// ⚠️ VERSION DURCIE, PRÊTE À DÉPLOYER — **NON DÉPLOYÉE**.
// Elle porte le nom `index.ts`, dans `supabase/functions-staging/`, précisément pour être
// déployable : l'outil ne déploie que `index.ts`, et le workflow ne regarde que
// `supabase/functions/`. Un correctif nommé `HARDENED_index.ts` ne pouvait structurellement
// jamais partir (constat CHATGPT-2026-09-25-P0-DEEP-CLEAN-SECURE).
//
// Écart avec la version en production : la signature Stripe est VÉRIFIÉE. Aujourd'hui elle est
// lue puis ignorée derrière un `TODO`, et le corps est exploité tel quel — un tiers peut donc
// fabriquer un événement et faire passer un paiement en « payé » sans qu'un euro ait été versé.
// Tout le reste du fichier est identique à la production, volontairement : un correctif de
// sécurité ne doit pas emporter d'autres changements.
//
// À POSER AVANT DÉPLOIEMENT (sinon la fonction refuse tout, en 503, et c'est voulu) :
//   STRIPE_WEBHOOK_SECRET   le secret « whsec_… » du endpoint, pris dans le tableau de bord Stripe
// Le secret ne vient PAS de `app_settings` : cette table est lisible par tout compte authentifié.
//
// Déploiement (décision humaine) :
//   cp -R supabase/functions-staging/_shared supabase/functions-staging/stripe-webhook/../_shared
//   supabase functions deploy stripe-webhook --project-ref <ref> \
//     --use-api --project-dir . --entrypoint supabase/functions-staging/stripe-webhook/index.ts
// (la commande exacte est reprise, vérifiée et commentée dans docs/security/SECURITY-STRIPE.md)
// Retour arrière : redéployer `supabase/functions/stripe-webhook/index.ts`, inchangé dans le dépôt.
//
// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// stripe-webhook — reçoit notifs Stripe et update payments en BDD
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifier } from "../_shared/stripe-signature.ts";

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

    // Le corps BRUT, jamais reparsé : la signature porte sur les octets exacts.
    const rawBody = await req.text();

    // @ts-ignore
    const verdict = await verifier(rawBody, req.headers.get("stripe-signature"), Deno.env.get("STRIPE_WEBHOOK_SECRET"));
    if (!verdict.ok) {
      // On ne dit pas au client CE qui cloche au-delà du motif : inutile de l'aider à ajuster.
      console.log(JSON.stringify({ evt: "stripe_webhook_refus", motif: verdict.motif }));
      return json({ error: "signature" }, verdict.code);
    }
    // Typage volontairement aussi large qu'en production : ce correctif ne doit apporter QUE la
    // vérification de signature. Resserrer les types ici ferait apparaître une dizaine
    // d'erreurs sur du code inchangé, et gonflerait un diff qui doit rester lisible.
    // deno-lint-ignore no-explicit-any
    const event = verdict.evenement as any;
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
