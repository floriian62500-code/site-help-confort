// ═══════════════════════════════════════════════════════════════
// HELP Confort — Cron : Exécute les publications planifiées dues
// ═══════════════════════════════════════════════════════════════
// Appelée par pg_cron toutes les 5 min avec la SERVICE_ROLE_KEY.
// Récupère tous les scheduled_publications pending dont scheduled_at <= now,
// les marque running, puis appelle publish-meta / publish-linkedin / publish-gbp.
// Met à jour le statut final et stocke le résultat dans result_log.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...cors } });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function callPublishFn(fn: string, realisationId: string, authToken: string) {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ realisationId })
    });
    const data = await r.json().catch(() => ({}));
    return { success: r.ok, status: r.status, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: "Missing SUPABASE env vars" }, 500);
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // 1. Récupère les publications dues
  const now = new Date().toISOString();
  const { data: dues, error } = await sb
    .from("scheduled_publications")
    .select("id, realisation_id, channels, scheduled_at")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(20);

  if (error) return json({ error: error.message }, 500);
  if (!dues || dues.length === 0) return json({ processed: 0, message: "No due publications" });

  const results: any[] = [];

  for (const due of dues) {
    // Marque running
    await sb.from("scheduled_publications").update({ status: "running" }).eq("id", due.id);

    const channels = due.channels || {};
    const log: any = {};
    let anySuccess = false;
    let anyFail = false;

    if (channels.meta) {
      log.meta = await callPublishFn("publish-meta", due.realisation_id, SERVICE_ROLE_KEY);
      if (log.meta.success) anySuccess = true; else anyFail = true;
    }
    if (channels.linkedin) {
      log.linkedin = await callPublishFn("publish-linkedin", due.realisation_id, SERVICE_ROLE_KEY);
      if (log.linkedin.success) anySuccess = true; else anyFail = true;
    }
    if (channels.gbp) {
      log.gbp = await callPublishFn("publish-gbp", due.realisation_id, SERVICE_ROLE_KEY);
      if (log.gbp.success) anySuccess = true; else anyFail = true;
    }
    // HC-V2 : channel "site" → publication sur le site web (status realisations = publie)
    // C'est le channel par défaut si aucun autre n'est sélectionné
    if (channels.site || (!channels.meta && !channels.linkedin && !channels.gbp)) {
      try {
        const { error: errSite } = await sb.from("realisations").update({
          status: "publie",
          published_at: new Date().toISOString()
        }).eq("id", due.realisation_id);
        if (errSite) { log.site = { success: false, error: errSite.message }; anyFail = true; }
        else { log.site = { success: true, channel: "site_web" }; anySuccess = true; }
      } catch (e) {
        log.site = { success: false, error: (e as Error).message };
        anyFail = true;
      }
    }

    // Marque le chantier publié si succès au moins partiel
    if (anySuccess) {
      await sb.from("realisations").update({
        status: "publie",
        published_at: new Date().toISOString()
      }).eq("id", due.realisation_id);

      // Aussi mettre à jour ai_generated.publish_log sur la réalisation
      const { data: rNow } = await sb.from("realisations").select("ai_generated").eq("id", due.realisation_id).single();
      const newAi = { ...(rNow?.ai_generated || {}), publish_log: log, scheduled_from: due.id };
      await sb.from("realisations").update({ ai_generated: newAi }).eq("id", due.realisation_id);
    }

    const finalStatus = anyFail && !anySuccess ? "failed" : "done";
    const lastError = anyFail
      ? Object.entries(log).filter(([_, v]: any) => !v.success).map(([k, v]: any) => `${k}: ${v.data?.error || v.error || 'unknown'}`).join("; ")
      : null;

    await sb.from("scheduled_publications").update({
      status: finalStatus,
      executed_at: new Date().toISOString(),
      result_log: log,
      last_error: lastError
    }).eq("id", due.id);

    results.push({ id: due.id, status: finalStatus, log });
  }

  return json({ processed: results.length, results });
});
