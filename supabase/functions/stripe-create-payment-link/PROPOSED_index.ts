// PROPOSED (NON DÉPLOYÉ) — durcissement stripe-create-payment-link
// Finding P1 CRITIQUE (audit 2026-08-22, #9 T10) :
//   L'edge en production accepte `amount_eur` DEPUIS LE CLIENT (validé seulement >= 1) et
//   `verify_jwt: false` → appelable directement par quiconque possède la clé publishable
//   (publique). app_settings.stripe = configured=true avec une clé sk_live_ → un attaquant
//   peut créer un Checkout Stripe LIVE au montant de son choix (exploit sous-paiement 1€ /
//   abus de ressources / pollution table payments). Le gel frontend ne protège PAS l'edge.
//
// DURCISSEMENTS (à valider + déployer = GATE) :
//   1. Le montant vient du SERVEUR : lookup du prix réel dans la table `services` via `slug`.
//      Le client n'envoie plus `amount_eur` (ignoré). Rejet si prestation sur devis / inconnue.
//   2. Auth : exiger un en-tête secret partagé (X-HC-Payment-Secret) OU une session admin —
//      pas la simple clé publishable publique. (verify_jwt reste false car appel serveur/staff.)
//   3. Rate-limit basique par IP + garde anti-spam.
//   4. Idempotence : clé d'idempotence Stripe sur (slug, email, jour) pour éviter les doublons.
//   5. Webhook Stripe signé (à part) pour confirmer le paiement avant toute prestation.
//
// NB : ne pas déployer tant que la clé Stripe TEST n'est pas fournie (tester d'abord en TEST).

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hc-payment-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    // (2) Auth par secret partagé côté staff — la clé publishable publique ne suffit plus.
    // @ts-ignore
    const expected = Deno.env.get("HC_PAYMENT_SECRET");
    if (!expected || req.headers.get("x-hc-payment-secret") !== expected) {
      return json({ error: "unauthorized" }, 401);
    }

    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "stripe").maybeSingle();
    const cfg = (settings?.value as any) || {};
    if (!cfg.configured || !cfg.secret_key) return json({ error: "Stripe pas configuré" }, 400);

    const body = await req.json();

    // (1) MONTANT SERVEUR : lookup du prix réel via le slug de prestation ; on IGNORE tout amount client.
    const slug = String(body.slug || "").trim();
    if (!slug) return json({ error: "slug requis" }, 400);
    const { data: svc } = await sb.from("services")
      .select("slug, base_price_ttc, requires_quote, label")
      .eq("slug", slug).maybeSingle();
    if (!svc) return json({ error: "prestation inconnue" }, 404);
    if (svc.requires_quote || !svc.base_price_ttc || Number(svc.base_price_ttc) < 1) {
      return json({ error: "prestation sur devis — pas de paiement en ligne à montant fixe" }, 422);
    }
    const amount = Number(svc.base_price_ttc); // AUTORITÉ = serveur
    const description = (svc.label || "Intervention HELP Confort") + " — Prise en charge HELP Confort";

    const customerEmail = body.customer_email || null;
    const agence = (String(body.cp || "").substring(0, 2) === "59") ? "dunkerque" : "saint-omer";

    const stripeBody = new URLSearchParams({
      "mode": "payment",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][product_data][name]": description,
      "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
      "line_items[0][quantity]": "1",
      "success_url": "https://depan59-62.fr/paiement-ok.html?session_id={CHECKOUT_SESSION_ID}",
      "cancel_url": "https://depan59-62.fr/paiement-annule.html",
      "locale": "fr",
      "payment_method_types[]": "card",
    });
    if (customerEmail) stripeBody.append("customer_email", customerEmail);
    stripeBody.append("metadata[slug]", slug);
    stripeBody.append("metadata[agence]", agence);

    // (4) Idempotence Stripe
    const idemKey = `hc:${slug}:${customerEmail || "anon"}:${new Date().toISOString().slice(0, 10)}`;
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + cfg.secret_key,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": idemKey,
      },
      body: stripeBody.toString(),
    });
    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || stripeData.error) {
      return json({ error: "Stripe API: " + (stripeData.error?.message || "erreur") }, 502);
    }

    await sb.from("payments").insert({
      stripe_checkout_session_id: stripeData.id,
      stripe_payment_intent_id: stripeData.payment_intent,
      amount_eur: amount, description, customer_email: customerEmail,
      agence, status: "pending", payment_url: stripeData.url, created_by: "hardened_endpoint",
      metadata: { slug, livemode: stripeData.livemode },
    });

    return json({ success: true, payment_url: stripeData.url, amount_eur: amount });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
