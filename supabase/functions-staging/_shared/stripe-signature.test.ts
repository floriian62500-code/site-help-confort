// Tests de la vérification de signature Stripe — sans réseau, sans Stripe, déterministes.
//   deno test supabase/functions-staging/_shared/stripe-signature.test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { analyserEntete, egalConstant, hmacHex, verifier } from "./stripe-signature.ts";

const SECRET = "whsec_secret_de_test_pour_ces_controles";
const CORPS = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_1" } } });
const T = 1_700_000_000;

/** Forge un en-tête valide, comme le ferait Stripe. */
async function entete(corps = CORPS, t = T, secret = SECRET) {
  return `t=${t},v1=${await hmacHex(secret, `${t}.${corps}`)}`;
}

// ── 1. Le cas nominal
Deno.test("une charge utile réellement signée par Stripe est acceptée", async () => {
  const v = await verifier(CORPS, await entete(), SECRET, T);
  assert(v.ok);
  assertEquals((v as { evenement: { id: string } }).evenement.id, "evt_1");
});

// ── 2. Ce que la fonction déployée laisse passer aujourd'hui
Deno.test("un événement FABRIQUÉ sans signature est refusé (c'est la faille actuelle)", async () => {
  const v = await verifier(CORPS, null, SECRET, T);
  assert(!v.ok);
  assertEquals((v as { code: number }).code, 400);
  assertEquals((v as { motif: string }).motif, "signature_absente");
});

Deno.test("une signature inventée est refusée", async () => {
  const v = await verifier(CORPS, `t=${T},v1=${"0".repeat(64)}`, SECRET, T);
  assert(!v.ok);
  assertEquals((v as { motif: string }).motif, "signature_invalide");
});

Deno.test("une signature valide pour un AUTRE corps ne vaut pas pour celui-ci", async () => {
  const autre = JSON.stringify({ id: "evt_2", type: "charge.refunded" });
  const v = await verifier(CORPS, await entete(autre), SECRET, T);
  assert(!v.ok);
  assertEquals((v as { motif: string }).motif, "signature_invalide");
});

Deno.test("une signature faite avec un autre secret est refusée", async () => {
  const v = await verifier(CORPS, await entete(CORPS, T, "whsec_un_autre_secret_completement"), SECRET, T);
  assert(!v.ok);
  assertEquals((v as { motif: string }).motif, "signature_invalide");
});

// ── 3. Rejeu
Deno.test("une requête valide mais trop vieille est refusée (rejeu)", async () => {
  const v = await verifier(CORPS, await entete(), SECRET, T + 301);
  assert(!v.ok);
  assertEquals((v as { motif: string }).motif, "horodatage_hors_tolerance");
});

Deno.test("dans la fenêtre de tolérance, elle passe", async () => {
  assert((await verifier(CORPS, await entete(), SECRET, T + 299)).ok);
});

Deno.test("un horodatage dans le futur hors tolérance est refusé aussi", async () => {
  const v = await verifier(CORPS, await entete(), SECRET, T - 301);
  assert(!v.ok);
});

// ── 4. Pas de secret → on refuse, jamais de repli
Deno.test("sans secret configuré : 503, et surtout PAS d'acceptation par défaut", async () => {
  const v = await verifier(CORPS, await entete(), undefined, T);
  assert(!v.ok);
  assertEquals((v as { code: number }).code, 503);
  assertEquals((v as { motif: string }).motif, "secret_absent");
});

// ── 5. En-tête mal formé
Deno.test("un en-tête illisible est refusé", async () => {
  for (const mauvais of ["", "n'importe quoi", "t=abc,v1=xx", `t=${T}`, "v1=xx"]) {
    const v = await verifier(CORPS, mauvais, SECRET, T);
    assert(!v.ok, "aurait dû refuser : " + mauvais);
  }
});

Deno.test("plusieurs signatures v1 : une seule valide suffit (rotation de secret)", async () => {
  const bonne = await hmacHex(SECRET, `${T}.${CORPS}`);
  const v = await verifier(CORPS, `t=${T},v1=${"a".repeat(64)},v1=${bonne}`, SECRET, T);
  assert(v.ok);
});

// ── 6. Détails qui comptent
Deno.test("la signature porte sur les octets EXACTS : un corps re-sérialisé ne passe pas", async () => {
  const e = await entete();
  const reserialise = JSON.stringify(JSON.parse(CORPS.replace('"id":"evt_1"', '"id":"evt_1" ')));
  const v = await verifier(reserialise + " ", e, SECRET, T);
  assert(!v.ok);
});

Deno.test("un corps signé mais illisible en JSON est refusé", async () => {
  const corps = "{pas du json";
  const v = await verifier(corps, await entete(corps), SECRET, T);
  assert(!v.ok);
  assertEquals((v as { motif: string }).motif, "corps_illisible");
});

Deno.test("l'analyse de l'en-tête tolère les espaces et l'ordre", () => {
  const a = analyserEntete(` v1=aa , t=${T} `);
  assert(a && a.t === T && a.signatures[0] === "aa");
});

Deno.test("la comparaison est constante : vrai pour l'identique, faux dès un octet", () => {
  assert(egalConstant("abc", "abc"));
  assert(!egalConstant("abc", "abd"));
  assert(!egalConstant("abc", "abcd"));
  assert(!egalConstant("", "a"));
});
