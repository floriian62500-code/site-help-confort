// ═══════════════════════════════════════════════════════════════════════════
// stripe-webhook-test — confirmation des paiements Stripe TEST sur le MÊME dossier
// Directive 5713247831. Événements acceptés uniquement s'ils sont :
//   • signés avec STRIPE_TEST_WEBHOOK_SECRET (tolérance 5 min) ;
//   • en mode TEST (livemode:false) — un événement live est refusé.
// Effets (idempotents) :
//   • checkout.session.completed → metadata.payment.status='paid' (+ montant, date, références)
//     puis UNE notification agence « Paiement reçu » et UN email de confirmation client ;
//   • checkout.session.expired / async_payment_failed → statut mis à jour (le dossier reste intact).
// Un événement rejoué (même id) ou un dossier déjà payé ne déclenche rien de plus.
// ═══════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const enc = new TextEncoder();

async function hmacHex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function safeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const secret = Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET') || '';
  if (!secret) return json({ ok: false, blocked: 'missing_webhook_secret' }, 503);

  const raw = await req.text();
  const header = req.headers.get('stripe-signature') || '';
  const parts: Record<string, string[]> = {};
  header.split(',').forEach((kv) => { const [k, v] = kv.split('='); if (k && v) (parts[k.trim()] = parts[k.trim()] || []).push(v.trim()); });
  const t = Number((parts.t || [])[0] || 0);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return json({ error: 'signature expirée ou absente' }, 400);
  const expected = await hmacHex(secret, `${t}.${raw}`);
  if (!(parts.v1 || []).some((v) => safeEq(v, expected))) return json({ error: 'signature invalide' }, 400);

  let event: any = null;
  try { event = JSON.parse(raw); } catch (_) { return json({ error: 'JSON invalide' }, 400); }
  if (event.livemode === true) return json({ error: 'live_event_refused' }, 400); // jamais de LIVE

  const session = event.data?.object || {};
  const leadId = String(session.metadata?.lead_id || session.client_reference_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) return json({ ok: true, ignored: 'sans dossier' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: lead } = await sb.from('leads').select('id, metadata').eq('id', leadId).single();
  if (!lead) return json({ ok: true, ignored: 'dossier introuvable' });
  const meta = (lead.metadata || {}) as Record<string, any>;
  const pay = (meta.payment || {}) as Record<string, any>;
  const seen: string[] = Array.isArray(pay.events) ? pay.events : [];
  if (event.id && seen.includes(event.id)) return json({ ok: true, duplicate: true });

  const now = new Date().toISOString();
  if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    if (pay.status === 'paid') return json({ ok: true, already_paid: true });
    const next = {
      ...pay, status: 'paid', amount: Number(session.amount_total || 0) / 100, currency: session.currency || 'eur',
      paid_at: now, session_id: session.id, payment_intent: session.payment_intent || null, livemode: false,
      events: seen.concat(event.id ? [event.id] : []).slice(-20),
    };
    await sb.from('leads').update({ metadata: { ...meta, payment: next } }).eq('id', leadId);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
    // Une seule alerte agence (pas un « nouveau lead ») + une confirmation client
    try { await fetch(`${url}/functions/v1/notify-lead-v6`, { method: 'POST', headers, body: JSON.stringify({ lead_id: leadId, kind: 'payment' }) }); } catch (_) {}
    try { await fetch(`${url}/functions/v1/lead-auto-reply`, { method: 'POST', headers, body: JSON.stringify({ lead_id: leadId, kind: 'payment' }) }); } catch (_) {}
    return json({ ok: true, status: 'paid' });
  }
  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    if (pay.status === 'paid') return json({ ok: true, already_paid: true });
    const status = event.type === 'checkout.session.expired' ? 'expired' : 'failed';
    await sb.from('leads').update({ metadata: { ...meta, payment: { ...pay, status, updated_at: now, events: seen.concat(event.id ? [event.id] : []).slice(-20) } } }).eq('id', leadId);
    return json({ ok: true, status });
  }
  return json({ ok: true, ignored: event.type });
});
