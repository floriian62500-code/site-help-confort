// Tests du lien de paiement durci — sans réseau (Supabase et Stripe simulés).
//   deno test supabase/functions/stripe-create-payment-link/handler.test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { choisirStripe, creerGestionnaire, ligneJournal, montantDe, Refus, type Deps } from "../_shared/payment-link.ts";

const STAFF = "11111111-1111-1111-1111-111111111111";
const CLIENT = "22222222-2222-2222-2222-222222222222";
const IV = "33333333-3333-3333-3333-333333333333";
const ENV_TEST = { STRIPE_MODE: "test", STRIPE_TEST_SECRET_KEY: "sk_test_x", STRIPE_LIVE_SECRET_KEY: "sk_live_y" };

function monde(over: Partial<Deps> = {}, etat: any = {}) {
  const appelsStripe: any[] = [], enregistres: any[] = [], journal: string[] = [];
  const deps: Deps = {
    env: ENV_TEST,
    utilisateurDepuisJeton: async (jwt) => (jwt === "jeton-staff" ? { id: STAFF } : jwt === "jeton-client" ? { id: CLIENT } : null),
    profil: async (id) => (id === STAFF ? { role: "assistant", is_active: true } : null),
    intervention: async (id) => (id === IV ? {
      id: IV, status: "terminee", montant_ttc: ('montant' in etat) ? etat.montant : 245.5, metier: "plomberie",
      client_email: "client@example.test", client_first_name: "Jean", client_last_name: "Test", client_phone: "0600000000",
    } : null),
    paiementsDe: async () => etat.paiements || [],
    creerSessionStripe: async (cle, params, idem) => { appelsStripe.push({ cle, params: Object.fromEntries(params), idem }); return { id: "cs_1", url: "https://checkout.stripe.test/cs_1", livemode: cle.startsWith("sk_live_") }; },
    enregistrerPaiement: async (l) => { enregistres.push(l); return { id: "pay_1" }; },
    journal: (l) => journal.push(l),
    ...over,
  };
  return { h: creerGestionnaire(deps), appelsStripe, enregistres, journal };
}
const req = (body: unknown, jeton?: string, origin = "https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app") =>
  new Request("https://x/functions/v1/stripe-create-payment-link", {
    method: "POST", body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...(jeton ? { authorization: "Bearer " + jeton } : {}), origin },
  });

Deno.test("sans session : 401, rien n'est créé", async () => {
  const m = monde();
  const r = await m.h(req({ intervention_id: IV, amount_eur: 1 }));
  assertEquals(r.status, 401); assertEquals(m.appelsStripe.length, 0);
});

Deno.test("client connecté (pas personnel) : 403 — un compte de l'espace client ne peut rien encaisser", async () => {
  const m = monde();
  const r = await m.h(req({ intervention_id: IV }, "jeton-client"));
  assertEquals(r.status, 403); assertEquals(m.appelsStripe.length, 0);
});

Deno.test("le montant envoyé par l'appelant est IGNORÉ : seul celui de l'intervention compte", async () => {
  const m = monde();
  const r = await m.h(req({ intervention_id: IV, amount_eur: 1 }, "jeton-staff"));
  const d = await r.json();
  assertEquals(r.status, 200);
  assertEquals(d.amount_eur, 245.5);
  assertEquals(m.appelsStripe[0].params["line_items[0][price_data][unit_amount]"], "24550");
  assertEquals(m.enregistres[0].amount_eur, 245.5);
});

Deno.test("montant non renseigné sur l'intervention : 422", async () => {
  const m = monde({}, { montant: null });
  const r = await m.h(req({ intervention_id: IV }, "jeton-staff"));
  assertEquals(r.status, 422); assertEquals((await r.json()).code, "montant_absent");
});

Deno.test("montant hors bornes : 422 (0 ou plus de 10 000 €)", async () => {
  for (const montant of [0, -5, 10000.01]) {
    const r = await monde({}, { montant }).h(req({ intervention_id: IV }, "jeton-staff"));
    assertEquals(r.status, 422);
  }
});

Deno.test("intervention inconnue : 404 ; déjà payée : 409", async () => {
  assertEquals((await monde().h(req({ intervention_id: "44444444-4444-4444-4444-444444444444" }, "jeton-staff"))).status, 404);
  const m = monde({}, { paiements: [{ id: "p0", status: "paid", amount_eur: 245.5 }] });
  assertEquals((await m.h(req({ intervention_id: IV }, "jeton-staff"))).status, 409);
});

Deno.test("idempotence : un lien en attente (même dossier, même montant, même mode) est renvoyé, pas recréé", async () => {
  const m = monde({}, { paiements: [{ id: "p_en_attente", status: "pending", amount_eur: 245.5, payment_url: "https://checkout.stripe.test/ancien", metadata: { mode: "test" } }] });
  const d = await (await m.h(req({ intervention_id: IV }, "jeton-staff"))).json();
  assertEquals(d.reutilise, true); assertEquals(d.payment_id, "p_en_attente"); assertEquals(m.appelsStripe.length, 0);
});

Deno.test("clé d'idempotence Stripe dérivée du dossier (même dossier = même clé)", async () => {
  const m = monde();
  await m.h(req({ intervention_id: IV }, "jeton-staff"));
  assertEquals(m.appelsStripe[0].idem, `hc-lien:${IV}:24550:test`);
});

Deno.test("recette : toujours TEST, même si STRIPE_MODE=live", async () => {
  const m = monde({ env: { ...ENV_TEST, STRIPE_MODE: "live" } });
  const d = await (await m.h(req({ intervention_id: IV }, "jeton-staff"))).json();
  assertEquals(d.mode, "test"); assertEquals(m.appelsStripe[0].cle, "sk_test_x");
});

Deno.test("LIVE seulement si STRIPE_MODE=live ET origine de production ET clé sk_live_", () => {
  assertEquals(choisirStripe({ ...ENV_TEST, STRIPE_MODE: "live" }, "https://depan59-62.fr").mode, "live");
  assertEquals(choisirStripe({ ...ENV_TEST, STRIPE_MODE: "test" }, "https://depan59-62.fr").mode, "test");
  let refus = false;
  try { choisirStripe({ STRIPE_MODE: "live", STRIPE_LIVE_SECRET_KEY: "rk_live_restreinte", STRIPE_TEST_SECRET_KEY: "sk_test_x" }, "https://depan59-62.fr"); } catch (e) { refus = e instanceof Refus; }
  assert(refus, "une clé LIVE qui n'est pas sk_live_ est refusée");
});

Deno.test("clé TEST obligatoirement sk_test_ (une clé live dans la variable TEST est refusée)", () => {
  let refus = false;
  try { choisirStripe({ STRIPE_TEST_SECRET_KEY: "sk_live_piege" }, null); } catch (e) { refus = e instanceof Refus; }
  assert(refus);
});

Deno.test("données client lues sur l'intervention, jamais dans la requête", async () => {
  const m = monde();
  await m.h(req({ intervention_id: IV, customer_email: "pirate@example.test", customer_name: "Pirate" }, "jeton-staff"));
  assertEquals(m.enregistres[0].customer_email, "client@example.test");
  assertEquals(m.appelsStripe[0].params["customer_email"], "client@example.test");
});

Deno.test("journal sans donnée personnelle (ni email, ni nom, ni téléphone)", async () => {
  const m = monde();
  await m.h(req({ intervention_id: IV }, "jeton-staff"));
  const tout = m.journal.join("\n");
  assert(!/@|Jean|Test|0600000000/.test(tout), tout);
  assertEquals(ligneJournal({ evt: "x", email: "a@b.c", montant: 1 }), '{"evt":"x","montant":1}');
});

Deno.test("montantDe : arrondi au centime", () => {
  assertEquals(montantDe({ id: IV, montant_ttc: "99.999" }), 100);
});
