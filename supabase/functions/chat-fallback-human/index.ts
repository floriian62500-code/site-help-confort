// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// chat-fallback-human — escalade vers humaine quand IA ne sait pas répondre
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });
  try {
    const body = await req.json();
    const sessionId = body.session_id || 'unknown';
    const userMsg = String(body.user_message || '').slice(0, 4000);
    const aiAttempts = Array.isArray(body.ai_attempts) ? body.ai_attempts.slice(0, 10) : [];
    const visitorEmail = body.visitor_email || null;
    const visitorName = body.visitor_name || null;
    const visitorPhone = body.visitor_phone || null;
    const pageUrl = body.page_url || '(inconnue)';
    const reason = body.reason || 'ai_dont_know';

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await sb.from('chat_human_handoffs').insert({
      session_id: sessionId,
      user_message: userMsg,
      ai_attempts: aiAttempts,
      visitor_email: visitorEmail,
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
      page_url: pageUrl,
      reason,
      status: 'nouveau'
    });

    const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_KEY) {
      const reasonLabels: Record<string, string> = {
        ai_dont_know: 'L IA n a pas su répondre',
        explicit_human: 'Le client a demandé un humain',
        complex_topic: 'Sujet jugé complexe par l IA',
        multiple_questions: 'Trop de questions accumulées'
      };
      const reasonLabel = reasonLabels[reason] || reason;
      const esc = (s: string) => String(s).replace(/[&<>"]/g, (c: string) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
      const coord = (visitorName || visitorEmail || visitorPhone)
        ? '<div style="background:#F8FCFE;border-left:4px solid #0DA0CF;padding:14px 18px;border-radius:0 8px 8px 0;margin:14px 0"><strong style="color:#0DA0CF;font-size:.78rem;text-transform:uppercase">Coordonnées</strong><br>' + (visitorName ? '<strong>' + esc(visitorName) + '</strong><br>' : '') + (visitorPhone ? '☎ ' + esc(visitorPhone) + '<br>' : '') + (visitorEmail ? '✉ ' + esc(visitorEmail) : '') + '</div>'
        : '<div style="color:#94a3b8;font-size:.86rem;margin:14px 0">Visiteur anonyme</div>';
      const attemptsHtml = aiAttempts.length
        ? '<div style="background:#FAFCFD;border-left:3px solid #94a3b8;padding:10px 14px;margin:10px 0;font-size:.84rem;color:#475569"><strong>Tentatives IA :</strong><br>' + aiAttempts.map((a: any, i: number) => (i + 1) + '. ' + esc(String(a).slice(0, 200))).join('<br>') + '</div>'
        : '';
      const html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F4F7FB;padding:24px">' +
        '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(10,20,40,.08)">' +
        '<tr><td style="background:#FF6B1A;padding:18px 24px;color:#fff">' +
        '<div style="font-size:11px;font-weight:700;opacity:.85;text-transform:uppercase;letter-spacing:.06em">Chat IA vers humain</div>' +
        '<div style="font-size:18px;font-weight:800;margin-top:4px">' + esc(reasonLabel) + '</div>' +
        '</td></tr>' +
        '<tr><td style="padding:24px">' +
        '<div style="background:#FFFBEB;border-left:4px solid #FFB400;padding:14px 18px;border-radius:0 8px 8px 0">' +
        '<strong style="color:#92400E;font-size:.78rem;text-transform:uppercase">Message visiteur</strong><br>' +
        '<div style="margin-top:8px;font-size:14px;color:#0A1428;line-height:1.55;white-space:pre-wrap">' + esc(userMsg) + '</div>' +
        '</div>' + coord + attemptsHtml +
        '<div style="font-size:.82rem;color:#64748b;margin-top:14px"><strong>Page :</strong> ' + esc(pageUrl) + '<br><strong>Session :</strong> ' + esc(sessionId) + '</div>' +
        '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #E5EDF3"><strong>A faire :</strong> rappeler le visiteur si tél, sinon répondre par mail.</div>' +
        '</td></tr></table></body></html>';

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Florian D Haillecourt <noreply@depan59-62.fr>',
          to: ['saint-omer@helpconfort.com', 'dunkerque@helpconfort.com'],
          reply_to: visitorEmail || 'florian.dhaillecourt@helpconfort.com',
          subject: 'Chat vers humain - ' + reasonLabel,
          html,
          headers: {
            'List-Unsubscribe': '<mailto:florian.dhaillecourt@helpconfort.com?subject=Unsubscribe>',
            'X-Entity-Ref-ID': sessionId
          }
        })
      });
    }

    return new Response(JSON.stringify({ success: true, handoff: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
