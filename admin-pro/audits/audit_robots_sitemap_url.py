#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit robots.txt — directive Sitemap — sonde P15.

Vérifie que le fichier `robots.txt` racine du repo contient bien la
directive `Sitemap: https://www.depan59-62.fr/sitemap.xml` (recommandation
Google Search Console pour la découverte automatique du sitemap).

Règles appliquées :
  - robots.txt existe à la racine (sinon ERROR : ROBOTS-MISSING)
  - au moins une directive `Sitemap:` est présente (sinon ERROR :
    SITEMAP-DIRECTIVE-MISSING)
  - l'URL pointée correspond exactement au sitemap canonique
    `https://www.depan59-62.fr/sitemap.xml` (sinon ERROR :
    SITEMAP-URL-MISMATCH)
  - l'URL pointée n'utilise pas `http://` au lieu de `https://`
    (sinon WARN : SITEMAP-HTTP-NOT-HTTPS)
  - aucune directive `Sitemap` en double (sinon WARN :
    SITEMAP-DUPLICATE)

Sortie :
  - admin-pro/audits/audit_robots_sitemap_url_report.md
  - admin-pro/audits/audit_robots_sitemap_url_report.json

Note : un audit séparé `audit_robots.py` couvre déjà la vérification
prod HTTP (status 200, content-type, allow/disallow). Le présent
script se concentre exclusivement sur la directive `Sitemap:` côté
fichier local — ce qui le rend exécutable sans accès Internet
(utile sandbox + CI).

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import json
import pathlib
import re
from datetime import datetime
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
ROBOTS_PATH = ROOT / "robots.txt"
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_robots_sitemap_url_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_robots_sitemap_url_report.json"

CANONICAL_SITEMAP = "https://www.depan59-62.fr/sitemap.xml"
EXPECTED_HOSTS = {"depan59-62.fr", "www.depan59-62.fr"}
EXPECTED_PATH  = "/sitemap.xml"


def parse_sitemap_directives(text: str) -> list[str]:
    """Retourne la liste des URLs déclarées dans 'Sitemap:' (ordre fichier)."""
    urls: list[str] = []
    for raw in text.splitlines():
        # Strip commentaire en fin de ligne
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        m = re.match(r"^sitemap\s*:\s*(.+)$", line, re.I)
        if m:
            urls.append(m.group(1).strip())
    return urls


def main():
    errors: list[str] = []
    warnings: list[str] = []
    info: dict = {
        "robots_exists": False,
        "sitemap_urls": [],
        "canonical_expected": CANONICAL_SITEMAP,
    }

    if not ROBOTS_PATH.exists():
        errors.append("ROBOTS-MISSING : robots.txt absent à la racine du repo")
    else:
        info["robots_exists"] = True
        text = ROBOTS_PATH.read_text(encoding="utf-8", errors="replace")
        urls = parse_sitemap_directives(text)
        info["sitemap_urls"] = urls

        if not urls:
            errors.append(
                "SITEMAP-DIRECTIVE-MISSING : aucune ligne `Sitemap:` "
                "dans robots.txt — Google Search Console recommande "
                "d'exposer le sitemap via cette directive"
            )
        else:
            # Doublons
            seen = set()
            for u in urls:
                if u in seen:
                    warnings.append(f"SITEMAP-DUPLICATE : URL `{u}` déclarée plusieurs fois")
                seen.add(u)

            # Match canonique
            found_canonical = False
            for u in urls:
                if u == CANONICAL_SITEMAP:
                    found_canonical = True
                    continue
                parsed = urlparse(u)
                # http vs https
                if parsed.scheme == "http":
                    warnings.append(
                        f"SITEMAP-HTTP-NOT-HTTPS : `{u}` devrait être https://"
                    )
                # Bon host ?
                if parsed.netloc and parsed.netloc not in EXPECTED_HOSTS:
                    errors.append(
                        f"SITEMAP-URL-MISMATCH : host `{parsed.netloc}` ≠ depan59-62.fr "
                        f"(URL : `{u}`)"
                    )
                # Bon path ?
                if parsed.path and parsed.path != EXPECTED_PATH:
                    errors.append(
                        f"SITEMAP-URL-MISMATCH : path `{parsed.path}` ≠ `{EXPECTED_PATH}` "
                        f"(URL : `{u}`)"
                    )

            if not found_canonical and not errors:
                # Aucune URL canonique stricte, mais le host + path matchent
                warnings.append(
                    f"SITEMAP-NOT-CANONICAL : aucune ligne exactement "
                    f"`Sitemap: {CANONICAL_SITEMAP}` — vérifier formatage"
                )

    status = "ok" if (not errors) else "error"
    if not errors and warnings:
        status = "warn"

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit robots.txt — directive Sitemap — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- robots.txt présent : **{'✅' if info['robots_exists'] else '❌'}**",
        f"- URLs déclarées via `Sitemap:` : **{len(info['sitemap_urls'])}**",
        f"- URL canonique attendue : `{CANONICAL_SITEMAP}`",
        f"- ❌ Erreurs : **{len(errors)}**",
        f"- ⚠️  Avertissements : **{len(warnings)}**",
        f"- Findings totaux : **{len(errors) + len(warnings)}**",
        f"- Statut global : **{status.upper()}**",
        "",
    ]
    if info["sitemap_urls"]:
        md += ["## URLs Sitemap déclarées", ""]
        for u in info["sitemap_urls"]:
            md.append(f"- `{u}`")
        md.append("")

    md += ["## Findings", ""]
    if not errors and not warnings:
        md += [
            "_Aucun finding — robots.txt expose correctement le sitemap canonique._",
            "",
        ]
    else:
        for e in errors:
            md.append(f"- ❌ {e}")
        for w in warnings:
            md.append(f"- ⚠️ {w}")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "canonical_sitemap": CANONICAL_SITEMAP,
                "robots_exists": info["robots_exists"],
                "sitemap_urls": info["sitemap_urls"],
                "errors": errors,
                "warnings": warnings,
                "status": status,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_robots_sitemap_url] {len(errors)} erreurs, "
        f"{len(warnings)} warnings, "
        f"{len(info['sitemap_urls'])} URL(s) Sitemap "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
