#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
minify-inline-styles.py — Minifie le CSS inline dans une page HTML
sans altérer la sémantique des règles. Cible : index.html (HEAVY_HTML).

Préserve :
- Le bloc <style id="hc-critical-header"> tel quel (critical CSS)
- Les commentaires de licence /*! ... */ (s'il y en a)

Minification appliquée aux autres <style> :
- Supprime commentaires CSS /* ... */
- Compresse whitespace (1 espace max entre tokens)
- Supprime espaces autour de : ; { } ,
- Supprime ; juste avant }
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def minify_css(css: str) -> str:
    """Minifie une chaîne CSS de façon conservative."""
    # Garder les commentaires de licence /*! */
    # Supprimer les autres
    css = re.sub(r"/\*(?!!)[\s\S]*?\*/", "", css)
    # Whitespace → 1 espace
    css = re.sub(r"\s+", " ", css)
    # Espaces autour de : ; { } ,
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)
    # ; final avant } inutile
    css = re.sub(r";}", "}", css)
    # Trim
    return css.strip()


def process_html(text: str) -> tuple[str, int]:
    """Retourne (nouveau_html, bytes_gagnés)."""
    saved = 0
    out_chunks = []
    pos = 0
    for m in re.finditer(r"<style([^>]*)>(.*?)</style>", text, re.DOTALL):
        attrs = m.group(1)
        body = m.group(2)
        out_chunks.append(text[pos:m.start()])
        # Conserver intact le critical CSS du header
        if 'id="hc-critical-header"' in attrs:
            out_chunks.append(m.group(0))
        else:
            mini = minify_css(body)
            saved += len(body) - len(mini)
            out_chunks.append(f"<style{attrs}>{mini}</style>")
        pos = m.end()
    out_chunks.append(text[pos:])
    return "".join(out_chunks), saved


def main():
    target = ROOT / "index.html"
    if not target.exists():
        print(f"introuvable : {target}", file=sys.stderr)
        sys.exit(1)
    before = target.stat().st_size
    text = target.read_text(encoding="utf-8")
    new, saved = process_html(text)
    target.write_text(new, encoding="utf-8")
    after = target.stat().st_size
    print(f"index.html : {before} → {after} bytes  (Δ -{before - after}, "
          f"compression CSS: -{saved} bytes)")


if __name__ == "__main__":
    main()
