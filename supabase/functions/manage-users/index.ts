// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Edge Function : manage-users
// ═══════════════════════════════════════════════════════════════
// Gestion centralisée des comptes admins du dashboard.
// Toutes les actions vérifient que l'appelant est OWNER (sinon 403).
//
// Actions supportées (POST body : { action: '...', ... }) :
//   - list                              → renvoie tous les users + profiles
//   - invite { email, full_name, role } → invite par email (lien magique)
//   - update_role { user_id, role }     → change le rôle d'un user
//   - set_active { user_id, active }    → active/désactive un compte
//   - delete { user_id }                → supprime définitivement un compte
//
// Déploiement :
//   supabase functions deploy manage-users
// (JWT vérifié automatiquement par Supabase ; pas besoin de --no-verify-jwt)
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS }
  });

// @ts-ignore Deno
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore Deno
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-ignore Deno
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const VALID_ROLES = new Set(["owner", "assistant", "viewer"]);

// @ts-ignore Deno
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // 1) Auth caller
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return json({ error: "Missing auth token" }, 401);

  // Client "user" pour identifier l'appelant
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Invalid session" }, 401);
  const caller = userData.user;

  // 2) Vérifier que l'appelant est OWNER
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: profile, error: profErr } = await admin
    .from("user_profiles")
    .select("role, is_active")
    .eq("user_id", caller.id)
    .single();

  if (profErr || !profile) {
    return json({ error: "No profile found. Run setup_user_profiles.sql first." }, 403);
  }
  if (profile.role !== "owner" || !profile.is_active) {
    return json({ error: "Forbidden : owner role required" }, 403);
  }

  // 3) Parse action
  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const action = body?.action;
  if (!action) return json({ error: "Missing action" }, 400);

  try {
    switch (action) {

      // ─── LIST ─────────────────────────────────────────
      case "list": {
        const { data: profiles, error: pErr } = await admin
          .from("user_profiles")
          .select("user_id, full_name, role, is_active, invited_by, created_at, updated_at")
          .order("created_at", { ascending: true });
        if (pErr) throw pErr;

        // Récupère les emails et last_sign_in via auth.admin
        const { data: authList, error: aErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (aErr) throw aErr;
        const byId = new Map(authList.users.map(u => [u.id, u]));

        const users = (profiles || []).map(p => {
          const u = byId.get(p.user_id);
          return {
            user_id: p.user_id,
            email: u?.email || null,
            full_name: p.full_name,
            role: p.role,
            is_active: p.is_active,
            last_sign_in_at: u?.last_sign_in_at || null,
            created_at: p.created_at,
            invited_by: p.invited_by,
            banned: !!u?.banned_until && new Date(u.banned_until) > new Date()
          };
        });
        return json({ ok: true, users });
      }

      // ─── INVITE ───────────────────────────────────────
      case "invite": {
        const email = String(body.email || "").trim().toLowerCase();
        const role  = String(body.role || "assistant");
        const full_name = String(body.full_name || "").trim();
        if (!email) return json({ error: "Email required" }, 400);
        if (!VALID_ROLES.has(role)) return json({ error: "Invalid role" }, 400);

        const { data: inv, error: iErr } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { name: full_name, role, invited_by: caller.email }
        });
        if (iErr) throw iErr;

        // Le trigger handle_new_user créera le profil avec role par défaut 'assistant'.
        // On force le rôle souhaité tout de suite.
        if (inv?.user) {
          await admin.from("user_profiles").upsert({
            user_id: inv.user.id,
            full_name: full_name || email.split("@")[0],
            role,
            is_active: true,
            invited_by: caller.id
          }, { onConflict: "user_id" });
        }
        return json({ ok: true, invited: { email, role, user_id: inv?.user?.id } });
      }

      // ─── UPDATE_ROLE ──────────────────────────────────
      case "update_role": {
        const user_id = body.user_id;
        const role = body.role;
        if (!user_id) return json({ error: "user_id required" }, 400);
        if (!VALID_ROLES.has(role)) return json({ error: "Invalid role" }, 400);

        // Empêcher de se rétrograder soi-même si c'est le DERNIER owner
        if (user_id === caller.id && role !== "owner") {
          const { count } = await admin
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "owner")
            .eq("is_active", true);
          if ((count || 0) <= 1) {
            return json({ error: "Impossible : tu es le dernier owner actif" }, 400);
          }
        }

        const { error: uErr } = await admin
          .from("user_profiles")
          .update({ role })
          .eq("user_id", user_id);
        if (uErr) throw uErr;
        return json({ ok: true });
      }

      // ─── SET_ACTIVE ───────────────────────────────────
      case "set_active": {
        const user_id = body.user_id;
        const active = !!body.active;
        if (!user_id) return json({ error: "user_id required" }, 400);

        // Empêcher de se désactiver soi-même
        if (user_id === caller.id && !active) {
          return json({ error: "Impossible : tu ne peux pas te désactiver toi-même" }, 400);
        }

        const { error: uErr } = await admin
          .from("user_profiles")
          .update({ is_active: active })
          .eq("user_id", user_id);
        if (uErr) throw uErr;

        // Ban/unban côté auth (empêche les sessions de fonctionner)
        await admin.auth.admin.updateUserById(user_id, {
          ban_duration: active ? "none" : "876000h" // ~100 ans
        });
        return json({ ok: true });
      }

      // ─── DELETE ───────────────────────────────────────
      case "delete": {
        const user_id = body.user_id;
        if (!user_id) return json({ error: "user_id required" }, 400);
        if (user_id === caller.id) {
          return json({ error: "Impossible : tu ne peux pas te supprimer toi-même" }, 400);
        }
        // Supprime aussi le profil via CASCADE
        const { error: dErr } = await admin.auth.admin.deleteUser(user_id);
        if (dErr) throw dErr;
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action: " + action }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message || String(e) }, 500);
  }
});
