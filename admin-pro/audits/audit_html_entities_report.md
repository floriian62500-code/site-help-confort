# Audit HTML double-encoding — Rapport

_Généré le 2026-05-27 07:07_

## Synthèse

- Pages scannées : **107**
- ✅ OK (aucune entité doublement encodée) : **107**
- ❌ Erreurs (entités doublement encodées) : **0**
- Total occurrences : **0**

## Règles

- Tout `&amp;nbsp;`, `&amp;eacute;`, `&amp;#233;`, etc. → ERREUR
- Blocs `<pre>`, `<code>`, `<style>`, `<script>`, commentaires : ignorés
- Visible utilisateur : l'entité littérale apparaît dans le rendu

## Findings

_Aucun finding — aucune page ne contient d'entité doublement encodée._
