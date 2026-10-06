#!/usr/bin/env python3
"""
Remove fake testimonials (Marie D. + Pierre L.) from all prestation pages.
Replace with honest aggregate rating block linking to Google reviews.
Idempotent: skips files already containing "343 avis Google certifies".
"""
import os
import re
import sys

PRESTATIONS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "prestations",
)

NEW_SECTION = (
    '<section class="seo-section"><h2>Avis clients verifies</h2>'
    '<p class="seo-section-lead">HELP Confort Saint-Omer & Dunkerque est note '
    '<strong>4,7/5 sur 343 avis Google</strong> par ses clients de '
    "l'audomarois et du littoral nord. Une reputation construite intervention "
    "apres intervention, sans sous-traitance.</p>"
    '<div style="display:flex;align-items:center;gap:18px;padding:18px 22px;'
    'background:#F8FCFE;border-left:3px solid var(--c);border-radius:10px;'
    'flex-wrap:wrap"><div style="font-size:2.4rem;font-weight:900;'
    'color:#FFB400;line-height:1">4,7<span style="font-size:1.2rem;'
    'color:#94a3b8">/5</span></div><div style="flex:1;min-width:200px">'
    '<div style="color:#FFB400;font-size:1.1rem;margin-bottom:4px">'
    '★★★★★</div><div style="font-size:.92rem;'
    'color:#0A1428;font-weight:600">343 avis Google certifies</div>'
    '<div style="font-size:.84rem;color:#6b7384">Saint-Omer · Dunkerque '
    "· Côte d'Opale</div></div>"
    '<a href="https://maps.app.goo.gl/B4BPVTiRp5rDp26fA" target="_blank" '
    'rel="noopener noreferrer" style="padding:10px 18px;background:#0A1428;'
    'color:#fff;text-decoration:none;border-radius:10px;font-weight:700;'
    'font-size:.86rem">Voir les avis →</a></div></section>'
)

# Use the exact French original strings for matching
NEW_SECTION_FR = (
    '<section class="seo-section"><h2>Avis clients vérifiés</h2>'
    '<p class="seo-section-lead">HELP Confort Saint-Omer &amp; Dunkerque est noté '
    '<strong>4,7/5 sur 343 avis Google</strong> par ses clients de '
    "l'audomarois et du littoral nord. Une réputation construite intervention "
    "après intervention, sans sous-traitance.</p>"
    '<div style="display:flex;align-items:center;gap:18px;padding:18px 22px;'
    'background:#F8FCFE;border-left:3px solid var(--c);border-radius:10px;'
    'flex-wrap:wrap"><div style="font-size:2.4rem;font-weight:900;'
    'color:#FFB400;line-height:1">4,7<span style="font-size:1.2rem;'
    'color:#94a3b8">/5</span></div><div style="flex:1;min-width:200px">'
    '<div style="color:#FFB400;font-size:1.1rem;margin-bottom:4px">'
    '★★★★★</div><div style="font-size:.92rem;'
    'color:#0A1428;font-weight:600">343 avis Google certifiés</div>'
    '<div style="font-size:.84rem;color:#6b7384">Saint-Omer · Dunkerque '
    "· Côte d'Opale</div></div>"
    '<a href="https://maps.app.goo.gl/B4BPVTiRp5rDp26fA" target="_blank" '
    'rel="noopener noreferrer" style="padding:10px 18px;background:#0A1428;'
    'color:#fff;text-decoration:none;border-radius:10px;font-weight:700;'
    'font-size:.86rem">Voir les avis →</a></div></section>'
)

# Pattern: <section class="seo-section"> ... "Avis clients verifies" with
# Marie D. and Pierre L. fake quotes, all the way to closing </section>
PATTERN = re.compile(
    r'<section class="seo-section">\s*<h2>Avis clients v[ée]rifi[ée]s</h2>.*?'
    r'Marie D\..*?Pierre L\..*?</section>',
    re.DOTALL,
)


def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if "343 avis Google certifi" in content:
        return "skipped"

    new_content, n = PATTERN.subn(NEW_SECTION_FR, content)
    if n == 0:
        return "no-match"

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return f"modified ({n} replacement)"


def main():
    if not os.path.isdir(PRESTATIONS_DIR):
        print(f"ERROR: {PRESTATIONS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    files = sorted(
        f for f in os.listdir(PRESTATIONS_DIR) if f.endswith(".html")
    )
    print(f"Found {len(files)} HTML files in prestations/")
    counts = {"modified": 0, "skipped": 0, "no-match": 0}
    for fname in files:
        path = os.path.join(PRESTATIONS_DIR, fname)
        result = process_file(path)
        key = (
            "modified" if result.startswith("modified")
            else result
        )
        counts[key] = counts.get(key, 0) + 1
        print(f"  {fname}: {result}")
    print()
    print(f"Summary: modified={counts['modified']} "
          f"skipped={counts['skipped']} no-match={counts['no-match']}")


if __name__ == "__main__":
    main()
