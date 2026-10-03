// ═════════════════════════════════════════════════════════════════════════════════════════
// Lien de paiement back-office — logique durcie, testable sans réseau (directive 5778526407 §2.A).
// Utilisée par supabase/functions/stripe-create-payment-link/HARDENED_index.ts (NON DÉPLOYÉ).
//
// Règles :
//   1. Appelant : un membre du personnel authentifié (JWT Supabase + rôle owner/assistant actif).
//      La clé publique du site ne suffit plus ; aucun secret statique côté navigateur.
//   2. Montant : JAMAIS celui envoyé par l'appelant. Il est lu sur l'intervention
//      (interventions.montant_ttc, saisi et tracé par le personnel sous RLS).
//   3. Éligibilité : intervention existante, non annulée, montant renseigné (0 < m ≤ 10 000 €),
//      pas déjà payée.
//   4. Idempotence : un lien en attente pour la même intervention, le même montant et le même mode
//      est RENVOYÉ au lieu d'en créer un autre ; clé d'idempotence Stripe dérivée du dossier.
//   5. TEST / LIVE : choisis côté serveur, par variables d'environnement, jamais par la base ni par la
//      requête. LIVE exige STRIPE_MODE=live, une clé sk_live_ ET une origine de production ; tout le
//      reste (recette comprise) est en TEST, avec une clé qui doit commencer par sk_test_.
//   6. Journal : identifiants et montants seulement, jamais nom, email ou téléphone.
// ═════════════════════════════════════════════════════════════════════════════════════════

export const PERSONNEL = ["owner", "assistant"];
export const MONTANT_MAX = 10000;
export const ORIGINES_PROD = ["https://depan59-62.fr", "https://www.depan59-62.fr"];

export type Mode = "test" | "live";
export type Env = { STRIPE_MODE?: string; STRIPE_TEST_SECRET_KEY?: string; STRIPE_LIVE_SECRET_KEY?: string };
export type Intervention = {
  id: string; status?: string | null; montant_ttc?: number | string | null;
  client_email?: string | null; client_first_name?: string | null; client_last_name?: string | null;
  client_phone?: string | null; metier?: string | null;
};
export type Paiement = { id: string; status: string; amount_eur: number; payment_url?: string | null; metadata?: any; created_at?: string };

export class Refus extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function estPersonnel(role: string | null | undefined, actif: boolean | null | undefined): boolean {
  return actif !== false && !!role && PERSONNEL.includes(role);
}

// Mode et clé Stripe : décision serveur uniquement
export function choisirStripe(env: Env, origine: string | null): { mode: Mode; cle: string } {
  const veutLive = String(env.STRIPE_MODE || "").toLowerCase() === "live";
  const origineProd = !!origine && ORIGINES_PROD.includes(origine.replace(/\/$/, ""));
  if (veutLive && origineProd) {
    const k = env.STRIPE_LIVE_SECRET_KEY || "";
    if (!k.startsWith("sk_live_")) throw new Refus(500, "live_mal_configure", "Mode LIVE demandé mais aucune clé sk_live_ valide");
    return { mode: "live", cle: k };
  }
  const t = env.STRIPE_TEST_SECRET_KEY || "";
  if (!t.startsWith("sk_test_")) throw new Refus(500, "test_mal_configure", "Clé Stripe TEST absente ou invalide (sk_test_ attendue)");
  return { mode: "test", cle: t };
}

// Montant canonique : celui de l'intervention, arrondi au centime, borné
export function montantDe(iv: Intervention): number {
  const m = Number(iv.montant_ttc);
  if (iv.montant_ttc == null || !isFinite(m)) throw new Refus(422, "montant_absent", "Montant de l'intervention non renseigné : le saisir sur l'intervention avant d'encaisser");
  const arrondi = Math.round(m * 100) / 100;
  if (arrondi <= 0 || arrondi > MONTANT_MAX) throw new Refus(422, "montant_hors_bornes", `Montant hors bornes (0 < montant ≤ ${MONTANT_MAX} €)`);
  return arrondi;
}

export function verifierEligibilite(iv: Intervention | null, paiements: Paiement[], montant: number, mode: Mode): Paiement | null {
  if (!iv) throw new Refus(404, "intervention_inconnue", "Intervention introuvable");
  if (["annulee", "annulée", "cancelled"].includes(String(iv.status || "").toLowerCase())) throw new Refus(409, "intervention_annulee", "Intervention annulée");
  if (paiements.some(p => p.status === "paid")) throw new Refus(409, "deja_payee", "Intervention déjà payée");
  // Idempotence : même dossier, même montant, même mode, encore en attente → on renvoie ce lien
  return paiements.find(p => p.status === "pending" && Number(p.amount_eur) === montant && (p.metadata?.mode || "live") === mode && !!p.payment_url) || null;
}

export function cleIdempotence(interventionId: string, montant: number, mode: Mode): string {
  return `hc-lien:${interventionId}:${Math.round(montant * 100)}:${mode}`;
}

// Journal sans donnée personnelle (liste blanche de clés)
const CLES_JOURNAL = ["evt", "intervention_id", "payment_id", "montant", "mode", "code", "reutilise", "appelant"];
export function ligneJournal(o: Record<string, unknown>): string {
  const out: Record<string, unknown> = {};
  for (const k of CLES_JOURNAL) if (o[k] !== undefined) out[k] = o[k];
  return JSON.stringify(out);
}

// ── Gestionnaire, avec dépendances injectées (tests sans réseau) ─────────────────────────
export type Deps = {
  env: Env;
  utilisateurDepuisJeton: (jwt: string) => Promise<{ id: string } | null>;
  profil: (userId: string) => Promise<{ role: string | null; is_active: boolean | null } | null>;
  intervention: (id: string) => Promise<Intervention | null>;
  paiementsDe: (interventionId: string) => Promise<Paiement[]>;
  creerSessionStripe: (cle: string, params: URLSearchParams, idempotence: string) => Promise<{ id: string; url: string; payment_intent?: string | null; livemode: boolean }>;
  enregistrerPaiement: (ligne: Record<string, unknown>) => Promise<{ id: string }>;
  journal: (ligne: string) => void;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

export function creerGestionnaire(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ error: "POST uniquement" }, 405);
    try {
      // 1. Appelant : personnel authentifié
      const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      const user = jwt ? await deps.utilisateurDepuisJeton(jwt) : null;
      if (!user) throw new Refus(401, "non_authentifie", "Session requise");
      const p = await deps.profil(user.id);
      if (!estPersonnel(p?.role, p?.is_active)) throw new Refus(403, "non_autorise", "Réservé au personnel de l'agence");

      // 2. Dossier : seul l'identifiant d'intervention est lu dans la requête
      const body = await req.json().catch(() => ({}));
      const interventionId = String(body?.intervention_id || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(interventionId)) throw new Refus(400, "intervention_requise", "intervention_id (uuid) requis");

      const iv = await deps.intervention(interventionId);
      const { mode, cle } = choisirStripe(deps.env, req.headers.get("origin"));
      const montant = iv ? montantDe(iv) : 0;
      const existant = verifierEligibilite(iv, await deps.paiementsDe(interventionId), montant, mode);
      if (existant) {
        deps.journal(ligneJournal({ evt: "lien_paiement", intervention_id: interventionId, payment_id: existant.id, montant, mode, reutilise: true, appelant: user.id }));
        return json({ success: true, reutilise: true, payment_id: existant.id, payment_url: existant.payment_url, amount_eur: montant, mode });
      }

      // 3. Session Stripe (montant serveur, clé d'idempotence du dossier)
      const iv2 = iv as Intervention;
      const description = `Intervention HELP Confort${iv2.metier ? " — " + iv2.metier : ""}`;
      const params = new URLSearchParams({
        "mode": "payment",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][product_data][name]": description,
        "line_items[0][price_data][unit_amount]": String(Math.round(montant * 100)),
        "line_items[0][quantity]": "1",
        "success_url": "https://depan59-62.fr/paiement-ok.html?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": "https://depan59-62.fr/paiement-annule.html",
        "locale": "fr",
        "payment_method_types[]": "card",
        "metadata[intervention_id]": interventionId,
        "metadata[mode]": mode,
      });
      if (iv2.client_email) params.append("customer_email", iv2.client_email);
      const session = await deps.creerSessionStripe(cle, params, cleIdempotence(interventionId, montant, mode));
      if ((mode === "live") !== !!session.livemode) throw new Refus(500, "mode_incoherent", "Stripe a répondu dans un autre mode que celui demandé");

      // 4. Trace : données client lues sur l'intervention, jamais dans la requête
      const ligne = await deps.enregistrerPaiement({
        stripe_checkout_session_id: session.id, stripe_payment_intent_id: session.payment_intent || null,
        amount_eur: montant, description,
        customer_name: [iv2.client_first_name, iv2.client_last_name].filter(Boolean).join(" ") || null,
        customer_email: iv2.client_email || null, customer_phone: iv2.client_phone || null,
        intervention_id: interventionId, agence: "saint-omer", status: "pending", payment_url: session.url,
        created_by: user.id, metadata: { mode, livemode: session.livemode, montant_source: "interventions.montant_ttc" },
      });
      deps.journal(ligneJournal({ evt: "lien_paiement", intervention_id: interventionId, payment_id: ligne.id, montant, mode, reutilise: false, appelant: user.id }));
      return json({ success: true, payment_id: ligne.id, payment_url: session.url, amount_eur: montant, mode });
    } catch (e) {
      if (e instanceof Refus) {
        deps.journal(ligneJournal({ evt: "lien_paiement_refuse", code: e.code }));
        return json({ error: e.message, code: e.code }, e.status);
      }
      deps.journal(ligneJournal({ evt: "lien_paiement_erreur", code: "exception" }));
      return json({ error: "Erreur interne" }, 500);
    }
  };
}
