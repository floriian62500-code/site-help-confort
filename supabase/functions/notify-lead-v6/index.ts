// notify-lead v6 (2026-08-06) — notification agence = outil de traitement commercial.
// Corrections v6 : plus de JSON brut (UTM lisibles ou masquées), source lisible, URL prod forcée
// (jamais 127.0.0.1), tél/email cliquables, actions rapides adaptées au form_type, lien direct
// vers la fiche du lead, champs vides masqués.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ACTION_BASE = 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/lead-action';
const BO_LEAD = (id: string) => `https://www.depan59-62.fr/admin-pro/leads.html?id=${encodeURIComponent(id)}`;

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
    const isRappel = ((lead.metadata?.form_type || lead.type_demande || '') + '').toLowerCase() === 'rappel';
    const subject = isRappel
      ? `Demande de rappel — ${prenomNom}${lead.telephone ? ' — ' + lead.telephone : ''}`
      : `Nouvelle demande ${metierLabel}${lead.ville ? ' à ' + lead.ville : ''} — ${prenomNom}`;
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
    return json({ ok: true, email_sent: true, email_id: resendData.id, to, v6: true });
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
  if (!m || m === '—') return 'demande';
  if (m.includes(',')) return 'multi-métier (' + m.toLowerCase() + ')';
  const MAP: Record<string,string> = {
    plomberie:'plomberie',chauffage:'chauffage',electricite:'électricité','électricité':'électricité',
    serrurerie:'serrurerie',vitrerie:'vitrerie',renovation:'rénovation','rénovation':'rénovation',
    'chauffe-eau':'chauffe-eau',autre:'travaux'
  };
  return MAP[m.toLowerCase()] || m.toLowerCase();
}
function labelTypeDemande(t: string): string {
  const MAP: Record<string,string> = {
    contact: 'Contact / devis', urgence: 'Urgence — dépannage', devis: 'Devis',
    rappel: 'Demande de rappel', rendez_vous: 'Rendez-vous', chat: 'Chat en ligne', whatsapp: 'WhatsApp',
  };
  return MAP[(t||'').toLowerCase()] || (t ? t : 'Demande');
}
// Origine lisible d'après le champ technique "source"
function labelSource(source: string): string {
  const s = (source || '').toLowerCase();
  if (!s || s === 'formulaire_site') return 'Formulaire du site';
  if (s.startsWith('home_wizard')) return 'Assistant de demande (page d’accueil)';
  if (s.includes('devis-express') || s.includes('express')) return 'Devis express';
  if (s.includes('recette') || s.includes('test')) return 'Test recette';
  return source;
}
function labelPage(path: string): string {
  if (!path || path === '/' || path === '') return 'Page d’accueil';
  const MAP: Record<string,string> = {
    '/index.html': 'Page d’accueil', '/contact.html': 'Page Contact',
    '/devis-express.html': 'Devis express', '/urgence.html': 'Page Urgence',
    '/plombier-saint-omer.html': 'Plombier Saint-Omer', '/electricien-saint-omer.html': 'Électricien Saint-Omer',
    '/chauffagiste-saint-omer.html': 'Chauffagiste Saint-Omer', '/serrurier-saint-omer.html': 'Serrurier Saint-Omer',
    '/vitrier-saint-omer.html': 'Vitrier Saint-Omer', '/menuisier-saint-omer.html': 'Menuisier Saint-Omer',
    '/travaux-saint-omer.html': 'Travaux Saint-Omer', '/pmr-saint-omer.html': 'PMR Saint-Omer',
    '/plombier-dunkerque.html': 'Plombier Dunkerque', '/maprimeadapt.html': 'MaPrimeAdapt',
  };
  if (MAP[path]) return MAP[path];
  return path.replace(/^\//,'').replace(/\.html$/,'').replace(/-/g,' ');
}
// Normalise l'URL d'origine : jamais localhost/127.0.0.1 en prod -> depan59-62.fr
function cleanOrigin(sourcePage: string): { label: string, url: string } {
  if (!sourcePage) return { label: 'Page d’accueil', url: '' };
  let path = sourcePage;
  try { const u = new URL(sourcePage, 'https://depan59-62.fr'); path = u.pathname + (u.search || ''); } catch { /* déjà un chemin */ }
  if (!path.startsWith('/')) path = '/' + path;
  const purepath = path.split('?')[0].split('#')[0];
  return { label: labelPage(purepath), url: 'https://depan59-62.fr' + path };
}
function labelReferer(ref: string): string {
  if (!ref) return '';
  try {
    const u = new URL(ref);
    const host = u.hostname.replace(/^www\./, '');
    if (host.includes('127.0.0.1') || host.includes('localhost')) return '';
    if (host.includes('depan59-62.fr')) return labelPage(u.pathname) + ' (même site)';
    if (host.includes('google.')) return '🔍 Recherche Google';
    if (host.includes('bing.')) return '🔍 Recherche Bing';
    if (host.includes('facebook.') || host.includes('fb.')) return 'Facebook';
    if (host.includes('instagram.')) return 'Instagram';
    if (host.includes('lebon')) return 'Le Bon Coin';
    if (host.includes('pagesjaunes.')) return 'Pages Jaunes';
    return host;
  } catch { return ''; }
}
// UTM lisibles — vide si aucune vraie UTM (la ligne sera alors masquée)
function labelUtm(utm: any): string {
  if (!utm || typeof utm !== 'object') return '';
  const src = utm.utm_source || utm.source || '';
  const med = utm.utm_medium || utm.medium || '';
  const camp = utm.utm_campaign || utm.campaign || '';
  const parts: string[] = [];
  if (src)  parts.push('source <strong>' + esc(src) + '</strong>');
  if (med)  parts.push('médium <strong>' + esc(med) + '</strong>');
  if (camp) parts.push('campagne <strong>' + esc(camp) + '</strong>');
  return parts.join(' • ');
}
function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
function buildHtml(l: any, tokens: Record<string,string>): string {
  const prenomNom = [l.prenom, l.nom].filter(Boolean).join(' ').trim() || '—';
  const adresse = [l.adresse, l.code_postal, l.ville].filter(Boolean).join(' ');
  const ft = (l.metadata?.form_type || l.type_demande || '').toLowerCase();
  const btn = (color: string, label: string, action: string) =>
    `<a href="${ACTION_BASE}?t=${tokens[action]}" style="display:inline-block;padding:11px 18px;background:${color};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:4px 4px 4px 0;font-family:Arial,sans-serif">${label}</a>`;
  const isRappel = ft === 'rappel';
  const CALLED = btn('#22C55E', isRappel ? '✅ Client rappelé' : '✅ Client appelé', 'called');
  const DEVIS  = btn('#3B82F6', '✉️ Devis envoyé', 'devis_sent');
  const RESCH  = btn('#F59E0B', isRappel ? '⏰ À rappeler plus tard' : '⏰ À rappeler demain', 'reschedule');
  const LOST   = btn('#94A3B8', isRappel ? '❌ Non joignable / pas intéressé' : '❌ Pas intéressé', 'lost');
  // Actions rapides adaptées au form_type : on met l'action la plus probable en 1er.
  // Demande de rappel : pas de « Devis envoyé » par défaut (ce n'est pas encore un devis).
  const isDevis = /devis/.test(ft);
  const actionsHtml = isRappel ? (CALLED + RESCH + LOST) : (isDevis ? (DEVIS + CALLED + RESCH + LOST) : (CALLED + DEVIS + RESCH + LOST));

  const origin = cleanOrigin(l.source_page || '');
  const utmStr = labelUtm(l.utm);
  const ref = labelReferer(l.source_referer || '');
  const rows = [
    `<div style="margin:3px 0"><strong>Page d’origine :</strong> ${esc(origin.label)}${origin.url ? ` — <a href="${origin.url}" style="color:#0DA0CF;text-decoration:none">ouvrir</a>` : ''}</div>`,
    `<div style="margin:3px 0"><strong>Type de demande :</strong> ${esc(labelTypeDemande(l.type_demande))}</div>`,
    `<div style="margin:3px 0"><strong>Origine :</strong> ${esc(labelSource(l.source))}</div>`,
    ref     ? `<div style="margin:3px 0"><strong>Vient de :</strong> ${esc(ref)}</div>` : '',
    utmStr  ? `<div style="margin:3px 0"><strong>Campagne marketing :</strong> ${utmStr}</div>` : '',
  ].filter(Boolean).join('');
  const origineHtml = `<div style="background:#EEF6FA;border-left:4px solid #0DA0CF;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:18px;font-size:14px;color:#0A1428;line-height:1.6">
    <div style="font-size:13px;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">🧭 Origine de la demande</div>
    ${rows}
  </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:24px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 18px rgba(10,20,40,.08);overflow:hidden;max-width:600px;width:100%">
<tr><td style="background:linear-gradient(135deg,#0A1428,#172240);padding:24px 28px;color:#fff">
<div style="font-size:12px;font-weight:700;opacity:.85;letter-spacing:.06em;text-transform:uppercase">${isRappel ? '📞 Demande de rappel' : 'Nouveau lead'}</div>
<div style="font-size:20px;font-weight:800;margin-top:6px">${esc(prenomNom)}</div>
<div style="font-size:14px;opacity:.85;margin-top:4px">${esc(labelMetierPlain(l.metier))}${l.ville ? ' — ' + esc(l.ville) : ''} · ${new Date(l.created_at).toLocaleString('fr-FR')}</div>
</td></tr>
<tr><td style="padding:24px 28px">
<div style="background:#F8FCFE;border-left:4px solid #0DA0CF;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:18px">
  <div style="font-size:13px;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Coordonnées</div>
  <div style="font-size:15px;color:#0A1428;line-height:1.8">
    ${l.telephone ? `📞 <a href="tel:${esc(l.telephone)}" style="color:#0DA0CF;text-decoration:none;font-weight:800;font-size:17px">${esc(l.telephone)}</a><br>` : ''}
    ${l.email ? `✉️ <a href="mailto:${esc(l.email)}" style="color:#0DA0CF;text-decoration:none;font-weight:600">${esc(l.email)}</a>` : ''}
  </div>
</div>
${adresse ? `<div style="background:#F0FDF4;border-left:4px solid #16A34A;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:18px">
  <div style="font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">📍 Adresse d’intervention</div>
  <div style="font-size:15px;color:#0A1428;line-height:1.6">${esc(adresse)}</div>
</div>` : ''}
${origineHtml}
${l.message ? `<div style="background:#FFFBEB;border-left:4px solid #FFB400;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:18px">
<div style="font-size:13px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Message du client</div>
<div style="font-size:14px;color:#0A1428;line-height:1.6;white-space:pre-wrap">${esc(l.message)}</div>
</div>` : ''}
<div style="background:#fff;border:1px solid #E5EDF3;border-radius:10px;padding:18px 20px;margin-bottom:18px">
  <div style="font-size:13px;font-weight:700;color:#0A1428;margin-bottom:12px">Action rapide (1 clic, aucune connexion requise) :</div>
  ${actionsHtml}
</div>
<div style="text-align:center;padding:10px 0;border-top:1px solid #F1F5F9">
  <a href="${BO_LEAD(l.id)}" style="display:inline-block;color:#0DA0CF;text-decoration:none;font-weight:700;font-size:14px">📋 Ouvrir la fiche de ce lead dans le back-office →</a>
</div>
</td></tr>
<tr><td style="padding:14px 28px;background:#FAFCFD;border-top:1px solid #E5EDF3;font-size:11px;color:#94A3B8">
Réf. : ${esc(l.id)}<br>HELP Confort · 03 66 10 01 34
</td></tr>
</table></td></tr></table></body></html>`;
}
function buildText(l: any, tokens: Record<string,string>): string {
  const prenomNom = [l.prenom, l.nom].filter(Boolean).join(' ').trim() || '—';
  const adresse = [l.adresse, l.code_postal, l.ville].filter(Boolean).join(' ');
  const origin = cleanOrigin(l.source_page || '');
  const utmStr = labelUtm(l.utm).replace(/<[^>]+>/g, '');
  const ref = labelReferer(l.source_referer || '');
  const lines = [
    'NOUVEAU LEAD', '', prenomNom,
    `${labelMetierPlain(l.metier)}${l.ville ? ' — ' + l.ville : ''}`,
    new Date(l.created_at).toLocaleString('fr-FR'), '',
    'ORIGINE',
    `Page : ${origin.label}${origin.url ? ' (' + origin.url + ')' : ''}`,
    `Type : ${labelTypeDemande(l.type_demande)}`,
    `Origine : ${labelSource(l.source)}`,
    ref ? `Vient de : ${ref}` : '',
    utmStr ? `Campagne : ${utmStr}` : '',
    '', 'COORDONNÉES',
    `Téléphone : ${l.telephone || '—'}`,
    `Email : ${l.email || '—'}`,
    `Adresse : ${adresse || '—'}`, '',
    l.message ? 'MESSAGE\n' + l.message + '\n' : '',
    'ACTIONS RAPIDES (1 clic) :',
    `Client appelé : ${ACTION_BASE}?t=${tokens.called}`,
    `Devis envoyé : ${ACTION_BASE}?t=${tokens.devis_sent}`,
    `À rappeler : ${ACTION_BASE}?t=${tokens.reschedule}`,
    `Pas intéressé : ${ACTION_BASE}?t=${tokens.lost}`, '',
    `Fiche du lead : ${BO_LEAD(l.id)}`,
    `Réf : ${l.id}`,
  ].filter(x => x !== '');
  return lines.join('\n');
}
