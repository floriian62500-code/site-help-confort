// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — notify-pending-reviews
// Envoie un email récap des avis Google non répondus à saint-omer@helpconfort.com
// À déclencher en cron quotidien (ex: 9h chaque matin).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const NOTIFY_EMAIL = "saint-omer@helpconfort.com";
const FROM_EMAIL = "noreply@send.depan59-62.fr";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    // Récupère la clé Resend
    const { data: resendSetting } = await sb.from("app_settings").select("value").eq("key", "resend").single();
    const resendKey = resendSetting?.value?.api_key;
    if (!resendKey) return json({ error: "Clé Resend manquante dans app_settings.resend" }, 400);

    // Récupère les avis NON Répondus (status != 'replied' et pas archivé)
    const { data: pending, error } = await sb
      .from("reviews")
      .select("id, source, agence, author_name, rating, comment, posted_at, source_url")
      .neq("status", "replied")
      .neq("status", "archived")
      .order("posted_at", { ascending: false })
      .limit(50);
    if (error) return json({ error: "BDD fetch failed: " + error.message }, 500);

    if (!pending || pending.length === 0) {
      return json({ success: true, message: "Aucun avis en attente — pas d'email envoyé", count: 0 });
    }

    // Construit le HTML de l'email
    const reviewsHtml = pending.map(r => {
      const stars = "★".repeat(Math.round(r.rating || 0)) + "☆".repeat(5 - Math.round(r.rating || 0));
      const date = new Date(r.posted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
      const agenceLabel = r.agence === "depan-audo" ? "Saint-Omer" : r.agence === "depan-dk" ? "Dunkerque" : "";
      return `
        <div style="background:#fff;border:1px solid #E5EDF3;border-radius:10px;padding:14px 16px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div><strong>${r.author_name}</strong> <span style="color:#FFB400;font-size:14px">${stars}</span></div>
            <div style="color:#94a3b8;font-size:12px">${date} • ${agenceLabel}</div>
          </div>
          <p style="margin:6px 0;font-size:13px;color:#475569;line-height:1.5">${(r.comment || "(sans commentaire)").slice(0, 250)}${(r.comment || "").length > 250 ? "…" : ""}</p>
          ${r.source_url ? `<a href="${r.source_url}" style="font-size:12px;color:#0DA0CF;text-decoration:none">→ Répondre sur Google</a>` : ""}
        </div>`;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html><body style="font-family:Inter,system-ui,sans-serif;background:#F7FBFD;padding:20px;margin:0">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.08)">
          <div style="background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:22px">⭐ ${pending.length} avis en attente de réponse</h1>
            <p style="margin:8px 0 0;opacity:.9;font-size:14px">Répondre rapidement = +12% de confiance utilisateur</p>
          </div>
          <div style="padding:20px">
            ${reviewsHtml}
            <div style="text-align:center;margin-top:20px">
              <a href="https://depan59-62.fr/admin-pro/reviews.html" style="display:inline-block;background:#0DA0CF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Ouvrir le back-office</a>
            </div>
          </div>
          <div style="background:#F7FBFD;padding:14px;text-align:center;color:#94a3b8;font-size:12px">
            HELP Confort Saint-Omer • Email automatique — ne pas répondre
          </div>
        </div>
      </body></html>`;

    // Envoi via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `⭐ ${pending.length} avis Google en attente de réponse — HC Saint-Omer`,
        html
      })
    });
    if (!resendRes.ok) {
      const txt = await resendRes.text();
      return json({ error: "Resend HTTP " + resendRes.status, detail: txt.slice(0, 300) }, 500);
    }
    const resendData = await resendRes.json();

    return json({ success: true, count: pending.length, email_id: resendData.id, sent_to: NOTIFY_EMAIL });
  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, "content-type": "application/json" } });
}
