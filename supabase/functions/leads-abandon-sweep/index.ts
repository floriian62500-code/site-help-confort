// ═══════════════════════════════════════════════════════════════════════════
// leads-abandon-sweep — relance interne des demandes NON finalisées
// ═══════════════════════════════════════════════════════════════════════════
// Le client a laissé ses coordonnées à l'étape « Afficher les tarifs » (intention
// enregistrée en silence par submit-lead-v6) puis n'a pas validé sa demande.
// Après N minutes d'inactivité (15 par défaut), l'agence reçoit UNE alerte interne.
//
// Garanties :
//   • une seule alerte par dossier (drapeau metadata.abandon_notified_at posé AVANT l'envoi) ;
//   • aucune alerte si le client a finalisé (metadata.finalized_at) ;
//   • aucun email au client ;
//   • aucun nouveau dossier créé.
//
// Appel : POST { minutes?: number, dry_run?: boolean, limit?: number }
// Prévu pour un cron (toutes les 5 min). Déploiement + cron = geste humain.
// ═══════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch (_) { body = {}; }
  const minutes = Math.min(Math.max(Number(body.minutes) || 15, 5), 24 * 60);
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 200);
  const dryRun = body.dry_run === true;

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const now = Date.now();
  const cutoff = new Date(now - minutes * 60_000).toISOString();
  const floor = new Date(now - 7 * 24 * 3600_000).toISOString(); // au-delà de 7 jours : trop tard, on n'alerte plus

  const { data: rows, error } = await sb
    .from('leads')
    .select('id, prenom, nom, telephone, email, ville, metier, status, metadata, created_at')
    .eq('status', 'intent')
    .gt('created_at', floor)
    .lt('metadata->>last_activity_at', cutoff)
    .filter('metadata->>finalized_at', 'is', null)
    .filter('metadata->>abandon_notified_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return json({ ok: false, error: error.message }, 500);
  const candidates = Array.isArray(rows) ? rows : [];
  if (dryRun) return json({ ok: true, dry_run: true, minutes, scanned: candidates.length, ids: candidates.map((r) => r.id) });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
  const notified: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  for (const row of candidates) {
    const meta = (row.metadata || {}) as Record<string, unknown>;
    const isTest = /TEST\s*RECETTE|NE\s*PAS\s*TRAITER/i.test(`${row.nom || ''} ${row.prenom || ''}`);
    if (isTest) { skipped.push({ id: row.id, reason: 'lead_de_test' }); continue; }

    // Drapeau posé AVANT l'envoi : au pire une alerte est perdue, jamais dupliquée.
    const claim = await sb
      .from('leads')
      .update({ status: 'needs_followup', metadata: { ...meta, abandon_notified_at: new Date().toISOString() } })
      .eq('id', row.id)
      .eq('status', 'intent')
      .select('id');
    if (claim.error || !claim.data || !claim.data.length) { skipped.push({ id: row.id, reason: 'deja_traite' }); continue; }

    try {
      await fetch(`${url}/functions/v1/notify-lead-v6`, {
        method: 'POST', headers, body: JSON.stringify({ lead_id: row.id, kind: 'abandon' }),
      });
      notified.push(row.id);
    } catch (e) {
      console.error('[abandon-sweep] notification échouée', row.id, e);
      skipped.push({ id: row.id, reason: 'notification_echouee' });
    }
  }

  return json({ ok: true, minutes, scanned: candidates.length, notified: notified.length, ids: notified, skipped });
});
