#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit `<img alt="">` strict — Sonde #55 (MEMOIRE_IA_MAINTENANCE.md).

Détecte les `<img>` dont l'alt est vide ("") MAIS qui sont à l'intérieur d'un
`<a>` ou `<button>` SANS texte visible adjacent et SANS `aria-label` / titre
sur le parent. C'est une violation WCAG 1.1.1 (Non-text Content) : le lien
ou le bouton n'a alors aucun nom accessible.

Cas valides (PAS d'alerte) :
  - `<img alt="">` purement décoratif hors `<a>` / `<button>`.
  - `<img alt="">` à l'intérieur d'un `<a>` ou `<button>` qui contient du
    texte visible (ex : `<a><img alt="">Voir plus</a>`).
  - `<img alt="">` avec `aria-hidden="true"` ou `role="presentation"`
    explicite, dont le parent porte lui-même `aria-label` / `title`.

Périmètre : `*.html` racine, hors `404.html`, `reset.html`, `test-*`.

Sorties :
  - admin-pro/audits/audit_alt_strict_report.md
  - admin-pro/audits/audit_alt_strict_report.json
"""
from __future__ import annotations

import json
import pathlib
import sys
from datetime import datetime
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_alt_strict_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_alt_strict_report.json")

EXCLUDED = {"404.html", "reset.html"}


def is_target(p: pathlib.Path) -> bool:
    if p.suffix.lower() != ".html":
        return False
    if p.name in EXCLUDED:
        return False
    if p.name.startswith("test-"):
        return False
    return True


class StrictAltParser(HTMLParser):
    """Parser qui collecte les couples (img alt="" ; ancêtre <a|button>)."""

    VOID = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }
    SKIP = {"script", "style", "svg", "template", "noscript"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        # Chaque entrée : {tag, attrs, line, text_chunks, contained_imgs}
        self.stack: list[dict] = []
        self.findings: list[dict] = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs_list):
        tag = tag.lower()
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        line = self.getpos()[0]

        if tag in self.SKIP:
            self.skip_depth += 1

        if self.skip_depth:
            if tag not in self.VOID:
                self.stack.append({"tag": tag, "attrs": attrs, "line": line, "text": [], "imgs": []})
            return

        if tag == "img":
            # Chercher le plus proche ancêtre <a> ou <button>
            ancestor = None
            for frame in reversed(self.stack):
                if frame["tag"] in ("a", "button"):
                    ancestor = frame
                    break
            self._check_img(attrs, line, ancestor)
            return

        if tag not in self.VOID:
            self.stack.append({"tag": tag, "attrs": attrs, "line": line, "text": [], "imgs": []})

    def handle_startendtag(self, tag, attrs_list):
        # <img /> self-closing
        if tag.lower() == "img":
            self.handle_starttag(tag, attrs_list)

    def handle_endtag(self, tag):
        tag = tag.lower()
        while self.stack and self.stack[-1]["tag"] != tag:
            self.stack.pop()
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()
        if tag in self.SKIP and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data: str):
        if self.skip_depth or not self.stack:
            return
        text = data.strip()
        if not text:
            return
        # Ajoute le texte à tous les ancêtres ouverts
        for frame in self.stack:
            frame["text"].append(text)

    def _check_img(self, attrs: dict, line: int, ancestor: dict | None) -> None:
        # On ne s'intéresse qu'aux <img alt=""> (alt présent mais vide)
        if "alt" not in attrs:
            return
        if attrs["alt"].strip():
            return  # alt non vide → hors périmètre de cette sonde

        # alt="" explicite : si décoratif hors lien/bouton → OK
        if ancestor is None:
            return

        # Si l'img porte aria-label non vide → elle s'auto-décrit
        if attrs.get("aria-label", "").strip():
            return

        # Sinon, vérifier que l'ancêtre <a>/<button> a un nom accessible
        a_attrs = ancestor["attrs"]
        has_aria_label = bool(a_attrs.get("aria-label", "").strip())
        has_aria_labelledby = bool(a_attrs.get("aria-labelledby", "").strip())
        has_title = bool(a_attrs.get("title", "").strip())
        # Texte visible déjà collecté pendant la lecture (avant la fermeture
        # de l'ancêtre, on n'a que ce qui précède l'img ; on ré-évalue le
        # texte final via post-traitement plus bas). Approximation : texte
        # collecté avant l'img + indication "ancêtre ouvert".
        text_so_far = " ".join(ancestor["text"]).strip()

        # On marque l'img comme suspecte. La décision finale (texte
        # APRÈS l'img) est faite au close de l'ancêtre, donc on stocke
        # une référence dans ancestor["imgs"].
        ancestor.setdefault("imgs", []).append({
            "line": line,
            "src": attrs.get("src", "")[:80],
            "text_before": text_so_far,
            "has_aria_label": has_aria_label,
            "has_aria_labelledby": has_aria_labelledby,
            "has_title": has_title,
            "ancestor_tag": ancestor["tag"],
            "ancestor_line": ancestor["line"],
        })

    def close(self):
        # Toute frame restant sur la pile = HTML mal fermé : flush
        while self.stack:
            self._flush_frame(self.stack.pop())
        super().close()

    def handle_endtag_flush(self, frame: dict):
        # Appelée quand on ferme un <a> ou <button> dans le flot normal
        self._flush_frame(frame)

    def _flush_frame(self, frame: dict) -> None:
        if frame["tag"] not in ("a", "button"):
            return
        imgs = frame.get("imgs") or []
        if not imgs:
            return
        final_text = " ".join(frame["text"]).strip()
        for img in imgs:
            ok = (
                bool(final_text)
                or img["has_aria_label"]
                or img["has_aria_labelledby"]
                or img["has_title"]
            )
            if not ok:
                self.findings.append({
                    "img_line": img["line"],
                    "ancestor": img["ancestor_tag"],
                    "ancestor_line": img["ancestor_line"],
                    "src": img["src"],
                    "issue": "WCAG-1.1.1: <img alt=''> dans <%s> sans nom accessible" % img["ancestor_tag"],
                })


# On surcharge handle_endtag pour flush au moment où on pop
_orig_handle_endtag = StrictAltParser.handle_endtag


def _patched_handle_endtag(self, tag):
    tag = tag.lower()
    while self.stack and self.stack[-1]["tag"] != tag:
        # Pop intermédiaire : flush si c'est un <a>/<button>
        self._flush_frame(self.stack.pop())
    if self.stack and self.stack[-1]["tag"] == tag:
        self._flush_frame(self.stack[-1])
        self.stack.pop()
    if tag in self.SKIP and self.skip_depth:
        self.skip_depth -= 1


StrictAltParser.handle_endtag = _patched_handle_endtag


def scan(page: pathlib.Path) -> list[dict]:
    parser = StrictAltParser()
    try:
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        parser.close()
    except Exception as exc:  # pragma: no cover
        return [{"img_line": 0, "ancestor": "PARSE-ERROR", "ancestor_line": 0,
                 "src": "", "issue": str(exc)[:120]}]
    return parser.findings


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))

    per_page: dict[str, list[dict]] = {}
    total = 0
    for p in pages:
        findings = scan(p)
        if findings:
            per_page[p.name] = findings
            total += len(findings)

    md = []
    md.append("# 🖼️ Audit `<img alt=\"\">` strict — sonde #55")
    md.append("")
    md.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    md.append("")
    md.append(f"- Pages scannées : **{len(pages)}**")
    md.append(f"- Pages avec findings : **{len(per_page)}**")
    md.append(f"- Findings totaux : **{total}**")
    md.append("")
    md.append("Règle WCAG 1.1.1 (Non-text Content) : un `<img alt=\"\">` dans un ")
    md.append("`<a>` ou `<button>` qui n'a pas de texte visible adjacent ni ")
    md.append("`aria-label` / `aria-labelledby` / `title` rend l'élément sans nom ")
    md.append("accessible (lecteur d'écran ne dit rien).")
    md.append("")

    if per_page:
        md.append("## ❌ Findings")
        md.append("")
        for fname, items in per_page.items():
            md.append(f"### `{fname}` ({len(items)})")
            md.append("")
            for it in items:
                src = it["src"] or "(sans src)"
                md.append(f"- L{it['img_line']:>5} — `<img alt=''>` ({src}) dans `<{it['ancestor']}>` L{it['ancestor_line']}")
            md.append("")
        md.append("→ Action : soit ajouter `aria-label=\"...\"` au `<a>`/`<button>` ")
        md.append("parent, soit ajouter du texte visible adjacent, soit remplacer ")
        md.append("`alt=\"\"` par une vraie description si l'image est porteuse de ")
        md.append("sens.")
    else:
        md.append("## ✅ Aucun `<img alt=\"\">` orphelin dans un lien/bouton")

    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned": len(pages),
        "pages_with_findings": len(per_page),
        "findings_total": total,
        "per_page": per_page,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Scanned={len(pages)} Pages={len(per_page)} Findings={total}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not per_page else 1


if __name__ == "__main__":
    sys.exit(main())
