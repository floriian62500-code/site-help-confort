// ⚠️ VERSION DURCIE — **NON DÉPLOYÉE**. Le déploiement d'une fonction edge est une décision humaine
// (directive 5778526407 §2.B, précisée par 5795806773 §3B : « ne supprime rien, ne déploie rien »).
//
// Remplacera index.ts (conservé pour le retour arrière) sur décision de Florian. Toute la logique
// de refus est dans ../_shared/github-write.ts, testée sans réseau par handler.test.ts (11 contrôles,
// en plus des 24 de gh-push-inline qui couvrent le socle commun).
//
// Variables d'environnement à poser AVANT le déploiement (sinon refus, 503) :
//   GITHUB_WRITE_TOKEN / GITHUB_WRITE_REPOS / GITHUB_WRITE_BRANCHES  (cf. gh-push-inline)
// Et `verify_jwt = true` au déploiement.
//
// Corps attendu : { owner, repo, branch, file_path, find, replace, message, replace_all? }
// `token` n'est plus accepté ; `branch` n'a plus de valeur par défaut (l'ancienne visait `staging`).
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { creerGestionnaireEdition, type DepsEdition } from "../_shared/github-write.ts";

// @ts-ignore
const env = Deno.env.toObject();
const admin = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function gh(token: string, chemin: string, opts: RequestInit = {}) {
  const r = await fetch("https://api.github.com" + chemin, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "hc-gh-edit-file",
    },
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("GitHub " + chemin + " → " + r.status);
  return r.json();
}

function depuisBase64(b64: string): string {
  const bin = atob(String(b64).replace(/\n/g, ""));
  const octets = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(octets);
}

const deps: DepsEdition = {
  env,
  utilisateurDepuisJeton: async (jwt) => {
    const { data } = await admin.auth.getUser(jwt);
    return data?.user ? { id: data.user.id } : null;
  },
  profil: async (id) => {
    const { data } = await admin.from("user_profiles").select("role,is_active").eq("id", id).maybeSingle();
    return data ?? null;
  },
  // Lecture par /contents en JSON (Accept:raw renvoyait des 401 : c'est la raison de la v3 d'origine).
  lireFichier: async ({ token, owner, repo, branche, chemin }) => {
    const url = `/repos/${owner}/${repo}/contents/${chemin.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branche)}`;
    const res = await gh(token, url);
    return res && res.content ? depuisBase64(res.content) : null;
  },
  // Un seul commit, jamais de force-push.
  pousser: async ({ token, owner, repo, branche, message, fichiers }) => {
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branche}`);
    if (!ref) throw new Error("branche introuvable");
    const tete = ref.object.sha;
    const commitTete = await gh(token, `/repos/${owner}/${repo}/git/commits/${tete}`);
    const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fichiers[0].content_b64, encoding: "base64" }),
    });
    const arbre = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_tree: commitTete.tree.sha, tree: [{ path: fichiers[0].path, mode: "100644", type: "blob", sha: blob.sha }] }),
    });
    const commit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tree: arbre.sha, parents: [tete] }),
    });
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branche}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return { sha: commit.sha };
  },
  appelsRecents: async (appelant) => {
    const depuis = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data } = await admin.from("gh_write_calls").select("created_at").eq("caller", appelant).gte("created_at", depuis);
    return (data || []).map((l: any) => new Date(l.created_at).getTime());
  },
  noterAppel: async (appelant) => { await admin.from("gh_write_calls").insert({ caller: appelant }); },
  journal: (ligne) => console.log(ligne),
};

// @ts-ignore
Deno.serve(creerGestionnaireEdition(deps));
