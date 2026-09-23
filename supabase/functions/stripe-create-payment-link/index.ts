// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-22 (directive 5778526407 §2.A) — code identique
// à la version déployée (seul cet en-tête a été ajouté) (version 1, verify_jwt = false). Elle tournait sans source dans le dépôt.
//
// 🔴 VERSION VULNÉRABLE, conservée ici pour pouvoir revenir en arrière après le déploiement de la
//    version durcie (HARDENED_index.ts). Ce qu'elle fait aujourd'hui :
//    - appelable par n'importe qui (verify_jwt = false, aucune vérification d'appelant) ;
//    - montant pris dans le corps de la requête (amount_eur) ;
//    - clé Stripe lue en base (app_settings.stripe) : clé de PRODUCTION ;
//    - données client (email, nom, téléphone) prises dans la requête.
//    Correctif prêt et testé : HARDENED_index.ts + ../_shared/payment-link.ts (14 tests Deno).
//
// stripe-create-payment-link
// POST body: { amount_eur, description, customer_email?, customer_phone?, customer_name?, intervention_id?, agence? }
// Crée un Checkout Session Stripe + ligne en BDD + retourne URL
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    // 1. Lire config Stripe
    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "stripe").maybeSingle();
    const cfg = settings?.value || {};
    if (!cfg.configured || !cfg.secret_key) {
      return json({ error: "Stripe pas configuré" }, 400);
    }

    // 2. Parse body
    const body = await req.json();
    const amount = Number(body.amount_eur);
    if (!amount || amount < 1) return json({ error: "amount_eur invalide (min 1€)" }, 400);
    const description = body.description || "Intervention HELP Confort";
    const customerEmail = body.customer_email || null;
    const customerName = body.customer_name || null;
    const customerPhone = body.customer_phone || null;
    const interventionId = body.intervention_id || null;
    const agence = body.agence || "depan-audo";

    // 3. Créer Checkout Session Stripe (api 2024-11-20)
    const stripeBody = new URLSearchParams({
      "mode": "payment",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][product_data][name]": description,
      "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
      "line_items[0][quantity]": "1",
      "success_url": "https://depan59-62.fr/paiement-ok.html?session_id={CHECKOUT_SESSION_ID}",
      "cancel_url": "https://depan59-62.fr/paiement-annule.html",
      "locale": "fr",
      "payment_method_types[]": "card"
    });
    if (customerEmail) stripeBody.append("customer_email", customerEmail);
    if (interventionId) stripeBody.append("metadata[intervention_id]", interventionId);
    if (agence) stripeBody.append("metadata[agence]", agence);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + cfg.secret_key,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: stripeBody.toString()
    });
    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || stripeData.error) {
      return json({ error: "Stripe API: " + (stripeData.error?.message || JSON.stringify(stripeData)) }, 502);
    }

    // 4. Insert en BDD
    const { data: payment, error: insErr } = await sb.from("payments").insert({
      stripe_checkout_session_id: stripeData.id,
      stripe_payment_intent_id: stripeData.payment_intent,
      amount_eur: amount,
      description,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      intervention_id: interventionId,
      agence,
      status: "pending",
      payment_url: stripeData.url,
      created_by: "manual_dashboard",
      metadata: { stripe_session: { livemode: stripeData.livemode, expires_at: stripeData.expires_at } }
    }).select("id,payment_url,stripe_checkout_session_id,amount_eur,description").single();

    if (insErr) {
      return json({ error: "DB insert: " + insErr.message, stripe_url: stripeData.url }, 500);
    }

    return json({
      success: true,
      payment_id: payment.id,
      payment_url: payment.payment_url,
      checkout_session_id: payment.stripe_checkout_session_id,
      amount_eur: payment.amount_eur,
      description: payment.description
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
