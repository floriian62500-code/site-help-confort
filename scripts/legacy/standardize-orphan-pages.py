#!/usr/bin/env python3
"""
standardize-orphan-pages.py
---------------------------
Inject the standard hc-topbar + hc-header + footer-v3 blocks into a list
of orphan pages that lack them.

Source of truth: reseau-help-confort.html

Idempotent: if the page already has hc-topbar / hc-header / footer-v3, the
corresponding block is NOT re-injected.

Special cases:
- partenaires.html: has its own custom header — only inject the footer.
- 404.html: already has the standard footer-v3 — only inject topbar + header.

Run from project root:
    python3 scripts/standardize-orphan-pages.py
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "reseau-help-confort.html"

# Pages where we inject topbar + header + footer if missing.
FULL_INJECT = [
    "agence-dunkerque.html",
    "agence-saint-omer.html",
    "debouchage-canalisation.html",
    "diagnostic-electrique.html",
    "entretien-chaudiere.html",
    "nos-metiers.html",
    "nos-villes.html",
    "ouverture-porte-claquee.html",
    "panne-chaudiere.html",
]

# Page that already has its own header — only inject footer if missing.
FOOTER_ONLY = ["partenaires.html"]

# Page that already has footer — only inject topbar + header if missing.
HEADER_ONLY = ["404.html"]


def extract_block(html: str, start_pattern: str, end_tag: str) -> str:
    """Extract a block from html starting at the regex `start_pattern` and ending at `end_tag`."""
    m = re.search(start_pattern, html)
    if not m:
        raise RuntimeError(f"Cannot find start pattern: {start_pattern!r}")
    start = m.start()
    end = html.find(end_tag, start)
    if end == -1:
        raise RuntimeError(f"Cannot find end tag {end_tag!r} after start of {start_pattern!r}")
    return html[start:end + len(end_tag)]


def load_source_blocks() -> tuple[str, str, str]:
    src = SOURCE.read_text(encoding="utf-8")
    topbar = extract_block(src, r'<div class="hc-topbar"[^>]*>', "</div>\n</div>")
    # The above ends two </div> in: inner </div> then outer </div>. Confirm.
    # If it didn't match cleanly we fall back to a slower approach.
    if not topbar.startswith('<div class="hc-topbar"'):
        raise RuntimeError("Topbar extraction failed")

    header = extract_block(src, r'<header class="hc-header"[^>]*>', "</header>")
    footer = extract_block(src, r'<footer class="footer footer-v3"[^>]*>', "</footer>")
    return topbar, header, footer


def has_topbar(html: str) -> bool:
    return bool(re.search(r'<div class="hc-topbar"', html))


def has_hc_header(html: str) -> bool:
    return bool(re.search(r'<header class="hc-header"', html))


def has_footer_v3(html: str) -> bool:
    return bool(re.search(r'<footer class="footer footer-v3"', html))


def inject_topbar_and_header(html: str, topbar: str, header: str) -> tuple[str, list[str]]:
    """Insert topbar + header right after the <body...> tag (or after a hc-skip-link if present)."""
    changes = []
    # Prefer inserting AFTER the hc-skip-link anchor when present.
    skip_re = re.compile(r'(<a[^>]*class="[^"]*hc-skip-link[^"]*"[^>]*>.*?</a>)', re.DOTALL)
    body_re = re.compile(r'(<body[^>]*>)')

    block_parts = []
    if not has_topbar(html):
        block_parts.append(topbar)
        changes.append("topbar")
    if not has_hc_header(html):
        block_parts.append(header)
        changes.append("header")
    if not block_parts:
        return html, changes

    block = "\n" + "\n".join(block_parts) + "\n"

    m = skip_re.search(html)
    if m:
        idx = m.end()
        new_html = html[:idx] + block + html[idx:]
        return new_html, changes

    m = body_re.search(html)
    if not m:
        raise RuntimeError("No <body> tag found")
    idx = m.end()
    new_html = html[:idx] + block + html[idx:]
    return new_html, changes


def inject_footer(html: str, footer: str) -> tuple[str, bool]:
    if has_footer_v3(html):
        return html, False
    m = re.search(r'</body>', html)
    if not m:
        raise RuntimeError("No </body> tag found")
    idx = m.start()
    return html[:idx] + footer + "\n" + html[idx:], True


def process(file: Path, topbar: str, header: str, footer: str,
            do_topbar_header: bool, do_footer: bool) -> dict:
    result = {"file": file.name, "changes": [], "skipped": []}
    html = file.read_text(encoding="utf-8")
    new_html = html

    if do_topbar_header:
        new_html, ch = inject_topbar_and_header(new_html, topbar, header)
        result["changes"].extend(ch)
        if not ch:
            result["skipped"].append("topbar+header (already present)")
    if do_footer:
        new_html, did = inject_footer(new_html, footer)
        if did:
            result["changes"].append("footer")
        else:
            result["skipped"].append("footer (already present)")

    if new_html != html:
        file.write_text(new_html, encoding="utf-8")
        result["written"] = True
    else:
        result["written"] = False
    return result


def main() -> int:
    if not SOURCE.exists():
        print(f"ERROR: source file missing: {SOURCE}", file=sys.stderr)
        return 1

    topbar, header, footer = load_source_blocks()
    print(f"Extracted: topbar={len(topbar)}B  header={len(header)}B  footer={len(footer)}B")
    print()

    results = []
    for name in FULL_INJECT:
        f = ROOT / name
        if not f.exists():
            results.append({"file": name, "error": "missing"})
            continue
        results.append(process(f, topbar, header, footer,
                               do_topbar_header=True, do_footer=True))

    for name in FOOTER_ONLY:
        f = ROOT / name
        if not f.exists():
            results.append({"file": name, "error": "missing"})
            continue
        results.append(process(f, topbar, header, footer,
                               do_topbar_header=False, do_footer=True))

    for name in HEADER_ONLY:
        f = ROOT / name
        if not f.exists():
            results.append({"file": name, "error": "missing"})
            continue
        results.append(process(f, topbar, header, footer,
                               do_topbar_header=True, do_footer=False))

    # Report
    for r in results:
        if "error" in r:
            print(f"  ! {r['file']}: {r['error']}")
            continue
        ch = ",".join(r["changes"]) if r["changes"] else "(none)"
        sk = ",".join(r["skipped"]) if r["skipped"] else ""
        flag = "*" if r["written"] else " "
        print(f"  {flag} {r['file']:<32} changes=[{ch}]  skipped=[{sk}]")

    print()
    written = sum(1 for r in results if r.get("written"))
    print(f"Files written: {written} / {len(results)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
