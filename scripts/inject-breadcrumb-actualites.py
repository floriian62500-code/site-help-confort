#!/usr/bin/env python3
"""
One-shot : injecte un BreadcrumbList JSON-LD dans toutes les pages
`actualites/*.html` qui n'en ont pas encore.

Chaîne : Accueil → Actualités (blog.html) → <Titre article>

Le bloc est inséré immédiatement après le `</script>` qui ferme
le JSON-LD `Article` existant. Si non trouvé, après `</title>`.

Idempotent : si un BreadcrumbList est déjà présent → skip.
"""

from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ACTU = ROOT / "actualites"
BASE_URL = "https://www.depan59-62.fr"

# Pour extraire le headline depuis le JSON-LD Article existant
RE_HEADLINE = re.compile(r'"headline"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"')
RE_ARTICLE_BLOCK = re.compile(
    r'(<script\s+type="application/ld\+json"\s*>\s*\{[^<]*?"@type"\s*:\s*"Article".*?</script>)',
    re.DOTALL | re.IGNORECASE,
)
RE_HAS_BREADCRUMB = re.compile(r'"@type"\s*:\s*"BreadcrumbList"', re.IGNORECASE)


def make_breadcrumb_jsonld(headline: str, filename: str) -> str:
    headline_safe = (
        headline.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", " ")
        .strip()
    )
    url = f"{BASE_URL}/actualites/{filename}"
    return (
        "\n<script type=\"application/ld+json\">\n"
        "{\n"
        ' "@context": "https://schema.org",\n'
        ' "@type": "BreadcrumbList",\n'
        ' "itemListElement": [\n'
        '  {"@type":"ListItem","position":1,"name":"Accueil","item":"' + BASE_URL + '/"},\n'
        '  {"@type":"ListItem","position":2,"name":"Actualités","item":"' + BASE_URL + '/blog.html"},\n'
        '  {"@type":"ListItem","position":3,"name":"' + headline_safe + '","item":"' + url + '"}\n'
        " ]\n"
        "}\n"
        "</script>"
    )


def process_file(path: Path) -> tuple[bool, str]:
    text = path.read_text(encoding="utf-8")

    if RE_HAS_BREADCRUMB.search(text):
        return False, "skip — déjà BreadcrumbList"

    m_head = RE_HEADLINE.search(text)
    if m_head:
        headline = m_head.group(1)
    else:
        # fallback : <title>
        m_title = re.search(r"<title>([^<]+)</title>", text, re.IGNORECASE)
        headline = (m_title.group(1) if m_title else path.stem).split(" — ")[0].strip()

    block = make_breadcrumb_jsonld(headline, path.name)

    m_art = RE_ARTICLE_BLOCK.search(text)
    if m_art:
        end = m_art.end()
        new_text = text[:end] + block + text[end:]
    else:
        # fallback : injecter après </title>
        m_title = re.search(r"</title>", text, re.IGNORECASE)
        if not m_title:
            return False, "skip — pas de </title>"
        end = m_title.end()
        new_text = text[:end] + block + text[end:]

    path.write_text(new_text, encoding="utf-8")
    return True, f"injecté → {headline[:60]}…"


def main():
    files = sorted(ACTU.glob("*.html"))
    print(f"Scan {ACTU} : {len(files)} fichier(s).\n")
    n_injected = 0
    n_skip = 0
    for p in files:
        ok, msg = process_file(p)
        flag = "✓" if ok else "·"
        print(f"  {flag} {p.name}  — {msg}")
        if ok:
            n_injected += 1
        else:
            n_skip += 1
    print(f"\nRésumé : {n_injected} injection(s), {n_skip} skip.")


if __name__ == "__main__":
    main()
