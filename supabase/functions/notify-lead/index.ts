// notify-lead v5 — VERSION ACTUELLEMENT EN PRODUCTION. NE PAS MODIFIER/REMPLACER (blue/green).
// La nouvelle version est dans supabase/functions/notify-lead-v6/. Cutover via le runbook.
// (traceability page d'origine, formulaire, referrer, UTM + magic links)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ACTION_BASE = 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/lead-action';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: CORS });
  try {
    const { lead_id } = await req.json();
    if (!lead_id) return json({ error: 'lead_id required' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: lead } = await sb.from('leads').select('*').eq('id', lead_id).single();
    if (!lead) return json({ error: 'lead not found' }, 404);
    const { data: settings } = await sb.from('app_settings').select('value').eq('key','notification_emails').maybeSingle();
    const cfg = settings?.value || {};
    const agences = cfg.agences || {};
    const agenceKey = deduceAgence(lead.agence || '', lead.ville || '');
    const agenceCfg = agences[agenceKey] || agences['saint-omer'] || {};
    const to = agenceCfg.email || cfg.leads_to || 'saint-omer@helpconfort.com';
    const cc = (cfg.leads_cc || []) as string[];

    const actions = ['called','devis_sent','lost','reschedule'];
    const tokens: Record<string,string> = {};
    for (const a of actions) {
      const { data: tok } = await sb.rpc('gen_lead_action_token', { p_lead_id: lead_id, p_action: a });
      tokens[a] = tok || '';
    }

    const fromEmail = 'noreply@depan59-62.fr';
    const fromName = 'Florian D’Haillecourt';
    const replyTo = lead.email || cfg.reply_to || 'florian.dhaillecourt@helpconfort.com';
    const metierLabel = labelMetierPlain(lead.metier);
    const prenomNom = [lead.prenom, lead.nom].filter(Boolean).join(' ').trim() || lead.email || 'Client';
    const subject = `Nouvelle demande ${metierLabel}${lead.ville ? ' à ' + lead.ville : ''} — ${prenomNom}`;
    const html = buildHtml(lead, tokens);
    const text = buildText(lead, tokens);
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) return json({ ok: true, email_sent: false, reason: 'no_api_key' });
    const resendBody: Record<string, unknown> = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      reply_to: replyTo,
      subject, html, text,
      headers: {
        'List-Unsubscribe': '<mailto:florian.dhaillecourt@helpconfort.com?subject=Unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Entity-Ref-ID': lead.id,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      }
    };
    if (cc.length) resendBody.cc = cc;
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(resendBody),
    });
    if (!resendRes.ok) {
      const err = await resendRes.text();
      return json({ ok: false, email_sent: false, error: err, status: resendRes.status }, 200);
    }
    const resendData = await resendRes.json();
    return json({ ok: true, email_sent: true, email_id: resendData.id, to, anti_spam_v5: true });
  } catch (e) {
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const VILLES_AUDO = ['saint-omer','arques','longuenesse','tatinghem','wizernes','blendecques','aire-sur-la-lys','lumbres','saint-martin-lez-tatinghem'];
const VILLES_DK   = ['dunkerque','grande-synthe','coudekerque-branche','téteghem','teteghem','cappelle-la-grande','saint-pol-sur-mer','gravelines','bergues','calais','boulogne-sur-mer'];
function deduceAgence(explicit: string, ville: string): string {
  if (explicit) return explicit;
  const v = (ville || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
  if (VILLES_AUDO.some(c => v.includes(c))) return 'saint-omer';
  if (VILLES_DK.some(c => v.includes(c))) return 'dunkerque';
  return 'saint-omer';
}
function labelMetierPlain(m: string): string {
  if (!m) return 'demande';
  if (m.includes(',')) return 'multi-métier (' + m.toLowerCase() + ')';
  const MAP: Record<string,string> = {
    plomberie:'plomberie',chauffage:'chauffage',electricite:'électricité',
    serrurerie:'serrurerie',vitrerie:'vitrerie',renovation:'rénovation',
    'chauffe-eau':'chauffe-eau',autre:'travaux'
  };
  return MAP[m.toLowerCase()] || m.toLowerCase();
}
function labelTypeDemande(t: string): string {
  const MAP: Record<string,string> = {
    contact: 'Formulaire contact général',
    urgence: 'Demande urgence',
    devis: 'Demande de devis',
    rappel: 'Demande de rappel',
    rendez_vous: 'Demande de rendez-vous',
    chat: 'Conversation chat en ligne',
    whatsapp: 'WhatsApp',
    formulaire_site: 'Formulaire site',
  };
  return MAP[(t||'').toLowerCase()] || (t ? t : 'Inconnu');
}
function labelPage(path: string): string {
  if (!path || path === '/' || path === '') return 'Page d\'accueil';
  const MAP: Record<string,string> = {
    '/contact.html': 'Page Contact (formulaire générique)',
    '/plombier-saint-omer.html': 'Page Plombier Saint-Omer',
    '/electricien-saint-omer.html': 'Page Électricien Saint-Omer',
    '/chauffagiste-saint-omer.html': 'Page Chauffagiste Saint-Omer',
    '/serrurier-saint-omer.html': 'Page Serrurier Saint-Omer',
  };
  if (MAP[path]) return MAP[path];
  return path;
}
function labelReferer(ref: string): string {
  if (!ref) return 'Accès direct (typage URL / favori / lien sans referer)';
  try {
    const u = new URL(ref);
    const host = u.hostname.replace(/^www\./, '');
    if (host.includes('depan59-62.fr')) return labelPage(u.pathname) + ' (même site)';
    if (host.includes('google.')) return '🔍 Recherche Google';
    if (host.includes('facebook.') || host.includes('fb.')) return 'Facebook';
    return host;
  } catch {
    return ref;
  }
}
function labelUtm(utm: any): string {
  if (!utm || typeof utm !== 'object' || !Object.keys(utm).length) return 'Aucune (organique / direct)';
  const src = utm.utm_source || utm.source || '';
  const med = utm.utm_medium || utm.medium || '';
  const camp = utm.utm_campaign || utm.campaign || '';
  const parts: string[] = [];
  if (camp) parts.push('campagne <strong>' + camp + '</strong>');
  if (src) parts.push('source <strong>' + src + '</strong>');
  if (med) parts.push('médium <strong>' + med + '</strong>');
  return parts.join(' • ') || JSON.stringify(utm);
}
function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
function buildHtml(l: any, tokens: Record<string,string>): string {
  const prenomNom = [l.prenom, l.nom].filter(Boolean).join(' ').trim() || '—';
  const adresse = [l.adresse, l.code_postal, l.ville].filter(Boolean).join(' ');
  const btn = (color: string, label: string, action: string) =>
    `<a href="${ACTION_BASE}?t=${tokens[action]}" style="display:inline-block;padding:11px 18px;background:${color};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:4px 4px 4px 0;font-family:Arial,sans-serif">${label}</a>`;
  const origineHtml = `<div style="background:#EEF6FA;border-left:4px solid #0DA0CF;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:18px;font-size:14px;color:#0A1428;line-height:1.7">
    <div style="font-size:13px;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">🧭 Origine de la demande</div>
    <div><strong>Page d'origine :</strong> ${esc(labelPage(l.source_page || ''))}</div>
    <div><strong>Type de formulaire :</strong> ${esc(labelTypeDemande(l.type_demande))}</div>
    <div><strong>Vient de :</strong> ${esc(labelReferer(l.source_referer || ''))}</div>
    <div><strong>Campagne :</strong> ${labelUtm(l.utm)}</div>
  </div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:24px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px">
<tr><td style="background:linear-gradient(135deg,#0A1428,#172240);padding:24px 28px;color:#fff">
<div style="font-size:12px;font-weight:700;opacity:.85;text-transform:uppercase">Nouveau lead</div>
<div style="font-size:20px;font-weight:800;margin-top:6px">${esc(prenomNom)}</div>
</td></tr>
<tr><td style="padding:24px 28px">
<div style="font-size:15px;color:#0A1428;line-height:1.8">
  ${l.telephone ? `📞 <a href="tel:${esc(l.telephone)}" style="color:#0DA0CF;text-decoration:none;font-weight:800">${esc(l.telephone)}</a><br>` : ''}
  ${l.email ? `✉️ <a href="mailto:${esc(l.email)}" style="color:#0DA0CF">${esc(l.email)}</a><br>` : ''}
  ${adresse ? `📍 ${esc(adresse)}` : ''}
</div>
${origineHtml}
${l.message ? `<div style="background:#FFFBEB;padding:14px;border-radius:8px;margin-bottom:18px">${esc(l.message)}</div>` : ''}
<div>${btn('#22C55E','✅ Client appelé','called')}${btn('#3B82F6','✉️ Devis envoyé','devis_sent')}${btn('#F59E0B','⏰ À rappeler','reschedule')}${btn('#94A3B8','❌ Pas intéressé','lost')}</div>
<div style="text-align:center;padding:8px 0"><a href="https://www.depan59-62.fr/admin-pro/leads.html" style="color:#0DA0CF">Ouvrir dans le back-office →</a></div>
</td></tr></table></td></tr></table></body></html>`;
}
function buildText(l: any, tokens: Record<string,string>): string {
  const prenomNom = [l.prenom, l.nom].filter(Boolean).join(' ').trim() || '—';
  const adresse = [l.adresse, l.code_postal, l.ville].filter(Boolean).join(' ');
  return `NOUVEAU LEAD\n\n${prenomNom}\n${labelMetierPlain(l.metier)}\nTél : ${l.telephone || '—'}\nEmail : ${l.email || '—'}\nAdresse : ${adresse || '—'}\n${l.message ? '\nMESSAGE\n' + l.message : ''}\n\nClient appelé : ${ACTION_BASE}?t=${tokens.called}\nBack-office : https://www.depan59-62.fr/admin-pro/leads.html\nRéf : ${l.id}`;
}
