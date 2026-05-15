#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synthèse mensuelle des audits — P10
===================================
Concatène les `*_report.md` les plus récents en un seul rapport
`admin-pro/audits/DIGEST_YYYY-MM.md` :

- Pour chaque audit présent : nom, date de génération, compteur de
  findings (extrait par heuristique), résumé des sections principales.
- Évolution vs mois précédent : compare le DIGEST_YYYY-MM-1.md s'il
  existe (delta nb findings par audit).

Usage:
    python3 admin-pro/audits/digest_mensuel.py
    python3 admin-pro/audits/digest_mensuel.py --month 2026-05

Zéro dépendance externe.
"""
from __future__ import annotations
import re
import json
import argparse
import pathlib
from datetime import datetime, date

ROOT = pathlib.Path(__file__).resolve().parents[2]
AUDITS_DIR = ROOT / "admin-pro" / "audits"

# Compteurs de findings — heuristiques regex sur le contenu MD
#
# Stratégie en cascade (la 1ʳᵉ qui matche gagne) :
#   1) Compteur "total" explicite (Findings totaux / Total findings)
#   2) Somme erreurs + warnings (lighthouse, html5, aria)
#   3) Compteur unitaire (Alertes / Avertissements / URLs cassés / Findings)
#   4) Comptage de glyphes 🚨🔴 en dernier recours
PRIMARY_TOTAL_PATTERNS = [
    re.compile(r"\*\*Findings\s+totaux\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"Findings\s+totaux\s*:\s*\*\*?(\d+)\*\*?", re.I),
    re.compile(r"\*\*Total\s+findings\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"Total\s+findings\s*:\s*\*\*(\d+)\*\*", re.I),
]

# Patterns "erreurs" — capturent un compteur explicite d'erreurs
# Acceptent label en clair OU entouré de `**` (les rapports n'ont pas tous le même style).
ERRORS_PATTERNS = [
    re.compile(r"\*\*Erreurs\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"^[\-\*]?\s*Erreurs?[^:\n]*:\s*\*\*(\d+)\*\*", re.I | re.M),
    re.compile(r"\*\*(\d+)\s+erreurs?\*\*", re.I),
    re.compile(r"Pages\s+avec\s*[≥>=]?\s*1\s+erreur\s*:\s*\*\*(\d+)\*\*", re.I),
]

# Patterns "warnings / alertes / avertissements"
WARNINGS_PATTERNS = [
    re.compile(r"\*\*Warnings?\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"^[\-\*]?\s*Avertissements?[^:\n]*:\s*\*\*(\d+)\*\*", re.I | re.M),
    re.compile(r"\*\*Alertes(?:\s*\(?[^)]*\)?)?\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"^[\-\*]?\s*Alertes?[^:\n]*:\s*\*\*(\d+)\*\*", re.I | re.M),
    re.compile(r"\*\*(\d+)\s+warnings?\*\*", re.I),
    re.compile(r"Warnings?\s*:\s*\*\*(\d+)\*\*", re.I),
    re.compile(r"\*\*URLs\s+cassés?[^*]*\*\*\s*:\s*\*\*?(\d+)", re.I),
    re.compile(r"\*\*Findings[^*]*\*\*\s*:\s*\*?\*?(\d+)", re.I),
    re.compile(r"^[\-\*]?\s*Findings?[^:\n]*:\s*\*\*(\d+)\*\*", re.I | re.M),
]

GENERATED_PATTERN = re.compile(r"[Gg]énéré\s+(?:le\s+|par\s+`[^`]+`\s*[—-]\s*)?(\d{4}-\d{2}-\d{2}(?:\s\d{2}:\d{2})?)")


def _first_match(text: str, patterns: list[re.Pattern]) -> int | None:
    for pat in patterns:
        m = pat.search(text)
        if m:
            try:
                return int(m.group(1))
            except (ValueError, IndexError):
                continue
    return None


def extract_findings(text: str) -> int:
    """Retourne le nombre de findings selon une cascade d'heuristiques."""
    # 1) total explicite
    total = _first_match(text, PRIMARY_TOTAL_PATTERNS)
    if total is not None:
        return total
    # 2) somme erreurs + warnings (si l'un OU l'autre est trouvé)
    err = _first_match(text, ERRORS_PATTERNS)
    warn = _first_match(text, WARNINGS_PATTERNS)
    if err is not None or warn is not None:
        return (err or 0) + (warn or 0)
    # 3) dernier recours — comptage emojis d'alerte
    n = len(re.findall(r"🚨|🔴", text))
    return n


def extract_date(text: str) -> str:
    m = GENERATED_PATTERN.search(text)
    return m.group(1) if m else ""


def extract_title(text: str) -> str:
    m = re.search(r"^#\s+(.+)$", text, re.M)
    return m.group(1).strip() if m else "(sans titre)"


def extract_first_paragraph(text: str) -> str:
    """Premier paragraphe après l'en-tête générée (résumé court)."""
    # Skip titre + ligne de génération
    body = re.sub(r"^#.*$", "", text, count=1, flags=re.M).strip()
    body = re.sub(r"^\*Généré[^\n]*\*\s*", "", body, count=1, flags=re.M)
    paragraphs = re.split(r"\n\s*\n", body, maxsplit=4)
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith("##"):
            # Tronquer à 250 caractères max
            p = re.sub(r"\s+", " ", p)
            return p[:250] + ("…" if len(p) > 250 else "")
    return ""


def load_previous_digest(month: str) -> dict | None:
    """Cherche le digest du mois précédent (DIGEST_YYYY-MM.json) et retourne ses compteurs."""
    y, m = map(int, month.split("-"))
    if m == 1:
        prev = f"{y-1}-12"
    else:
        prev = f"{y}-{m-1:02d}"
    prev_json = AUDITS_DIR / f"DIGEST_{prev}.json"
    if prev_json.exists():
        try:
            return json.loads(prev_json.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--month", default=date.today().strftime("%Y-%m"),
                        help="Mois cible YYYY-MM (défaut : mois courant)")
    args = parser.parse_args()
    month = args.month

    OUT_MD = AUDITS_DIR / f"DIGEST_{month}.md"
    OUT_JSON = AUDITS_DIR / f"DIGEST_{month}.json"

    # ----- Collecter les rapports --------------------------------------------
    reports = sorted(AUDITS_DIR.glob("*_report.md"))
    if not reports:
        print("Aucun rapport trouvé dans", AUDITS_DIR)
        return 1

    digest_entries: list[dict] = []
    total_findings = 0

    for rep in reports:
        text = rep.read_text(encoding="utf-8", errors="replace")
        slug = rep.name.replace("_report.md", "")
        findings = extract_findings(text)
        total_findings += findings
        entry = {
            "audit": slug,
            "file": rep.name,
            "title": extract_title(text),
            "generated": extract_date(text),
            "findings": findings,
            "size_bytes": rep.stat().st_size,
            "summary": extract_first_paragraph(text),
        }
        digest_entries.append(entry)

    digest_entries.sort(key=lambda e: (-e["findings"], e["audit"]))

    # ----- Comparaison vs mois précédent -------------------------------------
    prev = load_previous_digest(month)
    prev_by_audit = {e["audit"]: e["findings"] for e in (prev.get("entries", []) if prev else [])}
    deltas: dict[str, int] = {}
    for e in digest_entries:
        if e["audit"] in prev_by_audit:
            deltas[e["audit"]] = e["findings"] - prev_by_audit[e["audit"]]
        else:
            deltas[e["audit"]] = None  # nouveau

    # ----- Rapport markdown ---------------------------------------------------
    lines = [
        f"# 📋 Digest audits — {month}",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/digest_mensuel.py`*",
        "",
        f"**Audits inclus** : {len(digest_entries)}",
        f"**Findings cumulés** : **{total_findings}**",
        f"**Comparaison vs mois précédent** : {'oui (' + (prev.get('month', '?')) + ')' if prev else 'aucun digest antérieur'}",
        "",
        "## 🏆 Vue d'ensemble",
        "",
        "| Audit | Findings | Δ vs précédent | Généré | Taille rapport |",
        "|-------|----------|----------------|--------|----------------|",
    ]
    for e in digest_entries:
        d = deltas.get(e["audit"])
        if d is None:
            delta_str = "🆕"
        elif d > 0:
            delta_str = f"⚠️ +{d}"
        elif d < 0:
            delta_str = f"✅ {d}"
        else:
            delta_str = "➖ 0"
        gen = e["generated"] or "—"
        size = f"{e['size_bytes']//1024} KB" if e["size_bytes"] >= 1024 else f"{e['size_bytes']} B"
        lines.append(f"| `{e['audit']}` | **{e['findings']}** | {delta_str} | {gen} | {size} |")

    lines.extend(["", "## 📑 Détail par audit", ""])
    for e in digest_entries:
        lines.append(f"### {e['title']}")
        lines.append("")
        lines.append(f"- **Source** : `{e['file']}`")
        lines.append(f"- **Findings** : {e['findings']}")
        lines.append(f"- **Généré** : {e['generated'] or '—'}")
        if e["summary"]:
            lines.append(f"- **Résumé** : {e['summary']}")
        lines.append("")

    # Évolution remarquable
    big_increases = [a for a, d in deltas.items() if d is not None and d >= 5]
    big_decreases = [a for a, d in deltas.items() if d is not None and d <= -5]
    new_audits = [a for a, d in deltas.items() if d is None]
    if big_increases or big_decreases or new_audits:
        lines.append("## 📈 Évolution remarquable")
        lines.append("")
        if big_increases:
            lines.append(f"- ⚠️ **Hausse ≥ 5 findings** : {', '.join('`' + a + '`' for a in big_increases)}")
        if big_decreases:
            lines.append(f"- ✅ **Baisse ≥ 5 findings** : {', '.join('`' + a + '`' for a in big_decreases)}")
        if new_audits and prev:
            lines.append(f"- 🆕 **Nouveaux audits ce mois** : {', '.join('`' + a + '`' for a in new_audits)}")
        lines.append("")

    lines.extend([
        "## 🛠️ Procédure",
        "",
        "1. Examiner en priorité les audits avec Δ positif (régression).",
        "2. Pour les audits 🆕, vérifier que le rapport est attendu (sinon faux positif).",
        "3. Ouvrir le rapport détaillé via le lien `Source` pour chaque audit en alerte.",
        "4. À chaque nouvelle sonde ajoutée à `MEMOIRE_IA_MAINTENANCE.md`, ajouter le `*_report.md` associé pour que ce digest l'intègre automatiquement.",
        "",
        "*Item P10 — `AGENT_TODO.md`. Lancer mensuellement le 1er de chaque mois ou à la demande.*",
    ])

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "month": month,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "total_findings": total_findings,
        "entries": digest_entries,
        "deltas": deltas,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Rapport : {OUT_MD.relative_to(ROOT)}")
    print(f"Audits inclus : {len(digest_entries)} — Findings cumulés : {total_findings}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
