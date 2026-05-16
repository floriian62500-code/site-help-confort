// ═══════════════════════════════════════════════════════════════════════════
// notify-lead — Envoi d'email à Florian dès qu'un nouveau lead arrive
// v1.0.0 (2026-05-16)
// ═══════════════════════════════════════════════════════════════════════════
// Appelée depuis assets/hc-leads-capture.js APRÈS l'insert dans la table leads.
// Pattern copié de notify-subscription. Lit RESEND_API_KEY depuis secrets.
//
// Body attendu (JSON) :
//   { lead_id: "uuid" }
//
// Le but : Florian reçoit l'email <5min pour pouvoir rappeler le prospect
// AVANT que la concurrence ne le contacte. Sur 100 leads chauds en plomberie,
// les 20% de premières réponses raflent 80% du CA.
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
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { lead_id } = await req.json();
    if (!lead_id) return json({ error: 'lead_id required' }, 400);

    // Service role pour bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Charge le lead
    const { data: lead, error: lErr } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();
    if (lErr || !lead) return json({ error: 'lead not found', detail: lErr?.message }, 404);

    // Charge les settings (emails destinataires)
    const { data: settings } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .maybeSingle();
    const cfg = settings?.value || {};
    const agences = cfg.agences || {};

    // Déduit l'agence depuis la ville si non précisée
    const agenceKey = deduceAgence(lead.agence || '', lead.ville || '');
    const agenceCfg = agences[agenceKey] || agences['saint-omer'] || {};

    // FROM_EMAIL FORCÉ à noreply@depan59-62.fr (seul domaine vérifié dans Resend)
    const FROM_EMAIL_FORCED = 'noreply@depan59-62.fr';
    const to = agenceCfg.email || cfg.leads_to || cfg.subscriptions_to || 'saint-omer@helpconfort.com';
    const cc = (cfg.leads_cc || cfg.subscriptions_cc || []) as string[];
    const fromName = cfg.from_name || 'HELP Confort — Site';
    const fromEmail = FROM_EMAIL_FORCED;
    const replyTo = lead.email || cfg.reply_to || 'saint-omer@helpconfort.com';

    const metierLabel = labelMetier(lead.metier);
    const urgent = isUrgent(lead);
    const subject = `${urgent ? '🚨 URGENCE' : '💬 Nouveau lead'} ${metierLabel}${lead.ville ? ' — ' + lead.ville : ''} · ${(lead.nom || lead.email || '').slice(0, 40)}`;
    const html = buildEmailHtml(lead, agenceKey, urgent);
    const text = buildEmailText(lead, agenceKey, urgent);

    // ─── Envoi via Resend ───────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.log('[notify-lead] RESEND_API_KEY missing — email skipped, lead saved in DB');
      return json({ ok: true, email_sent: false, reason: 'no_api_key', lead_id });
    }

    const resendBody: Record<string, unknown> = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      text,
    };
    if (cc.length) resendBody.cc = cc;

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
      console.error('[notify-lead] Resend error:', resendRes.status, err);
      return json({ ok: false, email_sent: false, error: err, status: resendRes.status }, 200);
    }
    const resendData = await resendRes.json();

    // Trace côté lead
    await supabase.from('leads').update({
      metadata: { ...(lead.metadata || {}), email_notified_at: new Date().toISOString(), email_id: resendData.id, notified_to: to }
    }).eq('id', lead_id);

    return json({ ok: true, email_sent: true, email_id: resendData.id, to });

  } catch (e) {
    console.error('[notify-lead] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const VILLES_AUDO = ['saint-omer','arques','longuenesse','tatinghem','wizernes','blendecques','aire-sur-la-lys','lumbres','saint-martin-lez-tatinghem'];
const VILLES_DK   = ['dunkerque','grande-synthe','coudekerque-branche','téteghem','teteghem','cappelle-la-grande','saint-pol-sur-mer','gravelines','bergues','calais','boulogne-sur-mer'];

function deduceAgence(explicit: string, ville: string): string {
  if (explicit) return explicit;
  const v = (ville || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
  if (VILLES_AUDO.some(c => v.includes(c))) return 'saint-omer';
  if (VILLES_DK.some(c => v.includes(c))) return 'dunkerque';
  return 'saint-omer';
}

function isUrgent(lead: any): boolean {
  const blob = (lead.message || '' + ' ' + (lead.metier || '')).toLowerCase();
  return /urgence|urgent|fuite|inond|panne|cassé|cassee|ne marche plus|ne fonctionne plus|chauffage en panne|chaudière en panne/.test(blob);
}

const METIER_LABELS: Record<string,string> = {
  plomberie: '🔧 Plomberie',
  chauffage: '🔥 Chauffage',
  electricite: '⚡ Électricité',
  serrurerie: '🔒 Serrurerie',
  vitrerie: '🪟 Vitrerie',
  renovation: '🛠 Rénovation',
  'chauffe-eau': '💧 Chauffe-eau',
  autre: '📝 Autre',
};
function labelMetier(m: string): string {
  return METIER_LABELS[(m||'').toLowerCase()] || (m ? '🔧 ' + m.charAt(0).toUpperCase()+m.slice(1) : '💬 Demande');
}

// ─── Templates HTML & text ─────────────────────────────────────────────────

function buildEmailHtml(l: any, agence: string, urgent: boolean): string {
  const m = l.metadata || {};
  const utm = m.utm || {};
  const ville = [l.code_postal, l.ville].filter(Boolean).join(' ');

  const row = (label: string, val: string | undefined, opts?: { strong?: boolean, link?: string }) => val
    ? `<tr><td style="padding:8px 0;color:#6b7384;font-size:13px;width:160px;vertical-align:top">${label}</td><td style="padding:8px 0;color:#0A1428;font-size:14px;font-weight:${opts?.strong ? 800 : 600};vertical-align:top">${opts?.link ? `<a href="${opts.link}" style="color:#0DA0CF;text-decoration:none;font-weight:700">${val}</a>` : val}</td></tr>`
    : '';

  const headerBg = urgent ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : 'linear-gradient(135deg,#1FC4F0,#0DA0CF)';
  const headerSub = urgent ? '🚨 URGENCE — rappel immédiat' : 'Nouvelle demande client';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;box-shadow:0 6px 24px rgba(10,20,40,.08);overflow:hidden">

<tr><td style="background:${headerBg};padding:24px 28px;color:#fff">
  <div style="font-size:14px;font-weight:700;opacity:.92;letter-spacing:.04em;text-transform:uppercase">${headerSub}</div>
  <div style="font-size:22px;font-weight:800;margin-top:4px">${escapeHtml(labelMetier(l.metier))}${l.ville ? ' — ' + escapeHtml(l.ville) : ''}</div>
  <div style="font-size:14px;font-weight:600;margin-top:6px;opacity:.95">Agence ${escapeHtml(agence === 'dunkerque' ? "Dépan'DK" : "Dépan'Audo")} · ${new Date(l.created_at).toLocaleString('fr-FR')}</div>
</td></tr>

<tr><td style="padding:28px">
  <div style="font-size:15px;color:#0A1428;line-height:1.55;margin-bottom:18px">
    ${urgent ? '<strong style="color:#DC2626">⏱ URGENCE.</strong> Rappelez sous 5 minutes pour ne pas perdre ce prospect.' : 'Un prospect vient de remplir le formulaire. <strong>Rappelez sous 1h</strong> tant que c\'est chaud (taux de conversion x3).'}
  </div>

  <div style="background:#f8fcff;border:1px solid rgba(13,160,207,.18);border-radius:10px;padding:14px 18px;margin-bottom:18px">
    <div style="font-size:12px;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Coordonnées</div>
    <div style="font-size:18px;font-weight:800;color:#0A1428">${escapeHtml(l.nom || l.prenom || '—')}</div>
    <div style="margin-top:10px;font-size:14px;line-height:2">
      ${l.telephone ? `<a href="tel:${escapeHtml(l.telephone)}" style="color:#0DA0CF;text-decoration:none;font-weight:800;font-size:16px">📞 ${escapeHtml(l.telephone)}</a><br>` : ''}
      ${l.email ? `<a href="mailto:${escapeHtml(l.email)}" style="color:#0DA0CF;text-decoration:none;font-weight:700">✉️ ${escapeHtml(l.email)}</a><br>` : ''}
      ${ville ? `📍 ${escapeHtml(ville)}` : ''}
    </div>
  </div>

  ${l.message ? `<div style="background:#FFFBEB;border-left:4px solid #FFB400;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:18px">
    <div style="font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Message du client</div>
    <div style="font-size:14px;color:#0A1428;line-height:1.55;white-space:pre-wrap">${escapeHtml(l.message)}</div>
  </div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5EDF3">
    ${row('Métier', labelMetier(l.metier))}
    ${row('Valeur estimée', l.estimated_value ? Number(l.estimated_value).toLocaleString('fr-FR') + ' €' : '')}
    ${row('Source', l.source || '')}
    ${row('Page d\'origine', m.page_url || '')}
    ${utm.utm_source ? row('UTM source', utm.utm_source) : ''}
    ${utm.utm_medium ? row('UTM medium', utm.utm_medium) : ''}
    ${utm.utm_campaign ? row('UTM campaign', utm.utm_campaign) : ''}
    ${m.referrer ? row('Référent', m.referrer) : ''}
    ${row('Adresse IP / User-agent', [m.ip, m.user_agent_short].filter(Boolean).join(' · ') || '')}
  </table>

  <div style="margin-top:24px;padding:14px 18px;background:#fafcfd;border-radius:10px;font-size:13px;color:#475569;line-height:1.55">
    💡 <strong>Action :</strong> rappel téléphonique recommandé.<br>
    <a href="https://depan59-62.fr/admin-pro/leads.html" style="color:#0DA0CF;font-weight:700;text-decoration:none">→ Ouvrir le lead dans le back-office</a>
  </div>
</td></tr>

<tr><td style="padding:18px 28px;background:#fafcfd;border-top:1px solid #E5EDF3;font-size:11px;color:#94a3b8">
  HELP Confort — Lead reçu le ${new Date(l.created_at).toLocaleString('fr-FR')}<br>
  Référence interne : ${l.id}
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmailText(l: any, agence: string, urgent: boolean): string {
  const m = l.metadata || {};
  const utm = m.utm || {};
  return `${urgent ? '🚨 URGENCE — RAPPEL IMMÉDIAT 🚨' : 'NOUVEAU LEAD CLIENT'}
═══════════════════════════════════════

${labelMetier(l.metier)}${l.ville ? ' — ' + l.ville : ''}
Agence : ${agence === 'dunkerque' ? "Dépan'DK" : "Dépan'Audo"}
Reçu le : ${new Date(l.created_at).toLocaleString('fr-FR')}

─── COORDONNÉES ───
${l.nom || l.prenom || '—'}
📞 ${l.telephone || '—'}
✉️ ${l.email || '—'}
📍 ${[l.code_postal, l.ville].filter(Boolean).join(' ') || '—'}

${l.message ? `─── MESSAGE ───\n${l.message}\n\n` : ''}─── INFOS COMPLÉMENTAIRES ───
Métier : ${labelMetier(l.metier)}
Valeur estimée : ${l.estimated_value ? Number(l.estimated_value).toLocaleString('fr-FR') + ' €' : '—'}
Source : ${l.source || '—'}
Page d'origine : ${m.page_url || '—'}
${utm.utm_source ? 'UTM : ' + utm.utm_source + ' / ' + (utm.utm_medium || '') + ' / ' + (utm.utm_campaign || '') : ''}

═══════════════════════════════════════
${urgent ? '⏱ Rappelez sous 5 minutes — URGENCE.' : '💬 Rappelez sous 1h — conversion x3.'}

Voir dans le back-office :
https://depan59-62.fr/admin-pro/leads.html

Référence : ${l.id}`;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
