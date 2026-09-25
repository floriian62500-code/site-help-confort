// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// Edge Function : partners-json — liste publique des partenaires actifs, filtrable par tag
// GET /partners-json?tag=pmr
// GET /partners-json (sans filtre = tous)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      "content-type": "application/json",
      "cache-control": "public, max-age=60, s-maxage=300"
    }
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let q = sb
      .from("partners")
      .select("id, slug, name, type, scope, description, logo_url, website, position, highlight, badge_color, tags")
      .eq("active", true)
      .order("position", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(limit);

    if (tag) q = q.contains("tags", [tag]);

    const { data, error } = await q;
    if (error) return json({ error: error.message }, 500);

    return json({
      success: true,
      count: (data || []).length,
      tag: tag || null,
      partners: data || []
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
