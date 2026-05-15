#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #47 — SW version freshness.

Parse `sw.js` à la racine et :
  - Détecte le mode kill-switch (pas de `const VERSION`, présence d'un
    `unregister()`/skipWaiting()) : statut OK + info, pas d'alerte.
  - Sinon, extrait `const VERSION = '...'` et compare la date implicite à la
    date du dernier commit ayant modifié un asset (images/, assets/, og/).

Critère d'alerte :
  - Si SW versionné ET VERSION sémantique daté < dernier commit asset de plus
    de 7 jours → ALERTE *SW cache obsolète*.
  - Si pas d'asset committé depuis > 30 jours, on ne déclenche pas d'alerte
    (un repo dormant n'a pas besoin de bump SW).

Sortie :
  admin-pro/audits/audit_sw_version_report.md
  admin-pro/audits/audit_sw_version_report.json

Zéro dépendance externe. Utilise `git log --pretty=format:%cs` pour récupérer
les dates des derniers commits sur les répertoires d'assets.
"""
from __future__ import annotations
import json
import pathlib
import re
import subprocess
import sys
from datetime import datetime, timedelta, date

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_sw_version_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_sw_version_report.json"

SW_PATH = ROOT / "sw.js"
ASSET_DIRS = ("images", "assets", "og")

VERSION_RE = re.compile(r"""const\s+VERSION\s*=\s*['"]([^'"]+)['"]""")
DATE_IN_VERSION_RE = re.compile(r"(\d{4})[-./]?(\d{2})[-./]?(\d{2})")

STALE_DAYS = 7
DORMANT_DAYS = 30


def detect_killswitch(content: str) -> bool:
    """Heuristique : SW kill-switch = pas de VERSION + présence
    d'`unregister(` ou commentaire explicite "kill-switch"."""
    lower = content.lower()
    has_version = VERSION_RE.search(content) is not None
    if has_version:
        return False
    return ("kill-switch" in lower) or ("unregister(" in lower) or ("self.registration.unregister" in lower)


def parse_version_date(version: str) -> date | None:
    m = DATE_IN_VERSION_RE.search(version)
    if not m:
        return None
    try:
        return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    except ValueError:
        return None


def last_commit_date_for(rel_path: str) -> date | None:
    """Retourne la date (YYYY-MM-DD) du dernier commit sur rel_path, ou None
    si pas d'historique trouvé."""
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "log", "-1", "--pretty=format:%cs", "--", rel_path],
            capture_output=True, text=True, timeout=10,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    s = (out.stdout or "").strip()
    if not s:
        return None
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


def main() -> int:
    now = datetime.now()
    today = now.date()
    findings: list[dict] = []

    if not SW_PATH.exists():
        # Pas de service worker → pas d'audit.
        report = {
            "generated_at": now.isoformat(timespec="seconds"),
            "status": "NO_SW",
            "detail": "Aucun sw.js trouvé à la racine — audit non applicable.",
            "findings": [],
        }
        OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        OUT_MD.write_text(
            f"# Audit SW version — {now.strftime('%Y-%m-%d %H:%M')}\n\n"
            "Aucun `sw.js` à la racine du repo — audit non applicable.\n",
            encoding="utf-8",
        )
        print("[audit_sw_version] no sw.js — skip")
        return 0

    content = SW_PATH.read_text(encoding="utf-8", errors="replace")

    killswitch = detect_killswitch(content)
    version_match = VERSION_RE.search(content)
    version_str = version_match.group(1) if version_match else None
    version_date = parse_version_date(version_str) if version_str else None

    # Dernière date d'asset committée (max sur les 3 répertoires)
    asset_dates = {}
    for d in ASSET_DIRS:
        cdate = last_commit_date_for(d)
        if cdate:
            asset_dates[d] = cdate.isoformat()
    last_asset_commit = max((date.fromisoformat(v) for v in asset_dates.values()), default=None)

    # Logique d'alerte
    status = "ok"
    alert: dict | None = None
    if killswitch:
        status = "killswitch"
    elif version_str is None:
        status = "MISSING_VERSION"
        alert = {
            "code": "SW-NO-VERSION",
            "severity": "warning",
            "detail": "sw.js ne contient ni `const VERSION = '...'` ni mention de kill-switch.",
        }
        findings.append(alert)
    elif version_date is None:
        # Version présente mais non datable
        status = "version_undatable"
        alert = {
            "code": "SW-VERSION-UNDATABLE",
            "severity": "info",
            "detail": f"VERSION='{version_str}' ne contient pas de date interprétable (YYYY-MM-DD).",
        }
        findings.append(alert)
    elif last_asset_commit is None:
        status = "no_git_history"
    else:
        delta_days = (last_asset_commit - version_date).days
        if delta_days >= STALE_DAYS and (today - last_asset_commit).days < DORMANT_DAYS:
            status = "STALE"
            alert = {
                "code": "SW-CACHE-OBSOLETE",
                "severity": "warning",
                "detail": (
                    f"VERSION SW = {version_date.isoformat()} mais dernier commit "
                    f"d'asset = {last_asset_commit.isoformat()} (+{delta_days} jours). "
                    "Bumper `const VERSION` dans sw.js pour invalider le cache utilisateur."
                ),
                "version_date": version_date.isoformat(),
                "last_asset_commit": last_asset_commit.isoformat(),
                "gap_days": delta_days,
            }
            findings.append(alert)

    # ---------- Markdown ----------
    lines = []
    lines.append(f"# Audit SW version freshness — {now.strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append(f"- **Fichier audité** : `sw.js`")
    lines.append(f"- **Mode détecté** : `{'kill-switch' if killswitch else 'standard'}`")
    if version_str:
        lines.append(f"- **VERSION** : `{version_str}` "
                     f"(date interprétée : `{version_date.isoformat() if version_date else 'non datable'}`)")
    else:
        lines.append("- **VERSION** : *(non trouvée)*")
    if asset_dates:
        lines.append("- **Dernier commit par répertoire asset** :")
        for d, dt in sorted(asset_dates.items()):
            lines.append(f"  - `{d}/` → `{dt}`")
        if last_asset_commit:
            lines.append(f"- **Dernier commit asset global** : `{last_asset_commit.isoformat()}`")
    else:
        lines.append("- **Dernier commit asset** : *(historique git indisponible)*")
    lines.append(f"- **Statut** : `{status}`")
    lines.append("")

    if killswitch:
        lines.append("> ℹ️ SW en mode **kill-switch** — pas de cache versionné à entretenir. "
                     "Quand le SW reviendra (réintroduction de `const VERSION`), cet audit "
                     "vérifiera automatiquement la fraîcheur.")
        lines.append("")

    if findings:
        lines.append("## Alertes")
        lines.append("")
        for f in findings:
            icon = "❌" if f["severity"] == "error" else ("⚠️" if f["severity"] == "warning" else "ℹ️")
            lines.append(f"- {icon} **{f['code']}** — {f['detail']}")
        lines.append("")
    else:
        lines.append("## ✅ Aucune alerte")
        lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "audit": "sw_version",
        "generated_at": now.isoformat(timespec="seconds"),
        "killswitch": killswitch,
        "version_string": version_str,
        "version_date": version_date.isoformat() if version_date else None,
        "asset_last_commit_by_dir": asset_dates,
        "asset_last_commit_global": last_asset_commit.isoformat() if last_asset_commit else None,
        "status": status,
        "findings": findings,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"[audit_sw_version] status={status} findings={len(findings)}")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
