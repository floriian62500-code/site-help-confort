#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde IA #43 — Audit délais d'intervention promis
=================================================
Détecte les patterns commerciaux qui créent un engagement contractuel non
tenable (juridiquement exposant pour HC) du type :
  - « intervention sous 1h »
  - « rappel sous 5 min »
  - « réponse sous 30 minutes »
  - « en moins de 2h »
  - « délai moyen 45 minutes »

Tolère les patterns INFORMATIFS structurels :
  - 7j/7, 24h/24, Lun-Sam 8h-18h
  - durées de FORMULES (entretien annuel, contrat XX mois)
  - garantie XX ans / mois

Source décision : Florian, 15 mai 2026 — "retirer tous les délais présents sur
le site" (cf. MEMOIRE addendum v9 sonde #43).

Sortie : admin-pro/audits/audit_delais_report.md + .json
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_delais_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_delais_report.json"

# Patterns ALERTE — engagement de délai d'intervention
PATTERNS_ALERTE = [
    # « sous 1h », « sous 30 min », « sous 45 minutes »
    (re.compile(r"\bsous\s+(?:un|une|\d+)\s*(?:h|heures?|min|minutes?)\b", re.I),
     "engagement « sous X (h/min) »"),
    # « rappel sous » + tout
    (re.compile(r"\brappel(?:é|ée|ées|és)?\s+sous\b", re.I),
     "engagement « rappel sous … »"),
    # « réponse sous », « réponse en moins de »
    (re.compile(r"\bréponse\s+(?:sous|en\s+moins\s+de)\b", re.I),
     "engagement « réponse sous/en moins de »"),
    # « intervention sous », « intervention en moins de »
    (re.compile(r"\bintervention\s+(?:sous|en\s+moins\s+de)\s+\d", re.I),
     "engagement « intervention sous X »"),
    # « en moins de XX min/h »
    (re.compile(r"\ben\s+moins\s+de\s+\d+\s*(?:h|heures?|min|minutes?)\b", re.I),
     "engagement « en moins de X (h/min) »"),
    # « délai moyen X »
    (re.compile(r"\bd[ée]lai\s+moyen\s+(?:de\s+)?\d", re.I),
     "« délai moyen X »"),
    # « remise en service en X »
    (re.compile(r"\bremise\s+en\s+service\s+en\s+\d", re.I),
     "« remise en service en X »"),
    # « arrivée sur place sous »
    (re.compile(r"\barriv[ée]e?\s+sur\s+place\s+sous\b", re.I),
     "« arrivée sur place sous »"),
    # « garanti(e) X heures/minutes »
    (re.compile(r"\bgaranti(?:e|es|s)?\s+\d+\s*(?:h|heures?|min|minutes?)\b", re.I),
     "« garanti X h/min » (engagement)"),
    # « dans l'heure », « dans les 30 minutes »
    (re.compile(r"\bdans\s+l['’]heure\b", re.I),
     "« dans l'heure »"),
    (re.compile(r"\bdans\s+les?\s+\d+\s*(?:min|minutes?)\b", re.I),
     "« dans les X minutes »"),
]

# Patterns à TOLÉRER (info structurelle, pas un délai promis)
RE_TOLERE = re.compile(
    r"\b("
    r"7\s*j\s*/\s*7|"          # 7j/7
    r"24\s*h\s*/\s*24|"        # 24h/24
    r"7j7|24h24|"
    r"lun(?:di)?\s*-\s*sam(?:edi)?|"
    r"\d+\s*ans?\s+de\s+garantie|"
    r"garantie\s+\d+\s*(?:ans?|mois)|"
    r"contrat\s+\d+\s*(?:ans?|mois)"
    r")\b",
    re.I,
)


def is_tolere(snippet: str) -> bool:
    return bool(RE_TOLERE.search(snippet))


def strip_meta(text: str) -> str:
    """Retire blocs script/style/comments pour ne pas matcher dans du code/json."""
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"<script\b[^>]*>.*?</script>", "", text, flags=re.S | re.I)
    text = re.sub(r"<style\b[^>]*>.*?</style>", "", text, flags=re.S | re.I)
    return text


def scan_file(path: pathlib.Path) -> list[dict]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    text = strip_meta(raw)
    # Calcule l'offset entre raw et text pour retrouver la ligne d'origine
    findings = []
    for pat, label in PATTERNS_ALERTE:
        for m in pat.finditer(text):
            start = m.start()
            snippet = text[max(0, start - 60): start + len(m.group(0)) + 60]
            if is_tolere(snippet):
                continue
            # Position de ligne approximative (sur le raw original)
            # On retrouve une occurrence dans raw pour donner une ligne
            raw_idx = raw.find(m.group(0))
            line = raw[:raw_idx].count("\n") + 1 if raw_idx >= 0 else 0
            findings.append({
                "file": path.name,
                "line": line,
                "match": m.group(0).strip(),
                "label": label,
                "context": " ".join(snippet.split())[:200],
            })
    return findings


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if not p.name.startswith("test-"))
    all_findings: list[dict] = []
    per_file: defaultdict[str, int] = defaultdict(int)
    per_label: defaultdict[str, int] = defaultdict(int)

    for page in pages:
        findings = scan_file(page)
        for f in findings:
            all_findings.append(f)
            per_file[f["file"]] += 1
            per_label[f["label"]] += 1

    # ----- Rapport markdown ---------------------------------------------------
    lines = [
        "# ⏱️ Audit délais d'intervention promis — Sonde IA #43",
        "",
        f"*Généré le {datetime.now():%Y-%m-%d %H:%M} — `admin-pro/audits/audit_delais.py`*",
        "",
        f"**Pages scannées** : {len(pages)}",
        f"**Findings (promesses commerciales détectées)** : **{len(all_findings)}**",
        f"**Pages concernées** : {len(per_file)}",
        "",
        "## 🎯 Contexte",
        "",
        "Décision Florian 15 mai 2026 : retirer tous les délais d'intervention "
        "promis du site. Tout engagement chiffré (« sous 1h », « rappel sous "
        "30 min », « réponse en moins de 2h ») crée une obligation contractuelle "
        "non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.",
        "",
        "## 📊 Synthèse",
        "",
        "| Pattern | Occurrences |",
        "|---------|-------------|",
    ]
    for label, n in sorted(per_label.items(), key=lambda x: -x[1]):
        lines.append(f"| {label} | {n} |")
    if not per_label:
        lines.append("| ✅ Aucun pattern détecté | 0 |")
    lines.extend(["", "## 📋 Findings détaillés", ""])
    if all_findings:
        lines.append("| Fichier | Ligne | Pattern | Match | Contexte |")
        lines.append("|---------|------:|---------|-------|----------|")
        for f in all_findings:
            ctx = f["context"].replace("|", "\\|")
            lines.append(f"| `{f['file']}` | {f['line']} | {f['label']} | `{f['match']}` | …{ctx}… |")
    else:
        lines.append("✅ Aucune promesse de délai détectée — le site est conforme à la décision Florian 15/05.")
    lines.extend([
        "",
        "## 🛠️ Procédure de correction",
        "",
        "Pour chaque finding :",
        "1. Ouvrir le fichier à la ligne indiquée.",
        "2. Réécrire la phrase pour supprimer le délai chiffré.",
        "   Exemples de réécriture :",
        "   - « intervention sous 1h » → « intervention rapide »",
        "   - « rappel sous 5 min » → « rappel rapide »",
        "   - « réponse en moins de 2h » → « réponse au plus vite »",
        "   - « délai moyen 45 minutes » → (supprimer)",
        "3. Conserver les patterns INFO : `7j/7`, `24h/24`, `Lun-Sam 8h-18h`, garanties.",
        "",
        "*Sonde IA #43 — référence MEMOIRE_IA_MAINTENANCE.md addendum v9.*",
    ])

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps({
        "scanned": len(pages),
        "findings": all_findings,
        "per_file": dict(per_file),
        "per_label": dict(per_label),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Rapport généré : {OUT_MD.relative_to(ROOT)}")
    print(f"Pages scannées : {len(pages)} — Findings : {len(all_findings)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
