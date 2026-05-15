#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #29 v4 — Audit Schema.org @type métier.

Pour chaque page `<métier>-saint-omer.html`, on extrait le bloc JSON-LD principal
décrivant l'activité locale et on vérifie que son @type correspond au mapping
attendu pour le métier :

    plombier      → Plumber
    chauffagiste  → HVACBusiness
    electricien   → Electrician
    serrurier     → Locksmith
    travaux       → GeneralContractor

Tout mismatch (par exemple un `chauffagiste-*` avec @type=Plumber) → ALERTE :
Google s'appuie sur le @type pour qualifier le secteur et son résultat enrichi.

Le check tolère un @type sous forme de liste : la sonde valide si le @type attendu
est *présent* dans la liste.

Sortie :
  admin-pro/audits/audit_schema_type_metier_report.md
  admin-pro/audits/audit_schema_type_metier_report.json

Usage :
  python3 admin-pro/audits/audit_schema_type_metier.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_schema_type_metier_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_schema_type_metier_report.json"

# slug racine → type schema.org attendu
EXPECTED = {
    "plombier":     "Plumber",
    "chauffagiste": "HVACBusiness",
    "electricien":  "Electrician",
    "serrurier":    "Locksmith",
    "travaux":      "GeneralContractor",
}

# Types « génériques » tolérés en plus du type spécifique (jamais à la place)
GENERIC_OK = {"LocalBusiness", "Organization", "ProfessionalService"}

SCRIPT_RE = re.compile(
    r'<script\s+type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)


def candidate_pages() -> list[pathlib.Path]:
    """Liste des pages métier-saint-omer.html présentes sur disque."""
    out = []
    for slug in EXPECTED:
        p = ROOT / f"{slug}-saint-omer.html"
        if p.is_file():
            out.append(p)
    return out


def normalize_types(t):
    if isinstance(t, list):
        return [str(x) for x in t]
    if isinstance(t, str):
        return [t]
    return []


def iter_nodes(node):
    """Yields tous les nœuds dict d'un JSON-LD (récursif)."""
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from iter_nodes(v)
    elif isinstance(node, list):
        for child in node:
            yield from iter_nodes(child)


def scan_page(path: pathlib.Path, slug: str, expected_type: str) -> dict:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return {
            "page": path.name, "slug": slug, "expected_type": expected_type,
            "status": "READ-ERROR", "types_found": [], "alerts": ["Impossible de lire la page"],
        }

    scripts = SCRIPT_RE.findall(html)
    types_found = []  # tous les @type rencontrés
    jsonld_errors = 0

    for raw in scripts:
        try:
            data = json.loads(raw.strip())
        except json.JSONDecodeError:
            jsonld_errors += 1
            continue
        for node in iter_nodes(data):
            for t in normalize_types(node.get("@type")):
                types_found.append(t)

    types_set = set(types_found)
    has_expected = expected_type in types_set
    has_other_business = bool({"Plumber", "HVACBusiness", "Electrician", "Locksmith",
                                "GeneralContractor"} & types_set) and not has_expected

    status = "ok"
    alerts = []

    if not scripts:
        status = "NO-JSONLD"
        alerts.append("Aucun bloc JSON-LD sur la page")
    elif not types_set:
        status = "NO-TYPE"
        alerts.append("JSON-LD présent mais aucun @type extrait")
    elif has_other_business:
        status = "WRONG-TYPE"
        wrong = sorted({"Plumber", "HVACBusiness", "Electrician", "Locksmith",
                        "GeneralContractor"} & types_set)
        alerts.append(
            f"Type métier incohérent : attendu **{expected_type}**, trouvé {wrong}"
        )
    elif not has_expected:
        # Pas le type attendu ; vérifions s'il y a au moins un fallback générique
        if types_set & GENERIC_OK:
            status = "GENERIC-ONLY"
            alerts.append(
                f"Pas de @type=**{expected_type}** ; seulement type(s) générique(s) "
                f"trouvé(s) : {sorted(types_set & GENERIC_OK)}"
            )
        else:
            status = "MISSING-EXPECTED"
            alerts.append(
                f"Pas de @type=**{expected_type}** ; aucun fallback business générique non plus"
            )

    if jsonld_errors:
        alerts.append(f"{jsonld_errors} bloc(s) JSON-LD avec erreur de syntaxe (non scannés)")

    return {
        "page": path.name,
        "slug": slug,
        "expected_type": expected_type,
        "types_found": sorted(set(types_found)),
        "jsonld_errors": jsonld_errors,
        "status": status,
        "alerts": alerts,
    }


def main() -> int:
    pages = candidate_pages()
    entries = []
    for p in pages:
        slug = p.stem.replace("-saint-omer", "")
        if slug in EXPECTED:
            entries.append(scan_page(p, slug, EXPECTED[slug]))

    bad = {"WRONG-TYPE", "MISSING-EXPECTED", "GENERIC-ONLY", "NO-TYPE", "NO-JSONLD"}
    alerts = [e for e in entries if e["status"] in bad]
    ok     = [e for e in entries if e["status"] == "ok"]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# Audit Schema.org @type métier — {now}")
    lines.append("")
    lines.append(f"- **Pages métier attendues** : {len(EXPECTED)}")
    lines.append(f"- **Pages trouvées sur disque** : {len(entries)}")
    lines.append(f"- **Pages OK (type attendu présent)** : {len(ok)}")
    lines.append(f"- **Pages alertées** : {len(alerts)}")
    lines.append("")
    lines.append("## Mapping attendu")
    lines.append("")
    lines.append("| Page | @type attendu |")
    lines.append("|------|---------------|")
    for slug, t in EXPECTED.items():
        lines.append(f"| `{slug}-saint-omer.html` | `{t}` |")
    lines.append("")

    if alerts:
        lines.append("## 🚨 Alertes")
        lines.append("")
        lines.append("| Page | Slug | Attendu | Types trouvés | Statut | Détail |")
        lines.append("|------|------|---------|---------------|--------|--------|")
        for e in alerts:
            detail = "<br>".join(e["alerts"]) if e["alerts"] else ""
            types_str = ", ".join(f"`{t}`" for t in e["types_found"]) or "(aucun)"
            lines.append(
                f"| `{e['page']}` | {e['slug']} | `{e['expected_type']}` | {types_str} | **{e['status']}** | {detail} |"
            )
        lines.append("")
    else:
        lines.append("## ✅ Tous les @type métier sont conformes")
        lines.append("")

    # Pages OK détaillées
    if ok:
        lines.append("## Pages conformes")
        lines.append("")
        for e in ok:
            lines.append(f"- `{e['page']}` → `{e['expected_type']}` présent ✓")
        lines.append("")

    # Détection pages absentes
    missing_pages = [slug for slug in EXPECTED if not (ROOT / f"{slug}-saint-omer.html").is_file()]
    if missing_pages:
        lines.append("## ⚠️ Pages métier introuvables sur disque")
        lines.append("")
        for slug in missing_pages:
            lines.append(f"- `{slug}-saint-omer.html` (attendu `@type=\"{EXPECTED[slug]}\"`)")
        lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "expected_mapping": EXPECTED,
        "pages_found": len(entries),
        "ok": len(ok),
        "alerts": len(alerts),
        "missing_pages": missing_pages,
        "entries": entries,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[audit_schema_type_metier] {len(entries)}/{len(EXPECTED)} pages métier scannées, "
          f"{len(ok)} OK, {len(alerts)} alertes")
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
