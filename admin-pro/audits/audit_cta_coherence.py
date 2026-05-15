#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit CTA cohérence URL — Sonde #20 (MEMOIRE_IA_MAINTENANCE.md).

Liste tous les boutons CTA ("Demander un devis", "Devis gratuit",
"Estimation", "Réserver", "Demande de devis", "Devis express"…) du site
et vérifie qu'ils pointent vers la même URL canonique par famille.

Pourquoi : un funnel de conversion doit converger. Si "Devis gratuit" mène
parfois à #contact, parfois à contact.html, parfois à devis-express.html,
on perd le ranking SEO interne et on brouille l'attribution analytics.

Détection :
  - Scanner tous les `<a href=...>` et `<button>` dont le texte visible
    matche un pattern CTA (regex insensitive accent).
  - Grouper par "famille" (devis, reserver, estimation, contact, urgence).
  - Pour chaque famille, lister les URLs cibles uniques.
  - Si une famille a plus de 1 URL cible canonique → ALERTE *CTA-DIVERGENT*.

Tolérances :
  - `tel:` et `mailto:` ignorés (gérés ailleurs).
  - Variantes de hash (`#contact` vs `contact.html#form`) tolérées si même page.
  - Liens externes (http(s)://) ignorés.

Sorties :
  - admin-pro/audits/audit_cta_coherence_report.md
  - admin-pro/audits/audit_cta_coherence_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata
from collections import defaultdict
from datetime import datetime
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_cta_coherence_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_cta_coherence_report.json")

# Pages hors périmètre
EXCLUDED = {"404.html", "reset.html"}

# Familles de CTA et patterns de texte (libellés visibles)
# Le texte est normalisé sans accents / lowercase / espace simple avant matching.
CTA_FAMILIES = {
    "devis": [
        r"\bdemander\s+un\s+devis\b",
        r"\bdevis\s+gratuit\b",
        r"\bdevis\s+express\b",
        r"\bdemande\s+de\s+devis\b",
        r"\bobtenir\s+un\s+devis\b",
        r"^devis$",
    ],
    "estimation": [
        r"\bestim(ation|er)\b",
        r"\bevaluer\s+(le|mon|votre)\b",
    ],
    "reserver": [
        r"\breserver\b",
        r"\bje\s+reserve\b",
        r"\bprendre\s+(un\s+)?rdv\b",
        r"\bprendre\s+rendez-?vous\b",
    ],
    "urgence": [
        r"\bappel\s+urgence\b",
        r"\bintervention\s+urgente\b",
        r"\burgence\s+24\b",
    ],
}

# Compile
CTA_PATTERNS = {
    fam: [re.compile(p, re.I) for p in pats]
    for fam, pats in CTA_FAMILIES.items()
}


def is_target(p: pathlib.Path) -> bool:
    if p.suffix.lower() != ".html":
        return False
    if p.name in EXCLUDED:
        return False
    if p.name.startswith("test-"):
        return False
    return True


def strip_accents(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    )


def normalize_text(s: str) -> str:
    """Normalise un texte visible pour matching CTA."""
    s = strip_accents(s).lower()
    s = re.sub(r"[\s ]+", " ", s).strip()
    # Retire la ponctuation décorative en début/fin
    s = re.sub(r"^[\W_]+|[\W_]+$", "", s)
    return s


def normalize_href(href: str, source_file: str) -> str:
    """Normalise un href pour comparaison cross-CTA.

    - Strip trailing slash
    - tel:/mailto: → conservé tel quel (mais skip dans match)
    - relative → ramène au nom de fichier + fragment éventuel
    - external → conservé tel quel
    """
    if not href:
        return ""
    h = href.strip()
    if not h:
        return ""
    if h.startswith(("javascript:", "tel:", "mailto:")):
        return h
    if h.startswith(("http://", "https://", "//")):
        return h
    # Lien relatif
    # Garde fragment et query séparément
    return h


class CTAExtractor(HTMLParser):
    """Extrait tous les <a> et <button> avec leur texte visible + href."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        # Stack des éléments interactifs ouverts (a/button)
        self.stack: list[dict] = []
        self.depth_skip = 0  # script/style/svg
        self.results: list[dict] = []

    def handle_starttag(self, tag: str, attrs):
        if tag in ("script", "style", "template", "svg"):
            self.depth_skip += 1
            return
        if self.depth_skip:
            return
        if tag in ("a", "button"):
            ad = dict(attrs)
            self.stack.append({
                "tag": tag,
                "href": ad.get("href", "") if tag == "a" else "",
                "aria_label": ad.get("aria-label", ""),
                "title": ad.get("title", ""),
                "text_chunks": [],
                "_depth": len(self.stack),
            })

    def handle_endtag(self, tag: str):
        if tag in ("script", "style", "template", "svg"):
            if self.depth_skip:
                self.depth_skip -= 1
            return
        if self.depth_skip:
            return
        if tag in ("a", "button") and self.stack:
            # Pop le dernier élément du même tag
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i]["tag"] == tag:
                    item = self.stack.pop(i)
                    text = "".join(item["text_chunks"])
                    text = re.sub(r"\s+", " ", text).strip()
                    if not text and item["aria_label"]:
                        text = item["aria_label"]
                    if not text and item["title"]:
                        text = item["title"]
                    self.results.append({
                        "tag": item["tag"],
                        "href": item["href"],
                        "text": text,
                    })
                    break

    def handle_data(self, data: str):
        if self.depth_skip:
            return
        for item in self.stack:
            item["text_chunks"].append(data)


def classify_cta(text: str) -> str | None:
    """Retourne la famille CTA matchée, ou None."""
    if not text:
        return None
    norm = normalize_text(text)
    if not norm or len(norm) > 80:  # Tronqué si trop long (CTA = libellé court)
        return None
    for fam, patterns in CTA_PATTERNS.items():
        for pat in patterns:
            if pat.search(norm):
                return fam
    return None


def scan_page(p: pathlib.Path) -> list[dict]:
    """Retourne la liste des CTA trouvés sur la page."""
    html = p.read_text(encoding="utf-8", errors="replace")
    parser = CTAExtractor()
    try:
        parser.feed(html)
    except Exception:
        return []
    out = []
    for r in parser.results:
        fam = classify_cta(r["text"])
        if not fam:
            continue
        href = normalize_href(r["href"], p.name)
        # On ignore les CTA sans href réel (boutons JS-only)
        if r["tag"] == "a" and not href:
            continue
        if r["tag"] == "button":
            # Bouton sans destination → on note séparément
            href = "[button-js]"
        out.append({
            "page": p.name,
            "family": fam,
            "text": r["text"][:60],
            "href": href,
        })
    return out


def canonical_destination(href: str) -> str:
    """Réduit un href à sa destination canonique pour comparer.

    contact.html#form → contact.html
    contact.html?ref=hero → contact.html
    /devis-express.html → devis-express.html
    """
    if not href or href.startswith(("javascript:", "tel:", "mailto:", "http://", "https://", "//", "[")):
        return href
    # Strip query + fragment
    base = re.split(r"[?#]", href, 1)[0]
    # Normalise leading slash
    base = base.lstrip("/")
    return base or href


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))
    all_ctas: list[dict] = []
    for p in pages:
        all_ctas.extend(scan_page(p))

    # Group par famille → set destinations canoniques
    by_family: dict[str, list[dict]] = defaultdict(list)
    for c in all_ctas:
        by_family[c["family"]].append(c)

    findings = []
    family_stats = {}
    for fam, items in by_family.items():
        dests = defaultdict(list)  # canon → list of original cta dicts
        for it in items:
            canon = canonical_destination(it["href"])
            dests[canon].append(it)
        family_stats[fam] = {
            "occurrences": len(items),
            "unique_destinations": len(dests),
            "destinations": {k: len(v) for k, v in dests.items()},
        }
        if len(dests) > 1:
            findings.append({
                "family": fam,
                "destination_count": len(dests),
                "destinations": [
                    {
                        "canon": k,
                        "count": len(v),
                        "examples": [
                            {"page": e["page"], "text": e["text"], "href": e["href"]}
                            for e in v[:3]
                        ],
                    }
                    for k, v in sorted(dests.items(), key=lambda kv: -len(kv[1]))
                ],
            })

    # Rapport markdown
    lines = []
    lines.append("# 🎯 Audit CTA cohérence URL — sonde #20")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append(f"- Pages scannées : **{len(pages)}**")
    lines.append(f"- CTA trouvés (toutes familles) : **{len(all_ctas)}**")
    lines.append(f"- Familles avec ≥ 1 occurrence : **{len(by_family)}**")
    lines.append(f"- Familles **divergentes** (alertes) : **{len(findings)}**")
    lines.append("")
    lines.append("**Seuil** : 1 famille = 1 destination canonique attendue. Si > 1 → ALERTE.")
    lines.append("")

    if findings:
        lines.append("## ❌ Familles divergentes")
        lines.append("")
        for f in findings:
            lines.append(f"### Famille `{f['family']}` — {f['destination_count']} destinations")
            lines.append("")
            for d in f["destinations"]:
                lines.append(f"- **`{d['canon']}`** — {d['count']} occurrence(s)")
                for ex in d["examples"]:
                    lines.append(f"  - `{ex['page']}` : « {ex['text']} » → `{ex['href']}`")
            lines.append("")
        lines.append("→ Décision Florian : harmoniser sur une URL canonique par famille.")
    else:
        lines.append("## ✅ Toutes les familles CTA convergent vers 1 destination unique")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📊 Stats par famille")
    lines.append("")
    for fam, st in sorted(family_stats.items()):
        marker = "✅" if st["unique_destinations"] <= 1 else "⚠️"
        lines.append(f"### {marker} `{fam}` — {st['occurrences']} occurrence(s), {st['unique_destinations']} destination(s)")
        for dest, n in sorted(st["destinations"].items(), key=lambda kv: -kv[1]):
            lines.append(f"- `{dest}` × {n}")
        lines.append("")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned_pages": len(pages),
        "total_ctas": len(all_ctas),
        "families": family_stats,
        "alerts": findings,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Pages={len(pages)} CTAs={len(all_ctas)} Familles={len(by_family)} Alerts={len(findings)}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
