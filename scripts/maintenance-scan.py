#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
maintenance-scan.py — Agent IA Maintenance HELP! Confort
─────────────────────────────────────────────────────────
Scan le site (HTML/CSS/JS) + back-office + Edge Functions,
détecte les anomalies, écrit logs/scan-latest.json + scan-YYYY-MM-DD.json.
Le fichier admin-pro/maintenance.html lit le JSON pour afficher l'état live.

Usage :
    python3 scripts/maintenance-scan.py
    python3 scripts/maintenance-scan.py --verbose
    python3 scripts/maintenance-scan.py --root /chemin/du/repo
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────

PLACEHOLDERS = [
    "G-XXXXXXXXXX",
    "GTM-XXXXXXX",
    "YOUR_API_KEY",
    "TONIDREEL",
    "TON_SERVICE_ROLE_KEY",
    "vous@entreprise.fr",
    "vous@exemple.fr",
    "0321000000",
]

VALID_PHONE = "+33366100134"
PHONE_REGEX = re.compile(r"href=\"tel:([+0-9 .]+)\"")

CACHE_BUSTER_RX = re.compile(r"(styles\.css|hc-widgets\.js)\?v=(\d+)")

HEAVY_IMG_THRESHOLD = 500 * 1024     # 500 KB
HEAVY_HTML_THRESHOLD = 150 * 1024    # 150 KB
HEAVY_VIDEO_THRESHOLD = 10 * 1024 * 1024  # 10 MB

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"sk_live_[A-Za-z0-9]{20,}"),
    re.compile(r"EAAB[A-Za-z0-9]{30,}"),
    re.compile(r"AIza[A-Za-z0-9_-]{30,}"),
    re.compile(r"ghp_[A-Za-z0-9]{30,}"),
    re.compile(r"service_role.*[A-Za-z0-9]{40,}"),
]

CONSOLE_RX = re.compile(r"console\.(log|warn|error|debug|info)\b")
META_DESC_RX = re.compile(
    r'<meta\s+name="description"\s+content="([^"]+)"', re.IGNORECASE
)
TITLE_RX = re.compile(r"<title>([^<]+)</title>", re.IGNORECASE)
CANONICAL_RX = re.compile(r'rel="canonical"', re.IGNORECASE)
VIEWPORT_RX = re.compile(r'name="viewport"', re.IGNORECASE)


# ─────────────────────────────────────────────────────────────────────
# SCAN
# ─────────────────────────────────────────────────────────────────────

def is_html(p: Path) -> bool:
    return p.suffix.lower() == ".html"

def list_html(root: Path):
    """Toutes les pages HTML (site public + admin-pro), hors scripts/tmp."""
    for p in root.rglob("*.html"):
        s = str(p)
        if "/node_modules/" in s or "/.git/" in s or "/scripts/tmp/" in s:
            continue
        yield p

def scan_file(path: Path, root: Path) -> dict:
    """Inspecte une page HTML et retourne ses findings."""
    rel = str(path.relative_to(root))
    findings = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return {"file": rel, "findings": [
            {"severity": "critical", "code": "READ_ERROR",
             "msg": f"Impossible de lire le fichier : {e}"}
        ]}

    size = path.stat().st_size

    # Placeholders non remplacés
    for ph in PLACEHOLDERS:
        if ph in text:
            findings.append({"severity": "critical", "code": "PLACEHOLDER",
                             "msg": f"Placeholder non remplacé : {ph}"})

    # Console.*
    cm = CONSOLE_RX.findall(text)
    if cm:
        findings.append({"severity": "important", "code": "CONSOLE_LOG",
                         "msg": f"{len(cm)} console.* en production"})

    # Téléphone parasite
    for m in PHONE_REGEX.finditer(text):
        num = m.group(1).replace(" ", "").replace(".", "")
        if num and num != VALID_PHONE and num != "+33366100134":
            findings.append({"severity": "critical", "code": "WRONG_PHONE",
                             "msg": f"Numéro tel: incorrect → {num}"})

    # Cache buster (collecté plus tard pour cohérence inter-pages)
    cbs = CACHE_BUSTER_RX.findall(text)

    # Meta description
    md = META_DESC_RX.search(text)
    if md:
        L = len(md.group(1))
        if L > 160:
            findings.append({"severity": "important", "code": "META_DESC_LONG",
                             "msg": f"Meta description {L} caractères (>160)"})
        elif L < 50:
            findings.append({"severity": "important", "code": "META_DESC_SHORT",
                             "msg": f"Meta description {L} caractères (<50)"})

    # Title
    tt = TITLE_RX.search(text)
    if tt:
        L = len(tt.group(1))
        if L > 70:
            findings.append({"severity": "important", "code": "TITLE_LONG",
                             "msg": f"Title {L} caractères (>70)"})
        elif L < 10:
            findings.append({"severity": "important", "code": "TITLE_SHORT",
                             "msg": f"Title {L} caractères (<10)"})

    # Canonical (skip admin-pro qui n'en a pas besoin)
    if not rel.startswith("admin-pro") and not CANONICAL_RX.search(text):
        findings.append({"severity": "important", "code": "NO_CANONICAL",
                         "msg": "Pas de balise <link rel=\"canonical\">"})

    # Viewport
    if not VIEWPORT_RX.search(text):
        findings.append({"severity": "critical", "code": "NO_VIEWPORT",
                         "msg": "Pas de meta viewport (responsive cassé)"})

    # Secrets potentiels
    for pat in SECRET_PATTERNS:
        if pat.search(text):
            findings.append({"severity": "critical", "code": "POSSIBLE_SECRET",
                             "msg": f"Secret potentiel : {pat.pattern[:30]}..."})

    # Lourd
    if size > HEAVY_HTML_THRESHOLD and not rel.startswith("admin-pro"):
        findings.append({"severity": "optimisation", "code": "HEAVY_HTML",
                         "msg": f"Page lourde : {size // 1024} KB"})

    return {"file": rel, "size": size, "findings": findings, "cache_busters": cbs}


def scan_assets(root: Path) -> list:
    """Détecte images/vidéos lourdes."""
    findings = []
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        for p in root.rglob(ext):
            if "/.git/" in str(p) or "/node_modules/" in str(p):
                continue
            s = p.stat().st_size
            if s > HEAVY_IMG_THRESHOLD:
                findings.append({
                    "severity": "important",
                    "code": "HEAVY_IMG",
                    "file": str(p.relative_to(root)),
                    "msg": f"Image {s // 1024} KB (>500 KB)"
                })
    for ext in ("*.mp4", "*.webm", "*.mov"):
        for p in root.rglob(ext):
            if "/.git/" in str(p):
                continue
            s = p.stat().st_size
            if s > HEAVY_VIDEO_THRESHOLD:
                findings.append({
                    "severity": "optimisation",
                    "code": "HEAVY_VIDEO",
                    "file": str(p.relative_to(root)),
                    "msg": f"Vidéo {s // (1024 * 1024)} MB (>10 MB)"
                })
    return findings


def scan_edge_functions(root: Path) -> list:
    """Vérifie cohérence des Edge Functions Supabase."""
    fn_dir = root / "supabase" / "functions"
    findings = []
    if not fn_dir.exists():
        return findings
    for fn in fn_dir.iterdir():
        if not fn.is_dir():
            continue
        index = fn / "index.ts"
        if not index.exists():
            findings.append({"severity": "important", "code": "FN_NO_INDEX",
                             "file": f"supabase/functions/{fn.name}",
                             "msg": "Edge Function sans index.ts"})
            continue
        txt = index.read_text(encoding="utf-8", errors="ignore")
        if "Access-Control-Allow-Origin" not in txt and fn.name != "sitemap":
            findings.append({"severity": "important", "code": "FN_NO_CORS",
                             "file": f"supabase/functions/{fn.name}/index.ts",
                             "msg": "Pas de CORS headers"})
        if "try" not in txt:
            findings.append({"severity": "critical", "code": "FN_NO_TRYCATCH",
                             "file": f"supabase/functions/{fn.name}/index.ts",
                             "msg": "Aucun bloc try/catch détecté"})
        for pat in SECRET_PATTERNS:
            if pat.search(txt):
                findings.append({"severity": "critical", "code": "FN_HARDCODED_SECRET",
                                 "file": f"supabase/functions/{fn.name}/index.ts",
                                 "msg": "Secret possiblement hardcodé"})
    return findings


def detect_cache_buster_drift(per_file: list) -> list:
    """Détecte si différentes pages chargent différentes versions de styles.css / hc-widgets.js."""
    findings = []
    by_resource: dict[str, Counter] = defaultdict(Counter)
    examples: dict[tuple, list] = defaultdict(list)
    for entry in per_file:
        for resource, version in entry.get("cache_busters", []):
            by_resource[resource][version] += 1
            examples[(resource, version)].append(entry["file"])
    for resource, counter in by_resource.items():
        if len(counter) > 1:
            majority = counter.most_common(1)[0]
            for version, cnt in counter.most_common():
                if version != majority[0]:
                    ex = ", ".join(examples[(resource, version)][:3])
                    findings.append({
                        "severity": "critical",
                        "code": "CACHE_BUSTER_DRIFT",
                        "msg": (f"{resource}?v={version} utilisé sur {cnt} page(s) "
                                f"alors que majorité est ?v={majority[0]} "
                                f"({majority[1]} pages). Ex: {ex}")
                    })
    return findings


# ─────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────

def compute_health_score(by_sev: Counter, distinct_critical_codes: int = 0) -> int:
    """Score sur 100 (capé). Pondération réaliste :
    - chaque CLASSE critique  : -15 (max -45)
    - findings important      : -1 par finding (max -30)
    - findings optimisation   : -0.3 par finding (max -10)
    """
    deduction = min(45, 15 * distinct_critical_codes)
    deduction += min(30, by_sev.get("important", 0))
    deduction += min(10, 0.3 * by_sev.get("optimisation", 0))
    return max(0, int(round(100 - deduction)))


def run(root: Path, verbose: bool = False) -> dict:
    started = datetime.now()
    all_findings = []
    per_file = []
    pages_scanned = 0

    for path in list_html(root):
        pages_scanned += 1
        result = scan_file(path, root)
        per_file.append(result)
        for f in result["findings"]:
            all_findings.append({"file": result["file"], **f})

    # Détection inter-fichiers
    for f in detect_cache_buster_drift(per_file):
        all_findings.append({"file": "[multi]", **f})

    # Assets
    for f in scan_assets(root):
        all_findings.append(f)

    # Edge Functions
    for f in scan_edge_functions(root):
        all_findings.append(f)

    by_sev = Counter(f["severity"] for f in all_findings)
    distinct_critical_codes = len({f["code"] for f in all_findings if f["severity"] == "critical"})
    health = compute_health_score(by_sev, distinct_critical_codes)

    summary = {
        "scanned_at": started.isoformat(timespec="seconds"),
        "duration_ms": int((datetime.now() - started).total_seconds() * 1000),
        "pages_scanned": pages_scanned,
        "total_findings": len(all_findings),
        "by_severity": dict(by_sev),
        "health_score": health,
        "findings": all_findings,
    }

    if verbose:
        print(f"[scan] {pages_scanned} pages scannées en {summary['duration_ms']}ms")
        print(f"[scan] {len(all_findings)} findings — score santé {health}/100")
        for f in all_findings[:20]:
            print(f"  [{f['severity']:>11}] {f.get('file','?'):40} — {f.get('msg','')}")

    return summary


def write_outputs(summary: dict, root: Path):
    logs = root / "logs"
    logs.mkdir(exist_ok=True)
    date = datetime.now().strftime("%Y-%m-%d")
    (logs / "scan-latest.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    (logs / f"scan-{date}.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))


def main():
    ap = argparse.ArgumentParser(description="Scan maintenance HELP! Confort")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    summary = run(root, verbose=args.verbose)
    write_outputs(summary, root)
    print(f"OK · score {summary['health_score']}/100 · "
          f"{summary['total_findings']} findings · "
          f"écrit dans logs/scan-latest.json")


if __name__ == "__main__":
    sys.exit(main())
