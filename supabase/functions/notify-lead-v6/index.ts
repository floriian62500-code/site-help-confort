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
    const { lead_id, kind } = await req.json();
    // kind = 'abandon' : relance interne d'une demande non finalisée (aucun email au client).
    const isAbandon = String(kind || '') === 'abandon';
    const isPayment = String(kind || '') === 'payment';
    if (!lead_id) return json({ error: 'lead_id required' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: lead } = await sb.from('leads').select('*').eq('id', lead_id).single();
    if (!lead) return json({ error: 'lead not found' }, 404);
    const { data: settings } = await sb.from('app_settings').select('value').eq('key','notification_emails').maybeSingle();
    const cfg = settings?.value || {};
    const agences = cfg.agences || {};
    const agenceKey = deduceAgence(lead.agence || '', lead.ville || '');
    const agenceCfg = agences[agenceKey] || agences['saint-omer'] || {};
    // Destinataires INTERNES uniquement : le client n'y figure jamais, même s'il fait partie de
    // l'équipe (ex. un test de Florian) — il reçoit seulement sa confirmation client.
    const clientEmail = String(lead.email || '').trim().toLowerCase();
    const notClient = (a: string) => !!a && a.trim().toLowerCase() !== clientEmail;
    let to = [agenceCfg.email || cfg.leads_to || 'saint-omer@helpconfort.com'].filter(notClient);
    const cc = ((cfg.leads_cc || []) as string[]).filter(notClient).filter((a) => !to.includes(a));
    if (!to.length) to = ['saint-omer@helpconfort.com'].filter(notClient);
    if (!to.length && cc.length) to = [cc.shift() as string];
    if (!to.length) return json({ ok: true, email_sent: false, reason: 'no_internal_recipient' });

    // Une seule notification par événement et par dossier (double clic, rafraîchissement, nouvel essai)
    const notifKind = isPayment ? 'payment' : (isAbandon ? 'abandon' : 'new');
    const journal = Array.isArray(lead.metadata?.notifications) ? lead.metadata.notifications : [];
    if (journal.some((j: any) => j && j.kind === notifKind && (j.sent === true || j.reason === 'no_api_key'))) {
      return json({ ok: true, email_sent: false, reason: 'already_notified', kind: notifKind });
    }
    const logNotif = async (entry: Record<string, unknown>) => {
      const { data: cur } = await sb.from('leads').select('metadata').eq('id', lead_id).single();
      const m = (cur && cur.metadata) || {};
      const j = Array.isArray(m.notifications) ? m.notifications : [];
      await sb.from('leads').update({ metadata: { ...m, notifications: j.concat([{ kind: notifKind, at: new Date().toISOString(), ...entry }]).slice(-20) } }).eq('id', lead_id);
    };

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
    const pay = (lead.metadata && lead.metadata.payment) || {};
    const ref = 'HC-' + String(lead.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase();
    const subject = isPayment
      ? `Paiement reçu — dossier ${ref} — ${Number(pay.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € — ${prenomNom}`
      : isAbandon
      ? `Demande non finalisée — ${prenomNom}${lead.telephone ? ' — ' + lead.telephone : ''}`
      : isRappel
        ? `Demande de rappel — ${prenomNom}${lead.telephone ? ' — ' + lead.telephone : ''}`
        : `Nouvelle demande ${metierLabel}${lead.ville ? ' à ' + lead.ville : ''} — ${prenomNom}`;
    const html = buildHtml(lead, tokens, isAbandon, isPayment);
    const text = buildText(lead, tokens, isAbandon, isPayment);
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) { await logNotif({ sent: false, reason: 'no_api_key', to }); return json({ ok: true, email_sent: false, reason: 'no_api_key' }); }
    const resendBody: Record<string, unknown> = {
      from: `${fromName} <${fromEmail}>`,
      to,
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
      await logNotif({ sent: false, reason: 'resend_error', status: resendRes.status }); // un nouvel essai reste possible
      return json({ ok: false, email_sent: false, error: err, status: resendRes.status }, 200);
    }
    const resendData = await resendRes.json();
    await logNotif({ sent: true, email_id: resendData.id, to, cc });
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
    consultation_tarifs: 'Consultation des tarifs (demande non finalisée)', mixte: 'Intervention (prix fermes + sur devis)',
    reservation: 'Intervention à prix ferme', entretien: 'Entretien', contrat_entretien: 'Contrat d’entretien', commande: 'Intervention',
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
// Lecture du dossier depuis le message métier du module v2 (puces « • » et lignes « Clé : valeur »)
function parseDossier(l: any) {
  const lines = String(l.message || '').split('\n');
  const bullets = lines.filter((x) => /^\s*•\s+/.test(x)).map((x) => x.replace(/^\s*•\s+/, '').trim());
  const kv: Record<string, string> = {};
  lines.forEach((x) => { const m = x.match(/^\s*-?\s*([^:•]{2,40}?)\s:\s(.+)$/); if (m) kv[m[1].trim().toLowerCase()] = m[2].trim(); });
  const kinds = { ferme: 0, confirmer: 0, devis: 0 };
  bullets.forEach((b) => { if (/sur devis/i.test(b)) kinds.devis++; else if (/à confirmer/i.test(b)) kinds.confirmer++; else if (/prix ferme/i.test(b)) kinds.ferme++; });
  return { bullets, kv, kinds };
}
function refOf(l: any) { return 'HC-' + String(l.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase(); }
function eurFr(n: any) { return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
// Statut de paiement affiché en tête de la fiche
function paymentStatus(l: any): { label: string; bg: string; fg: string; detail: string } {
  const p = l.metadata?.payment || null;
  const t = String(l.type_demande || '').toLowerCase();
  const d = parseDossier(l);
  if (p && p.status === 'paid') return { label: 'PAIEMENT : PAYÉ EN LIGNE', bg: '#ECFDF5', fg: '#14532D', detail: `${eurFr(p.amount)} TTC le ${new Date(p.paid_at || Date.now()).toLocaleString('fr-FR')}${p.livemode ? '' : ' (Stripe TEST)'}${p.payment_intent ? ' · transaction ' + p.payment_intent : ''}` };
  if (p && p.status === 'pending') return { label: 'PAIEMENT : EN ATTENTE', bg: '#FFF7ED', fg: '#7C2D12', detail: 'Le client a ouvert le paiement en ligne ; paiement non confirmé à ce stade.' };
  if (/devis|entretien|consultation_tarifs/.test(t) || !d.bullets.length || d.kinds.devis || d.kinds.confirmer)
    return { label: 'PAIEMENT : NON ÉLIGIBLE / SUR DEVIS', bg: '#F1F5F9', fg: '#334155', detail: 'Au moins une prestation est à confirmer sur place ou sur devis : règlement après validation.' };
  return { label: 'PAIEMENT : NON PAYÉ', bg: '#EFF6FF', fg: '#1E3A8A', detail: 'Forfaits à prix ferme : le client peut régler en ligne (facultatif), sinon après l’intervention.' };
}

function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
function buildHtml(l: any, tokens: Record<string,string>, isAbandon = false, isPayment = false): string {
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

  const dossier = parseDossier(l);
  const pay = paymentStatus(l);
  const dossierRef = refOf(l);
  const typeLabel = labelTypeDemande(l.type_demande);
  const attribution = (l.utm && l.utm.attribution) || {};
  const utmBits = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'].filter((k) => attribution[k]).map((k) => `${k.replace('utm_', '')} <strong>${esc(attribution[k])}</strong>`).join(' · ');
  const sec = (title: string, color: string, inner: string) => inner ? `<div style="border-left:4px solid ${color};background:#FAFCFE;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:16px">
  <div style="font-size:12px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">${title}</div>${inner}</div>` : '';
  const kv = (k: string, v: string) => v ? `<div style="margin:3px 0;font-size:14px;color:#0A1428;line-height:1.55"><span style="color:#64748B">${k} :</span> ${v}</div>` : '';
  const prestations = dossier.bullets.length ? '<ul style="margin:4px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#0A1428">' + dossier.bullets.map((b) => `<li>${esc(b)}</li>`).join('') + '</ul>' : '';
  const total = dossier.kv['total prix fermes'] || '';
  const breakdown = [dossier.kinds.ferme ? `${dossier.kinds.ferme} à prix ferme` : '', dossier.kinds.confirmer ? `${dossier.kinds.confirmer} à confirmer sur place` : '', dossier.kinds.devis ? `${dossier.kinds.devis} sur devis` : ''].filter(Boolean).join(' · ');
  const hasPrice = /prix ferme|Total prix fermes|€/i.test(String(l.message || ''));

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:24px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 18px rgba(10,20,40,.08);overflow:hidden;max-width:600px;width:100%">
<tr><td style="background:linear-gradient(135deg,#0A1428,#172240);padding:22px 26px;color:#fff">
<div style="font-size:12px;font-weight:700;opacity:.85;letter-spacing:.06em;text-transform:uppercase">${isPayment ? 'Paiement reçu — dossier existant' : (isAbandon ? 'Demande non finalisée' : (isRappel ? 'Demande de rappel' : 'Nouvelle demande'))} · ${esc(dossierRef)}</div>
<div style="font-size:21px;font-weight:800;margin-top:6px">${esc(prenomNom)}</div>
<div style="font-size:14px;opacity:.88;margin-top:4px">${esc(typeLabel)} · ${esc(labelMetierPlain(l.metier))}${l.ville ? ' — ' + esc(l.ville) : ''} · ${new Date(l.created_at).toLocaleString('fr-FR')}</div>
</td></tr>
<tr><td style="padding:22px 26px">
<div style="background:${pay.bg};color:${pay.fg};border-radius:10px;padding:14px 18px;margin-bottom:16px"><div style="font-size:15px;font-weight:800;letter-spacing:.02em">${esc(pay.label)}</div><div style="font-size:13px;margin-top:4px;line-height:1.5">${esc(pay.detail)}</div></div>
${isAbandon ? `<div style="background:#FFF7ED;border-left:4px solid #FF8A1E;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:16px;color:#7C2D12;font-size:14px;line-height:1.55"><strong>Ce client a consulté les tarifs mais n'est pas allé au bout de sa demande.</strong><br>Dernière étape atteinte : ${esc(String(l.metadata?.last_step || 'accès aux tarifs'))}. À recontacter pour savoir s'il a besoin d'aide. Aucun email ne lui a été envoyé.</div>` : ''}
${sec('Client', '#0DA0CF',
  kv('Prénom', esc(l.prenom || '')) + kv('Nom', esc(l.nom || '')) +
  (l.telephone ? `<div style="margin:6px 0"><a href="tel:${esc(l.telephone)}" style="color:#0DA0CF;text-decoration:none;font-weight:800;font-size:18px">${esc(l.telephone)}</a></div>` : '') +
  kv('Email', l.email ? `<a href="mailto:${esc(l.email)}" style="color:#0DA0CF;text-decoration:none;font-weight:600">${esc(l.email)}</a>` : '') +
  kv('Adresse', esc([l.adresse, [l.code_postal, l.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '))))}
${sec('Demande', '#0A6C8F',
  kv('Type', esc(typeLabel)) + kv('Métier', esc(l.metier || '')) + prestations +
  kv('Délai souhaité', esc(dossier.kv['délai souhaité'] || '')) + kv('Rappel souhaité', esc(dossier.kv['rappel souhaité'] || '')) +
  kv('Travaux', esc(dossier.kv['travaux'] || '')) + kv('Nature', esc(dossier.kv['nature du projet'] || '')) + kv('Projet', esc(dossier.kv['projet'] || '')) +
  kv('Précisions du client', esc(dossier.kv['précisions client'] || '')) + kv('Zone', esc(dossier.kv['zone'] || '')))}
${hasPrice ? sec('Tarification', '#B45309',
  kv('Total des prix fermes', total ? `<strong>${esc(total)}</strong>` : '') + kv('Répartition', esc(breakdown)) +
  `<div style="margin-top:8px;font-size:13px;color:#7C4A12;line-height:1.55">Réserve tarifaire : les montants correspondent aux forfaits sélectionnés par le client, sous réserve de vérification sur place. Si la situation constatée ne correspond pas au forfait, proposer un ajustement ou un devis complémentaire AVANT d'intervenir.</div>`) : ''}
${sec('Origine', '#64748B',
  kv('Page', (() => { const o = cleanOrigin(l.source_page || ''); return esc(o.label) + (o.url ? ` — <a href="${o.url}" style="color:#0DA0CF;text-decoration:none">ouvrir</a>` : ''); })()) +
  kv('Canal', esc(labelSource(l.source))) + kv('Vient de', esc(labelReferer(l.source_referer || attribution.referrer || ''))) + kv('Campagne', utmBits) +
  kv('Créée le', esc(new Date(l.created_at).toLocaleString('fr-FR'))))}
<div style="background:#fff;border:1px solid #E5EDF3;border-radius:10px;padding:16px 18px;margin-bottom:16px">
  <div style="font-size:13px;font-weight:700;color:#0A1428;margin-bottom:10px">Action rapide (1 clic, aucune connexion requise) :</div>
  ${actionsHtml}
</div>
<div style="text-align:center;padding:10px 0;border-top:1px solid #F1F5F9">
  <a href="${BO_LEAD(l.id)}" style="display:inline-block;color:#0DA0CF;text-decoration:none;font-weight:700;font-size:14px">Ouvrir le dossier ${esc(dossierRef)} dans le back-office →</a>
</div>
${l.message ? `<details style="margin-top:12px"><summary style="font-size:12px;color:#64748B;cursor:pointer">Message complet transmis par le site</summary><div style="font-size:12px;color:#334155;line-height:1.5;white-space:pre-wrap;margin-top:6px">${esc(l.message)}</div></details>` : ''}
</td></tr>
<tr><td style="padding:12px 26px;background:#FAFCFD;border-top:1px solid #E5EDF3;font-size:11px;color:#94A3B8">
Dossier ${esc(dossierRef)} · ${esc(l.id)}<br>HELP Confort — agence de Saint-Omer · 03 66 10 01 34
</td></tr>
</table></td></tr></table></body></html>`;
}
function buildText(l: any, tokens: Record<string,string>, isAbandon = false, isPayment = false): string {
  const prenomNom = [l.prenom, l.nom].filter(Boolean).join(' ').trim() || '—';
  const adresse = [l.adresse, l.code_postal, l.ville].filter(Boolean).join(' ');
  const origin = cleanOrigin(l.source_page || '');
  const utmStr = labelUtm(l.utm).replace(/<[^>]+>/g, '');
  const ref = labelReferer(l.source_referer || '');
  const isRappel = ((l.metadata?.form_type || l.type_demande || '') + '').toLowerCase() === 'rappel';
  const dossier = parseDossier(l);
  const pay = paymentStatus(l);
  const lines = [
    (isPayment ? 'PAIEMENT REÇU — dossier existant' : (isAbandon ? 'DEMANDE NON FINALISÉE — à recontacter' : (isRappel ? 'DEMANDE DE RAPPEL' : 'NOUVELLE DEMANDE'))) + ' · ' + refOf(l), '',
    pay.label, pay.detail, '',
    'CLIENT', `Prénom : ${l.prenom || '—'}`, `Nom : ${l.nom || '—'}`,
    `${labelTypeDemande(l.type_demande)} · ${labelMetierPlain(l.metier)}${l.ville ? ' — ' + l.ville : ''}`,
    new Date(l.created_at).toLocaleString('fr-FR'), '',
    dossier.bullets.length ? 'PRESTATIONS\n' + dossier.bullets.map((x) => '• ' + x).join('\n') : '',
    dossier.kv['total prix fermes'] ? `Total des prix fermes : ${dossier.kv['total prix fermes']} (sous réserve de vérification sur place)` : '', '',
    'ORIGINE',
    `Page : ${origin.label}${origin.url ? ' (' + origin.url + ')' : ''}`,
    `Type : ${labelTypeDemande(l.type_demande)}`,
    `Origine : ${labelSource(l.source)}`,
    ref ? `Vient de : ${ref}` : '',
    utmStr ? `Campagne : ${utmStr}` : '',
    '', 'COORDONNÉES',
    `Téléphone : ${l.telephone || '—'}`,
    `Email : ${l.email || '—'}`,
    '', 'ADRESSE D’INTERVENTION',
    `${adresse || '—'}`, '',
    l.message ? 'MESSAGE\n' + l.message + '\n' : '',
    isRappel ? 'ACTIONS RAPIDES (1 clic) :' : 'ACTIONS RAPIDES (1 clic) :',
    `${isRappel ? 'Client rappelé' : 'Client appelé'} : ${ACTION_BASE}?t=${tokens.called}`,
    isRappel ? '' : `Devis envoyé : ${ACTION_BASE}?t=${tokens.devis_sent}`,
    `${isRappel ? 'À rappeler plus tard' : 'À rappeler'} : ${ACTION_BASE}?t=${tokens.reschedule}`,
    `${isRappel ? 'Non joignable / pas intéressé' : 'Pas intéressé'} : ${ACTION_BASE}?t=${tokens.lost}`, '',
    `Fiche du lead : ${BO_LEAD(l.id)}`,
    `Réf : ${l.id}`,
  ].filter(x => x !== '');
  return lines.join('\n');
}
