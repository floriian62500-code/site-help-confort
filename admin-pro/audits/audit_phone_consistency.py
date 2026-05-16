#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit phone consistency — sonde P15.

Extrait tous les numéros de téléphone (lien `tel:` ou affichage humain
"03 66 10 01 34", "+33 3 66 10 01 34", etc.) des pages publiques et
vérifie qu'ils correspondent tous au numéro canonique HELP! Confort
(défini dans `mentions-legales.html` / `TARIFS_REFERENCE.md`).

Numéro canonique attendu :
  - `+33366100134`        (forme tel: international)
  - `03 66 10 01 34`      (forme affichée FR)
  - `+33 3 66 10 01 34`   (forme affichée internationale)

Sont tolérés (whitelist) :
  - les `placeholder="..."` des `<input type="tel">` (exemples UX)
  - les numéros dans des `<script type="application/ld+json">` matchant
    les variations canoniques

Sortie :
  - admin-pro/audits/audit_phone_consistency_report.md
  - admin-pro/audits/audit_phone_consistency_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_phone_consistency_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_phone_consistency_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Numéro canonique HELP! Confort (source : mentions-legales.html + TARIFS_REFERENCE.md)
CANONICAL_DIGITS = "33366100134"            # forme E.164 sans "+"
CANONICAL_LOCAL_DIGITS = "0366100134"       # forme FR 10 chiffres

# Patterns
# 1) liens tel:
RE_TEL_HREF = re.compile(r'(?i)href\s*=\s*["\']tel:([^"\']*?)["\']')
# 2) numéros FR au format 10 chiffres séparés (`03 66 10 01 34` / `03.66.10.01.34`)
RE_FR_10 = re.compile(
    r'(?<![\d])(0[1-9])([\s\.\-]?\d{2}){4}(?!\d)'
)
# 3) numéros internationaux `+33 X XX XX XX XX` / `+33XXXXXXXXX`
RE_INTL = re.compile(
    r'\+33[\s\.\-]?[1-9](?:[\s\.\-]?\d{2}){4}'
)

# Whitelist : zones où un numéro est *attendu* d'être différent
WHITELIST_CONTEXT_RE = re.compile(
    r'(?is)<input\b[^>]*placeholder\s*=\s*["\'][^"\']*?</input>'
    r'|<input\b[^>]*placeholder\s*=\s*["\'][^"\']*?["\'][^>]*>'
)


def find_public_pages():
    pages = []
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


def normalize(num: str) -> str:
    """Retire tous les non-digits, conserve un éventuel + comme préfixe '00'."""
    plus = num.strip().startswith("+")
    digits = re.sub(r"\D", "", num)
    if plus:
        return digits  # déjà E.164 sans +
    return digits


def is_canonical(digits: str) -> bool:
    """Compare une suite de digits aux formes canoniques."""
    return digits in {CANONICAL_DIGITS, CANONICAL_LOCAL_DIGITS}


_INPUT_ATTR_NAMES = ("placeholder", "aria-label", "value", "title", "alt")


def is_in_input_attribute(raw: str, pos: int) -> bool:
    """True si la position est dans un attribut d'input UX (placeholder/aria-label/value/title)."""
    snippet_start = max(0, pos - 250)
    snippet = raw[snippet_start:pos + 60]
    rel_pos = pos - snippet_start
    # Cherche toute occurrence d'attribut UX (qu'il soit ou non dans un <input>) :
    # un placeholder/aria-label sur un <input ...> est attendu, on en accepte la valeur.
    for attr in _INPUT_ATTR_NAMES:
        for m in re.finditer(rf'{attr}\s*=\s*(["\'])(.*?)\1', snippet):
            val_start = m.start(2)
            val_end = m.end(2)
            if val_start <= rel_pos < val_end:
                return True
    return False


# Keywords externes (organismes / médiateurs) — numéros tolérés
EXTERNAL_KEYWORDS = (
    "médiateur", "mediateur", "mfc", "franchise-fff", "info@franchise-fff",
    "police", "gendarmerie", "samu", "urgences européennes",
    "centre antipoison", "urssaf", "dgccrf", "fnaim",
)


def is_external_org_context(raw: str, pos: int) -> bool:
    """True si le numéro est précédé d'un mot-clé d'organisme externe."""
    snippet_start = max(0, pos - 300)
    snippet = raw[snippet_start:pos].lower()
    return any(kw in snippet for kw in EXTERNAL_KEYWORDS)


def scan_page(path: pathlib.Path) -> list[dict]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    findings = []
    seen = set()

    # 1) liens tel:
    for m in RE_TEL_HREF.finditer(raw):
        val = m.group(1).strip()
        norm = normalize(val)
        if not norm:
            continue  # tel: vide → ignoré
        ok = is_canonical(norm)
        key = ("tel", m.start(), norm)
        if key in seen:
            continue
        seen.add(key)
        if not ok:
            line_no = raw.count("\n", 0, m.start()) + 1
            findings.append({
                "type": "tel-href",
                "line": line_no,
                "raw": val,
                "normalized": norm,
                "expected": CANONICAL_DIGITS,
            })

    # 2 + 3) numéros affichés
    for pattern, label in [(RE_INTL, "intl-display"), (RE_FR_10, "fr-display")]:
        for m in pattern.finditer(raw):
            val = m.group(0)
            norm = normalize(val)
            if is_canonical(norm):
                continue
            # filtre placeholders/aria-label/value des inputs UX
            if is_in_input_attribute(raw, m.start()):
                continue
            # filtre numéros d'organismes externes (médiateur, etc.)
            if is_external_org_context(raw, m.start()):
                continue
            line_no = raw.count("\n", 0, m.start()) + 1
            key = (label, line_no, norm)
            if key in seen:
                continue
            seen.add(key)
            # contexte court
            snippet_start = max(0, m.start() - 40)
            snippet_end = min(len(raw), m.end() + 40)
            snippet = raw[snippet_start:snippet_end].replace("\n", " ").strip()
            findings.append({
                "type": label,
                "line": line_no,
                "raw": val,
                "normalized": norm,
                "expected": CANONICAL_LOCAL_DIGITS,
                "snippet": snippet,
            })
    return findings


def main():
    pages = find_public_pages()
    results = []
    n_findings = 0
    for p in pages:
        finds = scan_page(p)
        results.append({
            "file": str(p.relative_to(ROOT)),
            "n_findings": len(finds),
            "findings": finds,
        })
        n_findings += len(finds)

    n_total = len(results)
    flagged = [r for r in results if r["n_findings"] > 0]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit phone consistency — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages publiques scannées : **{n_total}**",
        f"- Numéro canonique attendu : `+{CANONICAL_DIGITS}` "
        f"(`{CANONICAL_LOCAL_DIGITS[:2]} {CANONICAL_LOCAL_DIGITS[2:4]} "
        f"{CANONICAL_LOCAL_DIGITS[4:6]} {CANONICAL_LOCAL_DIGITS[6:8]} "
        f"{CANONICAL_LOCAL_DIGITS[8:10]}`)",
        f"- Pages avec numéro non canonique : **{len(flagged)}**",
        f"- Findings totaux : **{n_findings}**",
        "- Whitelist : attributs UX `<input placeholder|aria-label|value|title|alt=...>` "
        "+ contextes organismes externes (médiateur, MFC, FFF, police, SAMU…)",
        "",
    ]

    if flagged:
        md += [
            "## ❌ Numéros non canoniques détectés",
            "",
            "Liste des occurrences à vérifier (orphelin éditorial, ancien "
            "numéro, exemple non explicitement marqué comme placeholder).",
            "",
        ]
        for r in flagged:
            md.append(f"### `{r['file']}` — {r['n_findings']} occurrence(s)")
            md.append("")
            md.append("| Ligne | Type | Numéro brut | Normalisé |")
            md.append("|-------|------|-------------|-----------|")
            for f in r["findings"]:
                md.append(
                    f"| {f['line']} | `{f['type']}` | `{f['raw']}` | "
                    f"`{f['normalized']}` |"
                )
            md.append("")
    else:
        md.append("_✅ Tous les numéros affichés / `tel:` correspondent au canonique._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "canonical_e164": "+" + CANONICAL_DIGITS,
                "canonical_local": CANONICAL_LOCAL_DIGITS,
                "n_total": n_total,
                "n_flagged_pages": len(flagged),
                "n_findings": n_findings,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_phone_consistency] {n_total} pages, "
        f"{len(flagged)} avec écart, {n_findings} findings total "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if flagged else 0


if __name__ == "__main__":
    raise SystemExit(main())
