#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit `required` / `pattern` hors `<form>` — Sonde #25 (MEMOIRE_IA_MAINTENANCE.md).

Détecte les `<input>` (ou `<textarea>`, `<select>`) qui portent un attribut
`required` ou `pattern="..."` mais qui ne sont contenus dans AUCUN
`<form>...</form>`.

Pourquoi c'est un bug :
  - HTML5 ne déclenche la validation `required`/`pattern` que sur soumission
    d'un `<form>`. Hors form, l'attribut est ignoré silencieusement → faux
    sentiment de sécurité côté code, validation absente côté utilisateur.
  - Si un wizard JS multi-step bypasse le `<form>` natif, il doit assumer
    sa propre validation. Sinon, retirer `required`/`pattern` ou wrapper le
    bloc dans un `<form novalidate>`.

Périmètre : `*.html` racine, hors `404.html`, `reset.html`, `test-*`.

Sorties :
  - admin-pro/audits/audit_required_orphan_report.md
  - admin-pro/audits/audit_required_orphan_report.json
"""
from __future__ import annotations

import json
import pathlib
import sys
from datetime import datetime
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_required_orphan_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_required_orphan_report.json")

EXCLUDED = {"404.html", "reset.html"}
TARGET_TAGS = {"input", "textarea", "select"}
# input type hors périmètre (validation native sans intérêt)
SKIP_INPUT_TYPES = {"hidden", "button", "submit", "reset", "image"}


def is_target(p: pathlib.Path) -> bool:
    if p.suffix.lower() != ".html":
        return False
    if p.name in EXCLUDED:
        return False
    if p.name.startswith("test-"):
        return False
    return True


class OrphanFinder(HTMLParser):
    """Parser qui détecte les inputs/textarea/select required|pattern sans <form> ancêtre."""

    # tags void HTML5 (pas de fermeture)
    VOID = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.findings: list[dict] = []

    def handle_starttag(self, tag: str, attrs_list):
        tag = tag.lower()
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        line = self.getpos()[0]

        if tag in TARGET_TAGS:
            self._check(tag, attrs, line)

        if tag not in self.VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag: str, attrs_list):
        # Self-closing : <input ... />
        tag = tag.lower()
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        line = self.getpos()[0]
        if tag in TARGET_TAGS:
            self._check(tag, attrs, line)

    def handle_endtag(self, tag: str):
        tag = tag.lower()
        # Pop jusqu'à matcher (HTML mal formé toléré)
        while self.stack and self.stack[-1] != tag:
            self.stack.pop()
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()

    def _check(self, tag: str, attrs: dict, line: int) -> None:
        # Skip input types qui ne portent pas de validation utile
        if tag == "input":
            itype = attrs.get("type", "text").lower()
            if itype in SKIP_INPUT_TYPES:
                return

        has_required = "required" in attrs
        has_pattern = "pattern" in attrs
        if not (has_required or has_pattern):
            return

        in_form = "form" in self.stack
        # Tolérer si <input form="..."> pointe vers un form externe par id
        has_form_attr = bool(attrs.get("form", "").strip())

        if not in_form and not has_form_attr:
            triggers = []
            if has_required:
                triggers.append("required")
            if has_pattern:
                triggers.append(f"pattern={attrs.get('pattern', '')[:40]!r}")
            self.findings.append({
                "tag": tag,
                "line": line,
                "type": attrs.get("type", ""),
                "name": attrs.get("name", attrs.get("id", "")),
                "triggers": triggers,
            })


def scan(page: pathlib.Path) -> list[dict]:
    parser = OrphanFinder()
    try:
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        parser.close()
    except Exception as exc:  # pragma: no cover — robustesse
        return [{"tag": "PARSE-ERROR", "line": 0, "triggers": [str(exc)[:80]], "type": "", "name": ""}]
    return parser.findings


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))

    per_page: dict[str, list[dict]] = {}
    total_findings = 0
    for p in pages:
        findings = scan(p)
        if findings:
            per_page[p.name] = findings
            total_findings += len(findings)

    # ─── Rapport Markdown ────────────────────────────────────────────────
    md = []
    md.append("# 🔎 Audit `required` / `pattern` hors `<form>` — sonde #25")
    md.append("")
    md.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    md.append("")
    md.append(f"- Pages scannées : **{len(pages)}**")
    md.append(f"- Pages avec orphelins : **{len(per_page)}**")
    md.append(f"- Findings totaux : **{total_findings}**")
    md.append("")
    md.append("Règle : un `<input>` (ou `<textarea>`, `<select>`) qui porte ")
    md.append("`required` ou `pattern=\"...\"` doit être à l'intérieur d'un ")
    md.append("`<form>...</form>` OU porter un attribut `form=\"id-du-form\"`. ")
    md.append("Sinon, HTML5 n'applique aucune validation native → bug silencieux.")
    md.append("")

    if per_page:
        md.append("## ❌ Findings")
        md.append("")
        for fname, items in per_page.items():
            md.append(f"### `{fname}` ({len(items)})")
            md.append("")
            for it in items:
                trig = ", ".join(it["triggers"])
                label = it["name"] or "(sans name/id)"
                md.append(f"- L{it['line']:>5} — `<{it['tag']}>` `{label}` → {trig}")
            md.append("")
        md.append("→ Action : encapsuler dans `<form novalidate>...</form>` si la ")
        md.append("validation est gérée par JS (wizard), ou retirer `required` / ")
        md.append("`pattern` pour éviter le faux sentiment de sécurité.")
    else:
        md.append("## ✅ Aucun input orphelin avec `required` / `pattern`")

    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    # ─── Rapport JSON ────────────────────────────────────────────────────
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned": len(pages),
        "pages_with_findings": len(per_page),
        "findings_total": total_findings,
        "per_page": per_page,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Scanned={len(pages)} Pages={len(per_page)} Findings={total_findings}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not per_page else 1


if __name__ == "__main__":
    sys.exit(main())
