#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit robots.txt + sitemap.xml — P10
====================================
Audit du couple robots.txt / sitemap.xml :

1. Vérifie que `robots.txt` à la racine existe + retourne 200 + autorise
   l'accès aux pages publiques principales (User-agent: * + Allow / pas
   de Disallow trop large).
2. Vérifie que `sitemap.xml` est servi en `application/xml` (ou
   `text/xml`) et qu'il est référencé dans `robots.txt` via la directive
   `Sitemap:`.
3. Croise les `<loc>` du sitemap avec les `*.html` racine du projet pour
   détecter les pages absentes (couvert aussi par la sonde #48 mais
   redondance utile ici).

Le script tente d'abord une requête HTTP vers https://www.depan59-62.fr/
pour valider en prod. Si pas d'accès réseau (sandbox CI), bascule sur
les fichiers locaux uniquement.

Sortie : admin-pro/audits/audit_robots_report.md (+ .json)

Zéro dépendance externe (urllib stdlib uniquement).
"""
from __future__ import annotations
import re
import json
import pathlib
import socket
import ssl
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_robots_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_robots_report.json"

SITE_URL = "https://www.depan59-62.fr"
TIMEOUT = 5
USER_AGENT = "Mozilla/5.0 (HC-AuditBot/1.0)"


def http_get(url: str) -> tuple[int, dict, str, str]:
    """Retourne (status, headers, body, error_msg). status=0 si KO réseau."""
    try:
        req = Request(url, method="GET", headers={"User-Agent": USER_AGENT})
        ctx = ssl.create_default_context()
        with urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status, dict(resp.headers), body, ""
    except HTTPError as e:
        return e.code, dict(e.headers or {}), "", str(e.reason)
    except (URLError, socket.timeout, ssl.SSLError, ConnectionError) as e:
        return 0, {}, "", type(e).__name__ + ": " + str(e)
    except Exception as e:
        return 0, {}, "", type(e).__name__ + ": " + str(e)


def parse_robots(text: str) -> dict:
    """Parse robots.txt → {agents: {ua: [(rule, path), ...]}, sitemaps: [...]}"""
    agents: dict[str, list[tuple[str, str]]] = {}
    sitemaps: list[str] = []
    current_ua: str | None = None
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        k = k.strip().lower()
        v = v.strip()
        if k == "user-agent":
            current_ua = v.lower()
            agents.setdefault(current_ua, [])
        elif k == "sitemap":
            sitemaps.append(v)
        elif k in ("allow", "disallow") and current_ua is not None:
            agents[current_ua].append((k, v))
    return {"agents": agents, "sitemaps": sitemaps}


def is_path_allowed(path: str, rules: list[tuple[str, str]]) -> bool:
    """Implémentation simplifiée : la règle la plus longue qui matche gagne."""
    best_match_len = -1
    allowed = True  # par défaut tout est autorisé (RFC robots)
    for rule, pat in rules:
        if not pat:
            continue
        # transforme * en .* et $ en fin
        regex_pat = re.escape(pat).replace(r"\*", ".*").replace(r"\$", "$")
        if re.match("^" + regex_pat, path):
            if len(pat) > best_match_len:
                best_match_len = len(pat)
                allowed = (rule == "allow")
    return allowed


def main() -> int:
    findings: list[dict] = []
    checks: list[dict] = []

    # ----- 1. robots.txt local ------------------------------------------------
    robots_path = ROOT / "robots.txt"
    if not robots_path.exists():
        findings.append({"sev": "CRITICAL", "msg": "robots.txt absent à la racine."})
        robots_text = ""
        robots_parsed = {"agents": {}, "sitemaps": []}
    else:
        robots_text = robots_path.read_text(encoding="utf-8", errors="replace")
        robots_parsed = parse_robots(robots_text)
        checks.append({"check": "robots.txt présent", "ok": True})

    # User-agent: * doit exister
    agents = robots_parsed["agents"]
    if "*" not in agents:
        findings.append({"sev": "HIGH", "msg": "Pas de User-agent: * — bots non couverts."})
    else:
        checks.append({"check": "User-agent: * présent", "ok": True})

    # Vérifier que les pages publiques principales sont autorisées
    test_paths = [
        "/", "/index.html", "/nos-prestations.html", "/contact.html",
        "/plombier-saint-omer.html", "/electricien-saint-omer.html",
        "/chauffagiste-saint-omer.html", "/serrurier-saint-omer.html",
        "/travaux-saint-omer.html", "/depannage-saint-omer.html",
        "/depannage-dunkerque.html", "/zones-intervention.html",
        "/a-propos.html", "/mentions-legales.html",
    ]
    star_rules = agents.get("*", [])
    blocked_public: list[str] = []
    for p in test_paths:
        if not is_path_allowed(p, star_rules):
            blocked_public.append(p)
    if blocked_public:
        findings.append({
            "sev": "HIGH",
            "msg": f"{len(blocked_public)} page(s) publique(s) bloquée(s) par robots.txt",
            "details": blocked_public,
        })
    else:
        checks.append({"check": f"{len(test_paths)} pages publiques principales autorisées", "ok": True})

    # Sitemap référencé
    if not robots_parsed["sitemaps"]:
        findings.append({"sev": "MED", "msg": "Directive `Sitemap:` absente de robots.txt — Google peut quand même trouver le sitemap mais c'est une bonne pratique de l'expliciter."})
    else:
        checks.append({"check": f"Sitemap référencé dans robots.txt : {len(robots_parsed['sitemaps'])}", "ok": True})

    # ----- 2. sitemap.xml local ----------------------------------------------
    sitemap_path = ROOT / "sitemap.xml"
    sitemap_locs: list[str] = []
    if not sitemap_path.exists():
        findings.append({"sev": "CRITICAL", "msg": "sitemap.xml absent à la racine."})
    else:
        try:
            tree = ET.parse(sitemap_path)
            ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
            for loc in tree.iter(ns + "loc"):
                if loc.text:
                    sitemap_locs.append(loc.text.strip())
            checks.append({"check": f"sitemap.xml présent + bien formé ({len(sitemap_locs)} URLs)", "ok": True})
        except ET.ParseError as e:
            findings.append({"sev": "CRITICAL", "msg": f"sitemap.xml malformé : {e}"})

    # Vérifier que les pages racine sont dans le sitemap (sonde redondante #48)
    local_pages = sorted(
        p.name for p in ROOT.glob("*.html")
        if not p.name.startswith("test-") and p.name not in ("404.html",)
    )
    sitemap_filenames: set[str] = set()
    for loc in sitemap_locs:
        # Extraire le filename de l'URL
        m = re.search(r"/([^/?#]+\.html)(?:[?#]|$)", loc)
        if m:
            sitemap_filenames.add(m.group(1))
        elif loc.endswith("/") or loc.endswith(SITE_URL) or loc.endswith(SITE_URL + "/"):
            sitemap_filenames.add("index.html")
    missing_from_sitemap = [p for p in local_pages if p not in sitemap_filenames and p != "index.html"]
    # index.html → racine
    if "index.html" not in sitemap_filenames:
        # Tolérer racine slash
        racine_ok = any(loc.rstrip("/") == SITE_URL for loc in sitemap_locs)
        if not racine_ok:
            missing_from_sitemap.append("index.html")
    if missing_from_sitemap:
        findings.append({
            "sev": "MED",
            "msg": f"{len(missing_from_sitemap)} page(s) racine absente(s) du sitemap",
            "details": missing_from_sitemap[:20],
        })
    else:
        checks.append({"check": "Toutes les pages racine sont dans le sitemap", "ok": True})

    # ----- 3. Tests HTTP en prod (best-effort) -------------------------------
    prod_results: dict = {}
    for path in ("/robots.txt", "/sitemap.xml"):
        url = SITE_URL + path
        status, headers, body, err = http_get(url)
        ct = (headers.get("Content-Type") or headers.get("content-type") or "").lower()
        prod_results[path] = {"status": status, "content_type": ct, "error": err, "tested": True}
        if status == 0:
            # Sandbox sans réseau — pas une alerte
            checks.append({"check": f"{path} test HTTP prod : SKIPPED (no network: {err[:60]})", "ok": None})
        elif status != 200:
            findings.append({"sev": "HIGH", "msg": f"{path} → HTTP {status} en prod (attendu 200)."})
        else:
            checks.append({"check": f"{path} → HTTP 200 en prod", "ok": True})
            # content-type
            if path == "/sitemap.xml":
                if not any(t in ct for t in ("xml", "text/xml")):
                    findings.append({
                        "sev": "MED",
                        "msg": f"sitemap.xml content-type = `{ct}` (attendu application/xml ou text/xml)",
                    })
                else:
                    checks.append({"check": f"sitemap.xml content-type OK ({ct})", "ok": True})
            elif path == "/robots.txt":
                if "text/plain" not in ct and "text" not in ct:
                    findings.append({
                        "sev": "LOW",
                        "msg": f"robots.txt content-type = `{ct}` (attendu text/plain)",
                    })

    # ----- Rapport markdown ---------------------------------------------------
    sev_count = {"CRITICAL": 0, "HIGH": 0, "MED": 0, "LOW": 0}
    for f in findings:
        sev_count[f["sev"]] = sev_count.get(f["sev"], 0) + 1

    lines = [
        "# 🤖 Audit robots.txt + sitemap.xml — P10",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/audit_robots.py`*",
        "",
        f"**Findings totaux** : {len(findings)} ({sev_count['CRITICAL']} critical, {sev_count['HIGH']} high, {sev_count['MED']} med, {sev_count['LOW']} low)",
        f"**Vérifications OK** : {sum(1 for c in checks if c.get('ok') is True)}",
        f"**Vérifications skipped** : {sum(1 for c in checks if c.get('ok') is None)}",
        "",
        "## ✅ Vérifications réussies",
        "",
    ]
    for c in checks:
        mark = "✅" if c["ok"] is True else "⏭️"
        lines.append(f"- {mark} {c['check']}")
    if not findings:
        lines.extend(["", "## 🎉 Aucun problème détecté", ""])
    else:
        lines.extend(["", "## 🚨 Findings", ""])
        for f in findings:
            sev_emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MED": "🟡", "LOW": "🔵"}[f["sev"]]
            lines.append(f"- {sev_emoji} **{f['sev']}** : {f['msg']}")
            if "details" in f:
                for d in f["details"][:10]:
                    lines.append(f"  - `{d}`")

    lines.extend([
        "",
        "## 📋 robots.txt (extrait)",
        "",
        "```",
        robots_text[:600] + ("\n…(tronqué)" if len(robots_text) > 600 else ""),
        "```",
        "",
        "## 🌍 Tests HTTP prod",
        "",
        f"- `/robots.txt` → status {prod_results.get('/robots.txt', {}).get('status', '—')} content-type `{prod_results.get('/robots.txt', {}).get('content_type', '—')}`",
        f"- `/sitemap.xml` → status {prod_results.get('/sitemap.xml', {}).get('status', '—')} content-type `{prod_results.get('/sitemap.xml', {}).get('content_type', '—')}`",
        "",
        "## 🛠️ Procédure",
        "",
        "1. Si robots.txt absent → créer fichier racine standard.",
        "2. Si pages publiques bloquées → corriger les `Disallow` trop larges.",
        "3. Si sitemap absent → générer via script.",
        "4. Si content-type sitemap KO → ajouter override headers dans `netlify.toml`.",
        "",
        "*Item P10 — `AGENT_TODO.md`.*",
    ])

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "robots_present": robots_path.exists(),
        "sitemap_present": sitemap_path.exists(),
        "sitemap_urls_count": len(sitemap_locs),
        "robots_sitemaps_directives": robots_parsed["sitemaps"],
        "missing_from_sitemap": missing_from_sitemap,
        "blocked_public": blocked_public,
        "findings": findings,
        "checks_ok": [c["check"] for c in checks if c.get("ok") is True],
        "prod_http_tests": prod_results,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Rapport : {OUT_MD.relative_to(ROOT)}")
    print(f"Findings : {len(findings)} — OK : {sum(1 for c in checks if c.get('ok') is True)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
