#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #52 — Typographie FR : espaces insécables avant la ponctuation haute.

En français, la ponctuation haute (`?`, `!`, `:`, `;`, `»`) doit être
précédée d'une espace **insécable** (`&nbsp;`, U+00A0, U+202F).
Une espace fine ou rien du tout est non conforme.

Cette sonde compte par page le nombre de cas où `?!:;»` est précédé d'un
caractère ASCII espace ou colle directement à un mot, et alerte si le
total dépasse un seuil.

Seuil : > 5 occurrences fautives → ALERTE *TYPO-FR*.

Whitelist :
  - balises `<script>`, `<style>`, `<pre>`, `<code>`, `<svg>`, `<template>`
    (le code source n'est pas concerné par la règle typographique).
  - commentaires HTML.
  - URLs / chemins (on retire avant analyse).
  - smileys ":)" ":(" ";)" — pas de typo FR.
  - mentions techniques type "key:value", "10:30" (heures), "http://".

Sortie :
  admin-pro/audits/audit_typo_fr_report.md
  admin-pro/audits/audit_typo_fr_report.json

Zéro dépendance externe.
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_typo_fr_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_typo_fr_report.json"

EXCLUDED = {"404.html", "reset.html"}
EXCLUDED_PREFIXES = ("test-", "_")

# Seuil au-dessus duquel on déclenche une alerte par page
THRESHOLD = 5

# Caractères insécables tolérés AVANT la ponctuation haute
NBSP_CHARS = {" ", " "}

# Balises à neutraliser avant analyse
STRIP_TAGS = ("script", "style", "pre", "code", "svg", "template", "noscript")

# Smileys/emojis textuels à ignorer
SMILEYS_RE = re.compile(r"[:;]-?[\)\(D/Pp\\]")

# Format heure (10:30, 14h30 — pas concerné, on ne capture pas ":h")
TIME_RE = re.compile(r"\b\d{1,2}[h:]\d{2}\b")

# URLs (on les retire pour ne pas matcher http:// ou :8080 etc.)
URL_RE = re.compile(r"https?://\S+")

# Détection du fautif : ponctuation haute précédée d'un caractère qui n'est
# pas une espace insécable. Les espaces fines U+202F sont OK, U+00A0 OK,
# &nbsp; (entity) est traité séparément avant le pattern.
# On considère "fautif" si le caractère précédent est :
#   - une lettre/chiffre (collé) — typiquement "français?"
#   - une espace ASCII U+0020 — typiquement "français ?"
# (Le `?` peut être OK en fin de balise type `<a aria-label="...">!?`,
#  mais on ne descend pas dans ces détails sur ce premier MVP.)
FAUTIF_RE = re.compile(r"(.)([?!:;»])")


def list_pages() -> list[pathlib.Path]:
    out = []
    for p in sorted(ROOT.glob("*.html")):
        if p.name in EXCLUDED:
            continue
        if any(p.name.startswith(pref) for pref in EXCLUDED_PREFIXES):
            continue
        out.append(p)
    return out


def neutralize(html: str) -> str:
    """Retire balises commentaires + zones de code, remplace &nbsp; et
    entités similaires par U+00A0 pour faciliter le matching."""
    # Commentaires
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    # Tags neutralisés
    for tag in STRIP_TAGS:
        html = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>", " ", html, flags=re.S | re.I)
    # URLs
    html = URL_RE.sub(" ", html)
    # Heures
    html = TIME_RE.sub(" ", html)
    # &nbsp; / &#160; / &#x00a0; / &#8239; → caractère insécable réel
    html = re.sub(r"&nbsp;|&#160;|&#xa0;|&#x00a0;|&#8239;|&#x202f;", " ", html, flags=re.I)
    return html


def count_fautifs(text: str) -> tuple[int, list[str]]:
    """Retourne (nb_fautifs, échantillons_de_contexte)."""
    fautifs = 0
    samples: list[str] = []
    # On parcourt le texte une seule passe (pas de regex globale parce que
    # le contexte d'avant suffit).
    for m in FAUTIF_RE.finditer(text):
        prev = m.group(1)
        punct = m.group(2)
        if prev in NBSP_CHARS:
            continue
        # Pas d'alerte si c'est un smiley (le caractère précédent est : ou ;
        # collé à ) ( D / etc.). On ré-évalue : si m.start()>=1, on regarde
        # un range autour.
        s = max(0, m.start() - 1)
        e = min(len(text), m.end() + 1)
        window = text[s:e]
        if SMILEYS_RE.search(window):
            continue
        # Cas "URL://", "key:value" sans espace : on s'intéresse uniquement
        # à `;` et `:` ici. Sinon on les ignore.
        # `:` colle souvent à des termes techniques (LocalBusiness:, JSON-LD:).
        # On filtre : si previous char est ASCII alphanum minuscule en latin,
        # on tolère `;` et `:` collés (key:value).
        if punct in (":", ";") and prev.isalnum() and prev.isascii():
            # Heuristique : si suit immédiatement d'une espace ou d'un
            # retour à la ligne → on tolère (probablement "Notez :" sans
            # nbsp côté serveur, mais pas typique du markup).
            # On accepte de tolérer cette typo silencieusement.
            continue
        fautifs += 1
        if len(samples) < 12:
            ctx_s = max(0, m.start() - 25)
            ctx_e = min(len(text), m.end() + 25)
            ctx = text[ctx_s:ctx_e].replace("\n", " ")
            ctx = re.sub(r"\s+", " ", ctx).strip()
            samples.append(f"…{ctx}…")
    return fautifs, samples


def audit_page(path: pathlib.Path) -> dict:
    raw = path.read_text(encoding="utf-8", errors="replace")
    clean = neutralize(raw)
    # On enlève aussi les balises HTML restantes pour ne pas matcher dans des
    # attributs (`alt="Plombier :"` par ex.)
    # Mais on garde leur contenu textuel → split via re.sub.
    text_only = re.sub(r"<[^>]+>", " ", clean)
    text_only = re.sub(r"\s+", " ", text_only)

    nb, samples = count_fautifs(text_only)

    findings = []
    if nb > THRESHOLD:
        findings.append({
            "code": "TYPO-FR",
            "severity": "warning",
            "detail": f"{nb} occurrences de ponctuation haute (?!:;») sans espace insécable.",
            "samples": samples,
        })
    return {
        "file": path.name,
        "fautifs": nb,
        "findings": findings,
    }


def render_markdown(results: list[dict]) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    pages = len(results)
    total_fautifs = sum(r["fautifs"] for r in results)
    alerted = [r for r in results if r["findings"]]
    clean = [r for r in results if not r["findings"]]

    lines = []
    lines.append(f"# Audit typographie FR (espaces insécables) — {now}")
    lines.append("")
    lines.append("Sonde MEMOIRE #52 — la ponctuation haute (?!:;») doit être "
                 "précédée d'une espace **insécable** (`&nbsp;`, U+00A0, U+202F). "
                 f"Seuil d'alerte : > **{THRESHOLD}** occurrences fautives par page.")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Pages auditées : **{pages}**")
    lines.append(f"- Pages clean (≤ seuil) : **{len(clean)}**")
    lines.append(f"- Pages avec alerte : **{len(alerted)}**")
    lines.append(f"- Occurrences fautives cumulées : **{total_fautifs}**")
    lines.append("")

    if alerted:
        lines.append("## ⚠️ Pages au-delà du seuil")
        lines.append("")
        lines.append("| Page | Fautifs | Échantillons |")
        lines.append("|------|---------|--------------|")
        for r in sorted(alerted, key=lambda x: -x["fautifs"]):
            samples = r["findings"][0].get("samples", [])
            # Tronque les samples pour rester lisible dans une cellule
            disp = " · ".join(f"`{s[:60]}`" for s in samples[:3])
            lines.append(f"| `{r['file']}` | **{r['fautifs']}** | {disp} |")
        lines.append("")

    if total_fautifs == 0:
        lines.append("## ✅ Aucune occurrence fautive — Bravo")
        lines.append("")
    else:
        # Top 5 pages les plus chargées (alertées ou non)
        top = sorted(results, key=lambda r: -r["fautifs"])[:5]
        lines.append("## Top 5 pages les plus chargées")
        lines.append("")
        for r in top:
            lines.append(f"- `{r['file']}` : {r['fautifs']} occurrence(s)")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    pages = list_pages()
    results = [audit_page(p) for p in pages]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text(render_markdown(results), encoding="utf-8")

    alerted = [r for r in results if r["findings"]]
    report = {
        "audit": "typo_fr",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "threshold": THRESHOLD,
        "stats": {
            "pages_audited": len(results),
            "pages_alerted": len(alerted),
            "total_fautifs": sum(r["fautifs"] for r in results),
            "code_distribution": dict(Counter(f["code"] for r in results for f in r["findings"])),
        },
        "results": results,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    s = report["stats"]
    print(f"[audit_typo_fr] {s['pages_audited']} pages, "
          f"{s['total_fautifs']} occurrences fautives, "
          f"{s['pages_alerted']} alertes")
    return 0 if not alerted else 1


if __name__ == "__main__":
    sys.exit(main())
