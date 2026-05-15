#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde IA #29 — Vérification des attributs `data-source` orphelins.

But : tout élément HTML porteur de `data-source="..."` est censé pointer vers
une source de vérité (BAREME AGENCE Excel, devis daté…). Cette sonde recense
chaque valeur de `data-source` rencontrée sur le site et alerte si :
  - la valeur n'a pas un format reconnu
  - la valeur référence un devis daté trop ancien (> 12 mois)
  - la valeur est vide

Format reconnu (regex SOURCE_RE) :
  - "base-produits-YYYY-MM" (ex. base-produits-2026-05)
  - "BAREME AGENCE"        (label exact)
  - "devis YYYY-MM-DD"     (ex. devis 2026-05-15)
  - "TARIFS_REFERENCE"     (renvoi au MD central)
  - "estimation marché"    (assumée — pas un prix engageant)

Sortie :
  admin-pro/audits/audit_datasource_report.md
  admin-pro/audits/audit_datasource_report.json

Usage :
  python3 admin-pro/audits/audit_datasource.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_datasource_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_datasource_report.json"

DATA_SOURCE_RE = re.compile(r'data-source\s*=\s*"([^"]*)"', re.I)

SOURCE_PATTERNS = [
    ("base-produits", re.compile(r"^base-produits-(\d{4})-(\d{2})$")),
    ("BAREME-AGENCE", re.compile(r"^BAREME[ _-]AGENCE$", re.I)),
    ("devis-daté", re.compile(r"^devis[ _-]?(\d{4}-\d{2}-\d{2})$", re.I)),
    ("TARIFS_REFERENCE", re.compile(r"^TARIFS[_-]?REFERENCE$", re.I)),
    ("estimation-marche", re.compile(r"^estimation[ _-]?march[ée]$", re.I)),
    # Non-tarifaires (widgets d'avis, intégrations tiers) : tolérés
    ("widget-avis", re.compile(r"^(google|trustville|trustpilot|facebook|avis-verifies)$", re.I)),
]

PAGES_GLOB = "*.html"
# Mois autorisés avant alerte ancienneté
STALE_MONTHS = 12


def classify(value: str, now: datetime) -> tuple[str, str]:
    """Renvoie (type, status). Status ∈ {'ok','stale','unknown','empty'}."""
    v = value.strip()
    if not v:
        return ("empty", "empty")
    for label, pat in SOURCE_PATTERNS:
        m = pat.match(v)
        if not m:
            continue
        if label == "base-produits":
            yr, mo = int(m.group(1)), int(m.group(2))
            try:
                dt = datetime(yr, mo, 1)
            except ValueError:
                return (label, "unknown")
            age_days = (now - dt).days
            if age_days > STALE_MONTHS * 30:
                return (label, "stale")
            return (label, "ok")
        if label == "devis-daté":
            try:
                dt = datetime.strptime(m.group(1), "%Y-%m-%d")
            except ValueError:
                return (label, "unknown")
            age_days = (now - dt).days
            if age_days > STALE_MONTHS * 30:
                return (label, "stale")
            return (label, "ok")
        return (label, "ok")
    return ("unknown", "unknown")


def audit(root: pathlib.Path):
    pages = sorted([p for p in root.glob(PAGES_GLOB) if p.is_file()])
    findings = []
    by_value: Counter = Counter()
    by_status: Counter = Counter()
    by_page: dict[str, dict] = {}
    now = datetime.now()

    for html_path in pages:
        try:
            html = html_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        page_counts = Counter()
        for m in DATA_SOURCE_RE.finditer(html):
            val = m.group(1)
            label, status = classify(val, now)
            by_value[val] += 1
            by_status[status] += 1
            page_counts[status] += 1
            if status != "ok":
                ln = html.count("\n", 0, m.start()) + 1
                findings.append({
                    "page": html_path.name,
                    "line": ln,
                    "value": val,
                    "type": label,
                    "status": status,
                })
        if page_counts:
            by_page[html_path.name] = dict(page_counts)

    return {
        "findings": findings,
        "by_value": dict(by_value),
        "by_status": dict(by_status),
        "by_page": by_page,
        "total_pages_with_ds": len(by_page),
    }


def render_md(rep):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    alerts = [f for f in rep["findings"] if f["status"] != "ok"]
    lines = [
        "# Audit data-source — Sonde IA #29",
        "",
        f"_Généré le {now} — `admin-pro/audits/audit_datasource.py`_",
        "",
        f"- Pages avec attribut `data-source` : **{rep['total_pages_with_ds']}**",
        f"- Occurrences totales : **{sum(rep['by_value'].values())}**",
        f"- Statuts : " + ", ".join(f"`{k}` ×{v}" for k, v in sorted(rep["by_status"].items())),
        f"- Alertes : **{len(alerts)}**",
        "",
        "## Formats reconnus",
        "- `base-produits-YYYY-MM` (BAREME AGENCE Excel)",
        "- `BAREME AGENCE`",
        "- `devis YYYY-MM-DD`",
        "- `TARIFS_REFERENCE`",
        "- `estimation marché`",
        "",
    ]
    if alerts:
        lines += [
            "## 🚨 Alertes",
            "",
            "| Page | Ligne | data-source | Type | Status |",
            "|------|------:|-------------|------|--------|",
        ]
        for a in alerts:
            lines.append(
                f"| `{a['page']}` | {a['line']} | `{a['value']}` | {a['type']} | "
                f"**{a['status']}** |"
            )
        lines.append("")
    else:
        lines += ["## ✅ Aucune alerte — toutes les valeurs `data-source` sont valides", ""]

    lines += ["## Détail par page", "",
              "| Page | OK | stale | unknown | empty |",
              "|------|---:|------:|--------:|------:|"]
    for page, counts in sorted(rep["by_page"].items()):
        lines.append(
            f"| `{page}` | {counts.get('ok',0)} | {counts.get('stale',0)} | "
            f"{counts.get('unknown',0)} | {counts.get('empty',0)} |"
        )
    lines.append("")
    lines += ["## Valeurs distinctes", "",
              "| `data-source` | Occurrences |",
              "|---------------|------------:|"]
    for val, n in sorted(rep["by_value"].items(), key=lambda x: -x[1]):
        lines.append(f"| `{val}` | {n} |")
    lines.append("")
    return "\n".join(lines)


def main():
    rep = audit(ROOT)
    OUT_MD.write_text(render_md(rep), encoding="utf-8")
    OUT_JSON.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding="utf-8")
    nb_alerts = sum(1 for f in rep["findings"] if f["status"] != "ok")
    print(f"✓ Audit data-source : {rep['total_pages_with_ds']} pages, "
          f"{sum(rep['by_value'].values())} occurrences, {nb_alerts} alertes.")
    print(f"  Rapport : {OUT_MD.relative_to(ROOT)}")
    return 0 if nb_alerts == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
