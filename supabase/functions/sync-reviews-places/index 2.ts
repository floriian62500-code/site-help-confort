// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — sync-reviews-places
// Pull les avis Google des 2 fiches HC via Places API (Place Details).
// Limites Places API : 5 avis récents max par fiche (Google ne donne pas l'historique complet via cette API).
// MAIS ça marche sans approbation GMB API.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

// Requêtes de recherche pour les 2 fiches HC
const PLACES_SEARCH = [
  { agence: "depan-audo", query: "HELP Confort Saint-Omer" },
  { agence: "depan-dk", query: "HELP Confort Dunkerque" }
];

async function findPlaceId(query: string, apiKey: string): Promise<string | null> {
  // Places API (new) : Text Search
  const url = `https://places.googleapis.com/v1/places:searchText`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
    },
    body: JSON.stringify({ textQuery: query, languageCode: "fr", regionCode: "FR" })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`searchText HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

async function getPlaceReviews(placeId: string, apiKey: string): Promise<any> {
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews"
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`getPlaceReviews HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    const { data: setting } = await sb.from("app_settings").select("value").eq("key", "google_places").single();
    const apiKey = setting?.value?.api_key;
    if (!apiKey) return json({ error: "Clé Places API manquante dans app_settings.google_places" }, 400);

    const results: any = { synced: 0, errors: [], places: [] };

    for (const p of PLACES_SEARCH) {
      try {
        // 1. Trouver le Place ID
        const placeId = await findPlaceId(p.query, apiKey);
        if (!placeId) {
          results.errors.push(`${p.agence}: aucun place trouvé pour "${p.query}"`);
          continue;
        }

        // 2. Récupérer les avis
        const placeData = await getPlaceReviews(placeId, apiKey);
        results.places.push({
          agence: p.agence,
          place_id: placeId,
          name: placeData.displayName?.text || "",
          rating: placeData.rating || 0,
          total_ratings: placeData.userRatingCount || 0,
          reviews_count: (placeData.reviews || []).length
        });

        // 3. Upsert les reviews dans la table
        for (const rv of (placeData.reviews || [])) {
          const row = {
            source: "google",
            source_id: rv.name || rv.publishTime, // unique par avis
            source_url: `https://search.google.com/local/reviews?placeid=${placeId}`,
            agence: p.agence,
            location_id: placeId,
            author_name: rv.authorAttribution?.displayName || "Anonyme",
            author_photo_url: rv.authorAttribution?.photoUri || null,
            rating: rv.rating || 5,
            comment: rv.text?.text || rv.originalText?.text || null,
            posted_at: rv.publishTime || new Date().toISOString(),
            reply_text: null, // Places API ne donne pas les réponses du propriétaire
            reply_posted_at: null,
            status: "new"
          };
          const { error } = await sb.from("reviews").upsert(row, { onConflict: "source,source_id" });
          if (!error) results.synced++;
          else results.errors.push(`${p.agence}: ${error.message}`);
        }

        // 4. Sauvegarder le Place ID dans app_settings pour usage futur
        const { data: gbpSetting } = await sb.from("app_settings").select("value").eq("key", "gbp").single();
        const gbp = gbpSetting?.value || {};
        if (p.agence === "depan-audo") gbp.place_id_st_omer = placeId;
        if (p.agence === "depan-dk") gbp.place_id_dk = placeId;
        await sb.from("app_settings").update({ value: gbp }).eq("key", "gbp");
      } catch (e: any) {
        results.errors.push(`${p.agence}: ${e.message}`);
      }
    }

    return json({ success: true, ...results, synced_at: new Date().toISOString() });
  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, "content-type": "application/json" } });
}
