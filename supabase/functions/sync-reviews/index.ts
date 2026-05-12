// ═══════════════════════════════════════════════════════════════
// Edge Function : sync-reviews
// Pull les avis Google Business Profile (et Facebook si dispo)
// vers la table reviews
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy sync-reviews --no-verify-jwt
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
      refresh_token: cfg.refresh_token,
      grant_type: "refresh_token"
    })
  });
  const data = await res.json();
  if (data.access_token) {
    await sb.from("app_settings").update({
      value: { ...cfg, access_token: data.access_token }
    }).eq("key", "gbp");
    return data.access_token;
  }
  throw new Error("Refresh failed: " + JSON.stringify(data));
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const isCron = authHeader === `Bearer ${serviceKey}`;
    // @ts-ignore
    const sb = isCron
      // @ts-ignore
      ? createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } })
      // @ts-ignore
      : createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });

    if (!isCron) {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return json({ error: "Not authenticated" }, 401);
    }

    const { data: settings } = await sb.from("app_settings").select("*");
    const byKey: Record<string, any> = {};
    (settings || []).forEach((s: any) => byKey[s.key] = s.value || {});

    const results: any = { google: { synced: 0, errors: [] }, facebook: { synced: 0, errors: [] } };

    // ─── GOOGLE BUSINESS PROFILE ───
    if (byKey.gbp?.refresh_token && byKey.gbp?.account_id_audo) {
      let token = byKey.gbp.access_token;
      const locations = [
        { agence: "depan-audo", id: byKey.gbp.location_id_st_omer, label: "Saint-Omer" },
        { agence: "depan-dk", id: byKey.gbp.location_id_dk, label: "Dunkerque" }
      ].filter(l => l.id);

      const ratingMap: any = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
      results.google.byLocation = {};

      for (const loc of locations) {
        const locResult = { synced: 0, fetched: 0, errors: [] as string[] };
        try {
          let nextPage: string | undefined = undefined;
          let safety = 0;
          do {
            const u = new URL(`https://mybusiness.googleapis.com/v4/${byKey.gbp.account_id_audo}/${loc.id}/reviews`);
            u.searchParams.set("pageSize", "50");
            if (nextPage) u.searchParams.set("pageToken", nextPage);

            let r = await fetch(u.toString(), { headers: { "Authorization": `Bearer ${token}` } });
            if (r.status === 401 && byKey.gbp.refresh_token) {
              token = await refreshGoogleToken(byKey.gbp, sb);
              r = await fetch(u.toString(), { headers: { "Authorization": `Bearer ${token}` } });
            }
            if (!r.ok) {
              const body = await r.text();
              locResult.errors.push(`HTTP ${r.status} — ${body.slice(0, 140)}`);
              break;
            }
            const data = await r.json();
            locResult.fetched += (data.reviews || []).length;

            for (const rv of (data.reviews || [])) {
              const row = {
                source: "google",
                source_id: rv.reviewId || rv.name,
                source_url: `https://search.google.com/local/reviews?placeid=${loc.id}`,
                agence: loc.agence,
                location_id: loc.id,
                author_name: rv.reviewer?.displayName || "Anonyme",
                author_photo_url: rv.reviewer?.profilePhotoUrl,
                rating: ratingMap[rv.starRating] || 5,
                comment: rv.comment || null,
                posted_at: rv.createTime,
                reply_text: rv.reviewReply?.comment || null,
                reply_posted_at: rv.reviewReply?.updateTime || null,
                status: rv.reviewReply ? "replied" : "new"
              };
              const { error } = await sb.from("reviews").upsert(row, { onConflict: "source,source_id" });
              if (!error) locResult.synced++;
              else locResult.errors.push(error.message);
            }
            nextPage = data.nextPageToken;
            safety++;
          } while (nextPage && safety < 10); // garde-fou max 500 avis par sync

        } catch (e: any) {
          locResult.errors.push(`${e.message}`);
        }
        results.google.byLocation[loc.agence] = locResult;
        results.google.synced += locResult.synced;
        if (locResult.errors.length) {
          results.google.errors.push(`${loc.label}: ${locResult.errors.join(" | ")}`);
        }
      }

      // Mémorise la date de dernier sync
      await sb.from("app_settings").update({
        value: { ...byKey.gbp, last_synced_at: new Date().toISOString(), last_sync_count: results.google.synced }
      }).eq("key", "gbp");
    }

    // ─── FACEBOOK ─── (note : FB n'expose plus les avis individuels via API depuis 2021)
    // On peut juste récupérer le rating global de la page
    if (byKey.meta?.page_access_token && byKey.meta?.fb_page_id) {
      try {
        const r = await fetch(`https://graph.facebook.com/v21.0/${byKey.meta.fb_page_id}?fields=overall_star_rating,rating_count&access_token=${byKey.meta.page_access_token}`);
        const d = await r.json();
        if (d.overall_star_rating) {
          // On stocke un "avis agrégé" comme placeholder
          results.facebook.aggregate = {
            rating: d.overall_star_rating,
            count: d.rating_count
          };
        } else if (d.error) {
          results.facebook.errors.push(d.error.message);
        }
      } catch (e: any) { results.facebook.errors.push(e.message); }
    }

    return json({ success: true, results, synced_at: new Date().toISOString() });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
