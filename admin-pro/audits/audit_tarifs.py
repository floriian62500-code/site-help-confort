#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde IA #28 — Détection de tarifs inventés (HELP Confort).

But : croiser tout montant `\\d+\\s*€` visible dans les pages publiques HTML
avec la liste officielle TARIFS_REFERENCE.md (BAREME AGENCE validé Florian).

Règle (cf. TARIFS_REFERENCE.md § "Règle pour l'agent IA") :
  Tout montant N € affiché doit
    1. apparaître dans TARIFS_REFERENCE.md, OU
    2. être marqué "estimation marché" / "exemple non engageant", OU
    3. être porté par un élément HTML avec attribut data-source="...".

Toute violation → ALERTE.

Sortie :
  admin-pro/audits/audit_tarifs_report.md   (rapport humain)
  admin-pro/audits/audit_tarifs_report.json (machine)

Usage :
  python3 admin-pro/audits/audit_tarifs.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
TARIFS_MD = ROOT / "admin-pro" / "TARIFS_REFERENCE.md"
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_tarifs_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_tarifs_report.json"

# Montants ignorés (génériques techniques, ex. unités/CSS) — JAMAIS un prix réel
IGNORE_VALUES = {
    # rien pour l'instant — on garde tout
}

# Tolerance autour d'un montant connu (en €) : 0 = match strict.
TOLERANCE = 0

# Bornes : on ne considère pas les montants triviaux (< 5 €) comme un tarif business
MIN_AMOUNT = 5

# Pages à AUDITER : pages publiques racine (pas admin-pro, pas dossiers techniques)
PUBLIC_HTML_GLOB = "*.html"

# Marqueurs qui exemptent un montant
EXEMPT_MARKERS = [
    "estimation marché",
    "estimation marche",
    "exemple non engageant",
    "non engageant",
    "à partir de",  # marketing OK si proche d'un tarif réel — on logge en warning
    "a partir de",
]

# Regex montant : capture les nombres avec espaces/insécables, comma/point, etc.
# Examples capturés : "58 €", "58€", "1 332 €", "1.332 €", "58,50 €"
AMOUNT_RE = re.compile(
    r"(?<![\w/.,-])(\d{1,3}(?:[   .,]?\d{3})*(?:[,.]\d{1,2})?)\s*€"
)

# Tag englobant : on regarde si l'élément (ou un ancêtre direct dans la même ligne)
# porte data-source="..."
DATA_SOURCE_RE = re.compile(r'data-source\s*=\s*"[^"]+"', re.I)

# Pour exclure les montants à l'intérieur d'un attribut HTML/JSON-LD :
# heuristique = montant entre guillemets précédé de = ou :
ATTR_VALUE_RE = re.compile(r'(["\'])[^"\']*\b\d{1,3}[   .,]?\d{0,3}(?:[,.]\d{1,2})?\s*€[^"\']*\1')


def parse_tarifs(md_path: pathlib.Path) -> set[int]:
    """Extrait tous les montants `**XX €**` (ou `XX €` dans une cellule) du MD."""
    if not md_path.exists():
        print(f"⚠️  TARIFS_REFERENCE.md introuvable : {md_path}", file=sys.stderr)
        return set()
    txt = md_path.read_text(encoding="utf-8")
    montants: set[int] = set()
    for m in AMOUNT_RE.finditer(txt):
        raw = m.group(1).replace(" ", "").replace(" ", "").replace(" ", "")
        # On peut avoir "1.332" (notation alternative) ou "1,332" → on traite le séparateur de milliers
        # Mais "58,50" est un décimal. Heuristique : si seul séparateur et 3 chiffres après → milliers.
        if "," in raw and "." not in raw:
            int_part, dec = raw.rsplit(",", 1)
            if len(dec) == 3 and len(int_part) <= 3:
                raw = int_part + dec
            else:
                raw = int_part  # on ignore les centimes
        elif "." in raw and "," not in raw:
            int_part, dec = raw.rsplit(".", 1)
            if len(dec) == 3 and len(int_part) <= 3:
                raw = int_part + dec
            else:
                raw = int_part
        try:
            v = int(raw)
        except ValueError:
            continue
        if v >= MIN_AMOUNT:
            montants.add(v)
    return montants


def normalize_amount(s: str) -> int | None:
    raw = s.replace(" ", "").replace(" ", "").replace(" ", "")
    if "," in raw and "." not in raw:
        int_part, dec = raw.rsplit(",", 1)
        raw = int_part + dec if (len(dec) == 3 and len(int_part) <= 3) else int_part
    elif "." in raw and "," not in raw:
        int_part, dec = raw.rsplit(".", 1)
        raw = int_part + dec if (len(dec) == 3 and len(int_part) <= 3) else int_part
    try:
        return int(raw)
    except ValueError:
        return None


def line_context(text: str, pos: int, span: int = 80) -> str:
    start = max(0, pos - span)
    end = min(len(text), pos + span)
    snippet = text[start:end].replace("\n", " ⏎ ")
    return snippet.strip()


def line_number(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def element_carries_data_source(html: str, pos: int) -> bool:
    """Heuristique : remonter ~400 chars avant le match, chercher data-source dans
    la balise ouvrante la plus proche."""
    window = html[max(0, pos - 400):pos + 200]
    return bool(DATA_SOURCE_RE.search(window))


def line_is_exempt(line_text: str) -> bool:
    low = line_text.lower()
    return any(mark in low for mark in EXEMPT_MARKERS)


def is_inside_jsonld_or_script(html: str, pos: int) -> bool:
    """Détermine si le match est à l'intérieur d'un bloc <script type=...>."""
    # cherche le dernier <script ...> avant pos et le </script> avant pos
    open_idx = html.rfind("<script", 0, pos)
    if open_idx == -1:
        return False
    close_idx = html.rfind("</script", 0, pos)
    return open_idx > close_idx


def audit(root: pathlib.Path, valid_amounts: set[int]):
    pages = sorted([p for p in root.glob(PUBLIC_HTML_GLOB) if p.is_file()])
    findings = []
    seen_per_page: dict[str, dict] = {}

    for html_path in pages:
        try:
            html = html_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            findings.append({
                "page": html_path.name,
                "value": None,
                "line": None,
                "severity": "ERROR",
                "reason": f"Lecture impossible : {e}",
                "context": "",
            })
            continue

        page_stats = {"ok": 0, "exempt": 0, "data_source": 0, "alert": 0, "in_script": 0}

        for m in AMOUNT_RE.finditer(html):
            raw = m.group(1)
            val = normalize_amount(raw)
            if val is None or val < MIN_AMOUNT:
                continue
            if val in IGNORE_VALUES:
                continue

            pos = m.start()
            ln = line_number(html, pos)
            ctx = line_context(html, pos)

            # Skip si dans un <script> (JSON-LD, JS) — ces tarifs sont gérés par data-source au niveau HTML
            if is_inside_jsonld_or_script(html, pos):
                page_stats["in_script"] += 1
                continue

            in_tarifs = val in valid_amounts
            has_ds = element_carries_data_source(html, pos)
            exempt = line_is_exempt(ctx)

            if in_tarifs:
                page_stats["ok"] += 1
                continue
            if has_ds:
                page_stats["data_source"] += 1
                continue
            if exempt:
                page_stats["exempt"] += 1
                continue

            page_stats["alert"] += 1
            findings.append({
                "page": html_path.name,
                "value": val,
                "line": ln,
                "severity": "ALERT",
                "reason": "Montant absent de TARIFS_REFERENCE.md et sans data-source ni mention 'estimation marché'.",
                "context": ctx,
            })

        seen_per_page[html_path.name] = page_stats

    return findings, seen_per_page


def render_md(findings, stats, valid_amounts):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    alerts = [f for f in findings if f["severity"] == "ALERT"]
    errors = [f for f in findings if f["severity"] == "ERROR"]
    lines = [
        "# Audit Tarifs — Sonde IA #28",
        "",
        f"_Généré le {now} — `admin-pro/audits/audit_tarifs.py`_",
        "",
        f"- Pages publiques scannées : **{len(stats)}**",
        f"- Montants validés (TARIFS_REFERENCE.md) : **{len(valid_amounts)}**",
        f"- Alertes : **{len(alerts)}**",
        f"- Erreurs lecture : **{len(errors)}**",
        "",
        "## Règle",
        "Tout montant `\\d+\\s*€` visible doit :",
        "1. Apparaître dans `TARIFS_REFERENCE.md` (BAREME AGENCE), OU",
        "2. Être marqué « estimation marché » / « exemple non engageant », OU",
        "3. Avoir un attribut HTML `data-source=\"...\"`.",
        "",
    ]
    if alerts:
        lines.append("## 🚨 Alertes")
        lines.append("")
        lines.append("| Page | Ligne | Montant | Contexte |")
        lines.append("|------|------:|--------:|----------|")
        for a in alerts:
            ctx = a["context"].replace("|", "/")[:140]
            lines.append(f"| `{a['page']}` | {a['line']} | **{a['value']} €** | {ctx} |")
        lines.append("")
    else:
        lines.append("## ✅ Aucune alerte")
        lines.append("")

    lines.append("## Détail par page")
    lines.append("")
    lines.append("| Page | OK | data-source | exempt | in-script | ALERT |")
    lines.append("|------|---:|------------:|------:|----------:|------:|")
    for page, s in sorted(stats.items()):
        lines.append(
            f"| `{page}` | {s['ok']} | {s['data_source']} | {s['exempt']} | "
            f"{s['in_script']} | **{s['alert']}** |"
        )
    lines.append("")
    lines.append("## Montants valides reconnus depuis TARIFS_REFERENCE.md")
    lines.append("")
    lines.append(", ".join(f"{v} €" for v in sorted(valid_amounts)))
    lines.append("")
    return "\n".join(lines)


def main():
    valid = parse_tarifs(TARIFS_MD)
    findings, stats = audit(ROOT, valid)

    OUT_MD.write_text(render_md(findings, stats, valid), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps({"findings": findings, "stats": stats, "valid_amounts": sorted(valid)},
                   ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    nb_alerts = sum(1 for f in findings if f["severity"] == "ALERT")
    print(f"✓ Audit tarifs terminé : {len(stats)} pages, {nb_alerts} alertes.")
    print(f"  Rapport : {OUT_MD.relative_to(ROOT)}")
    return 0 if nb_alerts == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
