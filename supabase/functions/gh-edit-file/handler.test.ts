// Tests de l'édition GitHub durcie — sans réseau (Supabase et GitHub simulés).
//   deno test supabase/functions/gh-edit-file/handler.test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { appliquerRemplacement, creerGestionnaireEdition, enBase64, Refus, type DepsEdition } from "../_shared/github-write.ts";

const STAFF = "11111111-1111-1111-1111-111111111111";
const CLIENT = "22222222-2222-2222-2222-222222222222";
const ENV = { GITHUB_WRITE_TOKEN: "ghp_serveur", GITHUB_WRITE_REPOS: "floriian62500-code/site-help-confort", GITHUB_WRITE_BRANCHES: "recette,staging" };
const FICHIER = "<h1>Bonjour</h1><p>Bonjour encore</p>";

function monde(over: Partial<DepsEdition> = {}, contenu: string | null = FICHIER) {
  const pousses: any[] = [], journal: string[] = [];
  let historique: number[] = [];
  const deps: DepsEdition = {
    env: ENV,
    utilisateurDepuisJeton: async (jwt) => (jwt === "jeton-staff" ? { id: STAFF } : jwt === "jeton-client" ? { id: CLIENT } : null),
    profil: async (id) => (id === STAFF ? { role: "owner", is_active: true } : { role: "client", is_active: true }),
    lireFichier: async () => contenu,
    pousser: async (a) => { pousses.push(a); return { sha: "def5678" }; },
    appelsRecents: async () => historique,
    noterAppel: async (_a, appels) => { historique = appels; },
    journal: (l) => journal.push(l),
    ...over,
  };
  return { gestionnaire: creerGestionnaireEdition(deps), pousses, journal };
}
const requete = (body: unknown, jwt: string | null = "jeton-staff") => new Request("https://fn.test/gh-edit-file", {
  method: "POST",
  headers: jwt ? { "content-type": "application/json", authorization: "Bearer " + jwt } : { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const corps = (o: Record<string, unknown> = {}) => ({
  owner: "floriian62500-code", repo: "site-help-confort", branch: "staging",
  file_path: "index.html", find: "<h1>Bonjour</h1>", replace: "<h1>Salut</h1>", message: "test", ...o,
});

Deno.test("édition par un membre du personnel : un commit, sur la branche demandée", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps()));
  assertEquals(r.status, 200);
  assertEquals(m.pousses.length, 1);
  assertEquals(m.pousses[0].branche, "staging");
  assertEquals(m.pousses[0].fichiers[0].content_b64, enBase64("<h1>Salut</h1><p>Bonjour encore</p>"));
});

Deno.test("appelant anonyme → 401 ; client → 403 ; rien n'est écrit", async () => {
  const a = monde(); assertEquals((await a.gestionnaire(requete(corps(), null))).status, 401); assertEquals(a.pousses.length, 0);
  const b = monde(); assertEquals((await b.gestionnaire(requete(corps(), "jeton-client"))).status, 403); assertEquals(b.pousses.length, 0);
});

Deno.test("un jeton dans la requête est refusé", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ token: "ghp_navigateur" })));
  assertEquals(r.status, 403);
  assertEquals((await r.json()).error, "jeton_dans_la_requete");
});

Deno.test("branche main refusée, même demandée explicitement", async () => {
  const m = monde();
  assertEquals((await m.gestionnaire(requete(corps({ branch: "main" })))).status, 403);
  assertEquals(m.pousses.length, 0);
});

Deno.test("fichier d'exécution du projet refusé", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ file_path: ".github/workflows/deploy.yml" })));
  assertEquals(r.status, 403);
  assertEquals((await r.json()).error, "chemin_interdit");
});

Deno.test("texte introuvable → 404, rien n'est écrit", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ find: "absent" })));
  assertEquals(r.status, 404);
  assertEquals(m.pousses.length, 0);
});

Deno.test("occurrence ambiguë → 409, on ne devine pas", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ find: "Bonjour" })));
  assertEquals(r.status, 409);
  assertEquals((await r.json()).error, "texte_ambigu");
  assertEquals(m.pousses.length, 0);
});

Deno.test("replace_all assumé : les deux occurrences sont remplacées", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ find: "Bonjour", replace: "Salut", replace_all: true })));
  assertEquals(r.status, 200);
  assertEquals((await r.json()).occurrences_replaced, 2);
});

Deno.test("remplacement sans effet → 400", () => {
  let code = 0;
  try { appliquerRemplacement("abc", "b", "b", false); } catch (e) { code = (e as Refus).code; }
  assertEquals(code, 400);
});

Deno.test("fichier absent sur la branche → 404", async () => {
  const m = monde({}, null);
  assertEquals((await m.gestionnaire(requete(corps()))).status, 404);
});

Deno.test("le journal ne laisse fuir ni jeton ni contenu", async () => {
  const m = monde();
  await m.gestionnaire(requete(corps()));
  await m.gestionnaire(requete(corps({ branch: "main" })));
  const tout = m.journal.join("\n");
  assert(!tout.includes("ghp_") && !tout.includes("Bonjour") && !tout.includes("Salut"));
  assert(tout.includes("gh_edit_ok") && tout.includes("branche_interdite"));
});
