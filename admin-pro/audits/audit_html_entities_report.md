# Audit HTML double-encoding — Rapport

_Généré le 2026-06-04 07:27_

## Synthèse

- Pages scannées : **136**
- ✅ OK (aucune entité doublement encodée) : **136**
- ❌ Erreurs (entités doublement encodées) : **0**
- Total occurrences : **0**

## Règles

- Tout `&amp;nbsp;`, `&amp;eacute;`, `&amp;#233;`, etc. → ERREUR
- Blocs `<pre>`, `<code>`, `<style>`, `<script>`, commentaires : ignorés
- Visible utilisateur : l'entité littérale apparaît dans le rendu

## Findings

_Aucun finding — aucune page ne contient d'entité doublement encodée._
