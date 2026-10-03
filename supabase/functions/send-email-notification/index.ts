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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationPayload {
  type: 'timesheet_submitted' | 'leave_request' | 'critical_delay';
  technicianName: string;
  technicianId?: string;
  details: {
    weekNumber?: number;
    weekStart?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    daysCount?: number;
    reason?: string;
    lateWeeksCount?: number;
    lateWeeks?: string[];
  };
}

// Escape HTML to prevent injection through user-controlled fields embedded in emails
function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Authentication: require a valid Supabase JWT ----
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const payload: EmailNotificationPayload = await req.json();
    console.log('Email notification request from user:', claimsData.claims.sub, 'type:', payload.type);

    // Load email notification settings
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'email_notifications_config')
      .maybeSingle();

    const settings = settingsData?.value as {
      enabled: boolean;
      recipient_roles: string[];
      events: {
        timesheet_submitted: boolean;
        leave_request: boolean;
        critical_delay: boolean;
      };
    } | null;

    // Check if email notifications are enabled
    if (!settings?.enabled) {
      console.log('Email notifications are disabled');
      return new Response(JSON.stringify({ message: 'Email notifications disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this event type is enabled
    if (!settings.events[payload.type]) {
      console.log(`Event type ${payload.type} is disabled`);
      return new Response(JSON.stringify({ message: `Event ${payload.type} disabled` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get recipient emails based on configured roles
    const recipientRoles = settings.recipient_roles || ['admin'];
    const { data: roleUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', recipientRoles);

    if (!roleUsers?.length) {
      console.log('No recipients found for roles:', recipientRoles);
      return new Response(JSON.stringify({ message: 'No recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userIds = roleUsers.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .in('user_id', userIds)
      .eq('is_active', true)
      .not('email', 'is', null);

    if (!profiles?.length) {
      console.log('No email addresses found for recipients');
      return new Response(JSON.stringify({ message: 'No email addresses' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let recipientEmails = profiles.map(p => p.email!).filter(Boolean);
    console.log('Sending to:', recipientEmails.length, 'recipients (raw):', recipientEmails);

    // -------------------------------------------------------------------
    // FALLBACK MODE — when no Resend domain is verified yet
    //
    // On Resend's free tier without a verified sending domain, the
    // provider rejects (HTTP 403) any send whose recipient list contains
    // an address other than the Resend account owner's. To unblock the
    // system before a real domain is bought + verified, we let admins
    // configure a single "fallback recipient" via Supabase Secrets.
    //
    // If EMAIL_FALLBACK_RECIPIENT is set, we replace the recipient list
    // with that single address — every notification still fires, but it
    // lands in one inbox. Once a real domain is verified, simply unset
    // the secret and full multi-recipient delivery resumes.
    // -------------------------------------------------------------------
    const fallbackRecipient = (Deno.env.get('EMAIL_FALLBACK_RECIPIENT') || '').trim();
    if (fallbackRecipient) {
      console.log('[email-fn] EMAIL_FALLBACK_RECIPIENT active, overriding recipients to:', fallbackRecipient);
      recipientEmails = [fallbackRecipient];
    }

    // Build email content based on event type
    const { subject, htmlBody } = buildEmailContent(payload);

    // Load branding for email
    const { data: brandingData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'branding')
      .maybeSingle();

    const branding = brandingData?.value as {
      company_name?: string;
      primary_color?: string;
      email_from?: string;
      email_reply_to?: string;
    } | null;
    const companyName = branding?.company_name || 'Help Confort';
    const primaryColor = branding?.primary_color || '#0066B3';

    const appUrl = req.headers.get('origin') || 'https://click-and-clock.lovable.app';

    const fullHtml = buildFullEmailHtml(htmlBody, companyName, primaryColor, appUrl, payload.type);

    // CHANTIER 8 / Phase 8.1 (2026-05-12) : adresse expediteur configurable.
    // Priorite : RESEND_FROM_EMAIL (secret) > branding.email_from > sandbox.
    const fromEmail = (Deno.env.get('RESEND_FROM_EMAIL') as string | undefined)
      || branding?.email_from
      || 'onboarding@resend.dev';
    const fromHeader = `${companyName} <${fromEmail}>`;

    // Send via Resend
    console.log('[email-fn] About to call Resend with', recipientEmails.length, 'recipients (count only, no PII)');
    const resendBody = {
      from: fromHeader,
      ...(branding?.email_reply_to ? { reply_to: branding.email_reply_to } : {}),
      to: recipientEmails,
      subject: `[${companyName}] ${subject}`,
      html: fullHtml,
    };
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });

    const resendResult = await resendResponse.json();
    console.log('[email-fn] Resend status:', resendResponse.status, 'body:', JSON.stringify(resendResult));

    if (!resendResponse.ok) {
      console.error('[email-fn] Resend rejected the email:', resendResponse.status, resendResult);
      // Return the actual Resend error to the client so we can diagnose
      return new Response(JSON.stringify({
        error: 'Email provider rejected the request',
        resend_status: resendResponse.status,
        resend_message: resendResult?.message || resendResult?.error || JSON.stringify(resendResult),
        recipients_count: recipientEmails.length,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      sent_to: recipientEmails.length,
      resend_id: resendResult.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[email-fn] Unexpected error:', error);
    // TEMPORARY: expose error message to the client to debug end-to-end.
    // Revert to generic message after the email pipeline is fixed.
    const errMessage = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    return new Response(JSON.stringify({
      error: 'Internal error in send-email-notification',
      details: errMessage,
      stack: errStack,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildEmailContent(payload: EmailNotificationPayload): { subject: string; htmlBody: string } {
  // Sanitize all user-controlled values before embedding in HTML
  const name = escapeHtml(payload.technicianName);
  const d = payload.details || {};
  const weekNumber = escapeHtml(d.weekNumber);
  const weekStart = escapeHtml(d.weekStart);
  const leaveType = escapeHtml(d.leaveType);
  const startDate = escapeHtml(d.startDate);
  const endDate = escapeHtml(d.endDate);
  const daysCount = escapeHtml(d.daysCount);
  const reason = escapeHtml(d.reason);
  const lateWeeksCount = escapeHtml(d.lateWeeksCount);
  const lateWeeks = Array.isArray(d.lateWeeks) ? d.lateWeeks.map(escapeHtml) : [];

  switch (payload.type) {
    case 'timesheet_submitted':
      return {
        subject: `Feuille d'heures soumise - ${name}`,
        htmlBody: `
          <h2>📋 Nouvelle feuille d'heures à valider</h2>
          <p><strong>${name}</strong> a soumis sa feuille d'heures pour la <strong>semaine ${weekNumber}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Semaine</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">S${weekNumber}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Début de semaine</td><td style="padding:8px;border-bottom:1px solid #eee;">${weekStart}</td></tr>
          </table>
        `,
      };

    case 'leave_request':
      return {
        subject: `Demande de congé - ${name}`,
        htmlBody: `
          <h2>🌴 Nouvelle demande de congé</h2>
          <p><strong>${name}</strong> a soumis une demande de congé.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Type</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">${leaveType}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Du</td><td style="padding:8px;border-bottom:1px solid #eee;">${startDate}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Au</td><td style="padding:8px;border-bottom:1px solid #eee;">${endDate}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Jours</td><td style="padding:8px;border-bottom:1px solid #eee;">${daysCount}</td></tr>
            ${reason ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Motif</td><td style="padding:8px;border-bottom:1px solid #eee;">${reason}</td></tr>` : ''}
          </table>
        `,
      };

    case 'critical_delay':
      return {
        subject: `⚠️ Retard critique - ${name}`,
        htmlBody: `
          <h2>⚠️ Retard critique de saisie</h2>
          <p><strong>${name}</strong> a <strong>${lateWeeksCount} semaine(s)</strong> en retard de saisie.</p>
          ${lateWeeks.length ? `
            <p style="color:#666;">Semaines concernées :</p>
            <ul style="margin:8px 0;">
              ${lateWeeks.map(w => `<li>${w}</li>`).join('')}
            </ul>
          ` : ''}
        `,
      };

    default:
      return { subject: 'Notification', htmlBody: '<p>Nouvelle notification</p>' };
  }
}

function buildFullEmailHtml(
  body: string, 
  companyName: string, 
  primaryColor: string, 
  appUrl: string,
  eventType: string
): string {
  const safeCompany = escapeHtml(companyName);
  // Validate primary color (hex only) to avoid CSS injection
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(primaryColor) ? primaryColor : '#0066B3';
  const safeAppUrl = escapeHtml(appUrl);

  const ctaText = eventType === 'leave_request' 
    ? 'Voir les demandes de congé' 
    : 'Accéder au tableau de bord';
  
  const ctaPath = '/admin';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:${safeColor};padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:20px;">${safeCompany}</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${body}
          <div style="text-align:center;margin-top:24px;">
            <a href="${safeAppUrl}${ctaPath}" 
               style="display:inline-block;background:${safeColor};color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              ${ctaText}
            </a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px;">
          <p>Cet email a été envoyé automatiquement par ${safeCompany}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
