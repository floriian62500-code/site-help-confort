// ═════════════════════════════════════════════════════════════════════════════════════════
// Écriture GitHub depuis une fonction edge — logique durcie, testable sans réseau
// (directive 5778526407 §2.B, précisée par 5795806773 §3B).
//
// Utilisée par gh-push-inline/HARDENED_index.ts et gh-edit-file/HARDENED_index.ts. NON DÉPLOYÉ.
//
// Ce que les versions en production font aujourd'hui, et que celle-ci interdit :
//   - elles sont publiques (verify_jwt = false) et n'identifient pas l'appelant ;
//   - elles prennent le jeton GitHub DANS LE CORPS DE LA REQUÊTE : le navigateur doit donc
//     détenir un PAT, et n'importe qui peut en présenter un autre ;
//   - elles écrivent sur n'importe quel dépôt, n'importe quelle branche, `main` par défaut ;
//   - elles ne laissent aucune trace exploitable.
//
// Règles de la version durcie :
//   1. Appelant : membre du personnel authentifié (JWT Supabase + rôle actif). Plus d'appel anonyme.
//   2. Jeton GitHub : lu dans l'environnement du serveur (GITHUB_WRITE_TOKEN). Un jeton présent
//      dans la requête est un refus net (403), pas une valeur de repli — sinon la faille demeure.
//   3. Cible : liste blanche `owner/repo` (GITHUB_WRITE_REPOS) et branche (GITHUB_WRITE_BRANCHES).
//      `main` et `master` sont refusées même si quelqu'un les ajoute à la liste blanche.
//   4. Chemins : refus des fichiers qui changent l'exécution du projet ou exfiltrent des secrets
//      (.github/**, supabase/functions/**, netlify.toml, _redirects, _headers, .env*).
//   5. Jamais de force-push ; un seul commit par appel ; nombre et taille de fichiers bornés.
//   6. Débit : N appels par fenêtre et par appelant.
//   7. Journal : liste blanche de clés, aucune donnée personnelle, jamais le jeton.
// ═════════════════════════════════════════════════════════════════════════════════════════

export const PERSONNEL = ["owner", "assistant"];
export const BRANCHES_INTERDITES = ["main", "master"];
export const MAX_FICHIERS = 50;
export const MAX_OCTETS = 5 * 1024 * 1024; // 5 Mo par appel, base64 décodé
export const DEBIT_MAX = 20;               // appels par fenêtre
export const DEBIT_FENETRE_MS = 10 * 60 * 1000;

// Un chemin est refusé s'il touche l'exécution du projet ou ses secrets.
export const CHEMINS_INTERDITS: RegExp[] = [
  /^\.github\//,
  /^supabase\/functions\//,
  /^supabase\/migrations\//,
  /(^|\/)netlify\.toml$/,
  /(^|\/)_redirects$/,
  /(^|\/)_headers$/,
  /(^|\/)\.env/,
  /(^|\/)\.git(ignore|modules|attributes)?$/,
];

export class Refus extends Error {
  code: number;
  constructor(code: number, message: string) { super(message); this.code = code; }
}

export type Env = {
  GITHUB_WRITE_TOKEN?: string;
  GITHUB_WRITE_REPOS?: string;    // "owner/repo,owner/autre"
  GITHUB_WRITE_BRANCHES?: string; // "recette,staging"
};

export function estPersonnel(role: string | null | undefined, actif: boolean | null | undefined): boolean {
  return !!role && PERSONNEL.includes(role) && actif !== false;
}

// ── Jeton : serveur uniquement ───────────────────────────────────────────────────────────
export function jetonServeur(env: Env, jetonDansLaRequete: unknown): string {
  if (jetonDansLaRequete !== undefined && jetonDansLaRequete !== null && jetonDansLaRequete !== "") {
    throw new Refus(403, "jeton_dans_la_requete");
  }
  const t = (env.GITHUB_WRITE_TOKEN || "").trim();
  if (!t) throw new Refus(503, "jeton_serveur_absent");
  return t;
}

// ── Cible : dépôt et branche sur liste blanche ───────────────────────────────────────────
export function listeBlanche(v: string | undefined): string[] {
  return (v || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export function verifierCible(env: Env, owner: unknown, repo: unknown, branche: unknown): { owner: string; repo: string; branche: string } {
  const o = String(owner || "").trim(), r = String(repo || "").trim(), b = String(branche || "").trim();
  if (!o || !r || !b) throw new Refus(400, "cible_incomplete");
  if (BRANCHES_INTERDITES.includes(b.toLowerCase())) throw new Refus(403, "branche_interdite");
  const depots = listeBlanche(env.GITHUB_WRITE_REPOS);
  const branches = listeBlanche(env.GITHUB_WRITE_BRANCHES).filter((x) => !BRANCHES_INTERDITES.includes(x));
  if (!depots.length || !branches.length) throw new Refus(503, "liste_blanche_absente");
  if (!depots.includes((o + "/" + r).toLowerCase())) throw new Refus(403, "depot_hors_liste");
  if (!branches.includes(b.toLowerCase())) throw new Refus(403, "branche_hors_liste");
  return { owner: o, repo: r, branche: b };
}

// ── Chemins ──────────────────────────────────────────────────────────────────────────────
export function verifierChemin(chemin: unknown): string {
  const p = String(chemin || "").replace(/^\/+/, "").trim();
  if (!p) throw new Refus(400, "chemin_vide");
  if (p.includes("..") || p.includes("\\") || p.includes("\0")) throw new Refus(400, "chemin_invalide");
  for (const re of CHEMINS_INTERDITS) if (re.test(p)) throw new Refus(403, "chemin_interdit");
  return p;
}

export function tailleBase64(b64: string): number {
  const s = String(b64 || "").replace(/\s/g, "");
  const bourrage = (s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0);
  return Math.max(0, Math.floor(s.length * 3 / 4) - bourrage);
}

export function verifierFichiers(files: unknown): { path: string; content_b64: string }[] {
  if (!Array.isArray(files) || !files.length) throw new Refus(400, "aucun_fichier");
  if (files.length > MAX_FICHIERS) throw new Refus(413, "trop_de_fichiers");
  let total = 0;
  const out = files.map((f: any) => {
    const path = verifierChemin(f?.path);
    const content_b64 = String(f?.content_b64 ?? "");
    if (!/^[A-Za-z0-9+/=\s]*$/.test(content_b64)) throw new Refus(400, "contenu_non_base64");
    total += tailleBase64(content_b64);
    return { path, content_b64 };
  });
  if (total > MAX_OCTETS) throw new Refus(413, "charge_trop_lourde");
  return out;
}

// ── Débit, par appelant ──────────────────────────────────────────────────────────────────
export function verifierDebit(appels: number[], maintenant: number): number[] {
  const recents = appels.filter((t) => maintenant - t < DEBIT_FENETRE_MS);
  if (recents.length >= DEBIT_MAX) throw new Refus(429, "debit_depasse");
  return [...recents, maintenant];
}

// ── Journal sans donnée personnelle ni secret ────────────────────────────────────────────
// « raison » est un code interne fixe (branche_interdite, chemin_interdit…), jamais un message libre :
// il reste donc sans donnée personnelle, et c'est lui qui rend le journal exploitable.
const CLES_JOURNAL = ["evt", "appelant", "owner", "repo", "branche", "fichiers", "octets", "commit", "code", "raison"];
export function ligneJournal(o: Record<string, unknown>): string {
  const vu: Record<string, unknown> = {};
  for (const k of CLES_JOURNAL) if (o[k] !== undefined) vu[k] = o[k];
  return JSON.stringify(vu);
}

// ── Gestionnaire, dépendances injectées (tests sans réseau) ──────────────────────────────
export type Deps = {
  env: Env;
  utilisateurDepuisJeton: (jwt: string) => Promise<{ id: string } | null>;
  profil: (id: string) => Promise<{ role: string | null; is_active: boolean | null } | null>;
  pousser: (args: { token: string; owner: string; repo: string; branche: string; message: string; fichiers: { path: string; content_b64: string }[] }) => Promise<{ sha: string }>;
  appelsRecents: (appelant: string) => Promise<number[]>;
  noterAppel: (appelant: string, appels: number[]) => Promise<void>;
  journal: (ligne: string) => void;
  maintenant?: () => number;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

export function creerGestionnaire(deps: Deps) {
  const maintenant = deps.maintenant || (() => Date.now());
  return async function gestionnaire(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ error: "POST only" }, 405);

    let appelant = "";
    try {
      const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
      if (!jwt) throw new Refus(401, "authentification_requise");
      const u = await deps.utilisateurDepuisJeton(jwt);
      if (!u) throw new Refus(401, "jeton_invalide");
      appelant = u.id;
      const p = await deps.profil(u.id);
      if (!estPersonnel(p?.role, p?.is_active)) throw new Refus(403, "reserve_au_personnel");

      let body: any;
      try { body = await req.json(); } catch { throw new Refus(400, "json_invalide"); }

      const token = jetonServeur(deps.env, body?.token);
      const cible = verifierCible(deps.env, body?.owner, body?.repo, body?.branch);
      const fichiers = verifierFichiers(body?.files);
      const message = String(body?.message || "").trim();
      if (!message) throw new Refus(400, "message_requis");

      const appels = verifierDebit(await deps.appelsRecents(appelant), maintenant());
      await deps.noterAppel(appelant, appels);

      const octets = fichiers.reduce((n, f) => n + tailleBase64(f.content_b64), 0);
      const { sha } = await deps.pousser({ token, owner: cible.owner, repo: cible.repo, branche: cible.branche, message, fichiers });

      deps.journal(ligneJournal({ evt: "gh_write_ok", appelant, owner: cible.owner, repo: cible.repo, branche: cible.branche, fichiers: fichiers.length, octets, commit: sha }));
      return json({ success: true, commit_sha: sha, files_pushed: fichiers.length, branch: cible.branche });
    } catch (e) {
      const code = e instanceof Refus ? e.code : 500;
      const raison = e instanceof Refus ? e.message : "erreur_interne";
      deps.journal(ligneJournal({ evt: "gh_write_refus", appelant, code, raison } as Record<string, unknown>));
      return json({ error: raison }, code);
    }
  };
}
