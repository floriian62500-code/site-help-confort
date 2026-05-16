#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit HTML double-encoding — sonde P16.

Détecte les entités HTML doublement encodées qui apparaissent quand un
texte déjà encodé (`&nbsp;`) est ré-injecté dans un template qui le
ré-encode (`&amp;nbsp;`). Visible à l'écran sous la forme `&nbsp;`
littéral au lieu d'un espace insécable.

Patterns détectés :
  - `&amp;nbsp;`     → devrait être `&nbsp;` ou `\xa0`
  - `&amp;eacute;`   → devrait être `&eacute;` ou `é`
  - `&amp;<lettre>;` → générique : tout `&amp;[a-zA-Z]+;` ≡ double-encoding
  - `&amp;#\d+;`     → numérique : `&amp;#233;` ≡ double-encoding
  - `&amp;amp;`      → triple-encoding extrême

Whitelist : on ignore les blocs `<pre>`, `<code>`, `<style>`, `<script>`
(documentation / exemples de code peuvent contenir ces motifs légitimement).

Sortie :
  - admin-pro/audits/audit_html_entities_report.md
  - admin-pro/audits/audit_html_entities_report.json

Sans dépendance externe — stdlib uniquement.
Pourquoi : double-encoding = bug visible UX (utilisateur lit « Plus
d&amp;rsquo;infos » au lieu de « Plus d'infos »). Souvent introduit par
copier-coller depuis le navigateur ou par un CMS qui ré-applique
l'encodage HTML sur du contenu déjà encodé.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_html_entities_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_html_entities_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Pattern de double-encoding : `&amp;` suivi d'une entité valide
DOUBLE_ENCODE_RE = re.compile(
    r"&amp;(?:[a-zA-Z]{2,12}|#\d{1,5}|#x[0-9a-fA-F]{1,5});",
)

# Patterns à ignorer (contenu où ces motifs peuvent être légitimes)
SKIP_BLOCK_RE = re.compile(
    r"<(pre|code|style|script)\b[^>]*>.*?</\1>",
    re.IGNORECASE | re.DOTALL,
)
# Ignore aussi les commentaires HTML
SKIP_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def find_html_pages() -> list[pathlib.Path]:
    pages: list[pathlib.Path] = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    actu = ROOT / "actualites"
    if actu.exists():
        for p in actu.glob("*.html"):
            pages.append(p)
    return sorted(pages)


def strip_skip_blocks(raw: str) -> str:
    """Remplace les blocs à ignorer par des blancs de même longueur
    pour préserver les numéros de ligne."""
    def blank(m: re.Match) -> str:
        s = m.group(0)
        # Garde les \n pour conserver la numérotation
        return "".join(c if c == "\n" else " " for c in s)

    cleaned = SKIP_COMMENT_RE.sub(blank, raw)
    cleaned = SKIP_BLOCK_RE.sub(blank, cleaned)
    return cleaned


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "n_matches": 0,
        "matches": [],   # list of {line, snippet, entity}
        "errors": [],
    }
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        res["status"] = "error"
        res["errors"].append(f"READ-ERROR : {type(e).__name__}")
        return res

    cleaned = strip_skip_blocks(raw)

    # Indexe les positions de début de ligne pour calculer le n° de ligne
    line_starts = [0]
    for i, c in enumerate(cleaned):
        if c == "\n":
            line_starts.append(i + 1)

    def line_of(pos: int) -> int:
        # Recherche dichotomique
        lo, hi = 0, len(line_starts) - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if line_starts[mid] <= pos:
                lo = mid
            else:
                hi = mid - 1
        return lo + 1

    matches = []
    for m in DOUBLE_ENCODE_RE.finditer(cleaned):
        pos = m.start()
        ln = line_of(pos)
        # Snippet ±40 chars autour
        start = max(0, pos - 40)
        end = min(len(cleaned), pos + len(m.group(0)) + 40)
        snippet = cleaned[start:end].replace("\n", " ").strip()
        matches.append({
            "line": ln,
            "entity": m.group(0),
            "snippet": snippet,
        })

    res["n_matches"] = len(matches)
    res["matches"] = matches[:20]  # cap à 20 par fichier dans le rapport
    if matches:
        res["status"] = "error"
        res["errors"].append(
            f"HTML-DOUBLE-ENCODE : {len(matches)} entité(s) doublement encodée(s)"
        )
    return res


def main() -> None:
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_err   = sum(1 for r in results if r["status"] == "error")
    total_matches = sum(r["n_matches"] for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit HTML double-encoding — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK (aucune entité doublement encodée) : **{n_ok}**",
        f"- ❌ Erreurs (entités doublement encodées) : **{n_err}**",
        f"- Total occurrences : **{total_matches}**",
        "",
        "## Règles",
        "",
        "- Tout `&amp;nbsp;`, `&amp;eacute;`, `&amp;#233;`, etc. → ERREUR",
        "- Blocs `<pre>`, `<code>`, `<style>`, `<script>`, commentaires : ignorés",
        "- Visible utilisateur : l'entité littérale apparaît dans le rendu",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    for r in sorted(results, key=lambda x: (-x["n_matches"], x["file"])):
        if r["n_matches"] == 0 and not r["errors"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`  ({r['n_matches']} occurrence(s))")
        for e in r["errors"]:
            if not e.startswith("HTML-DOUBLE-ENCODE"):
                md.append(f"- ❌ {e}")
        for hit in r["matches"]:
            md.append(
                f"- ligne {hit['line']} — `{hit['entity']}` — "
                f"contexte : `{hit['snippet']}`"
            )
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — aucune page ne contient d'entité doublement encodée._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total":   n_total,
                "n_ok":      n_ok,
                "n_errors":  n_err,
                "total_matches": total_matches,
                "results":   results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_html_entities] {n_ok}/{n_total} OK, "
        f"{n_err} err — total matches={total_matches}"
    )
    print(f"Report: {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
