// ═══════════════════════════════════════════════════════════════════════════
// create-payment-session — paiement en ligne FACULTATIF d'une demande finalisée
// Directive 5713247831. Stripe TEST UNIQUEMENT : cette fonction ne lit JAMAIS la
// configuration Stripe de production (app_settings.stripe, clé live) et refuse toute
// clé qui n'est pas `sk_test_`.
// ═══════════════════════════════════════════════════════════════════════════
// Règles :
//   • le client prouve qu'il est l'auteur du dossier (pay_token remis à la finalisation) ;
//   • le montant est RECALCULÉ côté serveur depuis le catalogue (jamais celui du navigateur) ;
//   • paiement proposé seulement si TOUTES les prestations sont à prix ferme et le total ≥ 1 € ;
//   • un dossier déjà payé n'est jamais facturé deux fois (clé d'idempotence Stripe) ;
//   • URL de retour limitée aux domaines du site (pas de redirection ouverte).
//
// Body : { lead_id, pay_token, mode: 'check' | 'create', return_url? }
// ═══════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Mêmes règles que le cœur du front (assets/hc-demande-core.js : priced / perUnit / priceKind)
function priced(s: any) { return !!s && !s.requires_quote && Number(s.price_ttc) > 0 && s.active !== false; }
function perUnit(s: any) { return /\((?:au|par)\s+(m²|m2|ml|mètre linéaire|unité)\)/i.test(String((s && s.name) || '')); }
function kind(s: any) { if (!priced(s)) return 'devis'; return perUnit(s) ? 'confirmer' : 'ferme'; }

const RETURN_OK = [/^https:\/\/deploy-preview-\d+--remarkable-dragon-364e2b\.netlify\.app\//, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//, /^https:\/\/(www\.)?depan59-62\.fr\//];
function safeReturn(u: unknown): string | null {
  const s = String(u || '');
  return RETURN_OK.some((re) => re.test(s)) ? s.split('#')[0] : null;
}
function sameToken(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch (_) { return json({ error: 'JSON invalide' }, 400); }
  const leadId = String(body.lead_id || '');
  const token = String(body.pay_token || '');
  const mode = body.mode === 'create' ? 'create' : 'check';
  if (!/^[0-9a-f-]{36}$/i.test(leadId) || !token) return json({ error: 'dossier ou jeton manquant' }, 400);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: lead, error } = await sb.from('leads').select('*').eq('id', leadId).single();
  if (error || !lead) return json({ error: 'dossier introuvable' }, 404);
  const meta = (lead.metadata || {}) as Record<string, any>;
  if (!sameToken(String(meta.pay_token || ''), token)) return json({ error: 'jeton invalide' }, 403);
  if (meta.pay_token_expires && Date.now() > Number(meta.pay_token_expires)) return json({ error: 'jeton expiré' }, 403);
  if (!meta.finalized_at) return json({ error: 'demande non finalisée' }, 409);

  // Montant et éligibilité recalculés côté serveur
  const cart = Array.isArray(lead.utm?.cart) ? lead.utm.cart : [];
  let eligible = cart.length > 0, reason = cart.length ? '' : 'aucune prestation';
  const lines: Array<{ name: string; unit: number; qty: number }> = [];
  if (cart.length) {
    const ids = cart.map((c: any) => String(c.id || '')).filter(Boolean);
    const { data: svc } = await sb.from('v_services_public').select('*').in('id', ids);
    const byId: Record<string, any> = {};
    (svc || []).forEach((s: any) => { byId[String(s.id)] = s; });
    for (const c of cart) {
      const s = byId[String(c.id)];
      const qty = Math.min(Math.max(Number(c.qty) || 1, 1), 20);
      if (!s) { eligible = false; reason = 'prestation inconnue'; break; }
      const k = kind(s);
      if (k !== 'ferme') { eligible = false; reason = k === 'devis' ? 'prestation sur devis' : 'prix à confirmer sur place'; break; }
      lines.push({ name: String(s.name), unit: Math.round(Number(s.price_ttc) * 100), qty });
    }
  }
  const amountCents = lines.reduce((t, l) => t + l.unit * l.qty, 0);
  if (eligible && amountCents < 100) { eligible = false; reason = 'montant insuffisant'; }

  const key = Deno.env.get('STRIPE_TEST_SECRET_KEY') || '';
  const available = key.startsWith('sk_test_');
  const payment = meta.payment || null;

  if (mode === 'check') {
    return json({ ok: true, available, eligible, reason: eligible ? null : reason, amount: amountCents / 100, currency: 'eur', payment });
  }

  // ---- création de la session de paiement
  if (!key) return json({ ok: false, blocked: 'missing_stripe_test_key' });
  if (!available) return json({ ok: false, blocked: 'live_key_refused' }); // jamais de LIVE ici
  if (!eligible) return json({ ok: false, eligible: false, reason }, 422);
  if (payment && payment.status === 'paid') return json({ ok: true, already_paid: true, payment });
  const back = safeReturn(body.return_url);
  if (!back) return json({ ok: false, error: 'url de retour non autorisée' }, 400);

  const ref = 'HC-' + leadId.replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase();
  const form = new URLSearchParams({
    mode: 'payment',
    locale: 'fr',
    'payment_method_types[]': 'card',
    success_url: back + (back.includes('?') ? '&' : '?') + 'hc_pay=ok#step=envoye',
    cancel_url: back + (back.includes('?') ? '&' : '?') + 'hc_pay=annule#step=envoye',
    client_reference_id: leadId,
    'metadata[lead_id]': leadId,
    'metadata[reference]': ref,
    'payment_intent_data[description]': `Dossier ${ref} — HELP Confort Saint-Omer`,
    'payment_intent_data[metadata][lead_id]': leadId,
  });
  if (lead.email) form.append('customer_email', String(lead.email));
  lines.forEach((l, i) => {
    form.append(`line_items[${i}][price_data][currency]`, 'eur');
    form.append(`line_items[${i}][price_data][product_data][name]`, l.name.slice(0, 250));
    form.append(`line_items[${i}][price_data][unit_amount]`, String(l.unit));
    form.append(`line_items[${i}][quantity]`, String(l.qty));
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': `hc-pay-${leadId}-${amountCents}-${new Date().toISOString().slice(0, 10)}`,
    },
    body: form.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) return json({ ok: false, error: 'Stripe : ' + (data?.error?.message || res.status) }, 502);
  if (data.livemode === true) return json({ ok: false, blocked: 'live_session_refused' }); // défense en profondeur

  await sb.from('leads').update({
    metadata: { ...meta, payment: { status: 'pending', session_id: data.id, amount: amountCents / 100, currency: 'eur', created_at: new Date().toISOString(), livemode: false } },
  }).eq('id', leadId);

  return json({ ok: true, url: data.url, amount: amountCents / 100, reference: ref });
});
