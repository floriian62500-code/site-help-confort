// ═══════════════════════════════════════════════════════════════════════════
// lead-auto-reply — accusé de réception envoyé au CLIENT après une demande
// v2.0.0 (2026-09-18) — source restaurée dans le dépôt + vérité métier corrigée
// ═══════════════════════════════════════════════════════════════════════════
// Appelée par submit-lead-v6 UNIQUEMENT à la validation finale d'une demande.
// Une simple consultation des tarifs (intention) ne déclenche aucun email : la
// demande n'est pas terminée (directives 5713150094 / 5713186419).
//
// Vérité métier appliquée (remplace les promesses non tenables) :
//   • une seule agence physique : HELP Confort Saint-Omer (le reste = zone desservie) ;
//   • rappel « sous 24 h ouvrées », jamais « sous 30 minutes » ;
//   • horaires réels : lun–ven 9h–17h, sam 9h–16h — pas de 7j/7 ;
//   • le message correspond au type réel de demande (intervention / devis / entretien).
//
// Body : { lead_id: "uuid" }
// ═══════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const AGENCE = 'HELP Confort Saint-Omer';
const TEL = '03 66 10 01 34';
const HORAIRES = 'lun–ven 9h–17h, sam 9h–16h';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { lead_id, kind: mailKind } = await req.json();
    const isPayment = String(mailKind || '') === 'payment';
    if (!lead_id) return json({ error: 'lead_id required' }, 400);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: lead, error: lErr } = await supabase.from('leads').select('*').eq('id', lead_id).single();
    if (lErr || !lead) return json({ error: 'lead not found' }, 404);

    // Demande non finalisée (consultation des tarifs) : aucun accusé de réception.
    const meta = lead.metadata || {};
    const isIntent = lead.status === 'intent' || meta.intent === true || (lead.type_demande || '') === 'consultation_tarifs';
    if (isIntent && !meta.finalized_at) return json({ ok: true, sent: false, reason: 'intent_not_finalized' });

    if (!lead.email) return json({ ok: true, sent: false, reason: 'no_client_email' });
    if (isPayment && (!meta.payment || meta.payment.status !== 'paid')) return json({ ok: true, sent: false, reason: 'payment_not_confirmed' });
    if (isPayment && meta.payment.client_notified_at) return json({ ok: true, sent: false, reason: 'already_replied' });
    if (!isPayment && meta.client_replied_at) return json({ ok: true, sent: false, reason: 'already_replied' });
    if (/TEST\s*RECETTE|NE\s*PAS\s*TRAITER/i.test(`${lead.nom || ''} ${lead.prenom || ''}`)) {
      return json({ ok: true, sent: false, reason: 'lead_de_test' });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) return json({ ok: true, sent: false, reason: 'no_resend_key' });

    const firstName = (lead.prenom || '').trim();
    const kind = demandeKind(lead);
    const ref = 'HC-' + String(lead.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase();
    const subject = isPayment ? `Paiement reçu — dossier ${ref} — HELP Confort Saint-Omer`
      : `Votre ${kind.noun} HELP Confort a bien été reçue${lead.metier ? ' (' + labelMetier(lead.metier) + ')' : ''}`;
    const html = isPayment ? buildPaymentHtml(lead, firstName, ref) : buildHtml(lead, firstName, kind);
    const text = isPayment ? buildPaymentText(lead, firstName, ref) : buildText(lead, firstName, kind);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'HELP Confort <noreply@depan59-62.fr>',
        to: [lead.email],
        reply_to: 'saint-omer@helpconfort.com',
        subject, html, text,
      }),
    });
    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('[lead-auto-reply] Resend error:', resendRes.status, err);
      return json({ ok: false, sent: false, error: err, status: resendRes.status }, 200);
    }
    const data = await resendRes.json();
    const stamp = new Date().toISOString();
    const nextMeta = isPayment
      ? { ...meta, payment: { ...meta.payment, client_notified_at: stamp, client_email_id: data.id } }
      : { ...meta, client_replied_at: stamp, client_reply_email_id: data.id };
    await supabase.from('leads').update({ metadata: nextMeta }).eq('id', lead_id);

    return json({ ok: true, sent: true, email_id: data.id, to: lead.email, kind: kind.key });
  } catch (e) {
    console.error('[lead-auto-reply] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// Le contenu suit le type RÉEL de la demande (plus de message unique « votre demande »).
type Kind = { key: string; noun: string; title: string; steps: string[] };
function demandeKind(l: any): Kind {
  const t = String(l.type_demande || '').toLowerCase();
  const ft = String(l.metadata?.form_type || '').toLowerCase();
  if (t === 'contrat_entretien' || t === 'entretien' || /contrat entretien/i.test(String(l.metier || ''))) {
    return { key: 'entretien', noun: 'demande d’entretien', title: 'Votre demande d’entretien est bien reçue', steps: [
      'Un technicien vérifie votre équipement et la formule adaptée',
      `L’agence de Saint-Omer vous rappelle sous 24 h ouvrées (${HORAIRES})`,
      'Nous convenons ensemble de la date de la visite',
    ] };
  }
  if (t === 'devis' || ft === 'devis_express') {
    return { key: 'devis', noun: 'demande de devis', title: 'Votre demande de devis est bien reçue', steps: [
      'Un technicien étudie votre projet à partir de votre description',
      `L’agence de Saint-Omer vous rappelle sous 24 h ouvrées (${HORAIRES})`,
      'Vous recevez votre devis gratuit ; une visite sur place peut être proposée si nécessaire',
    ] };
  }
  return { key: 'intervention', noun: 'demande d’intervention', title: 'Votre demande d’intervention est bien reçue', steps: [
    `L’agence de Saint-Omer vous rappelle sous 24 h ouvrées (${HORAIRES})`,
    'Le créneau est fixé avec vous — aucun créneau n’est réservé en ligne',
    'Le technicien intervient ; les prix fermes affichés restent ceux annoncés',
  ] };
}

const METIER_LABELS: Record<string, string> = {
  plomberie: 'Plomberie', chauffage: 'Chauffage', electricite: 'Électricité', serrurerie: 'Serrurerie',
  vitrerie: 'Vitrerie', renovation: 'Rénovation', 'chauffe-eau': 'Chauffe-eau',
};
function labelMetier(m: string): string { return METIER_LABELS[(m || '').toLowerCase()] || (m || 'Demande'); }

// Récapitulatif du dossier pour le client : référence, prestations, total, statut de paiement.
const PAY_ORIGINS = [/^https:\/\/deploy-preview-\d+--remarkable-dragon-364e2b\.netlify\.app$/, /^https:\/\/(www\.)?depan59-62\.fr$/];
function recapOf(l: any) {
  const lines = String(l.message || '').split('\n');
  const bullets = lines.filter((x) => /^\s*•\s+/.test(x)).map((x) => x.replace(/^\s*•\s+/, '').trim());
  const totalLine = lines.find((x) => /^Total prix fermes\s:/.test(x.trim()));
  const total = totalLine ? totalLine.split(':').slice(1).join(':').trim() : '';
  const allFirm = bullets.length > 0 && bullets.every((b) => /prix ferme/i.test(b));
  const ref = 'HC-' + String(l.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase();
  const p = l.metadata?.payment || null;
  let origin = 'https://depan59-62.fr';
  try { const o = new URL(String(l.source_page || '')).origin; if (PAY_ORIGINS.some((re) => re.test(o))) origin = o; } catch (_) { /* défaut */ }
  const payAvailable = (Deno.env.get('STRIPE_TEST_SECRET_KEY') || '').startsWith('sk_test_');
  const payLink = allFirm && payAvailable && l.metadata?.pay_token ? `${origin}/catalogue.html#payer=${l.id}.${l.metadata.pay_token}` : '';
  const payState = p && p.status === 'paid' ? 'paid' : (payLink ? 'payable' : (allFirm ? 'after' : 'validation'));
  return { bullets, total, ref, payState, payLink, paid: p };
}

function buildHtml(l: any, firstName: string, kind: Kind): string {
  const greeting = firstName ? `Bonjour ${escapeHtml(firstName)},` : 'Bonjour,';
  const metierTxt = l.metier ? ` concernant un besoin <strong>${escapeHtml(labelMetier(l.metier))}</strong>` : '';
  const ville = l.ville ? ' à ' + escapeHtml(l.ville) : '';
  const steps = kind.steps.map((s, i) => `
    <tr><td style="padding:8px 0"><span style="display:inline-block;width:28px;height:28px;background:#1FC4F0;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-weight:800;margin-right:12px">${i + 1}</span></td>
    <td style="padding:8px 0">${escapeHtml(s)}</td></tr>`).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;box-shadow:0 6px 24px rgba(10,20,40,.08);overflow:hidden;max-width:600px">

<tr><td style="background:linear-gradient(135deg,#0A1428,#172240);padding:32px 28px;color:#fff;text-align:center">
  <img src="https://depan59-62.fr/logo-officiel.jpg" alt="HELP Confort" style="height:48px;margin-bottom:14px">
  <div style="font-size:22px;font-weight:800;margin:6px 0;line-height:1.3">${escapeHtml(kind.title)}</div>
  <div style="font-size:14px;opacity:.85">L’agence de Saint-Omer vous rappelle <strong style="color:#1FC4F0">sous 24 h ouvrées</strong></div>
</td></tr>

<tr><td style="padding:32px 28px;color:#0A1428;font-size:15px;line-height:1.6">
  <p style="margin:0 0 16px">${greeting}</p>
  <p style="margin:0 0 16px">Nous avons bien reçu votre ${escapeHtml(kind.noun)}${metierTxt}${ville}. Merci de votre confiance.</p>
  ${(() => {
    const r = recapOf(l);
    const items = r.bullets.map((b) => `<li style="margin:4px 0">${escapeHtml(b)}</li>`).join('');
    const payTxt = r.payState === 'paid'
      ? `<div style="background:#ECFDF5;border-radius:10px;padding:12px 16px;margin:0 0 16px;color:#14532D"><strong>Paiement reçu</strong> — ${escapeHtml(Number(r.paid.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }))} € TTC.</div>`
      : r.payState === 'payable'
        ? `<div style="background:#EFF6FF;border-radius:10px;padding:14px 16px;margin:0 0 16px;color:#1E3A8A;font-size:14px;line-height:1.55">Vous pouvez régler en ligne dès maintenant (facultatif), ou après l’intervention.<br><a href="${r.payLink}" style="display:inline-block;margin-top:10px;padding:11px 18px;background:#F2600C;color:#fff;text-decoration:none;border-radius:999px;font-weight:700">Régler en ligne</a></div>`
        : r.payState === 'after'
          ? `<p style="margin:0 0 16px;font-size:14px;color:#475569">Paiement : vous réglez après l’intervention.</p>`
          : `<p style="margin:0 0 16px;font-size:14px;color:#475569">Paiement : disponible après validation de l’agence (une prestation est à confirmer sur place ou sur devis).</p>`;
    return `<div style="border:1px solid #E5EDF3;border-radius:12px;padding:16px 18px;margin:0 0 18px">
      <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0A6C8F;margin-bottom:6px">Votre dossier ${escapeHtml(r.ref)}</div>
      ${items ? `<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.55">${items}</ul>` : ''}
      ${r.total ? `<p style="margin:10px 0 0;font-size:15px"><strong>Total des prix fermes : ${escapeHtml(r.total)}</strong></p>` : ''}
    </div>${kind.key === 'intervention' ? payTxt : ''}`;
  })()}
  <p style="margin:0 0 16px"><strong>Que se passe-t-il maintenant ?</strong></p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">${steps}</table>
  ${kind.key === 'intervention' ? `<div style="background:#FFF7EC;border:1px solid rgba(255,138,26,.24);padding:14px 18px;border-radius:12px;margin:0 0 20px;color:#7C4A12;font-size:14px;line-height:1.55"><strong>Prix sous réserve de vérification sur place :</strong> le montant annoncé correspond au forfait choisi. Si le technicien constate un besoin différent ou complémentaire, un ajustement ou un devis complémentaire vous est proposé avant toute intervention — aucun supplément n'est engagé sans votre accord.</div>` : ''}
  <div style="background:#FFFBEB;border-left:4px solid #FFB400;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 24px">
    <strong style="color:#92400E">Besoin urgent ?</strong> Appelez l’agence au <a href="tel:+33366100134" style="color:#FF6B1A;font-weight:800;text-decoration:none">${TEL}</a> — ${HORAIRES}.
  </div>
  <p style="margin:0 0 8px;font-size:13px;color:#475569">Si votre situation évolue ou si vous souhaitez préciser votre demande, répondez simplement à cet email.</p>
  <p style="margin:24px 0 0;color:#475569;font-size:14px">Bonne journée,<br><strong style="color:#0A1428">L’équipe ${escapeHtml(AGENCE)}</strong></p>
</td></tr>

<tr><td style="padding:22px 28px;background:#fafcfd;border-top:1px solid #E5EDF3;text-align:center;font-size:12px;color:#94a3b8;line-height:1.7">
  <div style="margin-bottom:10px">
    <a href="tel:+33366100134" style="color:#0DA0CF;text-decoration:none;font-weight:700;margin:0 8px">${TEL}</a> ·
    <a href="https://depan59-62.fr" style="color:#0DA0CF;text-decoration:none;font-weight:700;margin:0 8px">depan59-62.fr</a>
  </div>
  <div>SARL Dépannage 59-62 — réseau HELP Confort<br>Agence de Saint-Omer · 242 route de Boulogne · 62500 Saint-Martin-lez-Tatinghem</div>
</td></tr>

</table></td></tr></table></body></html>`;
}

function buildText(l: any, firstName: string, kind: Kind): string {
  const r = recapOf(l);
  return `Bonjour ${firstName || ''},

Nous avons bien reçu votre ${kind.noun} — dossier ${r.ref}.
${r.bullets.length ? '\n' + r.bullets.map((b) => '• ' + b).join('\n') + '\n' : ''}${r.total ? 'Total des prix fermes : ' + r.total + '\n' : ''}${kind.key === 'intervention' ? (r.payState === 'paid' ? 'Paiement reçu.\n' : (r.payState === 'payable' ? 'Régler en ligne (facultatif) : ' + r.payLink + '\n' : (r.payState === 'after' ? 'Paiement : après l’intervention.\n' : 'Paiement : après validation de l’agence.\n'))) : ''}
${kind.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${kind.key === 'intervention' ? "Prix sous réserve de vérification sur place : le montant annoncé correspond au forfait choisi ; tout ajustement vous est proposé avant intervention.\n\n" : ''}Besoin urgent ? Appelez l'agence au ${TEL} (${HORAIRES}).

Bonne journée,
L'équipe ${AGENCE}

${TEL} · depan59-62.fr`;
}

function buildPaymentHtml(l: any, firstName: string, ref: string): string {
  const p = l.metadata?.payment || {};
  const amount = Number(p.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  const when = new Date(p.paid_at || Date.now()).toLocaleString('fr-FR');
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;box-shadow:0 6px 24px rgba(10,20,40,.08);overflow:hidden;max-width:600px">
<tr><td style="background:linear-gradient(135deg,#0A1428,#172240);padding:28px;color:#fff;text-align:center">
  <div style="font-size:22px;font-weight:800">Paiement reçu</div>
  <div style="font-size:14px;opacity:.85;margin-top:6px">Dossier ${escapeHtml(ref)}</div>
</td></tr>
<tr><td style="padding:28px;color:#0A1428;font-size:15px;line-height:1.6">
  <p style="margin:0 0 14px">${firstName ? 'Bonjour ' + escapeHtml(firstName) + ',' : 'Bonjour,'}</p>
  <p style="margin:0 0 14px">Nous avons bien reçu votre paiement de <strong>${escapeHtml(amount)} € TTC</strong> le ${escapeHtml(when)} pour le dossier <strong>${escapeHtml(ref)}</strong>.</p>
  <p style="margin:0 0 14px">L’agence de Saint-Omer vous rappelle sous 24 h ouvrées (${HORAIRES}) pour fixer le créneau de l’intervention.</p>
  <div style="background:#FFF7EC;border:1px solid rgba(255,138,26,.24);padding:14px 18px;border-radius:12px;margin:0 0 18px;color:#7C4A12;font-size:14px;line-height:1.55"><strong>Prix sous réserve de vérification sur place :</strong> le montant réglé correspond au forfait choisi. Si le technicien constate un besoin différent ou complémentaire, un ajustement vous est proposé avant toute intervention — aucun supplément n’est engagé sans votre accord.</div>
  <p style="margin:0;color:#475569;font-size:14px">L’équipe ${escapeHtml(AGENCE)} · ${TEL}</p>
</td></tr></table></td></tr></table></body></html>`;
}
function buildPaymentText(l: any, firstName: string, ref: string): string {
  const p = l.metadata?.payment || {};
  return `Bonjour ${firstName || ''},\n\nNous avons bien reçu votre paiement de ${Number(p.amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € TTC pour le dossier ${ref}.\nL'agence de Saint-Omer vous rappelle sous 24 h ouvrées (${HORAIRES}) pour fixer le créneau.\n\nPrix sous réserve de vérification sur place : tout ajustement vous est proposé avant intervention.\n\nL'équipe ${AGENCE} · ${TEL}`;
}

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
