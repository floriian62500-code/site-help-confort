// ═══════════════════════════════════════════════════════════════════════════
// notify-subscription — Envoi d'email à la souscription d'un contrat
// v1.0.1 — publique (no JWT verify) pour appels depuis le site
// ═══════════════════════════════════════════════════════════════════════════
// Appelée depuis le client public (contrats-entretien.html) APRÈS l'insert
// dans la table contracts. Lit le RESEND_API_KEY depuis les secrets Supabase.
//
// Si RESEND_API_KEY non configuré → la fonction retourne 200 (no-op, mais OK)
// et l'admin voit quand même la souscription dans le back-office.
//
// Body attendu (JSON) :
//   { contract_id: "uuid", agence?: "saint-omer"|"dunkerque" }
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
    const { contract_id, agence } = await req.json();
    if (!contract_id) return json({ error: 'contract_id required' }, 400);

    // Service role pour bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Charge le contrat
    const { data: contract, error: ctErr } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contract_id)
      .single();
    if (ctErr || !contract) return json({ error: 'contract not found', detail: ctErr?.message }, 404);

    // Charge les settings (emails destinataires)
    const { data: settings } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single();
    const cfg = settings?.value || {};
    const agences = cfg.agences || {};
    const agenceCfg = agences[contract.agence || agence || ''] || {};
    const to = agenceCfg.email || cfg.subscriptions_to || 'florian.dhaillecourt@helpconfort.com';
    const fromName = cfg.from_name || 'HELP! Confort';
    const fromEmail = cfg.from_email || 'noreply@helpconfort-saintomer.fr';
    const replyTo = cfg.reply_to || 'saint-omer@helpconfort.com';

    const subject = `🔧 Nouvelle souscription contrat — ${contract.metadata?.energie || ''} ${(contract.type || '').toUpperCase()}`;
    const html = buildEmailHtml(contract);
    const text = buildEmailText(contract);

    // ─── Envoi via Resend ───────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.log('[notify-subscription] RESEND_API_KEY missing — email skipped, contract saved in DB');
      return json({ ok: true, email_sent: false, reason: 'no_api_key', contract_id });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('[notify-subscription] Resend error:', resendRes.status, err);
      return json({ ok: false, email_sent: false, error: err, status: resendRes.status }, 200);
    }
    const resendData = await resendRes.json();

    // Trace côté contrat (utile pour audit)
    await supabase.from('contracts').update({
      metadata: { ...(contract.metadata || {}), email_notified_at: new Date().toISOString(), email_id: resendData.id }
    }).eq('id', contract_id);

    return json({ ok: true, email_sent: true, email_id: resendData.id, to });

  } catch (e) {
    console.error('[notify-subscription] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─── Templates HTML & text ─────────────────────────────────────────────────

function buildEmailHtml(c: any): string {
  const m = c.metadata || {};
  const energie = m.energie ? m.energie.charAt(0).toUpperCase() + m.energie.slice(1) : '';
  const formule = (c.type || '').toUpperCase();
  const prix = m.prix_label || (c.monthly_amount ? `${c.monthly_amount} €/mois` : '—');

  const row = (label: string, val: string) => val
    ? `<tr><td style="padding:8px 0;color:#6b7384;font-size:13px;width:160px">${label}</td><td style="padding:8px 0;color:#0A1428;font-size:14px;font-weight:600">${val}</td></tr>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;box-shadow:0 6px 24px rgba(10,20,40,.08);overflow:hidden">

<tr><td style="background:linear-gradient(135deg,#1FC4F0,#0DA0CF);padding:24px 28px;color:#fff">
  <div style="font-size:14px;font-weight:600;opacity:.85;letter-spacing:.04em;text-transform:uppercase">Nouvelle souscription contrat</div>
  <div style="font-size:22px;font-weight:800;margin-top:4px">${escapeHtml(energie)} — Formule ${escapeHtml(formule)}</div>
  <div style="font-size:15px;font-weight:600;margin-top:6px;opacity:.95">${escapeHtml(prix)}</div>
</td></tr>

<tr><td style="padding:28px">
  <div style="font-size:15px;color:#0A1428;line-height:1.5;margin-bottom:18px">
    Un client vient de souscrire un contrat depuis le site. <strong>Rappelez-le sous 24h</strong> pour finaliser.
  </div>

  <div style="background:#f8fcff;border:1px solid rgba(13,160,207,.18);border-radius:10px;padding:14px 18px;margin-bottom:18px">
    <div style="font-size:12px;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Coordonnées</div>
    <div style="font-size:17px;font-weight:800;color:#0A1428">${escapeHtml(c.client_first_name || '')} ${escapeHtml(c.client_last_name || '')}</div>
    <div style="margin-top:8px;display:flex;gap:12px;font-size:14px">
      <a href="tel:${escapeHtml(c.client_phone || '')}" style="color:#0DA0CF;text-decoration:none;font-weight:700">📞 ${escapeHtml(c.client_phone || '—')}</a>
      ${c.client_email ? `&nbsp;·&nbsp; <a href="mailto:${escapeHtml(c.client_email)}" style="color:#0DA0CF;text-decoration:none;font-weight:700">✉️ ${escapeHtml(c.client_email)}</a>` : ''}
    </div>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5EDF3">
    ${row('Adresse', [c.client_address, [c.client_postal_code, c.client_city].filter(Boolean).join(' ')].filter(Boolean).join('<br>'))}
    ${row('Agence concernée', c.agence ? c.agence.charAt(0).toUpperCase() + c.agence.slice(1) : '')}
    ${row('Type de logement', m.type_logement || '')}
    ${row('Statut', m.statut_logement || '')}
    ${row('Marque chaudière', m.marque || '')}
    ${row('Modèle', m.modele || '')}
    ${row('Année installation', m.annee || '')}
    ${row('Dernier entretien', m.dernier_entretien || '')}
    ${row('Date début souhaitée', m.date_debut_souhaitee || 'À définir')}
    ${row('Commentaire client', m.commentaire || '')}
    ${row('CGV', m.cgv_accepted_at ? '✅ Acceptées le ' + new Date(m.cgv_accepted_at).toLocaleString('fr-FR') : '')}
  </table>

  <div style="margin-top:24px;padding:14px 18px;background:#fafcfd;border-radius:10px;font-size:13px;color:#475569;line-height:1.5">
    💡 <strong>Action :</strong> connectez-vous au back-office pour traiter cette souscription :
    <a href="https://remarkable-dragon-364e2b.netlify.app/admin-pro/contracts.html" style="color:#0DA0CF;font-weight:700;text-decoration:none">→ Voir dans le back-office</a>
  </div>
</td></tr>

<tr><td style="padding:18px 28px;background:#fafcfd;border-top:1px solid #E5EDF3;font-size:11px;color:#94a3b8">
  HELP! Confort — Souscription reçue le ${new Date(c.created_at).toLocaleString('fr-FR')}<br>
  Référence interne : ${c.id}
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmailText(c: any): string {
  const m = c.metadata || {};
  return `NOUVELLE SOUSCRIPTION CONTRAT
═══════════════════════════════════════

🔧 ${m.energie || ''} — Formule ${(c.type || '').toUpperCase()}
💰 ${m.prix_label || c.monthly_amount + ' €/mois'}
🏢 Agence : ${c.agence || '—'}

─── COORDONNÉES ───
${c.client_first_name || ''} ${c.client_last_name || ''}
📞 ${c.client_phone || '—'}
✉️ ${c.client_email || '—'}

─── ADRESSE ───
${c.client_address || ''}
${c.client_postal_code || ''} ${c.client_city || ''}

─── LOGEMENT ───
Type : ${m.type_logement || '—'}
Statut : ${m.statut_logement || '—'}

─── ÉQUIPEMENT ───
Marque : ${m.marque || '—'}
Modèle : ${m.modele || '—'}
Année installation : ${m.annee || '—'}
Dernier entretien : ${m.dernier_entretien || '—'}

─── DATE & PRÉCISIONS ───
Date début souhaitée : ${m.date_debut_souhaitee || 'À définir'}
Commentaire : ${m.commentaire || 'Aucun'}

CGV : ${m.cgv_accepted_at ? 'OUI ' + new Date(m.cgv_accepted_at).toLocaleString('fr-FR') : '—'}

═══════════════════════════════════════
Voir dans le back-office :
https://remarkable-dragon-364e2b.netlify.app/admin-pro/contracts.html

Référence : ${c.id}`;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
