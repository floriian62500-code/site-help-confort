#!/bin/sh
set -eu

echo "HELP CONFORT - preparation Claude Code MCP"

if ! command -v claude >/dev/null 2>&1; then
  echo "Claude Code n'est pas installe ou n'est pas dans le PATH."
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js est requis pour Playwright MCP."
  exit 2
fi

echo "Ajout Playwright MCP..."
claude mcp add playwright npx @playwright/mcp@latest || true

echo "Installation du plugin Figma officiel..."
claude plugin install figma@claude-plugins-official || true

echo "Termine. Dans Claude Code, lancer /mcp puis authentifier Figma."
echo "Ne jamais lancer de test qui envoie un vrai lead ou un paiement LIVE."
