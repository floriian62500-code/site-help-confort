#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit double nav identique — Sonde #51 (MEMOIRE_IA_MAINTENANCE.md).

Détecte si 2 entrées de la navigation principale pointent vers des pages
sémantiquement très similaires (contenu redondant masqué derrière deux
libellés différents) → mauvaise UX (Hick's law) et SEO (cannibalisation).

Approche :
  1. Repérer la première `<nav>` "principale" de chaque page (header).
     Heuristique : `<nav class="hc-nav">`, sinon la première `<nav>` après
     le `<body>`.
  2. Lister tous les `<a href="X.html">` internes (hors `mailto:`, `tel:`,
     `#ancre`, sous-domaines, etc.).
  3. Pour chaque cible, lire le `<h1>` + la `meta description` de la page.
  4. Calculer la similarité Jaccard sur les tokens significatifs (≥ 3
     caractères, hors mots-outils FR).
  5. Si Jaccard(H1) > 0.70 OU Jaccard(meta+H1) > 0.80 → ALERTE.

Périmètre source : `index.html` (la nav y est canonique).

Sorties :
  - admin-pro/audits/audit_nav_doublon_report.md
  - admin-pro/audits/audit_nav_doublon_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata
from datetime import datetime
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_nav_doublon_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_nav_doublon_report.json")

# Seuils de similarité
THRESHOLD_H1 = 0.70
THRESHOLD_COMBINED = 0.80

# Mots-outils FR à filtrer pour la similarité
STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "du", "de", "et", "ou", "à", "au",
    "aux", "en", "sur", "pour", "par", "avec", "sans", "dans", "vers", "chez",
    "ce", "cet", "cette", "ces", "qui", "que", "quoi", "dont", "où", "votre",
    "vos", "notre", "nos", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa",
    "ses", "est", "sont", "etre", "être", "avoir", "fait", "faire", "tout",
    "tous", "toute", "toutes", "plus", "moins", "très", "tres", "vous", "nous",
    "ils", "elles", "elle", "lui", "leur", "leurs", "saint", "omer", "depan",
    "help", "confort", "depannage", "dépannage",
}

# Headers exclus pour éviter de matcher la nav d'erreur ou la sitemap admin
EXCLUDED_PAGES = {"404.html", "reset.html"}


def normalize(text: str) -> str:
    text = text.lower().strip()
    # retire les accents
    text = "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )
    return text


def tokenize(text: str) -> set[str]:
    text = normalize(text)
    tokens = re.findall(r"[a-z0-9]{3,}", text)
    return {t for t in tokens if t not in STOPWORDS}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


class NavExtractor(HTMLParser):
    """Extrait les `<a href>` de la première `<nav>` du document."""

    VOID = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.depth_nav = 0
        self.first_nav_done = False
        self.current_link: dict | None = None
        self.links: list[dict] = []
        self.preferred_nav_seen = False

    def handle_starttag(self, tag, attrs_list):
        tag = tag.lower()
        attrs = {k.lower(): (v or "") for k, v in attrs_list}

        if tag == "nav" and not self.first_nav_done:
            cls = attrs.get("class", "").lower()
            # Préférer hc-nav / nav-principale si présent, sinon premier <nav>
            if "hc-nav" in cls or "nav-principale" in cls or self.depth_nav == 0:
                self.depth_nav += 1
                if "hc-nav" in cls or "nav-principale" in cls:
                    self.preferred_nav_seen = True
            return

        if self.depth_nav > 0 and tag == "a":
            href = attrs.get("href", "").strip()
            if href:
                self.current_link = {"href": href, "label_parts": []}
            return

        if tag == "nav" and self.depth_nav > 0:
            self.depth_nav += 1

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "nav" and self.depth_nav > 0:
            self.depth_nav -= 1
            if self.depth_nav == 0:
                self.first_nav_done = True
            return
        if self.depth_nav > 0 and tag == "a" and self.current_link is not None:
            label = " ".join(self.current_link["label_parts"]).strip()
            self.current_link["label"] = label
            self.links.append(self.current_link)
            self.current_link = None

    def handle_data(self, data):
        if self.depth_nav > 0 and self.current_link is not None:
            txt = data.strip()
            if txt:
                self.current_link["label_parts"].append(txt)


def extract_meta(page: pathlib.Path) -> dict:
    """Extrait H1 + meta description d'une page."""
    try:
        html = page.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return {"h1": "", "meta": "", "title": ""}

    h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    h1 = re.sub(r"<[^>]+>", " ", h1_m.group(1)).strip() if h1_m else ""

    desc_m = re.search(
        r"""<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']+)""",
        html, re.I,
    )
    meta = desc_m.group(1).strip() if desc_m else ""

    title_m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    title = re.sub(r"<[^>]+>", " ", title_m.group(1)).strip() if title_m else ""

    return {"h1": h1[:300], "meta": meta[:300], "title": title[:200]}


def main() -> int:
    index = ROOT / "index.html"
    if not index.exists():
        print("FATAL: index.html introuvable", file=sys.stderr)
        return 2

    parser = NavExtractor()
    parser.feed(index.read_text(encoding="utf-8", errors="replace"))
    parser.close()

    # Filtre : liens internes vers .html (hors ancres, mailto, tel, external)
    internal = []
    seen_hrefs: set[str] = set()
    for link in parser.links:
        href = link["href"]
        if href.startswith(("mailto:", "tel:", "#", "javascript:")):
            continue
        if href.startswith(("http://", "https://")):
            # external (sauf si même domaine — heuristique non testable hors prod)
            continue
        # garder uniquement les *.html racine
        if "/" in href or "#" in href.split("?")[0]:
            # garder seulement le path avant ?/#
            href_norm = href.split("?")[0].split("#")[0]
        else:
            href_norm = href
        if not href_norm.endswith(".html"):
            continue
        if href_norm in EXCLUDED_PAGES:
            continue
        if href_norm in seen_hrefs:
            continue
        seen_hrefs.add(href_norm)
        link["href_norm"] = href_norm
        internal.append(link)

    # Charger meta pour chaque page cible
    pages_meta: dict[str, dict] = {}
    for link in internal:
        target = ROOT / link["href_norm"]
        if target.exists():
            pages_meta[link["href_norm"]] = extract_meta(target)
        else:
            pages_meta[link["href_norm"]] = {"h1": "", "meta": "", "title": "", "missing": True}

    # Croiser deux à deux
    findings: list[dict] = []
    keys = sorted(pages_meta.keys())
    for i, a in enumerate(keys):
        for b in keys[i + 1:]:
            ma = pages_meta[a]
            mb = pages_meta[b]
            if ma.get("missing") or mb.get("missing"):
                continue
            ja = jaccard(tokenize(ma["h1"]), tokenize(mb["h1"]))
            jc = jaccard(
                tokenize(ma["h1"] + " " + ma["meta"]),
                tokenize(mb["h1"] + " " + mb["meta"]),
            )
            if ja >= THRESHOLD_H1 or jc >= THRESHOLD_COMBINED:
                findings.append({
                    "a": a,
                    "b": b,
                    "jaccard_h1": round(ja, 3),
                    "jaccard_combined": round(jc, 3),
                    "h1_a": ma["h1"][:120],
                    "h1_b": mb["h1"][:120],
                })

    md = []
    md.append("# 🧭 Audit double nav identique — sonde #51")
    md.append("")
    md.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    md.append("")
    md.append(f"- Source nav : `index.html` ({'nav.hc-nav détectée' if parser.preferred_nav_seen else 'première `<nav>` du document'})")
    md.append(f"- Liens internes uniques scannés : **{len(internal)}**")
    md.append(f"- Pages cibles lues : **{sum(1 for v in pages_meta.values() if not v.get('missing'))}**")
    md.append(f"- Pages cibles manquantes : **{sum(1 for v in pages_meta.values() if v.get('missing'))}**")
    md.append(f"- Findings (similarité ≥ {THRESHOLD_H1:.2f} sur H1 ou ≥ {THRESHOLD_COMBINED:.2f} combiné) : **{len(findings)}**")
    md.append("")
    md.append("Règle : si 2 entrées de la nav principale pointent vers des pages ")
    md.append("dont les `<h1>` (ou H1+meta-description) ont une similarité Jaccard ")
    md.append("supérieure aux seuils, le funnel utilisateur est confus et le ")
    md.append("référencement risque la cannibalisation (Google ne sait pas laquelle ")
    md.append("ranker).")
    md.append("")

    if findings:
        md.append("## ⚠️ Doublons potentiels")
        md.append("")
        for f in findings:
            md.append(f"### `{f['a']}` ↔ `{f['b']}`")
            md.append("")
            md.append(f"- Jaccard H1 : **{f['jaccard_h1']}** · Jaccard combiné : **{f['jaccard_combined']}**")
            md.append(f"- H1 A : « {f['h1_a']} »")
            md.append(f"- H1 B : « {f['h1_b']} »")
            md.append("")
        md.append("→ Action : décider si l'une des 2 pages doit fusionner avec ")
        md.append("l'autre (redirect 301) ou si les contenus doivent être ")
        md.append("différenciés (H1/meta retravaillés).")
    else:
        md.append("## ✅ Aucun doublon détecté dans la nav principale")

    # Détails des liens scannés
    md.append("")
    md.append("## 📋 Liens nav scannés")
    md.append("")
    for link in internal:
        meta = pages_meta.get(link["href_norm"], {})
        if meta.get("missing"):
            tag = "❌ MANQUANT"
        else:
            tag = "✓"
        md.append(f"- {tag} `{link['href_norm']}` — « {link.get('label', '?')[:80]} »")

    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": "index.html",
        "links_scanned": len(internal),
        "findings_total": len(findings),
        "thresholds": {"h1": THRESHOLD_H1, "combined": THRESHOLD_COMBINED},
        "findings": findings,
        "links": [
            {"href": l["href_norm"], "label": l.get("label", ""),
             "missing": pages_meta.get(l["href_norm"], {}).get("missing", False)}
            for l in internal
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Links={len(internal)} Findings={len(findings)}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
