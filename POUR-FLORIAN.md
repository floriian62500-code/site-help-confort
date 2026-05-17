# POUR FLORIAN — file d'attention humaine

> File des items détectés par les agents/conversations qui **requièrent l'arbitrage de Florian**.
> Les agents alimentent ce fichier mais ne le traitent **jamais**.
> Au début de chaque nouvelle conversation, l'instance Claude doit lire ce fichier et lister les items en attente à Florian.

---

## Format d'entrée

```markdown
## AAAA-MM-JJ HH:MM — <titre court>
**Source** : <conversation ou agent + contexte>
**Constat** : <description du problème>
**Pourquoi je ne traite pas** : <raison — OAuth, DROP, choix métier, comm à valider, dépense, etc.>
**Options** :
  1. <option 1>
  2. <option 2>
**Reco** : option <n>.
**Quand on se voit** : <temps estimé pour valider>.
```

Une fois traitée avec Florian, l'entrée est :
- soit déplacée vers `TODO.md` sous forme actionnable,
- soit archivée en bas de ce fichier dans une section `## Archivé`.

---

## Items en attente

*(aucun pour l'instant)*

---

## Archivé

*(rien encore)*
