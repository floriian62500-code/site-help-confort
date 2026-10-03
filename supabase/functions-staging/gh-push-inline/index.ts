// ⚠️ VERSION DURCIE — **NON DÉPLOYÉE**. Le déploiement d'une fonction edge est une décision humaine
// (directive 5778526407 §2.B, précisée par 5795806773 §3B : « ne supprime rien, ne déploie rien »).
//
// Elle remplacera index.ts (conservé tel quel pour le retour arrière) une fois que Florian aura
// tranché. Toute la logique de refus est dans ../_shared/github-write.ts, testée sans réseau par
// handler.test.ts (24 contrôles). Ce fichier ne fait que brancher le monde réel.
//
// Variables d'environnement à poser AVANT le déploiement (sinon la fonction refuse, 503) :
//   GITHUB_WRITE_TOKEN     jeton à portée étroite : ce dépôt, contenu seulement, PAS de portée workflow
//   GITHUB_WRITE_REPOS     ex. "floriian62500-code/site-help-confort"
//   GITHUB_WRITE_BRANCHES  ex. "recette,staging"  (main et master sont refusées de toute façon)
// Et `verify_jwt = true` au déploiement : l'authentification de l'appelant n'est pas une option.
//
// Corps attendu : { owner, repo, branch, message, files: [{ path, content_b64 }] }
// Le champ `token` n'est plus accepté : le fournir est un refus (403), pas un repli.
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { creerGestionnaire, type Deps } from "../_shared/github-write.ts";

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
      "User-Agent": "hc-gh-push-inline",
    },
  });
  if (!r.ok) throw new Error("GitHub " + chemin + " → " + r.status);
  return r.json();
}

const deps: Deps = {
  env,
  utilisateurDepuisJeton: async (jwt) => {
    const { data } = await admin.auth.getUser(jwt);
    return data?.user ? { id: data.user.id } : null;
  },
  profil: async (id) => {
    const { data } = await admin.from("user_profiles").select("role,is_active").eq("id", id).maybeSingle();
    return data ?? null;
  },
  // Un seul commit, jamais de force-push : le ref n'avance que si la tête n'a pas bougé.
  pousser: async ({ token, owner, repo, branche, message, fichiers }) => {
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branche}`);
    const tete = ref.object.sha;
    const commitTete = await gh(token, `/repos/${owner}/${repo}/git/commits/${tete}`);
    const arbre: any[] = [];
    for (const f of fichiers) {
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: f.content_b64, encoding: "base64" }),
      });
      arbre.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const nouvelArbre = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_tree: commitTete.tree.sha, tree: arbre }),
    });
    const commit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tree: nouvelArbre.sha, parents: [tete] }),
    });
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branche}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return { sha: commit.sha };
  },
  // Débit en base : une ligne par appel, lue sur la fenêtre courante.
  appelsRecents: async (appelant) => {
    const depuis = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data } = await admin.from("gh_write_calls").select("created_at").eq("caller", appelant).gte("created_at", depuis);
    return (data || []).map((l: any) => new Date(l.created_at).getTime());
  },
  noterAppel: async (appelant) => { await admin.from("gh_write_calls").insert({ caller: appelant }); },
  journal: (ligne) => console.log(ligne),
};

// @ts-ignore
Deno.serve(creerGestionnaire(deps));
