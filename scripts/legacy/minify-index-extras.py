#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
minify-index-extras.py — Optimisations supplémentaires sur index.html :
1. Supprime les commentaires HTML <!-- ... --> sauf marqueurs HC-* (utiles
   pour debug et idempotence des scripts).
2. Compresse whitespace dans les <script> hors JSON-LD (espaces multiples,
   lignes vides, commentaires // et /* */).

Conservé intact :
- <script type="application/ld+json"> (structured data, sensible)
- <style id="hc-critical-header">
- <noscript>
- Commentaires <!-- HC-* --> (marqueurs de versioning)
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"


def minify_js(js: str) -> str:
    """Minification JS conservative."""
    # Supprime /* ... */ (non-bang)
    js = re.sub(r"/\*(?!!)[\s\S]*?\*/", "", js)
    # Supprime // ... fin de ligne (mais pas dans une string)
    # Heuristique simple : si la ligne ne contient pas de ' ou " avant le //, on coupe
    def strip_line_comment(line: str) -> str:
        # On ne coupe que si le // n'est pas dans une string
        # Simple : on scanne, on garde l'état
        i = 0
        in_str = None
        while i < len(line):
            ch = line[i]
            if in_str:
                if ch == "\\":
                    i += 2
                    continue
                if ch == in_str:
                    in_str = None
            else:
                if ch in "\"'`":
                    in_str = ch
                elif ch == "/" and i + 1 < len(line) and line[i+1] == "/":
                    return line[:i].rstrip()
            i += 1
        return line
    lines = [strip_line_comment(ln) for ln in js.split("\n")]
    js = "\n".join(lines)
    # Compresse whitespace : lignes vides → rien, indent → 1 espace
    js = re.sub(r"\n\s*\n", "\n", js)
    js = re.sub(r"^\s+", "", js, flags=re.MULTILINE)
    return js


def main():
    text = HTML.read_text(encoding="utf-8")
    before = len(text)

    # 1. Strip HTML comments sauf HC-*
    def keep_comment(m):
        body = m.group(0)
        if "HC-" in body or "End Google" in body:
            return body
        return ""
    text = re.sub(r"<!--[\s\S]*?-->", keep_comment, text)

    # 2. Minify inline JS hors JSON-LD
    def process_script(m):
        attrs = m.group(1)
        body = m.group(2)
        if "application/ld+json" in attrs:
            return m.group(0)
        if "src=" in attrs:
            return m.group(0)
        if not body.strip():
            return m.group(0)
        return f"<script{attrs}>{minify_js(body)}</script>"
    text = re.sub(r"<script([^>]*)>(.*?)</script>", process_script, text, flags=re.DOTALL)

    # 3. Lignes vides multiples → 1
    text = re.sub(r"\n{3,}", "\n\n", text)

    HTML.write_text(text, encoding="utf-8")
    after = len(text)
    print(f"index.html : {before} → {after} bytes  (Δ -{before - after})")


if __name__ == "__main__":
    main()
