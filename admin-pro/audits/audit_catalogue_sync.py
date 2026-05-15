#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde IA #59 — Audit synchronisation wizard ↔ catalogue prestations
==================================================================
Croise les slugs entre :
  - `var ALL_PRESTAS = [...]` dans `index.html`   (wizard home)
  - `const LOCAL_CATALOG = [...]` dans `nos-prestations.html` (catalogue public)

Toute prestation présente dans l'un mais ABSENTE de l'autre = ALERTE
*catalogue désynchronisé*. Bug type : un client réserve une prestation depuis
le wizard home qui n'existe plus dans le catalogue (lien mort) — ou inverse.

Sortie : admin-pro/audits/audit_catalogue_sync_report.md + .json
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_catalogue_sync_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_catalogue_sync_report.json"

INDEX = ROOT / "index.html"
NOSPRESTAS = ROOT / "nos-prestations.html"

# Regex pour matcher chaque entrée d'objet — { slug:'foo', ... } ou { slug:"foo", ... }
RE_SLUG_FIELD = re.compile(r"""\bslug\s*:\s*['"]([a-z0-9\-]+)['"]""", re.I)
RE_LABEL      = re.compile(r"""\b(?:label|name)\s*:\s*['"]([^'"]+)['"]""", re.I)
RE_METIER     = re.compile(r"""\b(?:metier|category_name|category_slug)\s*:\s*['"]([^'"]+)['"]""", re.I)
RE_PRICE      = re.compile(r"""\b(?:price|price_ttc)\s*:\s*(\d+(?:\.\d+)?)""", re.I)
RE_QUOTE      = re.compile(r"""\b(?:quote|requires_quote)\s*:\s*(true)""", re.I)


def extract_block(text: str, marker: str) -> str | None:
    """Extrait le bloc tableau JS qui suit `<marker> = [` jusqu'au `]` matchant."""
    m = re.search(re.escape(marker) + r"\s*=\s*\[", text)
    if not m:
        return None
    start = m.end() - 1  # position du `[`
    depth = 0
    i = start
    in_str = None
    esc = False
    while i < len(text):
        ch = text[i]
        if esc:
            esc = False
        elif ch == "\\" and in_str:
            esc = True
        elif in_str:
            if ch == in_str:
                in_str = None
        elif ch in ('"', "'"):
            in_str = ch
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return text[start: i + 1]
        i += 1
    return None


def parse_entries(block: str) -> list[dict]:
    """Parse les objets `{ slug:..., label:..., price:..., metier:... }` du bloc.
    Suppose 1 objet par balise `{ … }` non-imbriquée — convient au format actuel."""
    # On découpe par accolades balancées
    entries = []
    depth = 0
    start = -1
    in_str = None
    esc = False
    for i, ch in enumerate(block):
        if esc:
            esc = False
            continue
        if ch == "\\" and in_str:
            esc = True
            continue
        if in_str:
            if ch == in_str:
                in_str = None
            continue
        if ch in ('"', "'"):
            in_str = ch
            continue
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start >= 0:
                chunk = block[start: i + 1]
                m_slug = RE_SLUG_FIELD.search(chunk)
                if not m_slug:
                    continue
                m_label = RE_LABEL.search(chunk)
                m_metier = RE_METIER.search(chunk)
                m_price = RE_PRICE.search(chunk)
                m_quote = RE_QUOTE.search(chunk)
                entries.append({
                    "slug": m_slug.group(1),
                    "label": m_label.group(1) if m_label else "",
                    "metier": m_metier.group(1) if m_metier else "",
                    "price": float(m_price.group(1)) if m_price else None,
                    "quote": bool(m_quote),
                })
                start = -1
    return entries


def main() -> int:
    if not INDEX.exists() or not NOSPRESTAS.exists():
        print("Fichiers source introuvables")
        return 1

    txt_idx = INDEX.read_text(encoding="utf-8", errors="replace")
    txt_nos = NOSPRESTAS.read_text(encoding="utf-8", errors="replace")

    block_idx = extract_block(txt_idx, "ALL_PRESTAS")
    block_nos = extract_block(txt_nos, "LOCAL_CATALOG")

    if block_idx is None:
        print("ALL_PRESTAS introuvable dans index.html")
        return 1
    if block_nos is None:
        print("LOCAL_CATALOG introuvable dans nos-prestations.html")
        return 1

    wiz = parse_entries(block_idx)
    cat = parse_entries(block_nos)

    wiz_slugs = {e["slug"]: e for e in wiz}
    cat_slugs = {e["slug"]: e for e in cat}

    # Slugs "fourre-tout" du wizard — convention UX, ne sont pas dans le catalogue
    # (option "autre" qui redirige vers contact pour un devis manuel)
    WIZARD_ONLY_TOLERATED = {"plomberie-sur-devis", "travaux-renovation"}

    only_wiz = sorted(set(wiz_slugs) - set(cat_slugs) - WIZARD_ONLY_TOLERATED)
    only_cat = sorted(set(cat_slugs) - set(wiz_slugs))
    common = sorted(set(wiz_slugs) & set(cat_slugs))
    tolerated = sorted((set(wiz_slugs) - set(cat_slugs)) & WIZARD_ONLY_TOLERATED)

    # Détecte les écarts de prix sur les slugs communs
    price_diffs = []
    for slug in common:
        a = wiz_slugs[slug]
        b = cat_slugs[slug]
        if a.get("price") and b.get("price") and abs(a["price"] - b["price"]) > 0.01:
            price_diffs.append({
                "slug": slug,
                "label_wizard": a.get("label", ""),
                "label_catalog": b.get("label", ""),
                "price_wizard": a["price"],
                "price_catalog": b["price"],
            })
        elif a.get("quote") != b.get("quote"):
            price_diffs.append({
                "slug": slug,
                "label_wizard": a.get("label", ""),
                "label_catalog": b.get("label", ""),
                "quote_wizard": a.get("quote"),
                "quote_catalog": b.get("quote"),
            })

    nb_alertes = len(only_wiz) + len(only_cat) + len(price_diffs)

    # ----- Rapport markdown ---------------------------------------------------
    lines = [
        "# 🔄 Audit synchronisation wizard ↔ catalogue — Sonde IA #59",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/audit_catalogue_sync.py`*",
        "",
        f"**Wizard home (`ALL_PRESTAS` d'index.html)** : {len(wiz)} prestations",
        f"**Catalogue (`LOCAL_CATALOG` de nos-prestations.html)** : {len(cat)} prestations",
        f"**Slugs communs** : {len(common)}",
        f"**Slugs wizard tolérés (fourre-tout)** : {len(tolerated)}",
        f"**Alertes totales** : **{nb_alertes}**",
        "",
        "## 🚨 Prestations dans wizard mais ABSENTES du catalogue",
        "",
    ]
    if only_wiz:
        lines.append("| Slug | Label wizard | Métier | Prix |")
        lines.append("|------|--------------|--------|------|")
        for slug in only_wiz:
            e = wiz_slugs[slug]
            price = f"{e['price']} €" if e["price"] else ("sur devis" if e["quote"] else "—")
            lines.append(f"| `{slug}` | {e['label']} | {e['metier']} | {price} |")
    else:
        lines.append("✅ Aucun écart — tous les slugs wizard existent dans le catalogue.")
    lines.extend(["", "## 🚨 Prestations dans catalogue mais ABSENTES du wizard", ""])
    if only_cat:
        lines.append("| Slug | Label catalogue | Métier | Prix |")
        lines.append("|------|-----------------|--------|------|")
        for slug in only_cat:
            e = cat_slugs[slug]
            price = f"{e['price']} €" if e["price"] else ("sur devis" if e["quote"] else "—")
            lines.append(f"| `{slug}` | {e['label']} | {e['metier']} | {price} |")
    else:
        lines.append("✅ Aucun écart — tous les slugs catalogue existent dans le wizard.")
    lines.extend(["", "## ⚠️ Écarts de prix sur slugs communs", ""])
    if price_diffs:
        lines.append("| Slug | Wizard | Catalogue |")
        lines.append("|------|--------|-----------|")
        for d in price_diffs:
            w = d.get("price_wizard")
            c = d.get("price_catalog")
            if w is not None and c is not None:
                lines.append(f"| `{d['slug']}` | {w} € | {c} € |")
            else:
                lines.append(f"| `{d['slug']}` | quote={d.get('quote_wizard')} | quote={d.get('quote_catalog')} |")
    else:
        lines.append("✅ Tous les prix communs concordent.")
    lines.extend([
        "",
        "## 🛠️ Procédure de correction",
        "",
        "Pour chaque alerte ci-dessus :",
        "1. **Slug seul dans le wizard** → soit l'ajouter au `LOCAL_CATALOG` de nos-prestations.html, soit le retirer du wizard.",
        "2. **Slug seul dans le catalogue** → l'ajouter à `ALL_PRESTAS` pour qu'il puisse être proposé dans le wizard.",
        "3. **Écart de prix** → re-croiser avec `TARIFS_REFERENCE.md` puis aligner les deux fichiers sur le tarif validé.",
        "",
        "*Sonde IA #59 — référence MEMOIRE_IA_MAINTENANCE.md addendum v10.*",
    ])

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "scanned_files": ["index.html", "nos-prestations.html"],
        "counts": {"wizard": len(wiz), "catalogue": len(cat), "common": len(common)},
        "only_wizard": only_wiz,
        "only_catalogue": only_cat,
        "price_diffs": price_diffs,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Rapport généré : {OUT_MD.relative_to(ROOT)}")
    print(f"Wizard {len(wiz)} | Catalogue {len(cat)} | Communs {len(common)} | Alertes {nb_alertes}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
