// ═════════════════════════════════════════════════════════════════════════════════════════
// stripe-create-payment-link — VERSION DURCIE, NON DÉPLOYÉE (directive 5778526407 §2.A)
// Remplace PROPOSED_index.ts (audit d'août) : cette proposition lisait des colonnes qui n'existent
// plus (services.base_price_ttc, label), plaçait un secret statique dans le navigateur et prenait
// toujours la clé Stripe de PRODUCTION en base.
//
// La logique est dans ../_shared/payment-link.ts (testée : deno test supabase/functions/stripe-create-payment-link/).
// Ce fichier ne fait que brancher les vraies dépendances (Supabase, Stripe, journal).
//
// Prérequis avant déploiement (procédure complète : docs/security/PATCHS-2026-09-22.md) :
//   1. migration supabase/_pending_migrations/20260922140000_interventions_montant.sql appliquée ;
//   2. secrets : STRIPE_TEST_SECRET_KEY (sk_test_…) ; pour la production seulement : STRIPE_MODE=live
//      et STRIPE_LIVE_SECRET_KEY (sk_live_…) — la clé n'est PLUS lue dans app_settings ;
//   3. back-office : l'écran Interventions enregistre le montant sur l'intervention, puis appelle la
//      fonction avec { intervention_id } seul (patch docs/security/patches/admin-interventions-encaisser.patch) ;
//   4. déploiement : renommer ce fichier en index.ts, puis
//      supabase functions deploy stripe-create-payment-link --project-ref btcbjwqiivhpwoszomhg
//      (verify_jwt peut rester à false : l'authentification est vérifiée DANS la fonction).
// Retour arrière : redéployer index.ts d'origine (copie exacte de la production dans ce dossier).
// ═════════════════════════════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { creerGestionnaire } from "../_shared/payment-link.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

Deno.serve(creerGestionnaire({
  env: {
    STRIPE_MODE: Deno.env.get("STRIPE_MODE") || "test",
    STRIPE_TEST_SECRET_KEY: Deno.env.get("STRIPE_TEST_SECRET_KEY") || "",
    STRIPE_LIVE_SECRET_KEY: Deno.env.get("STRIPE_LIVE_SECRET_KEY") || "",
  },
  utilisateurDepuisJeton: async (jwt) => {
    const { data, error } = await sb.auth.getUser(jwt);
    return error || !data?.user ? null : { id: data.user.id };
  },
  profil: async (userId) => {
    const { data } = await sb.from("user_profiles").select("role, is_active").eq("user_id", userId).maybeSingle();
    return data || null;
  },
  intervention: async (id) => {
    const { data } = await sb.from("interventions")
      .select("id, status, montant_ttc, client_email, client_first_name, client_last_name, client_phone, metier")
      .eq("id", id).maybeSingle();
    return data || null;
  },
  paiementsDe: async (interventionId) => {
    const { data } = await sb.from("payments").select("id, status, amount_eur, payment_url, metadata, created_at")
      .eq("intervention_id", interventionId).order("created_at", { ascending: false }).limit(20);
    return data || [];
  },
  creerSessionStripe: async (cle, params, idempotence) => {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + cle, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": idempotence },
      body: params.toString(),
    });
    const d = await r.json();
    if (!r.ok || d.error) throw new Error("Stripe : " + (d.error?.message || r.status));
    return { id: d.id, url: d.url, payment_intent: d.payment_intent, livemode: !!d.livemode };
  },
  enregistrerPaiement: async (ligne) => {
    const { data, error } = await sb.from("payments").insert(ligne).select("id").single();
    if (error) throw new Error("payments : " + error.message);
    return data;
  },
  journal: (l) => console.log(l),
}));
