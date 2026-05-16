#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit lang attribute — sonde P16.

Vérifie que toutes les pages publiques racine déclarent l'attribut `lang`
sur la balise `<html>`. Tolère `fr`, `fr-FR`, `fr-fr`, `fr-CA` (warning).

Critères :
  - ERROR  : pas de balise `<html>` détectée OU pas d'attribut `lang`
  - ERROR  : `lang="..."` ne commence pas par `fr`
  - WARN   : `lang="fr-XX"` avec XX ≠ FR (variantes peu pertinentes pour
             un site français hexagonal)
  - OK     : `lang="fr"` ou `lang="fr-FR"`

Whitelist : pages 404/reset/test-*/_* (admin déjà séparé).

Sortie :
  - admin-pro/audits/audit_lang_attribute_report.md
  - admin-pro/audits/audit_lang_attribute_report.json

Sans dépendance externe — stdlib uniquement (regex + json + pathlib).
Pourquoi : WCAG 3.1.1 (Language of Page) + SEO (Google utilise `lang`
pour le ciblage géographique et la sélection du modèle de pertinence).
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_lang_attribute_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_lang_attribute_report.json"

# Pages à exclure du scan
EXCLUDE = {
    "404.html",       # page d'erreur — souvent statique générique
    "reset.html",     # admin
}
EXCLUDE_PREFIX = ("test-", "_")

# Pattern pour capturer la balise <html ...> (multi-ligne, insensible à la casse)
HTML_TAG_RE = re.compile(r"<html\b([^>]*)>", re.IGNORECASE | re.DOTALL)
# Pattern pour capturer la valeur de lang= (simple ou double quote, ou non quoté)
LANG_ATTR_RE = re.compile(
    r"""lang\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""",
    re.IGNORECASE,
)


def find_html_pages() -> list[pathlib.Path]:
    pages: list[pathlib.Path] = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    # Sous-dossier actualites (articles)
    actu = ROOT / "actualites"
    if actu.exists():
        for p in actu.glob("*.html"):
            pages.append(p)
    return sorted(pages)


def classify(lang: str | None) -> tuple[str, str]:
    if lang is None:
        return "error", "LANG-MISSING : attribut `lang` absent sur <html>"
    lang_n = lang.strip().lower()
    if not lang_n:
        return "error", "LANG-EMPTY : attribut `lang` vide"
    if lang_n in ("fr", "fr-fr"):
        return "ok", f"OK : lang=\"{lang}\""
    if lang_n.startswith("fr-") or lang_n == "fr":
        return "warn", f"LANG-FR-VARIANT : lang=\"{lang}\" (variante régionale)"
    if lang_n.startswith("fr"):
        return "warn", f"LANG-FR-LOOSE : lang=\"{lang}\" (devrait être `fr` ou `fr-FR`)"
    return "error", f"LANG-NOT-FR : lang=\"{lang}\" (attendu `fr` ou `fr-FR`)"


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "html_tag_found": False,
        "lang": None,
        "errors": [],
        "warnings": [],
    }
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        res["status"] = "error"
        res["errors"].append(f"READ-ERROR : {type(e).__name__}")
        return res

    m = HTML_TAG_RE.search(raw)
    if not m:
        res["status"] = "error"
        res["errors"].append("HTML-TAG-MISSING : aucune balise `<html>` détectée")
        return res

    res["html_tag_found"] = True
    attrs = m.group(1) or ""
    la = LANG_ATTR_RE.search(attrs)
    lang_val = None
    if la:
        lang_val = la.group(1) or la.group(2) or la.group(3)
    res["lang"] = lang_val

    status, label = classify(lang_val)
    if status == "error":
        res["status"] = "error"
        res["errors"].append(label)
    elif status == "warn":
        res["status"] = "warn"
        res["warnings"].append(label)
    else:
        res["status"] = "ok"

    return res


def main() -> None:
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_warn  = sum(1 for r in results if r["status"] == "warn")
    n_err   = sum(1 for r in results if r["status"] == "error")
    total_errors   = sum(len(r["errors"])   for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit lang attribute — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK (`fr` ou `fr-FR`) : **{n_ok}**",
        f"- ⚠️  Warnings (variantes `fr-XX`) : **{n_warn}**",
        f"- ❌ Erreurs (lang manquant ou ≠ fr) : **{n_err}**",
        f"- Findings totaux : **{total_errors + total_warnings}**",
        f"  - Erreurs : {total_errors}",
        f"  - Avertissements : {total_warnings}",
        "",
        "## Règles",
        "",
        "- `<html lang=\"fr\">` ou `<html lang=\"fr-FR\">` → OK",
        "- `<html lang=\"fr-XX\">` (autres régions FR) → WARN",
        "- lang absent, vide, ou ne commençant pas par `fr` → ERREUR",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    order = {"error": 0, "warn": 1, "ok": 2}
    for r in sorted(results, key=lambda x: (order.get(x["status"], 9), x["file"])):
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`  (lang={r['lang']!r})")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les pages déclarent correctement `lang`._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total":   n_total,
                "n_ok":      n_ok,
                "n_warn":    n_warn,
                "n_errors":  n_err,
                "results":   results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_lang_attribute] {n_ok}/{n_total} OK, "
        f"{n_warn} warn, {n_err} err — "
        f"findings={total_errors + total_warnings}"
    )
    print(f"Report: {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
