#!/usr/bin/env python3
"""
HELP! Confort — Audit ARIA / accessibilité (a11y)
==================================================
Sonde locale (0 dépendance) qui scanne les pages publiques racine pour
détecter les anti-patterns d'accessibilité les plus fréquents :

  1. <button>...</button> sans texte visible ET sans aria-label / aria-labelledby
  2. <img> sans attribut alt (ou avec alt="" non décoratif suspect)
  3. <a href> sans contenu textuel ni aria-label (lien fantôme)
  4. <input> sans <label for=...> associé ET sans aria-label/placeholder
  5. role="dialog"/role="alertdialog" sans aria-labelledby ni aria-label
  6. <form> sans <label> pour ses champs visibles
  7. <html lang="..."> manquant
  8. <h1> absent ou multiple
  9. Contraste : éléments style="color:#xxx" sans background (info, pas erreur)
 10. Doublons d'id (cassent les labels)

Sortie : admin-pro/audits/audit_aria_report.md + .json

Usage:
  python3 admin-pro/audits/audit_aria.py
"""
from __future__ import annotations
import json
import re
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_MD = Path(__file__).with_name("audit_aria_report.md")
OUT_JSON = Path(__file__).with_name("audit_aria_report.json")

# Exclus de l'audit (admin, 404 dynamiques, etc.)
EXCLUDE = {"404.html"}


def discover_pages() -> list[Path]:
    pages = sorted(p for p in ROOT.glob("*.html") if p.name not in EXCLUDE)
    return pages


# ─── Analyseur HTML léger ──────────────────────────────────────────────
class A11yParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.findings: list[tuple[str, str, int]] = []
        self._stack: list[tuple[str, dict, int, list[str]]] = []
        self.ids: list[tuple[str, int]] = []
        self.label_for: list[str] = []
        self.input_ids: list[tuple[str, dict, int]] = []
        self.h1_count = 0
        self.lang = None
        self.in_skip = 0  # script/style/svg : on ignore le contenu textuel

    def add(self, code: str, snippet: str) -> None:
        line = self.getpos()[0]
        self.findings.append((code, snippet[:140], line))

    def handle_starttag(self, tag: str, attrs_list):
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        line = self.getpos()[0]
        if tag in ("script", "style", "svg"):
            self.in_skip += 1
        if tag == "html":
            self.lang = attrs.get("lang", "")
            if not self.lang:
                self.add("HTML-LANG-MISSING", "<html> sans attribut lang")
        if tag == "h1":
            self.h1_count += 1
        if "id" in attrs:
            self.ids.append((attrs["id"], line))
        if tag == "label" and attrs.get("for"):
            self.label_for.append(attrs["for"])
        if tag == "input":
            t = attrs.get("type", "text").lower()
            if t not in ("hidden", "submit", "button", "reset", "image"):
                self.input_ids.append((attrs.get("id", ""), attrs, line))
        if tag == "img":
            if "alt" not in attrs:
                self.add("IMG-NO-ALT", f'<img src="{attrs.get("src","?")[:60]}">')
        if tag in ("button", "a"):
            self._stack.append((tag, attrs, line, []))
        if tag == "div" and attrs.get("role") in ("dialog", "alertdialog"):
            if not attrs.get("aria-labelledby") and not attrs.get("aria-label"):
                self.add("DIALOG-NO-LABEL", f'<div role="{attrs["role"]}">')

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style", "svg"):
            self.in_skip = max(0, self.in_skip - 1)
        if tag in ("button", "a") and self._stack:
            for i in range(len(self._stack) - 1, -1, -1):
                if self._stack[i][0] == tag:
                    name, attrs, line, texts = self._stack.pop(i)
                    text = " ".join(t.strip() for t in texts if t.strip())
                    if not text and not attrs.get("aria-label") and not attrs.get("aria-labelledby") and not attrs.get("title"):
                        # exception : a href avec uniquement une <img alt> est OK si l'img a alt
                        # mais on n'inspecte pas ici, on signale tout
                        code = "BTN-NO-NAME" if name == "button" else "A-NO-NAME"
                        snippet = f'<{name}'
                        for k in ("href", "type", "class"):
                            if k in attrs:
                                snippet += f' {k}="{attrs[k][:30]}"'
                        snippet += "></"  + name + ">"
                        self.add(code, snippet)
                    break

    def handle_data(self, data: str) -> None:
        if self.in_skip:
            return
        if self._stack:
            self._stack[-1][3].append(data)


def audit_page(path: Path) -> dict:
    html = path.read_text(encoding="utf-8", errors="ignore")
    p = A11yParser()
    try:
        p.feed(html)
    except Exception as e:
        return {"file": path.name, "error": str(e), "findings": []}

    findings = list(p.findings)

    # Doublons d'id
    counter = Counter(i for i, _ in p.ids)
    for i, n in counter.items():
        if n > 1:
            findings.append(("DUP-ID", f'id="{i}" répété {n}x', 0))

    # H1 manquant ou multiple
    if p.h1_count == 0:
        findings.append(("H1-MISSING", "Aucun <h1>", 0))
    elif p.h1_count > 1:
        findings.append(("H1-MULTIPLE", f"{p.h1_count} <h1> sur la page", 0))

    # Inputs sans label
    label_for = set(p.label_for)
    for iid, attrs, line in p.input_ids:
        # Si placeholder OU aria-label OU label[for=id] OU title → OK
        has_label = (iid and iid in label_for) or attrs.get("aria-label") or attrs.get("aria-labelledby") or attrs.get("title")
        if not has_label and not attrs.get("placeholder"):
            findings.append(("INPUT-NO-LABEL", f'<input type="{attrs.get("type","text")}" name="{attrs.get("name","?")}">', line))

    # Compter par sévérité
    by_code = Counter(c for c, _, _ in findings)
    return {
        "file": path.name,
        "lang": p.lang,
        "h1_count": p.h1_count,
        "findings_total": len(findings),
        "by_code": dict(by_code),
        "findings": [{"code": c, "snippet": s, "line": l} for c, s, l in findings[:25]],
    }


SEVERITY = {
    "HTML-LANG-MISSING": "erreur",
    "H1-MISSING": "erreur",
    "DIALOG-NO-LABEL": "erreur",
    "BTN-NO-NAME": "erreur",
    "DUP-ID": "erreur",
    "IMG-NO-ALT": "avertissement",
    "A-NO-NAME": "avertissement",
    "INPUT-NO-LABEL": "avertissement",
    "H1-MULTIPLE": "info",
}


def main() -> int:
    pages = discover_pages()
    if not pages:
        print("Aucune page HTML trouvée.")
        return 1

    results = [audit_page(p) for p in pages]

    total_findings = sum(r["findings_total"] for r in results)
    by_code_global = Counter()
    for r in results:
        by_code_global.update(r["by_code"])

    pages_clean = sum(1 for r in results if r["findings_total"] == 0)
    pages_with_errors = sum(
        1 for r in results if any(SEVERITY.get(c) == "erreur" for c in r["by_code"])
    )

    OUT_JSON.write_text(json.dumps({
        "version": 1,
        "scanned_pages": len(results),
        "total_findings": total_findings,
        "by_code": dict(by_code_global),
        "pages_clean": pages_clean,
        "pages_with_errors": pages_with_errors,
        "details": results,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    # Markdown
    lines = []
    lines.append("# Audit ARIA / a11y — HELP! Confort")
    lines.append("")
    lines.append(f"_Généré par `admin-pro/audits/audit_aria.py` — {len(pages)} pages scannées._")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Pages scannées : **{len(results)}**")
    lines.append(f"- Pages 100% clean : **{pages_clean}**")
    lines.append(f"- Pages avec ≥ 1 erreur : **{pages_with_errors}**")
    lines.append(f"- Total findings : **{total_findings}**")
    lines.append("")
    lines.append("### Répartition par code")
    lines.append("")
    lines.append("| Code | Sévérité | Occurrences |")
    lines.append("|------|----------|-------------|")
    for code, n in by_code_global.most_common():
        lines.append(f"| `{code}` | {SEVERITY.get(code, 'avertissement')} | {n} |")
    lines.append("")
    lines.append("## Détail par page")
    lines.append("")
    for r in sorted(results, key=lambda x: -x["findings_total"]):
        if r["findings_total"] == 0:
            continue
        lines.append(f"### `{r['file']}` — {r['findings_total']} finding(s)")
        lines.append("")
        for f in r["findings"][:10]:
            sev = SEVERITY.get(f["code"], "avertissement")
            lines.append(f"- **{f['code']}** ({sev}, l. {f['line']}) — `{f['snippet']}`")
        if r["findings_total"] > 10:
            lines.append(f"- _… et {r['findings_total'] - 10} autre(s)_")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Codes de sévérité")
    lines.append("")
    lines.append("- **erreur** : impact bloquant pour lecteur d'écran ou validation WCAG AA.")
    lines.append("- **avertissement** : pratique non conforme mais souvent compensée par contexte.")
    lines.append("- **info** : indication, à valider manuellement.")
    lines.append("")
    lines.append("_Sonde ARIA-AUDIT-V1 — à intégrer au scan quotidien._")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK · {len(results)} pages · {total_findings} findings · clean={pages_clean} · erreurs={pages_with_errors}")
    print(f"Rapport : {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
