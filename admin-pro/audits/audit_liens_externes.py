#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit liens externes cassés — P10
=================================
Crawle tous les <a href="https://..."> du site (hors social network connus
qui retournent souvent 403/429 aux bots) et teste un HEAD HTTP avec
timeout 5s. Liste les 4xx/5xx dans :

    admin-pro/audits/audit_liens_externes_report.md (+ .json)

Zéro dépendance externe (urllib stdlib uniquement).

Whitelist de domaines ignorés : Facebook, Instagram, LinkedIn, Twitter/X,
TikTok, YouTube — ces plateformes répondent fréquemment 403/429 ou
nécessitent du JS pour résoudre l'URL finale ; à tester manuellement.
"""
from __future__ import annotations
import re
import json
import pathlib
import socket
import ssl
from collections import defaultdict
from datetime import datetime
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_liens_externes_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_liens_externes_report.json"

# Domaines à ignorer (social networks et apps qui répondent mal aux bots)
WHITELIST_HOSTS = {
    "facebook.com", "www.facebook.com", "m.facebook.com", "fb.com",
    "instagram.com", "www.instagram.com",
    "linkedin.com", "www.linkedin.com",
    "twitter.com", "x.com", "www.x.com",
    "tiktok.com", "www.tiktok.com",
    "youtube.com", "www.youtube.com", "youtu.be",
    "wa.me", "api.whatsapp.com",  # WhatsApp redirect
}

# Regex extraction
RE_HREF = re.compile(r'<a\b[^>]*\bhref\s*=\s*["\'](https?://[^"\']+)["\']', re.I)
TIMEOUT = 5  # secondes
USER_AGENT = "Mozilla/5.0 (HC-AuditBot/1.0; +https://www.depan59-62.fr/)"


def host_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def is_social(url: str) -> bool:
    h = host_of(url)
    return any(h == w or h.endswith("." + w) for w in WHITELIST_HOSTS)


def normalize_url(url: str) -> str:
    """Retire fragments et trim espaces."""
    url = url.strip()
    if "#" in url:
        url = url.split("#", 1)[0]
    return url


def test_url(url: str) -> tuple[int, str]:
    """Teste un URL. Retourne (status, error_msg). status=0 si erreur DNS/timeout."""
    try:
        req = Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
        ctx = ssl.create_default_context()
        with urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            return resp.status, ""
    except HTTPError as e:
        # Certains sites refusent HEAD → re-essayer en GET
        if e.code in (405, 403, 501):
            try:
                req = Request(url, method="GET", headers={"User-Agent": USER_AGENT})
                with urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
                    return resp.status, ""
            except HTTPError as e2:
                return e2.code, str(e2.reason)
            except (URLError, socket.timeout, ssl.SSLError) as e2:
                return 0, type(e2).__name__ + ": " + str(e2)
        return e.code, str(e.reason)
    except (URLError, socket.timeout, ssl.SSLError, ConnectionError) as e:
        return 0, type(e).__name__ + ": " + str(e)
    except Exception as e:
        return 0, type(e).__name__ + ": " + str(e)


def main() -> int:
    pages = sorted(
        p for p in ROOT.glob("*.html")
        if not p.name.startswith("test-") and p.name != "404.html"
    )

    # Collecter tous les URLs distincts + pages qui les référencent
    url_to_pages: dict[str, set[str]] = defaultdict(set)
    skipped_social: set[str] = set()

    for page in pages:
        text = page.read_text(encoding="utf-8", errors="replace")
        for raw_url in RE_HREF.findall(text):
            url = normalize_url(raw_url)
            if not url.startswith(("http://", "https://")):
                continue
            if is_social(url):
                skipped_social.add(url)
                continue
            url_to_pages[url].add(page.name)

    results: list[dict] = []
    broken: list[dict] = []
    ok_count = 0
    test_total = len(url_to_pages)

    for i, (url, refs) in enumerate(sorted(url_to_pages.items()), 1):
        status, err = test_url(url)
        entry = {
            "url": url,
            "status": status,
            "error": err,
            "ok": 200 <= status < 400,
            "pages": sorted(refs),
        }
        results.append(entry)
        if entry["ok"]:
            ok_count += 1
        else:
            broken.append(entry)
        print(f"[{i}/{test_total}] {status or '---'}  {url[:90]}")

    # ----- Rapport markdown ---------------------------------------------------
    lines = [
        "# 🔗 Audit liens externes cassés — P10",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/audit_liens_externes.py`*",
        "",
        f"**Pages scannées** : {len(pages)}",
        f"**URLs externes uniques testés** : {test_total}",
        f"**URLs OK (2xx/3xx)** : {ok_count}",
        f"**URLs cassés (4xx/5xx/timeout/DNS)** : **{len(broken)}**",
        f"**URLs social-network ignorés** : {len(skipped_social)} (whitelist : facebook/instagram/linkedin/twitter/tiktok/youtube/whatsapp)",
        "",
        "## 🚨 Liens cassés",
        "",
    ]
    if broken:
        lines.append("| Status | URL | Pages | Erreur |")
        lines.append("|--------|-----|-------|--------|")
        for b in broken:
            pgs = ", ".join(b["pages"][:3]) + (f" (+{len(b['pages'])-3})" if len(b["pages"]) > 3 else "")
            err = (b["error"] or "")[:80]
            lines.append(f"| {b['status'] or '---'} | `{b['url'][:100]}` | {pgs} | {err} |")
    else:
        lines.append("✅ Aucun lien externe cassé détecté.")

    lines.extend([
        "",
        "## 📊 Statistiques",
        "",
        f"- Taux de succès : **{ok_count*100//max(test_total,1)} %** ({ok_count}/{test_total})",
        f"- URLs social-network non testés (à vérifier manuellement si nécessaire) : {len(skipped_social)}",
        "",
        "## 🛠️ Procédure de correction",
        "",
        "Pour chaque lien marqué cassé :",
        "1. Ouvrir l'URL dans un navigateur pour confirmer (timeout possible).",
        "2. Si 404 → trouver une URL de remplacement ou retirer le lien.",
        "3. Si 5xx → réessayer plus tard (peut-être temporaire).",
        "4. Si DNS/timeout → vérifier que le domaine existe encore.",
        "",
        "*Liens social-network (facebook/insta/etc.) doivent être testés manuellement — bloqués au crawl.*",
        "",
        "*Item P10 — `AGENT_TODO.md`.*",
    ])

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "scanned_pages": len(pages),
        "tested_urls": test_total,
        "ok": ok_count,
        "broken": broken,
        "skipped_social": sorted(skipped_social),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nRapport : {OUT_MD.relative_to(ROOT)}")
    print(f"Testés : {test_total} — OK : {ok_count} — Cassés : {len(broken)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
