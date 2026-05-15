#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit JSON statique vs BDD — Sonde #11 (MEMOIRE_IA_MAINTENANCE.md).

Pour chaque `content/**/*.json` du repo, compte les entrées (lignes de la
liste racine, ou de la liste sous la première clé), et compare avec la
table Supabase correspondante.

Bug historique : `actualites.json` avait 5 articles alors que la BDD en
avait 17 → la vitrine affichait 5/17 articles ; l'agent n'avait pas
détecté la désynchro.

Approche :
  1. Lister tous les `content/**/*.json` (hors `config/`).
  2. Pour chaque fichier, compter les entrées (heuristique liste / dict
     wrapper).
  3. Lire le mtime du fichier (date dernière mise à jour locale).
  4. Si accès Supabase configuré (env `SUPABASE_URL` + `SUPABASE_ANON_KEY`),
     comparer avec `count` de la table correspondante (mapping configurable
     via `JSON_TABLE_MAP`). Sinon → log uniquement count local.
  5. Si écart > 10% → ALERTE *JSON-DESYNC*.

Sorties :
  - admin-pro/audits/audit_json_freshness_report.md
  - admin-pro/audits/audit_json_freshness_report.json
"""
from __future__ import annotations

import json
import os
import pathlib
import sys
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_json_freshness_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_json_freshness_report.json")

# Mapping JSON → table Supabase (best-effort, peut être étendu)
JSON_TABLE_MAP = {
    "content/actualites/index.json": ("articles", None),
    "content/realisations/index.json": ("realisations", None),
    "content/fournisseurs/index.json": ("fournisseurs", "fournisseurs"),  # sous-clé
    "content/apporteurs/index.json": ("apporteurs", "apporteurs"),
    "content/config/reviews.json": ("reviews", None),  # struct dict, count différemment
}

# Seuil d'alerte
DESYNC_THRESHOLD_PCT = 10.0


def count_entries(path: pathlib.Path, sub_key: str | None = None) -> tuple[int, str]:
    """Retourne (count, méthode utilisée)."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return -1, f"parse-error:{e}"

    if isinstance(data, list):
        return len(data), "list"

    if isinstance(data, dict):
        if sub_key and sub_key in data and isinstance(data[sub_key], list):
            return len(data[sub_key]), f"dict.{sub_key}[list]"
        # Heuristique : première valeur qui est une liste
        for k, v in data.items():
            if isinstance(v, list):
                return len(v), f"dict.{k}[list]"
        # Cas reviews.json : compte les sources (google/trustville…)
        return len(data), "dict[keys]"

    return -1, "unknown-type"


def fetch_supabase_count(table: str) -> tuple[int | None, str]:
    """Best-effort count via Supabase REST (HEAD + Range).

    Retourne (count, message). Sans réseau ou sans creds → (None, raison).
    """
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None, "no-creds"
    try:
        import urllib.request
        import urllib.error
        req = urllib.request.Request(
            f"{url}/rest/v1/{table}?select=id",
            method="HEAD",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Prefer": "count=exact",
                "Range-Unit": "items",
                "Range": "0-0",
            },
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            cr = resp.headers.get("Content-Range", "")
            # Format "0-0/N" ou "*/0"
            if "/" in cr:
                tail = cr.split("/")[-1].strip()
                if tail.isdigit():
                    return int(tail), "ok"
            return None, f"bad-content-range:{cr}"
    except urllib.error.URLError as e:
        return None, f"net-error:{e.reason}"
    except Exception as e:
        return None, f"error:{e}"


def main() -> int:
    content_root = ROOT / "content"
    json_files = sorted(content_root.rglob("*.json")) if content_root.exists() else []

    rows = []
    alerts = []
    for f in json_files:
        rel = f.relative_to(ROOT).as_posix()
        table, sub_key = JSON_TABLE_MAP.get(rel, (None, None))
        local_count, method = count_entries(f, sub_key)
        mtime = datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat(timespec="seconds")
        remote_count, remote_msg = (None, "skip:no-mapping")
        if table:
            remote_count, remote_msg = fetch_supabase_count(table)
        row = {
            "file": rel,
            "table": table,
            "local_count": local_count,
            "method": method,
            "mtime": mtime,
            "remote_count": remote_count,
            "remote_msg": remote_msg,
        }
        # Alerte si écart > seuil
        if isinstance(remote_count, int) and isinstance(local_count, int) and local_count > 0:
            diff = abs(local_count - remote_count)
            pct = (diff / max(local_count, remote_count)) * 100 if max(local_count, remote_count) else 0
            row["diff_pct"] = round(pct, 1)
            if pct > DESYNC_THRESHOLD_PCT:
                alerts.append({**row, "diff_pct": round(pct, 1)})
        rows.append(row)

    # Rapport markdown
    lines = []
    lines.append("# 📚 Audit JSON statique vs BDD — sonde #11")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append(f"- Fichiers JSON scannés : **{len(json_files)}**")
    has_creds = bool(os.environ.get("SUPABASE_URL") and (os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")))
    lines.append(f"- Accès Supabase : **{'✅ configuré' if has_creds else '❌ absent (log local uniquement)'}**")
    lines.append(f"- Alertes désync > {DESYNC_THRESHOLD_PCT}% : **{len(alerts)}**")
    lines.append("")

    if alerts:
        lines.append("## ❌ Fichiers désynchronisés")
        lines.append("")
        for a in alerts:
            lines.append(
                f"- `{a['file']}` → table **{a['table']}** : "
                f"local={a['local_count']} vs remote={a['remote_count']} "
                f"(écart {a['diff_pct']}%)"
            )
        lines.append("")
        lines.append("→ Action : régénérer le JSON via le script de sync, ou patcher la table.")
    else:
        if has_creds:
            lines.append("## ✅ Tous les JSON sont synchronisés avec la BDD")
        else:
            lines.append("## ℹ️ Pas d'accès Supabase — comparaison locale uniquement")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📊 Détail par fichier")
    lines.append("")
    lines.append("| Fichier | Table | Local | Remote | Δ % | Méthode | Dernière MAJ |")
    lines.append("|---------|-------|-------|--------|-----|---------|--------------|")
    for r in rows:
        remote = r["remote_count"] if r["remote_count"] is not None else f"_(`{r['remote_msg']}`)_"
        diff = f"{r['diff_pct']}%" if "diff_pct" in r else "—"
        table = r["table"] or "_(no-map)_"
        lines.append(
            f"| `{r['file']}` | {table} | {r['local_count']} | {remote} | "
            f"{diff} | `{r['method']}` | {r['mtime']} |"
        )

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned": len(json_files),
        "alerts": len(alerts),
        "supabase_creds": has_creds,
        "threshold_pct": DESYNC_THRESHOLD_PCT,
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Files={len(json_files)} Alerts={len(alerts)} Supabase={'ok' if has_creds else 'no'}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
