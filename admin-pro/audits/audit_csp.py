#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde IA #41 — Audit Content-Security-Policy whitelist
======================================================
Extrait tous les hosts externes utilisés sur les pages publiques racine
(<script src="https://...">, <link href="https://...">, <img src="https://...">,
fetch('https://...'), CSS url('https://...'), <iframe src="https://...">)
et croise avec les directives `script-src` / `style-src` / `img-src` /
`connect-src` / `frame-src` / `font-src` de `netlify.toml`.

Tout host trouvé en page mais ABSENT de la directive correspondante = ALERTE
CRITIQUE (CSP block silencieux → fonctionnalité cassée en prod).

Sortie : admin-pro/audits/audit_csp_report.md + .json
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from collections import defaultdict
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_csp_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_csp_report.json"
NETLIFY = ROOT / "netlify.toml"

# ----- Directives CSP à parser -------------------------------------------------
CSP_DIRECTIVES = [
    "script-src",
    "style-src",
    "img-src",
    "connect-src",
    "frame-src",
    "font-src",
    "media-src",
    "default-src",
]

# Regex pour extraire les hosts utilisés en HTML/CSS/JS
RE_SCRIPT = re.compile(r'<script\b[^>]*\bsrc\s*=\s*["\'](https?://[^"\']+)["\']', re.I)
RE_LINK   = re.compile(r'<link\b[^>]*\bhref\s*=\s*["\'](https?://[^"\']+)["\']', re.I)
RE_IMG    = re.compile(r'<img\b[^>]*\bsrc\s*=\s*["\'](https?://[^"\']+)["\']', re.I)
RE_IFRAME = re.compile(r'<iframe\b[^>]*\bsrc\s*=\s*["\'](https?://[^"\']+)["\']', re.I)
RE_FETCH  = re.compile(r"""(?:fetch|XMLHttpRequest\(\)\.open|axios\.[a-z]+|\.get|\.post)\s*\(\s*["'`](https?://[^"'`]+)["'`]""", re.I)
RE_CSS_URL = re.compile(r"""url\(\s*["']?(https?://[^"')]+)""", re.I)
RE_PRECONNECT = re.compile(r'<link\b[^>]*\brel\s*=\s*["\'](?:preconnect|dns-prefetch)["\'][^>]*\bhref\s*=\s*["\'](https?://[^"\']+)["\']', re.I)

# Pour chaque source HTML, à quelle directive CSP elle correspond
SRC_TO_DIRECTIVE = {
    "script": "script-src",
    "link-css": "style-src",
    "link-font": "font-src",
    "img": "img-src",
    "iframe": "frame-src",
    "fetch": "connect-src",
    "preconnect": "connect-src",
    "css-url": "style-src",  # ressources chargées via @font-face / background-image dans le CSS
}


def parse_csp_from_netlify(text: str) -> dict[str, set[str]]:
    """Extrait les directives CSP de la chaîne Content-Security-Policy de netlify.toml."""
    m = re.search(r'Content-Security-Policy\s*=\s*"([^"]+)"', text)
    if not m:
        return {}
    csp = m.group(1)
    directives: dict[str, set[str]] = {}
    for chunk in csp.split(";"):
        chunk = chunk.strip()
        if not chunk:
            continue
        parts = chunk.split(None, 1)
        name = parts[0].lower()
        sources = set()
        if len(parts) > 1:
            for s in parts[1].split():
                s = s.strip()
                if s:
                    sources.add(s.lower())
        directives[name] = sources
    return directives


def host_matches_directive(host: str, sources: set[str]) -> tuple[bool, str | None]:
    """Retourne (matched, matched_source).
    Supporte les wildcards style `https://*.supabase.co`."""
    host = host.lower()
    for src in sources:
        s = src.strip().lower()
        if s in ("'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:", "mediastream:", "filesystem:", "'none'", "https:", "http:"):
            # 'https:' matche tous les hosts en HTTPS
            if s == "https:":
                return True, s
            continue
        # netlify.toml peut mettre https://host ou simplement host
        cleaned = s.replace("https://", "").replace("http://", "").rstrip("/")
        if not cleaned:
            continue
        if cleaned.startswith("*."):
            suffix = cleaned[2:]
            if host == suffix or host.endswith("." + suffix):
                return True, s
        elif host == cleaned:
            return True, s
    return False, None


def detect_link_type(tag: str) -> str | None:
    """Détermine si un <link> déclenche une vérification CSP.
    Retourne None si le link n'est PAS soumis au CSP (canonical/icon/manifest/
    preconnect/dns-prefetch/alternate/sitemap/...) — ces hints n'engagent pas
    de ressource active."""
    t = tag.lower()
    m = re.search(r'\brel\s*=\s*["\']?([a-z0-9\- ]+)["\']?', t)
    rel = (m.group(1).strip() if m else "").split()
    rel_set = set(rel)
    # Links non concernés par CSP
    NON_CSP_RELS = {"canonical", "icon", "shortcut", "apple-touch-icon",
                    "mask-icon", "manifest", "alternate", "sitemap",
                    "preconnect", "dns-prefetch", "search", "me",
                    "prev", "next", "author", "license", "help"}
    if any(r in NON_CSP_RELS for r in rel_set):
        return None
    if "stylesheet" in rel_set:
        return "link-css"
    if "preload" in rel_set or "prefetch" in rel_set or "modulepreload" in rel_set:
        # CSP s'applique selon l'attribut `as`
        as_m = re.search(r'\bas\s*=\s*["\']?(font|style|script|image|fetch)["\']?', t)
        as_val = (as_m.group(1) if as_m else "").lower()
        return {
            "font":   "link-font",
            "style":  "link-css",
            "script": "script",
            "image":  "img",
            "fetch":  "fetch",
        }.get(as_val, "link-css")
    return None  # défaut : pas d'alerte


def extract_hosts_from_html(text: str) -> list[tuple[str, str, str]]:
    """Retourne une liste de (host, source_type, url_complet)."""
    out: list[tuple[str, str, str]] = []
    # Scripts
    for url in RE_SCRIPT.findall(text):
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, "script", url))
    # Links (CSS / font / preconnect)
    for m in re.finditer(r"<link\b[^>]*>", text, re.I):
        tag = m.group(0)
        href_m = re.search(r'\bhref\s*=\s*["\'](https?://[^"\']+)["\']', tag, re.I)
        if not href_m:
            continue
        url = href_m.group(1)
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, detect_link_type(tag), url))
    # Images
    for url in RE_IMG.findall(text):
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, "img", url))
    # Iframes
    for url in RE_IFRAME.findall(text):
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, "iframe", url))
    # Fetch/XHR/axios
    for url in RE_FETCH.findall(text):
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, "fetch", url))
    # CSS url()
    for url in RE_CSS_URL.findall(text):
        host = urlparse(url).hostname or ""
        if host:
            out.append((host, "css-url", url))
    return out


def main() -> int:
    if not NETLIFY.exists():
        print("netlify.toml introuvable")
        return 1
    csp = parse_csp_from_netlify(NETLIFY.read_text(encoding="utf-8", errors="replace"))
    if not csp:
        print("Aucune CSP trouvée dans netlify.toml")
        return 1

    # default-src fallback pour les directives manquantes
    default_src = csp.get("default-src", set())

    # Pages à scanner : racine publique uniquement (pas admin-pro)
    pages = sorted(p for p in ROOT.glob("*.html") if not p.name.startswith("test-"))

    alerts: list[dict] = []
    per_host: defaultdict[str, set[tuple[str, str]]] = defaultdict(set)
    per_directive: defaultdict[str, defaultdict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    scanned = 0

    for page in pages:
        scanned += 1
        text = page.read_text(encoding="utf-8", errors="replace")
        hosts = extract_hosts_from_html(text)
        for host, src_type, url in hosts:
            directive = SRC_TO_DIRECTIVE.get(src_type, "default-src")
            sources = csp.get(directive, default_src)
            matched, src = host_matches_directive(host, sources)
            per_host[host].add((src_type, page.name))
            per_directive[directive][host].add(page.name)
            if not matched:
                alerts.append({
                    "page": page.name,
                    "host": host,
                    "source_type": src_type,
                    "directive": directive,
                    "url_sample": url,
                })

    # ----- Rapport markdown ---------------------------------------------------
    lines = [
        "# 🛡️ Audit CSP whitelist — Sonde IA #41",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/audit_csp.py`*",
        "",
        f"**Pages scannées** : {scanned}",
        f"**Hosts externes distincts détectés** : {len(per_host)}",
        f"**Directives CSP parsées** : {', '.join(sorted(csp.keys()))}",
        f"**Alertes CSP block** : **{len(alerts)}**",
        "",
        "## 📋 Directives CSP actives (extrait netlify.toml)",
        "",
    ]
    for d in CSP_DIRECTIVES:
        if d in csp:
            lines.append(f"- **{d}** → {', '.join(sorted(csp[d])) if csp[d] else '(vide)'}")
    lines.extend(["", "## 🚨 Alertes (host non whitelisté)", ""])
    if alerts:
        lines.append("| Page | Host | Source | Directive attendue | URL |")
        lines.append("|------|------|--------|---------------------|-----|")
        for a in alerts:
            lines.append(f"| {a['page']} | `{a['host']}` | {a['source_type']} | {a['directive']} | `{a['url_sample']}` |")
    else:
        lines.append("✅ Aucune alerte — tous les hosts utilisés sont whitelistés.")
    lines.extend(["", "## 📊 Hosts par directive", ""])
    for d in CSP_DIRECTIVES:
        if d not in per_directive:
            continue
        lines.append(f"### {d}")
        for host, pages_set in sorted(per_directive[d].items()):
            matched, src = host_matches_directive(host, csp.get(d, default_src))
            mark = "✅" if matched else "❌"
            lines.append(f"- {mark} `{host}` — {len(pages_set)} page(s)")
        lines.append("")
    lines.extend([
        "## 🛠️ Procédure de correction",
        "",
        "Pour chaque host marqué ❌ :",
        "1. Vérifier qu'il est légitime (intentionnel + à jour).",
        "2. Ajouter le host à la directive CSP correspondante dans `netlify.toml`.",
        "3. Re-deployer Netlify, puis ré-exécuter ce script.",
        "",
        "*Sonde IA #41 — référence MEMOIRE_IA_MAINTENANCE.md addendum v9.*",
    ])

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "scanned": scanned,
        "alerts": alerts,
        "hosts_par_directive": {d: {h: sorted(ps) for h, ps in per_directive[d].items()} for d in per_directive},
        "csp_directives": {k: sorted(v) for k, v in csp.items()},
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Rapport généré : {OUT_MD.relative_to(ROOT)}")
    print(f"Pages scannées : {scanned} — Alertes : {len(alerts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
