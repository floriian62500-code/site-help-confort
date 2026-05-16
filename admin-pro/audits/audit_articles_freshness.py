#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit fraîcheur des articles — sonde P16.

Détecte les articles `actualites/*.html` dont la date de publication est
> 12 mois (WARN) ou > 24 mois (ERROR). Google Search rétrograde le
contenu obsolète dans les SERP, surtout sur les requêtes informationnelles
type « comment dégivrer un chauffe-eau » où l'algorithme privilégie le
contenu récent.

Source de date utilisée (dans l'ordre) :
  1. JSON-LD `"datePublished": "YYYY-MM-DD..."` (schema.org Article)
  2. Balise `<time datetime="YYYY-MM-DD...">`
  3. `<meta property="article:published_time" content="...">`
  4. Date extraite du nom de fichier `YYYY-MM-DD-*.html`
  5. mtime du fichier (fallback)

Critères :
  - ERROR  : date > 24 mois → article trop ancien, à archiver ou refondre
  - WARN   : date > 12 mois → rafraîchir (datePublished → dateModified
             OU réécriture partielle pour signaler à Google)
  - OK     : date ≤ 12 mois

Sortie :
  - admin-pro/audits/audit_articles_freshness_report.md
  - admin-pro/audits/audit_articles_freshness_report.json

Sans dépendance externe — stdlib uniquement.
Pourquoi : Florian publie régulièrement, mais les anciens articles
restent en ligne et peuvent diluer la pertinence du domaine. Ce rapport
sert d'aide éditoriale (que rafraîchir / dépublier / fusionner).
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime, timedelta

ROOT = pathlib.Path(__file__).resolve().parents[2]
ACTU = ROOT / "actualites"
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_articles_freshness_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_articles_freshness_report.json"

# Seuils (en jours)
WARN_DAYS  = 365
ERROR_DAYS = 730  # 24 mois

DATEPUB_JSONLD_RE = re.compile(
    r'"datePublished"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2}[^"]*)"',
)
TIME_DATETIME_RE = re.compile(
    r'<time\b[^>]*\bdatetime\s*=\s*["\']([0-9]{4}-[0-9]{2}-[0-9]{2}[^"\']*)["\']',
    re.IGNORECASE,
)
META_ARTICLE_PUBLISHED_RE = re.compile(
    r'<meta\b[^>]*\bproperty\s*=\s*["\']article:published_time["\'][^>]*\bcontent\s*=\s*["\']([^"\']+)["\']',
    re.IGNORECASE,
)
FILENAME_DATE_RE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-")


def parse_iso(s: str) -> datetime | None:
    s = s.strip()
    # Normalise : python fromisoformat accepte `YYYY-MM-DD` et `YYYY-MM-DDTHH:MM:SS`
    # mais pas le `Z` final → on le retire.
    if s.endswith("Z"):
        s = s[:-1]
    # Coupe la partie timezone (+HH:MM ou -HH:MM en fin)
    s_clean = re.sub(r"([+-]\d{2}:\d{2})$", "", s)
    try:
        return datetime.fromisoformat(s_clean)
    except ValueError:
        # Tente juste la date
        try:
            return datetime.strptime(s_clean[:10], "%Y-%m-%d")
        except ValueError:
            return None


def extract_date(path: pathlib.Path) -> tuple[datetime | None, str]:
    """Renvoie (date, source) où source ∈ {jsonld, time, meta, filename, mtime, none}."""
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        raw = ""

    m = DATEPUB_JSONLD_RE.search(raw)
    if m:
        d = parse_iso(m.group(1))
        if d:
            return d, "jsonld"

    m = TIME_DATETIME_RE.search(raw)
    if m:
        d = parse_iso(m.group(1))
        if d:
            return d, "time"

    m = META_ARTICLE_PUBLISHED_RE.search(raw)
    if m:
        d = parse_iso(m.group(1))
        if d:
            return d, "meta"

    m = FILENAME_DATE_RE.match(path.name)
    if m:
        try:
            d = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            return d, "filename"
        except ValueError:
            pass

    try:
        return datetime.fromtimestamp(path.stat().st_mtime), "mtime"
    except Exception:
        return None, "none"


def classify(age_days: int) -> tuple[str, str]:
    if age_days >= ERROR_DAYS:
        return "error", f"ARTICLE-STALE-24M : {age_days} jours (> 24 mois)"
    if age_days >= WARN_DAYS:
        return "warn", f"ARTICLE-STALE-12M : {age_days} jours (> 12 mois)"
    return "ok", ""


def audit_file(path: pathlib.Path, today: datetime) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "date": None,
        "source": "none",
        "age_days": None,
        "errors": [],
        "warnings": [],
    }
    d, src = extract_date(path)
    res["source"] = src
    if d is None:
        res["status"] = "error"
        res["errors"].append("DATE-MISSING : aucune date détectable (ni JSON-LD ni filename ni mtime)")
        return res
    res["date"] = d.strftime("%Y-%m-%d")
    age = (today - d).days
    res["age_days"] = age
    if age < 0:
        # Article daté dans le futur (publication programmée) : on tolère
        res["status"] = "ok"
        return res
    status, label = classify(age)
    if status == "error":
        res["status"] = "error"
        res["errors"].append(label)
    elif status == "warn":
        res["status"] = "warn"
        res["warnings"].append(label)
    return res


def main() -> None:
    if not ACTU.exists():
        print("[audit_articles_freshness] dossier actualites/ introuvable — skip")
        OUT_MD.parent.mkdir(parents=True, exist_ok=True)
        OUT_MD.write_text(
            "# Audit fraîcheur articles — Rapport\n\n_Pas de dossier `actualites/`._\n",
            encoding="utf-8",
        )
        OUT_JSON.write_text(
            json.dumps({"generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
                        "n_total": 0, "results": []}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return

    today = datetime.now()
    pages = sorted(ACTU.glob("*.html"))
    results = [audit_file(p, today) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_warn  = sum(1 for r in results if r["status"] == "warn")
    n_err   = sum(1 for r in results if r["status"] == "error")

    now = today.strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit fraîcheur articles — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Articles scannés : **{n_total}**",
        f"- ✅ OK (≤ 12 mois) : **{n_ok}**",
        f"- ⚠️  Warnings (12-24 mois — à rafraîchir) : **{n_warn}**",
        f"- ❌ Erreurs (> 24 mois — à archiver/refondre) : **{n_err}**",
        "",
        "## Règles",
        "",
        f"- Article > {ERROR_DAYS} jours (24 mois) → ERREUR",
        f"- Article > {WARN_DAYS} jours (12 mois) → WARN",
        "- Sources de date testées : JSON-LD `datePublished`, `<time datetime>`, "
        "`meta article:published_time`, nom de fichier `YYYY-MM-DD-*`, mtime",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    order = {"error": 0, "warn": 1, "ok": 2}
    for r in sorted(results, key=lambda x: (order.get(x["status"], 9), -(x["age_days"] or 0))):
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(
            f"### `{r['file']}`  ({r['date']}, source `{r['source']}`, "
            f"âge {r['age_days']} j)"
        )
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — tous les articles ont ≤ 12 mois._")
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
                "thresholds": {"warn_days": WARN_DAYS, "error_days": ERROR_DAYS},
                "results":   results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_articles_freshness] {n_ok}/{n_total} OK, "
        f"{n_warn} warn, {n_err} err"
    )
    print(f"Report: {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
