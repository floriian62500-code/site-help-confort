#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Supprime les blocs Clarity résiduels (non capturés par la 1ère passe)."""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Bloc Clarity résiduel = commentaire + <script>...CLARITY_ID...</script>
CLARITY_BLOCK_RX = re.compile(
    r"<!--\s*Microsoft Clarity[^>]*-->\s*\n"
    r"<script>\s*\n?"
    r"\(function\(c,l,a,r,i,t,y\)\{if\(i==='CLARITY_ID'\)return;.*?"
    r"</script>\s*\n",
    re.DOTALL,
)

def main():
    fixed = 0
    for p in ROOT.rglob("*.html"):
        if "/.git/" in str(p) or "/node_modules/" in str(p):
            continue
        rel = str(p.relative_to(ROOT))
        if rel == "admin-pro/wizard-ga4.html":
            continue
        try:
            t = p.read_text(encoding="utf-8")
        except Exception:
            continue
        if "CLARITY_ID" not in t:
            continue
        new, n = CLARITY_BLOCK_RX.subn("", t)
        if n > 0:
            p.write_text(new, encoding="utf-8")
            fixed += 1
            print(f"  ✓ {rel}  (-{n} bloc(s) Clarity)")
    print(f"\n[cleanup] {fixed} pages nettoyées")

if __name__ == "__main__":
    main()
