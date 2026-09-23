// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// All notification event types
type NotificationEvent =
  | 'timesheet_ready_to_sign'      // Tech: your timesheet is ready, please sign
  | 'timesheet_correction_needed'  // Tech: admin asked for correction
  | 'timesheet_admin_modified'     // Tech: admin modified your timesheet
  | 'timesheet_validated'          // Tech: your timesheet was validated
  | 'timesheet_submitted'          // Admin: tech submitted a timesheet
  | 'timesheet_pending_validation' // Admin: timesheet needs validation
  | 'leave_request_created'        // Admin: new leave request to review
  | 'leave_request_decided'        // Tech: leave request approved/rejected
  | 'absence_request_created'      // Admin: new absence request
  | 'absence_request_decided'      // Tech: absence decided
  | 'absence_justification_needed' // Tech: provide justification
  | 'signature_pending'            // Tech: final signature needed
  | 'counter_corrected'            // Admin: counter corrected — notify tech
  | 'anomaly_detected'             // Admin: anomaly needs attention
  | 'late_timesheet_reminder'      // Tech: reminder for late timesheet
  | 'late_timesheet_escalation'    // CHANTIER 8: supervisor escalation
  // CHANTIER 7 — Vie d'equipe & anniversaires (2026-05-12)
  | 'birthday_self'                // Tech : son propre anniversaire (souhaits equipe)
  | 'birthday_team'                // Tech : anniversaire d'un collegue
  | 'birthday_credit_applied'      // Tech : credit anniversaire ajoute (jour non travaille)
  | 'birthday_admin_credit'        // Admin : crédit anniversaire applique a un tech
  | 'birthday_admin_digest_weekly' // Admin : digest anniversaires de la semaine
  | 'birthday_admin_digest_monthly'// Admin : digest anniversaires du mois
  | 'anticipated_leave_cancelled'  // Tech : son conge anticipe a ete annule par l'admin (avec motif)
  | 'general';                     // Generic

interface NotifyPayload {
  event: NotificationEvent;
  targetUserIds: string[];            // Users who need to act
  actorName?: string;                 // Who triggered the event
  details?: Record<string, unknown>;  // Additional context
  relatedWeek?: string;
}

// Map event → notification content
function buildNotificationContent(event: NotificationEvent, actorName?: string, details?: Record<string, unknown>): { title: string; body: string; subject: string; htmlBody: string } {
  const d = details || {};

  switch (event) {
    case 'timesheet_ready_to_sign':
      return {
        title: '📋 Feuille à signer',
        body: `Votre feuille d'heures S${d.weekNumber || ''} est prête. Merci de la signer.`,
        subject: `Feuille d'heures S${d.weekNumber || ''} à signer`,
        htmlBody: `<h2>📋 Feuille d'heures à signer</h2><p>Votre feuille d'heures de la <strong>semaine ${d.weekNumber || ''}</strong> est prête et attend votre signature.</p>`,
      };

    case 'timesheet_correction_needed':
      return {
        title: '🔧 Correction demandée',
        body: `Une correction est demandée sur votre feuille S${d.weekNumber || ''}. Merci de la vérifier.`,
        subject: `Correction demandée – S${d.weekNumber || ''}`,
        htmlBody: `<h2>🔧 Correction demandée</h2><p>${actorName || 'L\'administrateur'} a demandé une correction sur votre feuille de la <strong>semaine ${d.weekNumber || ''}</strong>.</p>${d.comment ? `<p style="color:#666;">Commentaire : ${d.comment}</p>` : ''}`,
      };

    case 'timesheet_admin_modified':
      return {
        title: '✏️ Feuille modifiée',
        body: `Votre feuille S${d.weekNumber || ''} a été modifiée par l'administration. Consultez les changements.`,
        subject: `Feuille modifiée par l'administration – S${d.weekNumber || ''}`,
        htmlBody: `<h2>✏️ Feuille modifiée</h2><p>Votre feuille de la <strong>semaine ${d.weekNumber || ''}</strong> a été modifiée par ${actorName || 'l\'administrateur'}. Veuillez consulter les changements.</p>`,
      };

    case 'timesheet_validated':
      return {
        title: '✅ Feuille validée',
        body: `Votre feuille S${d.weekNumber || ''} a été validée.`,
        subject: `Feuille validée – S${d.weekNumber || ''}`,
        htmlBody: `<h2>✅ Feuille validée</h2><p>Votre feuille de la <strong>semaine ${d.weekNumber || ''}</strong> a été validée par ${actorName || 'l\'administrateur'}.</p>`,
      };

    case 'timesheet_submitted':
      return {
        title: '📋 Feuille soumise',
        body: `${actorName || 'Un technicien'} a soumis sa feuille d'heures S${d.weekNumber || ''}.`,
        subject: `Feuille d'heures soumise – ${actorName || ''} S${d.weekNumber || ''}`,
        htmlBody: `<h2>📋 Nouvelle feuille à valider</h2><p><strong>${actorName || 'Un technicien'}</strong> a soumis sa feuille d'heures pour la <strong>semaine ${d.weekNumber || ''}</strong>.</p>`,
      };

    case 'timesheet_pending_validation':
      return {
        title: '⏳ Feuille en attente',
        body: `La feuille de ${actorName || 'un technicien'} attend votre validation.`,
        subject: `Feuille en attente de validation – ${actorName || ''}`,
        htmlBody: `<h2>⏳ Feuille en attente de validation</h2><p>La feuille de <strong>${actorName || 'un technicien'}</strong> attend votre validation.</p>`,
      };

    case 'leave_request_created':
      return {
        title: '🌴 Demande de congé',
        body: `${actorName || 'Un salarié'} a soumis une demande de ${d.leaveType || 'congé'} (${d.daysCount || ''}j).`,
        subject: `Demande de congé – ${actorName || ''}`,
        htmlBody: `<h2>🌴 Demande de congé à traiter</h2><p><strong>${actorName || 'Un salarié'}</strong> a soumis une demande de <strong>${d.leaveType || 'congé'}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Du</td><td style="padding:8px;border-bottom:1px solid #eee;">${d.startDate || ''}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Au</td><td style="padding:8px;border-bottom:1px solid #eee;">${d.endDate || ''}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Jours</td><td style="padding:8px;border-bottom:1px solid #eee;">${d.daysCount || ''}</td></tr>
          </table>`,
      };

    case 'leave_request_decided':
      return {
        title: d.decision === 'approved' ? '✅ Congé approuvé' : '❌ Congé refusé',
        body: `Votre demande de ${d.leaveType || 'congé'} a été ${d.decision === 'approved' ? 'approuvée' : 'refusée'}.${d.comment ? ` Commentaire : ${d.comment}` : ''}`,
        subject: `Congé ${d.decision === 'approved' ? 'approuvé' : 'refusé'}`,
        htmlBody: `<h2>${d.decision === 'approved' ? '✅ Congé approuvé' : '❌ Congé refusé'}</h2>
          <p>Votre demande de <strong>${d.leaveType || 'congé'}</strong> du <strong>${d.startDate || ''}</strong> au <strong>${d.endDate || ''}</strong> a été <strong>${d.decision === 'approved' ? 'approuvée' : 'refusée'}</strong>.</p>
          ${d.comment ? `<p style="color:#666;">Commentaire : ${d.comment}</p>` : ''}`,
      };

    case 'absence_request_created':
      return {
        title: '📝 Demande d\'absence',
        body: `${actorName || 'Un salarié'} a soumis une demande d'absence.`,
        subject: `Demande d'absence – ${actorName || ''}`,
        htmlBody: `<h2>📝 Demande d'absence à traiter</h2><p><strong>${actorName || 'Un salarié'}</strong> a soumis une demande d'absence du <strong>${d.startDate || ''}</strong> au <strong>${d.endDate || ''}</strong>.</p>`,
      };

    case 'absence_request_decided':
      return {
        title: d.decision === 'approved' ? '✅ Absence approuvée' : '❌ Absence refusée',
        body: `Votre demande d'absence a été ${d.decision === 'approved' ? 'approuvée' : 'refusée'}.`,
        subject: `Absence ${d.decision === 'approved' ? 'approuvée' : 'refusée'}`,
        htmlBody: `<h2>${d.decision === 'approved' ? '✅' : '❌'} Absence ${d.decision === 'approved' ? 'approuvée' : 'refusée'}</h2><p>Votre demande d'absence a été traitée.</p>`,
      };

    case 'absence_justification_needed':
      return {
        title: '📎 Justificatif attendu',
        body: `Un justificatif est attendu pour votre absence. Merci de le fournir.`,
        subject: `Justificatif d'absence requis`,
        htmlBody: `<h2>📎 Justificatif attendu</h2><p>Un justificatif est attendu pour votre absence. Merci de le fournir dans les meilleurs délais.</p>`,
      };

    case 'signature_pending':
      return {
        title: '✍️ Signature requise',
        body: `Votre feuille S${d.weekNumber || ''} attend votre signature finale.`,
        subject: `Signature requise – S${d.weekNumber || ''}`,
        htmlBody: `<h2>✍️ Signature finale requise</h2><p>Votre feuille de la <strong>semaine ${d.weekNumber || ''}</strong> a été validée${d.hasModifications ? ' avec modifications' : ''}. Votre signature finale est requise.</p>`,
      };

    case 'counter_corrected':
      return {
        title: '🔢 Compteur corrigé',
        body: `Votre compteur d'heures a été corrigé par l'administration.`,
        subject: `Compteur d'heures corrigé`,
        htmlBody: `<h2>🔢 Compteur corrigé</h2><p>Votre compteur d'heures a été corrigé par ${actorName || 'l\'administrateur'}.</p>
          ${d.reason ? `<p style="color:#666;">Motif : ${d.reason}</p>` : ''}`,
      };

    case 'anomaly_detected':
      return {
        title: '⚠️ Anomalie détectée',
        body: `Une anomalie a été détectée et nécessite votre attention.`,
        subject: `Anomalie détectée`,
        htmlBody: `<h2>⚠️ Anomalie détectée</h2><p>Une anomalie a été détectée dans le système et nécessite votre intervention.</p>${d.description ? `<p>${d.description}</p>` : ''}`,
      };

    case 'late_timesheet_reminder':
      return {
        title: `⚠️ Feuille en retard`,
        body: `Vous avez ${d.lateCount || 1} feuille(s) d'heures en retard. Merci de les compléter.`,
        subject: `Rappel : feuille(s) d'heures en retard`,
        htmlBody: `<h2>⚠️ Rappel – Feuille(s) en retard</h2><p>Vous avez <strong>${d.lateCount || 1} feuille(s)</strong> d'heures en retard de soumission.</p><p>Merci de les compléter et signer au plus vite.</p>`,
      };

    // ============================================================
    // CHANTIER 8 — Escalade superviseur si feuille reste en retard
    // ============================================================
    case 'late_timesheet_escalation':
      return {
        title: `🚨 Escalade — Feuille en retard (${actorName || 'technicien'})`,
        body: `${actorName || 'Un technicien'} a une feuille en retard depuis ${d.daysOverdue || ''} jours. Intervention superviseur attendue.`,
        subject: `[Escalade] Feuille en retard – ${actorName || ''} (${d.daysOverdue || '?'}j)`,
        htmlBody: `<h2>🚨 Escalade superviseur</h2>
          <p>La feuille d'heures de <strong>${actorName || 'un technicien'}</strong> est en retard depuis <strong>${d.daysOverdue || '?'} jours</strong>${d.weekToCheck ? ` (semaine ${d.weekToCheck})` : ''}.</p>
          <p>Le technicien a été relancé quotidiennement sans succès. Merci de prendre contact.</p>`,
      };

    // ============================================================
    // CHANTIER 7 — Vie d'equipe & anniversaires
    // ============================================================
    case 'birthday_self':
      return {
        title: '🎉 Joyeux anniversaire !',
        body: `Toute l'équipe Help Confort vous souhaite un joyeux anniversaire !`,
        subject: `🎉 Joyeux anniversaire !`,
        htmlBody: `<h2>🎉 Joyeux anniversaire !</h2>
          <p>Toute l'équipe vous souhaite une excellente journée 🎂</p>
          <p style="color:#666;">Profitez bien de cette journée offerte par l'entreprise !</p>`,
      };

    case 'birthday_team':
      return {
        title: `🎂 Anniversaire de ${actorName || 'un collègue'}`,
        body: `Aujourd'hui c'est l'anniversaire de ${actorName || 'un collègue'} ! Pensez à lui souhaiter 🎂`,
        subject: `🎂 Anniversaire — ${actorName || ''}`,
        htmlBody: `<h2>🎂 Aujourd'hui, c'est l'anniversaire de ${actorName || 'un collègue'} !</h2>
          <p>Pensez à lui souhaiter une bonne journée.</p>`,
      };

    case 'birthday_credit_applied': {
      const ctxLabel = (d.contextLabel as string) || 'jour non travaillé';
      const hours = d.hours ?? 0;
      return {
        title: '🎉 Crédit anniversaire ajouté',
        body: `Votre anniversaire tombant un ${ctxLabel}, un crédit de ${hours}h a été ajouté à votre compteur.`,
        subject: `🎉 Crédit anniversaire (+${hours}h)`,
        htmlBody: `<h2>🎉 Crédit anniversaire ajouté</h2>
          <p>Votre anniversaire tombant un <strong>${ctxLabel}</strong>, un crédit de <strong>+${hours}h</strong> a été automatiquement ajouté à votre compteur pour que vous ne perdiez pas votre journée offerte.</p>
          <p style="color:#666;">Vous pouvez la prendre quand vous le souhaitez en accord avec votre planning.</p>`,
      };
    }

    case 'birthday_admin_credit': {
      const ctxLabel = (d.contextLabel as string) || 'jour non travaillé';
      const hours = d.hours ?? 0;
      const techName = (d.techName as string) || actorName || 'un salarié';
      return {
        title: `🎂 Crédit anniversaire — ${techName}`,
        body: `+${hours}h ajoutées au compteur de ${techName} (anniv. un ${ctxLabel}).`,
        subject: `🎂 Crédit anniversaire automatique — ${techName}`,
        htmlBody: `<h2>🎂 Crédit anniversaire automatique</h2>
          <p>Le système a ajouté <strong>+${hours}h</strong> au compteur de <strong>${techName}</strong> (anniversaire tombant un ${ctxLabel}).</p>
          <p style="color:#666;">Cette opération est tracée dans le journal d'audit RH.</p>`,
      };
    }

    case 'birthday_admin_digest_weekly': {
      const list = (d.list as string) || 'Aucun anniversaire cette semaine.';
      return {
        title: '🎂 Anniversaires de la semaine',
        body: list,
        subject: `🎂 Anniversaires de la semaine`,
        htmlBody: `<h2>🎂 Anniversaires de la semaine</h2>
          <div style="white-space:pre-line;">${list}</div>`,
      };
    }

    case 'birthday_admin_digest_monthly': {
      const list = (d.list as string) || 'Aucun anniversaire ce mois.';
      return {
        title: '🎂 Anniversaires du mois',
        body: list,
        subject: `🎂 Anniversaires du mois`,
        htmlBody: `<h2>🎂 Anniversaires du mois</h2>
          <div style="white-space:pre-line;">${list}</div>`,
      };
    }

    // ============================================================
    // 2026-05-12 — Annulation d'une demande de conge anticipe
    // (notification au salarie avec motif obligatoire + info recredit)
    // ============================================================
    case 'anticipated_leave_cancelled': {
      const motif = (d.reason as string) || 'Non precise';
      const startDate = (d.startDate as string) || '';
      const endDate = (d.endDate as string) || '';
      const leaveType = (d.leaveType as string) || 'conge';
      const recredited = Number(d.recreditedDays ?? 0);
      const recreditLine = recredited > 0
        ? `<p style="background:#f0fdf4;border-left:4px solid #16a34a;padding:8px 12px;margin:12px 0;"><strong>${recredited}j</strong> ont été automatiquement <strong>recrédités</strong> à votre solde.</p>`
        : '<p style="color:#666;">Aucun jour n\'avait été imputé sur le solde, donc aucun recrédit n\'est nécessaire.</p>';
      return {
        title: '❌ Demande de congé anticipé annulée',
        body: `Votre demande de ${leaveType} du ${startDate} au ${endDate} a été annulée par l'administration. Motif : ${motif}`,
        subject: `Congé anticipé annulé — ${startDate} → ${endDate}`,
        htmlBody: `<h2>❌ Demande de congé anticipé annulée</h2>
          <p>Votre demande de <strong>${leaveType}</strong> du <strong>${startDate}</strong> au <strong>${endDate}</strong> a été annulée par l'administration.</p>
          <p style="background:#fef2f2;border-left:4px solid #dc2626;padding:8px 12px;margin:12px 0;"><strong>Motif :</strong> ${motif}</p>
          ${recreditLine}
          <p style="color:#666;font-size:13px;">Si vous avez une question, contactez votre responsable RH. Cette action est tracée dans le journal d'audit.</p>`,
      };
    }

    default:
      return {
        title: '🔔 Notification',
        body: (d.message as string) || 'Vous avez une nouvelle notification.',
        subject: 'Notification',
        htmlBody: `<h2>🔔 Notification</h2><p>${(d.message as string) || 'Vous avez une nouvelle notification.'}</p>`,
      };
  }
}

function buildFullEmailHtml(
  bodyHtml: string,
  companyName: string,
  primaryColor: string,
  appUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:${primaryColor};padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:20px;">${companyName}</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${bodyHtml}
          <div style="text-align:center;margin-top:24px;">
            <a href="${appUrl}" style="display:inline-block;background:${primaryColor};color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              Ouvrir l'application
            </a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px;">
          <p>Cet email a été envoyé automatiquement par ${companyName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const payload: NotifyPayload = await req.json();
    const { event, targetUserIds, actorName, details, relatedWeek } = payload;

    if (!event || !targetUserIds?.length) {
      return new Response(JSON.stringify({ error: 'event and targetUserIds required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load notification settings
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'notification_config')
      .maybeSingle();

    const config = (settingsData?.value as Record<string, unknown>) || {};
    const pushEnabled = config.push_enabled !== false;
    const emailEnabled = config.email_enabled === true;
    const disabledEvents = (config.disabled_events as string[]) || [];

    if (disabledEvents.includes(event)) {
      return new Response(JSON.stringify({ skipped: true, reason: 'event_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = buildNotificationContent(event, actorName, details);
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    let pushSent = 0;
    let emailsSent = 0;

    // ============================================================
    // 2026-05-12 — Source de verite IN-APP (fix annulation conge)
    // ============================================================
    // On ecrit AVANT push/email un notification_log channel='in_app'
    // pour chaque targetUserId. Garantit que le destinataire verra
    // la notif dans l'app meme si :
    //   - il n'a pas active le push (pas de push_subscription)
    //   - email_enabled = false dans notification_config
    //   - le push tombe ou Resend est indisponible
    // Le composant InAppNotificationsCard (tech home) lit ce log.
    // ============================================================
    let inAppLogged = 0;
    for (const userId of targetUserIds) {
      try {
        const { error: inAppErr } = await supabase
          .from('notification_log')
          .insert({
            user_id: userId,
            notification_type: event,
            title: content.title,
            body: content.body,
            channel: 'in_app',
            status: 'sent',
            related_week: relatedWeek || null,
            data: details || null,
          });
        if (!inAppErr) inAppLogged++;
        else console.error(`in_app log failed for ${userId}:`, inAppErr);
      } catch (err) {
        console.error(`in_app log threw for ${userId}:`, err);
      }
    }

    // --- PUSH ---
    if (pushEnabled) {
      for (const userId of targetUserIds) {
        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              action: 'send_to_user',
              userId,
              title: content.title,
              body: content.body,
              notificationType: event,
              relatedWeek: relatedWeek || null,
              data: { type: event, ...(details || {}) },
            }),
          });
          const result = await res.json();
          if (result.sent > 0) pushSent++;
        } catch (err) {
          console.error(`Push failed for ${userId}:`, err);
        }
      }
    }

    // --- EMAIL ---
    if (emailEnabled) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_API_KEY) {
        // Get recipient emails
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name')
          .in('user_id', targetUserIds)
          .eq('is_active', true)
          .not('email', 'is', null);

        if (profiles?.length) {
          // Load branding
          const { data: brandingData } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'branding')
            .maybeSingle();

          const branding = (brandingData?.value as Record<string, string>) || {};
          const companyName = branding.company_name || 'Help Confort';
          const primaryColor = branding.primary_color || '#0066B3';
          const appUrl = 'https://click-and-clock.lovable.app';

          const fullHtml = buildFullEmailHtml(content.htmlBody, companyName, primaryColor, appUrl);

          const emails = profiles.map(p => p.email!).filter(Boolean);

          // CHANTIER 8 / Phase 8.1 (2026-05-12) : adresse d'envoi configurable.
          // Priorite : 1) env RESEND_FROM_EMAIL (secret Supabase) 2) branding.email_from
          // 3) fallback sandbox Resend pour ne pas casser le dev.
          // IMPORTANT : tant que le domaine n'est pas verifie dans Resend, seul
          // 'onboarding@resend.dev' fonctionne (sandbox). Configurer le domaine
          // helpconfort.com dans Resend pour utiliser 'no-reply@helpconfort.com'.
          const fromEmail = (Deno.env.get('RESEND_FROM_EMAIL') as string | undefined)
            || (branding.email_from as string | undefined)
            || 'onboarding@resend.dev';
          const fromHeader = `${companyName} <${fromEmail}>`;
          const replyTo = (branding.email_reply_to as string | undefined) || undefined;

          try {
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromHeader,
                ...(replyTo ? { reply_to: replyTo } : {}),
                to: emails,
                subject: `[${companyName}] ${content.subject}`,
                html: fullHtml,
              }),
            });

            if (resendResponse.ok) emailsSent = emails.length;
          } catch (err) {
            console.error('Email send failed:', err);
          }

          // Log email notifications
          for (const profile of profiles) {
            await supabase.from('notification_log').insert({
              user_id: profile.user_id,
              notification_type: event,
              title: content.title,
              body: content.body,
              channel: 'email',
              status: emailsSent > 0 ? 'sent' : 'failed',
              related_week: relatedWeek || null,
              data: details || null,
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ pushSent, emailsSent, inAppLogged, event }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-action:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
