// ═══════════════════════════════════════════════════════════════
// Edge Function : gbp-diagnostic  (v2026-05-14 — redeploy)
// Teste end-to-end la connexion Google Business Profile :
//   1. Credentials présents (client_id, client_secret, refresh_token)
//   2. Access token valide (auto-refresh si expiré)
//   3. Liste des comptes accessibles
//   4. Locations Saint-Omer + Dunkerque lisibles
//   5. Lecture du flux d'avis (count)
// Renvoie un objet { success, checks: {...}, error? } pour l'UI.
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy gbp-diagnostic --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

async function refreshGoogleToken(cfg: any, sb: any) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.client_id || "",
      client_secret: cfg.client_secret || "",
      refresh_token: cfg.refresh_token || "",
      grant_type: "refresh_token"
    })
  });
  const data = await res.json();
  if (data.access_token) {
    await sb.from("app_settings").update({
      value: { ...cfg, access_token: data.access_token }
    }).eq("key", "gbp");
    return { ok: true, token: data.access_token };
  }
  return { ok: false, err: data.error_description || data.error || "refresh failed" };
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const checks: any = {
    creds: false,
    access_token: false,
    refresh: false,
    account: false,
    loc_st_omer: false,
    loc_dk: false,
    reviews: false
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, checks, error: "Missing Authorization" }, 401);

    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ success: false, checks, error: "Not authenticated" }, 401);

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "gbp").single();
    const cfg = settings?.value || {};

    // 1) Credentials minimaux
    checks.creds = !!(cfg.client_id && cfg.client_secret && cfg.refresh_token);
    if (!checks.creds) {
      return json({ success: false, checks, error: "Credentials OAuth incomplets (Client ID, Client Secret, Refresh Token requis)." });
    }

    // 2) Test access token (ping rapide sur userinfo)
    let token = cfg.access_token;
    if (token) {
      const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
      });
      checks.access_token = r.ok;
      if (!r.ok) checks.access_token_err = "Token expiré, refresh en cours";
    }

    // 3) Refresh token (toujours testé pour valider que le client_id/secret marche)
    const ref = await refreshGoogleToken(cfg, sb);
    checks.refresh = ref.ok;
    if (!ref.ok) {
      checks.refresh_err = ref.err;
      return json({ success: false, checks, error: "Refresh token invalide : " + ref.err });
    }
    token = ref.token;
    checks.access_token = true; // on vient de le rafraîchir
    checks.access_token_err = null;

    // 4) Liste des comptes accessibles
    const accRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!accRes.ok) {
      const errBody = await accRes.text();
      checks.account_err = `HTTP ${accRes.status} — ${errBody.slice(0, 120)}`;
      // Cas le plus fréquent : approbation API pas encore donnée par Google → 403
      if (accRes.status === 403) {
        checks.account_err = "Accès non encore approuvé par Google (HTTP 403). Vérifiez l'étape 3 du wizard.";
      }
    } else {
      const accData = await accRes.json();
      checks.accounts_count = (accData.accounts || []).length;
      checks.account = !!cfg.account_id_audo && (accData.accounts || []).some((a: any) => a.name === cfg.account_id_audo);
      if (!checks.account && checks.accounts_count > 0) {
        checks.account_err = `Account ID renseigné introuvable. Comptes vus : ${(accData.accounts || []).map((a: any) => a.name).join(", ").slice(0, 200)}`;
      }
    }

    // 5) Locations
    if (checks.account && cfg.account_id_audo) {
      const locUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${cfg.account_id_audo}/locations?readMask=name,title&pageSize=20`;
      const locRes = await fetch(locUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (locRes.ok) {
        const locData = await locRes.json();
        const all = (locData.locations || []);
        const findLoc = (id: string | undefined) => id ? all.find((l: any) => l.name === id || ("locations/" + l.name) === id || l.name.endsWith(id.replace("locations/", ""))) : null;
        const so = findLoc(cfg.location_id_st_omer);
        const dk = findLoc(cfg.location_id_dk);
        checks.loc_st_omer = !!so;
        checks.loc_dk = !!dk;
        if (so) checks.loc_st_omer_title = so.title;
        if (dk) checks.loc_dk_title = dk.title;
      } else {
        checks.loc_err = `HTTP ${locRes.status}`;
      }
    }

    // 6) Lecture des avis (compte global)
    if (checks.loc_st_omer && cfg.location_id_st_omer) {
      try {
        const rUrl = `https://mybusiness.googleapis.com/v4/${cfg.account_id_audo}/${cfg.location_id_st_omer}/reviews?pageSize=1`;
        const rRes = await fetch(rUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (rRes.ok) {
          const rData = await rRes.json();
          checks.reviews = true;
          checks.reviews_count = rData.totalReviewCount ?? (rData.reviews?.length ?? 0);
        } else {
          checks.reviews_err = `HTTP ${rRes.status}`;
        }
      } catch (e: any) {
        checks.reviews_err = e.message;
      }
    }

    const success = checks.creds && checks.refresh && checks.account && checks.loc_st_omer && checks.loc_dk && checks.reviews;
    return json({ success, checks, tested_at: new Date().toISOString() });

  } catch (e: any) {
    return json({ success: false, checks, error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
