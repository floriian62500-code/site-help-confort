-- PROPOSED (NON APPLIQUÉE) — durcissement Storage bucket `site-photos`
-- Finding sécurité (audit 2026-08-22, docs/audits/SECURITY-AUDIT-2026-08.md §Storage) :
--   Le bucket public `site-photos` (25 Mo, images+PDF) porte 3 policies rôle {public}
--   = accessibles à un utilisateur ANONYME non authentifié :
--     - site_photos_public_insert  (INSERT)  → un anonyme peut uploader (DoS/coût storage)
--     - site_photos_public_update  (UPDATE)  → un anonyme peut ÉCRASER n'importe quelle
--                                              photo servie sur le site live (DÉFACEMENT)
--     - site_photos_public_delete  (DELETE)  → un anonyme peut SUPPRIMER les photos du site
--   Preuve d'inutilité : le front n'écrit JAMAIS dans site-photos ; il ne fait que LIRE
--   (`<img src=".../object/public/site-photos/...">` sur ~20 pages). L'upload légitime est
--   admin/authentifié. Ces 3 policies public sont donc supprimables sans casser le site.
--
-- APPLICATION = GATE (GO humain requis, cf. règle « actions production »).
-- Après apply : re-tester qu'une page métier affiche toujours ses photos (lecture publique
-- conservée par la policy site_photos_public_read + le flag bucket public=true).

begin;

-- Retire l'écriture publique (anon) : garde lecture publique + écriture authentifiée.
drop policy if exists "site_photos_public_insert" on storage.objects;
drop policy if exists "site_photos_public_update" on storage.objects;
drop policy if exists "site_photos_public_delete" on storage.objects;

-- Écriture réservée aux comptes authentifiés (admin). Idempotent.
drop policy if exists "site_photos_auth_write" on storage.objects;
create policy "site_photos_auth_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-photos')
  with check (bucket_id = 'site-photos');

-- La lecture publique reste assurée par "site_photos_public_read" (inchangée) + bucket public.

commit;

-- Vérification post-apply attendue :
--   select policyname, cmd, roles::text from pg_policies
--   where schemaname='storage' and tablename='objects' and policyname like 'site_photos%';
--   → plus aucune ligne rôle {public} en INSERT/UPDATE/DELETE ; seul SELECT public subsiste.
