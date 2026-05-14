-- ═════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET "realisations" : photos avant/après des chantiers
-- Le diagnostic setup.html cherche un bucket nommé "realisations".
-- Public en lecture (pour les URLs des photos sur le site), upload
-- réservé aux utilisateurs authentifiés.
-- ═════════════════════════════════════════════════════════════════════

-- 1. Créer le bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'realisations',
  'realisations',
  true,                    -- lecture publique (les URLs photos doivent être accessibles)
  52428800,                -- 50 MB par fichier
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies : lecture publique
DROP POLICY IF EXISTS "realisations_public_read" ON storage.objects;
CREATE POLICY "realisations_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'realisations');

-- 3. RLS policies : upload authentifié
DROP POLICY IF EXISTS "realisations_auth_insert" ON storage.objects;
CREATE POLICY "realisations_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'realisations');

-- 4. RLS policies : update / delete authentifié (pour remplacer/supprimer ses propres photos)
DROP POLICY IF EXISTS "realisations_auth_update" ON storage.objects;
CREATE POLICY "realisations_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'realisations');

DROP POLICY IF EXISTS "realisations_auth_delete" ON storage.objects;
CREATE POLICY "realisations_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'realisations');

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : "Success. No rows returned"
-- Vérification : aller dans https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/storage/buckets
-- Le bucket "realisations" doit apparaître avec un cadenas vert
-- ═══════════════════════════════════════════════════════════════
