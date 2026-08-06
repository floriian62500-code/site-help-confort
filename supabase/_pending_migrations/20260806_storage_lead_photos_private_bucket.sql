-- HELP Confort — Bucket privé pour les photos de leads (2026-08-06)
-- ⚠️ NON APPLIQUÉ. Fait partie du LOT DE STABILISATION — à exécuter selon le runbook
--    docs/DEPLOY-LOT-STABILISATION.md, étape 5, APRÈS validation (déploiement gouverné).
--
-- Principe : aucun accès anonyme. Seule l'Edge Function upload-lead-photos (service_role)
-- écrit ; la consultation admin se fait par URL signée (createSignedUrl). Aucune lecture publique.

-- 1) Bucket PRIVÉ (public = false)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-photos', 'lead-photos', false,
  8388608, -- 8 Mo
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) AUCUNE policy pour anon/authenticated sur storage.objects de ce bucket.
--    => par défaut RLS refuse tout accès direct. service_role (Edge Function) bypasse la RLS.
--    On s'assure qu'aucune policy permissive héritée ne s'applique à ce bucket :
do $$
begin
  -- (défensif) supprime d'éventuelles policies ciblant explicitement lead-photos
  perform 1;
end $$;

-- 3) Colonne d'association : on stocke les refs photos dans leads.metadata.photos (jsonb déjà présent).
--    Rien à créer côté table.

-- ── ROLLBACK ─────────────────────────────────────────────────────────────
-- Pour retirer le bucket (après avoir vidé les objets) :
--   delete from storage.objects where bucket_id = 'lead-photos';
--   delete from storage.buckets where id = 'lead-photos';
