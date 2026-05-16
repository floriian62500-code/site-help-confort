// ═══════════════════════════════════════════════════════════════════════════
// weekly-recap — Envoi d'email récap hebdo à Florian le lundi 8h
// v1.0.0 (2026-05-16)
// ═══════════════════════════════════════════════════════════════════════════
// Déclenchée par cron pg_cron tous les lundis à 08:00 Europe/Paris.
// Voir migration supabase/migrations/20260516_cron_weekly_recap.sql
//
// Calcule sur les 7 derniers jours :
//  - Leads reçus (et taux conversion vers contrats)
//  - Contrats souscrits (CA mensuel généré × 12)
//  - Commandes prestations (CA TTC encaissé)
//  - Top 3 villes / Top 3 métiers
//  - Leads en attente >7 jours sans relance
//  - Alertes : tokens FB/GA4 expirant <30j
//
// Body optionnel (pour appel manuel depuis le back-office) :
//   { force?: true, dry_run?: false }
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: { force?: boolean; dry_run?: boolean } = {};
  try { body = await req.json(); } catch(_){ /* GET ou POST sans body OK */ }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ─── Plage : 7 derniers jours (lundi 00:00 → dimanche 23:59 dernière semaine) ────
    const now = new Date();
    const end = new Date(now.getTime());
    const start = new Date(now.getTime() - 7 * 86400000);
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - 7 * 86400000);

    const startIso = start.toISOString();
    const endIso = end.toISOString();
    const prevStartIso = prevStart.toISOString();
    const prevEndIso = prevEnd.toISOString();

    // ─── Stats semaine en cours ────
    const [leadsRes, contractsRes, ordersRes, leadsPrevRes, contractsPrevRes, ordersPrevRes, leadsStaleRes, settingsRes] = await Promise.all([
      supabase.from('leads').select('*').gte('created_at', startIso).lte('created_at', endIso),
      supabase.from('contracts').select('*').gte('created_at', startIso).lte('created_at', endIso),
      supabase.from('service_orders').select('*').gte('created_at', startIso).lte('created_at', endIso),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso),
      supabase.from('contracts').select('id', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso),
      supabase.from('service_orders').select('id', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso),
      // Leads "en cours" depuis >7j sans relance
      supabase.from('leads').select('id,nom,telephone,ville,metier,created_at').eq('status', 'en_cours').lt('created_at', startIso),
      supabase.from('app_settings').select('value').eq('key', 'notification_emails').maybeSingle()
    ]);

    const leads = leadsRes.data || [];
    const contracts = contractsRes.data || [];
    const orders = ordersRes.data || [];
    const leadsPrev = leadsPrevRes.count || 0;
    const contractsPrev = contractsPrevRes.count || 0;
    const ordersPrev = ordersPrevRes.count || 0;
    const leadsStale = leadsStaleRes.data || [];
    const cfg = settingsRes.data?.value || {};

    // CA semaine : contrats × 12 mois + commandes TTC
    const caContrats = contracts.reduce((s, c) => s + Number(c.monthly_amount || 0) * 12, 0);
    const caCommandes = orders.reduce((s, o) => s + Number(o.price_ttc || 0), 0);
    const caTotal = caContrats + caCommandes;

    // CA semaine précédente (pour variation)
    const [prevContractsFull, prevOrdersFull] = await Promise.all([
      supabase.from('contracts').select('monthly_amount').gte('created_at', prevStartIso).lte('created_at', prevEndIso),
      supabase.from('service_orders').select('price_ttc').gte('created_at', prevStartIso).lte('created_at', prevEndIso)
    ]);
    const caContratsPrev = (prevContractsFull.data || []).reduce((s, c) => s + Number(c.monthly_amount || 0) * 12, 0);
    const caCommandesPrev = (prevOrdersFull.data || []).reduce((s, o) => s + Number(o.price_ttc || 0), 0);
    const caTotalPrev = caContratsPrev + caCommandesPrev;

    // Top villes (parmi leads de la semaine)
    const villeCount: Record<string, number> = {};
    leads.forEach(l => { if (l.ville) villeCount[l.ville] = (villeCount[l.ville] || 0) + 1; });
    const topVilles = Object.entries(villeCount).sort((a,b) => b[1]-a[1]).slice(0, 3);

    // Top métiers
    const metierCount: Record<string, number> = {};
    leads.forEach(l => { if (l.metier) metierCount[l.metier] = (metierCount[l.metier] || 0) + 1; });
    const topMetiers = Object.entries(metierCount).sort((a,b) => b[1]-a[1]).slice(0, 3);

    // Taux de conversion lead → contrat (cohorte semaine)
    const leadsGagnes = leads.filter(l => l.status === 'gagne').length;
    const tauxConv = leads.length ? (leadsGagnes / leads.length * 100).toFixed(1) : '0';

    // Variations
    const varLeads = pctVar(leads.length, leadsPrev);
    const varContrats = pctVar(contracts.length, contractsPrev);
    const varCommandes = pctVar(orders.length, ordersPrev);
    const varCa = pctVar(caTotal, caTotalPrev);

    // Alertes (best effort — ne bloque pas l'envoi si erreur)
    const alerts: string[] = [];
    try {
      const { data: fb } = await supabase.from('app_settings').select('value').eq('key','meta').maybeSingle();
      if (fb?.value?.page_access_token_expires_at) {
        const expDate = new Date(fb.value.page_access_token_expires_at);
        const daysLeft = Math.floor((expDate.getTime() - now.getTime()) / 86400000);
        if (daysLeft < 30 && daysLeft >= 0) alerts.push(`⚠ Token Facebook expire dans ${daysLeft} jours — renouveler via /admin-pro/refresh-meta-token-client.html`);
        if (daysLeft < 0) alerts.push(`🚨 Token Facebook EXPIRÉ depuis ${-daysLeft} jours — renouveler d'urgence`);
      }
    } catch(_){}

    if (leadsStale.length > 0) {
      alerts.push(`📞 ${leadsStale.length} lead${leadsStale.length>1?'s':''} "en cours" depuis +7 jours sans relance — risque de perte`);
    }

    // Si rien à signaler ET pas de force → on n'envoie rien (évite spam le lundi férié)
    if (!body.force && leads.length === 0 && contracts.length === 0 && orders.length === 0) {
      return json({ ok: true, sent: false, reason: 'no_activity_this_week' });
    }

    // ─── Email ────
    const FROM_EMAIL = 'noreply@depan59-62.fr';
    const fromName = cfg.from_name || 'HELP! Confort — Récap hebdo';
    const to = cfg.weekly_recap_to || cfg.subscriptions_to || 'saint-omer@helpconfort.com';
    const ccArr = (cfg.weekly_recap_cc || []) as string[];

    const semaineLabel = `${start.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })} → ${end.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}`;
    const subject = `📊 Récap semaine ${semaineLabel} · ${leads.length} leads · ${contracts.length} contrats · ${formatEur(caTotal)}`;

    const html = buildEmailHtml({
      semaineLabel, leads, contracts, orders, leadsPrev, contractsPrev, ordersPrev,
      caContrats, caCommandes, caTotal, caTotalPrev,
      topVilles, topMetiers, tauxConv, leadsGagnes,
      varLeads, varContrats, varCommandes, varCa,
      alerts, leadsStale
    });
    const text = buildEmailText({
      semaineLabel, leads, contracts, orders,
      caTotal, varLeads, varContrats, varCommandes, varCa,
      topVilles, topMetiers, tauxConv, leadsGagnes,
      alerts, leadsStale
    });

    if (body.dry_run) {
      return json({ ok: true, dry_run: true, subject, html_preview: html.slice(0, 500) });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return json({ ok: true, sent: false, reason: 'no_api_key' });
    }

    const resendBody: Record<string, unknown> = {
      from: `${fromName} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text,
    };
    if (ccArr.length) resendBody.cc = ccArr;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('[weekly-recap] Resend error:', resendRes.status, err);
      return json({ ok: false, sent: false, error: err, status: resendRes.status }, 200);
    }
    const resendData = await resendRes.json();
    return json({ ok: true, sent: true, email_id: resendData.id, to, kpis: { leads: leads.length, contracts: contracts.length, orders: orders.length, ca: caTotal } });

  } catch (e) {
    console.error('[weekly-recap] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────

function pctVar(curr: number, prev: number): { v: string, cls: 'up'|'down'|'flat', icon: string } {
  if (prev === 0) {
    if (curr === 0) return { v: '0 %', cls: 'flat', icon: '→' };
    return { v: 'nouveau', cls: 'up', icon: '↗' };
  }
  const delta = (curr - prev) / prev * 100;
  const cls: 'up'|'down'|'flat' = Math.abs(delta) < 1 ? 'flat' : delta > 0 ? 'up' : 'down';
  return { v: (delta > 0 ? '+' : '') + delta.toFixed(0) + ' %', cls, icon: cls === 'up' ? '↗' : cls === 'down' ? '↘' : '→' };
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

const METIER_LABELS: Record<string,string> = {
  plomberie: 'Plomberie', chauffage: 'Chauffage', electricite: 'Électricité',
  serrurerie: 'Serrurerie', vitrerie: 'Vitrerie', renovation: 'Rénovation',
  'chauffe-eau': 'Chauffe-eau', autre: 'Autre'
};
function labelMetier(m: string): string {
  return METIER_LABELS[(m||'').toLowerCase()] || (m ? m.charAt(0).toUpperCase()+m.slice(1) : '—');
}

// ─── Email HTML & text ──────────────────────────────────────────────────

function buildEmailHtml(d: any): string {
  const kpiCard = (lbl: string, val: string, sub: string, color: string, va: { v: string, cls: string, icon: string }) => {
    const colorMap: Record<string,string> = { up: '#15803D', down: '#B91C1C', flat: '#64748b' };
    return `<td style="width:25%;padding:0 6px;vertical-align:top">
      <div style="background:linear-gradient(135deg,${color}11,#fff);border:1px solid ${color}33;border-radius:12px;padding:14px 12px;text-align:left">
        <div style="font-size:10px;color:${color};font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${lbl}</div>
        <div style="font-size:22px;font-weight:900;color:#0A1428;line-height:1">${val}</div>
        <div style="margin-top:6px;font-size:11px;color:#64748b">${sub}</div>
        <div style="margin-top:3px;font-size:11px;font-weight:700;color:${colorMap[va.cls]}">${va.icon} ${va.v}</div>
      </div>
    </td>`;
  };

  const topList = (items: [string, number][], colorBg: string) => items.length
    ? '<ul style="margin:0;padding:0;list-style:none">' + items.map(([n, c], i) => `
      <li style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px">
        <span style="display:inline-flex;width:22px;height:22px;border-radius:50%;background:${colorBg};color:#fff;align-items:center;justify-content:center;font-size:11px;font-weight:800">${i+1}</span>
        <span style="flex:1;color:#0A1428;font-weight:600">${escapeHtml(n === n.toLowerCase() ? labelMetier(n) : n)}</span>
        <strong style="color:${colorBg}">${c}</strong>
      </li>
    `).join('') + '</ul>'
    : '<div style="color:#94a3b8;font-size:13px;font-style:italic;padding:8px 0">Aucune donnée cette semaine</div>';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px"><tr><td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(10,20,40,.10);overflow:hidden">

<tr><td style="background:linear-gradient(135deg,#0A1428 0%,#0DA0CF 100%);padding:28px 32px;color:#fff">
  <div style="font-size:13px;font-weight:700;opacity:.85;letter-spacing:.06em;text-transform:uppercase">Récap hebdo HELP! Confort</div>
  <div style="font-size:26px;font-weight:900;margin-top:4px;letter-spacing:-.02em">Semaine ${escapeHtml(d.semaineLabel)}</div>
  <div style="font-size:14px;opacity:.92;margin-top:8px">Bonjour Florian 👋 — voici ton tableau de bord de la semaine écoulée.</div>
</td></tr>

<tr><td style="padding:24px 28px 12px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      ${kpiCard('Leads reçus', String(d.leads.length), `vs ${d.leadsPrev} sem. préc.`, '#0DA0CF', d.varLeads)}
      ${kpiCard('Contrats', String(d.contracts.length), `vs ${d.contractsPrev}`, '#7C3AED', d.varContrats)}
      ${kpiCard('Commandes', String(d.orders.length), `vs ${d.ordersPrev}`, '#FF6B1A', d.varCommandes)}
      ${kpiCard('CA semaine', formatEur(d.caTotal), 'estim. contrats × 12 + ventes', '#16A34A', d.varCa)}
    </tr>
  </table>
</td></tr>

<tr><td style="padding:12px 28px 20px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;padding-right:8px;vertical-align:top">
        <div style="background:#fafcfd;border:1px solid #E5EDF3;border-radius:12px;padding:14px 16px">
          <div style="font-size:12px;font-weight:800;color:#0A1428;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🏆 Top villes</div>
          ${topList(d.topVilles, '#0DA0CF')}
        </div>
      </td>
      <td style="width:50%;padding-left:8px;vertical-align:top">
        <div style="background:#fafcfd;border:1px solid #E5EDF3;border-radius:12px;padding:14px 16px">
          <div style="font-size:12px;font-weight:800;color:#0A1428;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🛠 Top métiers</div>
          ${topList(d.topMetiers, '#FF6B1A')}
        </div>
      </td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:0 28px 20px">
  <div style="background:linear-gradient(135deg,rgba(13,160,207,.06),#fff);border:1px solid rgba(13,160,207,.20);border-radius:12px;padding:16px 20px">
    <div style="font-size:13px;color:#0A1428;line-height:1.6">
      <strong style="color:#0DA0CF">Taux de conversion :</strong> ${d.tauxConv} % (${d.leadsGagnes} gagnés / ${d.leads.length} leads)<br>
      <strong style="color:#0DA0CF">CA contrats :</strong> ${formatEur(d.caContrats)} (annualisé)<br>
      <strong style="color:#0DA0CF">CA commandes :</strong> ${formatEur(d.caCommandes)} (TTC)
    </div>
  </div>
</td></tr>

${d.alerts.length ? `<tr><td style="padding:0 28px 20px">
  <div style="background:#FFFBEB;border-left:4px solid #FFB400;border-radius:0 10px 10px 0;padding:14px 18px">
    <div style="font-size:12px;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">⚠ Alertes</div>
    <ul style="margin:0;padding-left:18px;font-size:13px;color:#451A03;line-height:1.7">
      ${d.alerts.map((a: string) => `<li>${escapeHtml(a)}</li>`).join('')}
    </ul>
  </div>
</td></tr>` : ''}

${d.leadsStale.length ? `<tr><td style="padding:0 28px 20px">
  <div style="background:#fff7ed;border:1px solid #FED7AA;border-radius:12px;padding:14px 18px">
    <div style="font-size:12px;font-weight:800;color:#9A3412;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📞 Leads "en cours" à relancer (${d.leadsStale.length})</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px">
      ${d.leadsStale.slice(0,6).map((l: any) => `
        <tr>
          <td style="padding:5px 0;border-bottom:1px solid #FED7AA;color:#0A1428;font-weight:700">${escapeHtml(l.nom || '—')}</td>
          <td style="padding:5px 0;border-bottom:1px solid #FED7AA;color:#475569">${escapeHtml(l.ville || '—')}</td>
          <td style="padding:5px 0;border-bottom:1px solid #FED7AA;color:#475569">${escapeHtml(labelMetier(l.metier || ''))}</td>
          <td style="padding:5px 0;border-bottom:1px solid #FED7AA"><a href="tel:${escapeHtml(l.telephone || '')}" style="color:#0DA0CF;font-weight:700;text-decoration:none">${escapeHtml(l.telephone || '—')}</a></td>
        </tr>
      `).join('')}
    </table>
    ${d.leadsStale.length > 6 ? `<div style="text-align:center;font-size:12px;color:#9A3412;margin-top:8px">… et ${d.leadsStale.length - 6} autres</div>` : ''}
  </div>
</td></tr>` : ''}

<tr><td style="padding:0 28px 28px">
  <a href="https://depan59-62.fr/admin-pro/" style="display:inline-block;background:linear-gradient(135deg,#1FC4F0,#0DA0CF);color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:800;font-size:14px;box-shadow:0 4px 12px rgba(13,160,207,.30)">→ Ouvrir le dashboard</a>
  <a href="https://depan59-62.fr/admin-pro/bilan-mensuel.html" style="display:inline-block;background:#fff;border:1px solid #E5EDF3;color:#0DA0CF;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;margin-left:8px">Voir bilan mensuel</a>
</td></tr>

<tr><td style="padding:18px 28px;background:#fafcfd;border-top:1px solid #E5EDF3;font-size:11px;color:#94a3b8">
  HELP! Confort — Récap automatique du lundi 8h<br>
  Tu peux désactiver cet email dans <a href="https://depan59-62.fr/admin-pro/settings.html" style="color:#0DA0CF">Réglages → Notifications</a>.
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmailText(d: any): string {
  return `RÉCAP HEBDO HELP! CONFORT
═══════════════════════════════════════
Semaine ${d.semaineLabel}

─── KPIs ───
Leads reçus      : ${d.leads.length} (${d.varLeads.icon} ${d.varLeads.v})
Contrats         : ${d.contracts.length} (${d.varContrats.icon} ${d.varContrats.v})
Commandes        : ${d.orders.length} (${d.varCommandes.icon} ${d.varCommandes.v})
CA estimé        : ${formatEur(d.caTotal)} (${d.varCa.icon} ${d.varCa.v})
Taux conversion  : ${d.tauxConv} %

─── TOP VILLES ───
${d.topVilles.map(([n, c]: [string, number], i: number) => `${i+1}. ${n} — ${c}`).join('\n') || 'Aucune donnée'}

─── TOP MÉTIERS ───
${d.topMetiers.map(([n, c]: [string, number], i: number) => `${i+1}. ${labelMetier(n)} — ${c}`).join('\n') || 'Aucune donnée'}

${d.alerts.length ? '─── ALERTES ───\n' + d.alerts.map((a: string) => '• ' + a).join('\n') + '\n\n' : ''}${d.leadsStale.length ? `─── LEADS À RELANCER (${d.leadsStale.length}) ───\n` + d.leadsStale.slice(0,6).map((l: any) => `• ${l.nom || '—'} · ${l.ville || ''} · ${l.telephone || '—'}`).join('\n') + '\n\n' : ''}═══════════════════════════════════════
Dashboard : https://depan59-62.fr/admin-pro/
Bilan mensuel : https://depan59-62.fr/admin-pro/bilan-mensuel.html`;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
