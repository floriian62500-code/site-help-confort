// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// lead-action — magic link 1-click pour Julie/Florian, marque un lead comme traité sans connexion
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STATUS_LABELS: Record<string, { status: string, label: string, color: string, msg: string }> = {
  called:     { status: 'en_cours',  label: '✅ Client appelé',          color: '#10B981', msg: 'Top — appel marqué. Pense à mettre une note dans le BO si besoin.' },
  devis_sent: { status: 'devis_envoye', label: '✉️ Devis envoyé',         color: '#3B82F6', msg: 'Devis tracé. Tu peux revenir suivre la conversion plus tard.' },
  paid:       { status: 'gagne',      label: '💰 Payé / Signé',         color: '#22C55E', msg: 'Excellent — lead converti en CA. Bravo !' },
  won:        { status: 'gagne',      label: '🏆 Gagné',                color: '#22C55E', msg: 'Lead gagné. Merci !' },
  lost:       { status: 'perdu',      label: '❌ Perdu',                  color: '#EF4444', msg: 'Pas grave. La raison en interne dans le BO pourra aider à ajuster les offres.' },
  reschedule: { status: 'a_rappeler',label: '⏰ À rappeler demain',     color: '#F59E0B', msg: 'On notera de rappeler demain.' },
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || '';
  if (!token) return htmlResp(400, 'Token manquant', 'Lien invalide. Demande à Florian un nouveau mail.', '#EF4444');

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  // Récupère le token
  const { data: tok } = await sb.from('lead_action_tokens').select('*').eq('token', token).maybeSingle();
  if (!tok) return htmlResp(404, 'Lien expiré', 'Ce lien d\'action a expiré ou n\'existe plus. Connecte-toi au back-office pour faire l\'action manuellement.', '#EF4444');
  if (tok.expires_at && new Date(tok.expires_at) < new Date()) {
    return htmlResp(410, 'Lien expiré', 'Ce lien a expiré (>30 jours). Connecte-toi au back-office.', '#EF4444');
  }

  const cfg = STATUS_LABELS[tok.action];
  if (!cfg) return htmlResp(400, 'Action inconnue', '', '#EF4444');

  // Récupère le lead
  const { data: lead } = await sb.from('leads').select('*').eq('id', tok.lead_id).maybeSingle();
  if (!lead) return htmlResp(404, 'Lead introuvable', '', '#EF4444');

  // Si déjà utilisé, on affiche juste un message info
  if (tok.used_at) {
    return htmlResp(200, 'Déjà fait ✓',
      `Cette action (${cfg.label}) a déjà été enregistrée le ${new Date(tok.used_at).toLocaleString('fr-FR')} pour <strong>${lead.prenom || ''} ${lead.nom || ''}</strong>.`, cfg.color, lead);
  }

  // Update le lead
  await sb.from('leads').update({
    status: cfg.status,
    last_contact_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes_internes: (lead.notes_internes || '') + `\n[${new Date().toLocaleString('fr-FR')}] ${cfg.label} (via magic link)`
  }).eq('id', tok.lead_id);
  await sb.from('lead_action_tokens').update({ used_at: new Date().toISOString() }).eq('token', token);

  return htmlResp(200, cfg.label,
    `<strong>${lead.prenom || ''} ${lead.nom || ''}</strong> — ${cfg.msg}`, cfg.color, lead);
});

function htmlResp(status: number, title: string, body: string, color: string, lead?: any) {
  const leadInfo = lead ? `
    <div style="margin-top:24px;padding:16px 20px;background:#F8FAFC;border-radius:12px;text-align:left;font-size:.92rem;line-height:1.7">
      <div style="font-weight:700;color:#0A1428;margin-bottom:6px">Récap du lead :</div>
      <div>📞 <a href="tel:${lead.telephone || ''}" style="color:#0DA0CF;font-weight:700;text-decoration:none">${lead.telephone || '—'}</a></div>
      <div>✉️ <a href="mailto:${lead.email || ''}" style="color:#0DA0CF;text-decoration:none">${lead.email || '—'}</a></div>
      <div>📍 ${[lead.adresse, lead.code_postal, lead.ville].filter(Boolean).join(' ') || '—'}</div>
      <div>🔧 ${lead.metier || '—'}</div>
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} · HELP Confort</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;background:#F4F7FB;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#fff;max-width:480px;padding:40px 32px;border-radius:18px;box-shadow:0 12px 40px rgba(10,20,40,.10);text-align:center}
.ic{width:72px;height:72px;background:${color};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 18px}
h1{font-size:1.5rem;font-weight:800;color:#0A1428;margin:0 0 8px}
p{color:#475569;line-height:1.6;margin:0}
.foot{margin-top:28px;padding-top:18px;border-top:1px solid #E5EDF3;font-size:.84rem;color:#94a3b8}
.foot a{color:#0DA0CF;text-decoration:none;font-weight:700}</style></head>
<body><div class="card">
<div class="ic">${title.includes('expir') || title.includes('introuv') || title.includes('Erreur') ? '⚠️' : '✓'}</div>
<h1>${title}</h1>
<p>${body}</p>
${leadInfo}
<div class="foot">HELP Confort · <a href="https://www.depan59-62.fr/admin-pro/leads.html">Ouvrir le back-office</a></div>
</div></body></html>`;
  return new Response(html, { status, headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' } });
}
