// Tests de l'écriture GitHub durcie — sans réseau (Supabase et GitHub simulés).
//   deno test supabase/functions/gh-push-inline/handler.test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import {
  creerGestionnaire, jetonServeur, ligneJournal, Refus, tailleBase64,
  verifierChemin, verifierCible, verifierDebit, verifierFichiers, type Deps,
} from "../_shared/github-write.ts";

const STAFF = "11111111-1111-1111-1111-111111111111";
const CLIENT = "22222222-2222-2222-2222-222222222222";
const ENV = {
  GITHUB_WRITE_TOKEN: "ghp_serveur",
  GITHUB_WRITE_REPOS: "floriian62500-code/site-help-confort",
  GITHUB_WRITE_BRANCHES: "recette,staging",
};
const B64 = btoa("bonjour");

function monde(over: Partial<Deps> = {}) {
  const pousses: any[] = [], journal: string[] = [];
  let historique: number[] = [];
  const deps: Deps = {
    env: ENV,
    utilisateurDepuisJeton: async (jwt) => (jwt === "jeton-staff" ? { id: STAFF } : jwt === "jeton-client" ? { id: CLIENT } : null),
    profil: async (id) => (id === STAFF ? { role: "assistant", is_active: true } : { role: "client", is_active: true }),
    pousser: async (a) => { pousses.push(a); return { sha: "abc1234" }; },
    appelsRecents: async () => historique,
    noterAppel: async (_a, appels) => { historique = appels; },
    journal: (l) => journal.push(l),
    ...over,
  };
  return { gestionnaire: creerGestionnaire(deps), pousses, journal, hist: () => historique };
}

function requete(body: unknown, jwt: string | null = "jeton-staff") {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (jwt) h["authorization"] = "Bearer " + jwt;
  return new Request("https://fn.test/gh-push-inline", { method: "POST", headers: h, body: JSON.stringify(body) });
}
const corps = (o: Record<string, unknown> = {}) => ({
  owner: "floriian62500-code", repo: "site-help-confort", branch: "recette",
  message: "test", files: [{ path: "index.html", content_b64: B64 }], ...o,
});

// ── 1. Appelant ──────────────────────────────────────────────────────────────────────────
Deno.test("sans jeton d'appelant → 401, rien n'est poussé", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps(), null));
  assertEquals(r.status, 401);
  assertEquals(m.pousses.length, 0);
});

Deno.test("client authentifié mais pas membre du personnel → 403", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps(), "jeton-client"));
  assertEquals(r.status, 403);
  assertEquals((await r.json()).error, "reserve_au_personnel");
  assertEquals(m.pousses.length, 0);
});

Deno.test("membre du personnel → poussée acceptée, un seul commit", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps()));
  assertEquals(r.status, 200);
  const j = await r.json();
  assertEquals(j.commit_sha, "abc1234");
  assertEquals(m.pousses.length, 1);
  assertEquals(m.pousses[0].branche, "recette");
});

// ── 2. Le jeton GitHub ne vient jamais de la requête ──────────────────────────────────────
Deno.test("un jeton fourni dans la requête est refusé, pas ignoré", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ token: "ghp_venu_du_navigateur" })));
  assertEquals(r.status, 403);
  assertEquals((await r.json()).error, "jeton_dans_la_requete");
  assertEquals(m.pousses.length, 0);
});

Deno.test("le jeton utilisé est celui du serveur", async () => {
  const m = monde();
  await m.gestionnaire(requete(corps()));
  assertEquals(m.pousses[0].token, "ghp_serveur");
});

Deno.test("aucun jeton côté serveur → 503, jamais de repli", () => {
  let leve = false;
  try { jetonServeur({}, undefined); } catch (e) { leve = true; assertEquals((e as Refus).code, 503); }
  assert(leve);
});

// ── 3. Dépôt et branche ──────────────────────────────────────────────────────────────────
Deno.test("main et master sont refusées, même listées", () => {
  for (const b of ["main", "master", "MAIN"]) {
    let code = 0;
    try { verifierCible({ ...ENV, GITHUB_WRITE_BRANCHES: "recette,main,master" }, "floriian62500-code", "site-help-confort", b); }
    catch (e) { code = (e as Refus).code; }
    assertEquals(code, 403, "branche " + b);
  }
});

Deno.test("dépôt hors liste blanche → 403", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ owner: "quelquun", repo: "autre" })));
  assertEquals(r.status, 403);
  assertEquals((await r.json()).error, "depot_hors_liste");
});

Deno.test("branche hors liste blanche → 403", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ branch: "experimentale" })));
  assertEquals(r.status, 403);
});

Deno.test("liste blanche absente → 503 (on n'écrit pas « au cas où »)", () => {
  let code = 0;
  try { verifierCible({ GITHUB_WRITE_TOKEN: "x" }, "a", "b", "recette"); } catch (e) { code = (e as Refus).code; }
  assertEquals(code, 503);
});

Deno.test("branche absente du corps : aucune valeur par défaut, surtout pas main", async () => {
  const m = monde();
  const c: any = corps(); delete c.branch;
  const r = await m.gestionnaire(requete(c));
  assertEquals(r.status, 400);
  assertEquals(m.pousses.length, 0);
});

// ── 4. Chemins ───────────────────────────────────────────────────────────────────────────
Deno.test("les chemins qui changent l'exécution du projet sont refusés", () => {
  for (const p of [".github/workflows/deploy.yml", "supabase/functions/submit-lead-v6/index.ts",
                   "supabase/migrations/001.sql", "netlify.toml", "_redirects", "_headers", ".env", ".gitignore"]) {
    let code = 0;
    try { verifierChemin(p); } catch (e) { code = (e as Refus).code; }
    assertEquals(code, 403, p);
  }
});

Deno.test("la remontée de dossier est refusée", () => {
  for (const p of ["../secrets.txt", "a/../../b", "dossier\\fichier.html"]) {
    let code = 0;
    try { verifierChemin(p); } catch (e) { code = (e as Refus).code; }
    assertEquals(code, 400, p);
  }
});

Deno.test("un chemin de page normal passe, le / initial est retiré", () => {
  assertEquals(verifierChemin("/prestations/ramonage.html"), "prestations/ramonage.html");
});

// ── 5. Volume ────────────────────────────────────────────────────────────────────────────
Deno.test("taille base64 : calcul du poids réel", () => {
  assertEquals(tailleBase64(btoa("abc")), 3);
  assertEquals(tailleBase64(btoa("ab")), 2);
  assertEquals(tailleBase64(""), 0);
});

Deno.test("trop de fichiers → 413", () => {
  let code = 0;
  const files = Array.from({ length: 51 }, (_, i) => ({ path: "p" + i + ".html", content_b64: B64 }));
  try { verifierFichiers(files); } catch (e) { code = (e as Refus).code; }
  assertEquals(code, 413);
});

Deno.test("charge trop lourde → 413", () => {
  let code = 0;
  const gros = "A".repeat(3 * 1024 * 1024); // ~2,25 Mo décodés
  try { verifierFichiers([{ path: "a.html", content_b64: gros }, { path: "b.html", content_b64: gros }, { path: "c.html", content_b64: gros }]); }
  catch (e) { code = (e as Refus).code; }
  assertEquals(code, 413);
});

Deno.test("contenu qui n'est pas du base64 → 400", () => {
  let code = 0;
  try { verifierFichiers([{ path: "a.html", content_b64: "<html>pas du base64</html>" }]); } catch (e) { code = (e as Refus).code; }
  assertEquals(code, 400);
});

// ── 6. Débit ─────────────────────────────────────────────────────────────────────────────
Deno.test("le débit est borné par appelant", () => {
  let appels: number[] = [];
  for (let i = 0; i < 20; i++) appels = verifierDebit(appels, 1000 + i);
  let code = 0;
  try { verifierDebit(appels, 1100); } catch (e) { code = (e as Refus).code; }
  assertEquals(code, 429);
});

Deno.test("les appels anciens sortent de la fenêtre", () => {
  const vieux = Array.from({ length: 20 }, (_, i) => i);
  const apres = verifierDebit(vieux, 60 * 60 * 1000);
  assertEquals(apres.length, 1);
});

Deno.test("le 21ᵉ appel est refusé de bout en bout", async () => {
  const m = monde();
  for (let i = 0; i < 20; i++) assertEquals((await m.gestionnaire(requete(corps()))).status, 200);
  const r = await m.gestionnaire(requete(corps()));
  assertEquals(r.status, 429);
  assertEquals(m.pousses.length, 20);
});

// ── 7. Journal ───────────────────────────────────────────────────────────────────────────
Deno.test("le journal ne contient ni jeton, ni donnée personnelle, ni contenu de fichier", async () => {
  const m = monde();
  await m.gestionnaire(requete(corps()));
  await m.gestionnaire(requete(corps({ branch: "experimentale" })));
  const tout = m.journal.join("\n");
  assert(tout.length > 0);
  assert(!tout.includes("ghp_"), "un jeton a fui dans le journal");
  assert(!tout.includes(B64), "un contenu de fichier a fui dans le journal");
  assert(tout.includes("gh_write_ok") && tout.includes("gh_write_refus"));
  assert(tout.includes("branche_hors_liste"), "le motif du refus doit rester lisible");
});

Deno.test("le journal filtre toute clé non prévue", () => {
  const l = ligneJournal({ evt: "x", commit: "abc", token: "ghp_secret", email: "a@b.c", nom: "Test" });
  assertEquals(l, JSON.stringify({ evt: "x", commit: "abc" }));
});

// ── 8. Message ───────────────────────────────────────────────────────────────────────────
Deno.test("un message de commit vide est refusé", async () => {
  const m = monde();
  const r = await m.gestionnaire(requete(corps({ message: "   " })));
  assertEquals(r.status, 400);
  assertEquals(m.pousses.length, 0);
});
