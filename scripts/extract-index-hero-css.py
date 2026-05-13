#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract-index-hero-css.py — Externalise le bloc CSS Hero V12 d'index.html
vers assets/index-hero.css, et remplace par <link rel="stylesheet">.

Identifie le bloc à externaliser par son commentaire de tête
"HERO V12 — composition référence".
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
OUT_CSS = ROOT / "assets" / "index-hero.css"

# Le bloc Hero V12 contient les règles .hc-hero4 / .hero4-* — signature unique
# (et il commence par .hc-hero4{).
HERO_BLOCK_RX = re.compile(
    r"<style>(\.hc-hero4\{[^<]*?)</style>",
    re.DOTALL,
)


def main():
    text = HTML.read_text(encoding="utf-8")
    m = HERO_BLOCK_RX.search(text)
    if not m:
        print("Bloc Hero V12 introuvable (peut-être déjà extrait)", file=sys.stderr)
        sys.exit(1)

    css_body = m.group(1).strip()
    OUT_CSS.write_text(
        "/*! HELP! Confort — styles Hero V12 (externalisé pour alléger index.html) */\n"
        + css_body + "\n",
        encoding="utf-8",
    )

    # Remplacer dans HTML par un <link rel="stylesheet"> avec un cache-buster
    replacement = '<link rel="stylesheet" href="/assets/index-hero.css?v=20260513">'
    new = text[:m.start()] + replacement + text[m.end():]

    before = len(text)
    after = len(new)
    HTML.write_text(new, encoding="utf-8")
    print(f"index.html : {before} → {after} bytes  (-{before - after})")
    print(f"index-hero.css créé : {len(css_body)} bytes")


if __name__ == "__main__":
    main()
