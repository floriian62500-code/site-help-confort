// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// stripe-webhook — reçoit notifs Stripe et update payments en BDD
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
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

    // Lire body brut (nécessaire pour la sig)
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    // TODO : vérifier la signature avec webhook_secret quand on l'aura
    // const wh_secret = (await sb.from("app_settings").select("value").eq("key","stripe").maybeSingle()).data?.value?.webhook_secret;

    const event = JSON.parse(rawBody);
    const type = event.type;
    const obj = event.data?.object;

    // Log webhook reçu
    console.log("[stripe-webhook] event:", type, "id:", event.id);

    if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") {
      // Paiement réussi → update payments.status = 'paid'
      const sessionId = obj.id;
      const { error } = await sb.from("payments").update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: obj.payment_intent || null,
        customer_email: obj.customer_email || obj.customer_details?.email || null,
        customer_name: obj.customer_details?.name || null,
        customer_phone: obj.customer_details?.phone || null,
        metadata: { stripe_event_id: event.id, payment_method: obj.payment_method_types, completed_at: new Date().toISOString() }
      }).eq("stripe_checkout_session_id", sessionId);

      if (error) {
        console.error("[stripe-webhook] update error:", error.message);
        return json({ received: true, db_error: error.message }, 200);
      }
      return json({ received: true, action: "marked_as_paid", session: sessionId });
    }

    if (type === "checkout.session.async_payment_failed" || type === "checkout.session.expired") {
      await sb.from("payments").update({
        status: type === "checkout.session.expired" ? "expired" : "failed"
      }).eq("stripe_checkout_session_id", obj.id);
      return json({ received: true, action: "marked_as_failed" });
    }

    if (type === "charge.refunded") {
      await sb.from("payments").update({
        status: "refunded", refunded_at: new Date().toISOString()
      }).eq("stripe_payment_intent_id", obj.payment_intent);
      return json({ received: true, action: "marked_as_refunded" });
    }

    // Événement non géré — acknowledge pour que Stripe ne re-essaie pas
    return json({ received: true, ignored: type });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
