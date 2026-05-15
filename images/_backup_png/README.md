# `images/_backup_png/` — Backup compression PNG (15/05/2026)

Ce dossier contient les **originaux PNG avant compression** appliquée par
`admin-pro/audits/audit_images.py` le **15 mai 2026** (voir item P4 "Compression"
dans `admin-pro/AGENT_TODO.md`).

## Contenu

- 42 fichiers PNG (~ 4.7 MB total)
- Mascotte HD (`mascotte1.png`, `mascotte-with-bg.png`)
- Logos partenaires (`apporteurs/homeserve.png`, `labels/pro-gaz.png`, …)
- 37 images Open Graph (`og/*.png`) générées par `scripts/gen_og_images.py`

## Statut prod

✅ **Aucun fichier de ce dossier n'est référencé en prod** (audit Grep `_backup_png`
le 15/05/2026 : 0 match dans HTML/CSS/JS). Les versions servies par Netlify sont
les fichiers compressés à leur emplacement d'origine (`images/`, `og/`).

## Procédure de nettoyage (à faire par Florian)

Le dossier est désormais ignoré par Git (cf. `.gitignore` racine). Pour purger
l'historique tracké :

```bash
git rm -r --cached images/_backup_png/
git commit -m "Cleanup: untrack images/_backup_png (backup conservé en local)"
```

Le dossier restera sur le disque local mais ne sera plus versionné. Si Florian
veut récupérer de l'espace disque local, il peut le supprimer ensuite :

```bash
rm -rf images/_backup_png/
```

## Pourquoi on ne supprime pas tout de suite

- Décision destructive → règle "Pas de suppression de fichier sans extrême prudence".
- Permet à Florian de récupérer un original en cas de problème de compression.
- L'exclusion `.gitignore` empêche déjà tout nouveau backup d'être tracké.

— *Documenté par l'agent autonome, session 15/05/2026 PM (item P11 "Cleanup
`images/_backup_png/`").*
