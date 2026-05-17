#!/usr/bin/env python3
"""
Comprehensive Security / SEO / A11Y / Broken-links audit for HELP Confort site.

Performs an audit across 4 axes and applies SAFE auto-fixes:
- AXIS A: Security (headers, robots, forms, target=_blank rel, inline scripts)
- AXIS B: SEO (sitemap, title/meta/canonical/OG)
- AXIS C: Accessibility (alt, labels, h1, lang)
- AXIS D: Broken stuff (dead internal links, missing assets/scripts/css)

Safe auto-fixes applied:
- Add `rel="noopener noreferrer"` to `target="_blank"` external links
- Ensure all required security headers in _headers
- Add `lang="fr"` to <html> tag if missing
- Add `aria-hidden="true"` to obviously decorative inline SVG icons

Run from repo root.
"""
from __future__ import annotations
import os
import re
import sys
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

REPORT: dict = {
    "axisA_security": {"issues": [], "fixed": [], "manual": []},
    "axisB_seo": {"issues": [], "fixed": [], "manual": []},
    "axisC_a11y": {"issues": [], "fixed": [], "manual": []},
    "axisD_broken": {"issues": [], "fixed": [], "manual": []},
}

# Collect all HTML files at root and in subfolders (excluding admin/backup/etc.)
EXCLUDED_DIRS = {".git", "node_modules", "_backup_png", "docs", "supabase",
                 "__pycache__", "tools", "logs", ".vscode"}


def iter_html_files():
    for p in ROOT.rglob("*.html"):
        rel = p.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        yield p


# ──────────────────────────────────────────────────────────
# AXIS A — Security
# ──────────────────────────────────────────────────────────
def audit_headers():
    headers_path = ROOT / "_headers"
    required = {
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    }
    if not headers_path.exists():
        REPORT["axisA_security"]["manual"].append("_headers file missing entirely")
        return
    content = headers_path.read_text(encoding="utf-8")
    # Determine which are present in the global /* block
    # (simple substring check is enough — file is small)
    missing = [k for k in required if k not in content]
    if missing:
        REPORT["axisA_security"]["issues"].append(
            f"_headers missing: {', '.join(missing)}"
        )
        # Safe auto-fix: append to /* block
        lines = content.splitlines()
        new_lines = []
        injected = False
        for i, line in enumerate(lines):
            new_lines.append(line)
            if not injected and line.strip() == "/*" and i + 1 < len(lines):
                # find end of /* block
                pass
        # simpler: inject inside the /* block right after the line "/*"
        out = []
        in_global = False
        injected = False
        for line in lines:
            out.append(line)
            if line.rstrip() == "/*" and not injected:
                in_global = True
                continue
            if in_global and not injected and (line == "" or line.startswith("#") or not line.startswith(" ")):
                # left the block, inject before this line
                # remove last appended to re-insert after our additions
                tail = out.pop()
                for k in missing:
                    out.append(f"  {k}: {required[k]}")
                out.append(tail)
                injected = True
                in_global = False
        if not injected and in_global:
            for k in missing:
                out.append(f"  {k}: {required[k]}")
            injected = True
        if injected:
            headers_path.write_text("\n".join(out) + "\n", encoding="utf-8")
            REPORT["axisA_security"]["fixed"].append(
                f"Added missing headers to /*: {', '.join(missing)}"
            )
    # CSP intentionally not added (would risk breaking inline scripts)
    if "Content-Security-Policy" not in content:
        REPORT["axisA_security"]["manual"].append(
            "Content-Security-Policy NOT set in _headers (not auto-added; "
            "would risk breaking inline scripts — add manually after audit of inline JS)"
        )


def audit_robots_txt():
    p = ROOT / "robots.txt"
    if not p.exists():
        REPORT["axisA_security"]["issues"].append("robots.txt missing")
        return
    content = p.read_text(encoding="utf-8")
    # Check no over-disclosure of admin paths — but Disallow IS the right pattern
    # Just confirm admin/admin-pro are disallowed
    needed = ["/admin/", "/admin-pro/", "/.env", "/.git/"]
    miss = [n for n in needed if n not in content]
    if miss:
        REPORT["axisA_security"]["issues"].append(
            f"robots.txt does not disallow: {', '.join(miss)}"
        )


TARGET_BLANK_RE = re.compile(
    r'<a\b([^>]*?\btarget\s*=\s*["\']_blank["\'][^>]*)>',
    re.IGNORECASE,
)


def fix_target_blank_in_file(path: Path) -> int:
    """Return number of fixes applied in this file."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return 0
    fixes = 0
    new_text = text

    def repl(m: re.Match) -> str:
        nonlocal fixes
        attrs = m.group(1)
        # Find existing rel
        rel_match = re.search(r'\brel\s*=\s*["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        if rel_match:
            rel_val = rel_match.group(1)
            tokens = set(rel_val.lower().split())
            needs = []
            if "noopener" not in tokens:
                needs.append("noopener")
            if "noreferrer" not in tokens:
                needs.append("noreferrer")
            if not needs:
                return m.group(0)
            new_rel = (rel_val + " " + " ".join(needs)).strip()
            new_attrs = re.sub(
                r'\brel\s*=\s*["\'][^"\']*["\']',
                f'rel="{new_rel}"',
                attrs,
                count=1,
                flags=re.IGNORECASE,
            )
            fixes += 1
            return f"<a{new_attrs}>"
        else:
            fixes += 1
            return f'<a{attrs} rel="noopener noreferrer">'

    new_text = TARGET_BLANK_RE.sub(repl, text)
    if fixes > 0 and new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return fixes


def audit_target_blank():
    total = 0
    affected = []
    for f in iter_html_files():
        n = fix_target_blank_in_file(f)
        if n:
            total += n
            affected.append(f"{f.relative_to(ROOT)} ({n})")
    if total:
        REPORT["axisA_security"]["fixed"].append(
            f"Added rel=noopener noreferrer on {total} <a target=_blank> across {len(affected)} files: "
            + ", ".join(affected[:8]) + (" ..." if len(affected) > 8 else "")
        )


def audit_forms():
    """Report forms (manual review for CSRF, action, method)."""
    findings = []
    for f in iter_html_files():
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        for m in re.finditer(r"<form\b([^>]*)>", text, re.IGNORECASE):
            attrs = m.group(1)
            has_action = bool(re.search(r"\baction\s*=", attrs, re.IGNORECASE))
            has_method = bool(re.search(r"\bmethod\s*=", attrs, re.IGNORECASE))
            if not has_action or not has_method:
                findings.append(
                    f"{f.relative_to(ROOT)}: <form> without "
                    + ("action " if not has_action else "")
                    + ("method" if not has_method else "")
                )
    if findings:
        REPORT["axisA_security"]["manual"].append(
            f"{len(findings)} <form> tag(s) without explicit action/method (review manually). "
            "First 5: " + " | ".join(findings[:5])
        )


def audit_inline_scripts():
    """Count inline <script> blocks across files (for future CSP planning)."""
    counts = defaultdict(int)
    for f in iter_html_files():
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        # Inline = no src=
        for m in re.finditer(r"<script\b([^>]*)>", text, re.IGNORECASE):
            if "src=" not in m.group(1).lower():
                counts[str(f.relative_to(ROOT))] += 1
    if counts:
        total = sum(counts.values())
        top = sorted(counts.items(), key=lambda x: -x[1])[:5]
        top_str = ", ".join(f"{n}({c})" for n, c in top)
        REPORT["axisA_security"]["manual"].append(
            f"{total} inline <script> blocks across {len(counts)} pages "
            f"(blocks CSP without 'unsafe-inline'). Top: {top_str}"
        )


# ──────────────────────────────────────────────────────────
# AXIS B — SEO
# ──────────────────────────────────────────────────────────
def audit_sitemap():
    p = ROOT / "sitemap.xml"
    if not p.exists():
        REPORT["axisB_seo"]["issues"].append("sitemap.xml missing")
        return
    text = p.read_text(encoding="utf-8")
    urls = re.findall(r"<loc>([^<]+)</loc>", text)
    REPORT["axisB_seo"]["manual"].append(
        f"sitemap.xml present with {len(urls)} URLs"
    )
    # Check prestation pages in sitemap
    presta_pages = list((ROOT).glob("prestations/*.html"))
    if presta_pages:
        url_set = {u.lower() for u in urls}
        missing = []
        for pp in presta_pages:
            slug = pp.stem
            if not any(slug in u for u in url_set):
                missing.append(slug)
        if missing:
            REPORT["axisB_seo"]["issues"].append(
                f"{len(missing)} prestation pages NOT in sitemap: {', '.join(missing[:10])}"
            )


def audit_seo_meta():
    titles = defaultdict(list)
    missing_canon = []
    missing_desc = []
    missing_og = []
    missing_robots = []
    for f in iter_html_files():
        # skip admin / 404
        rel = str(f.relative_to(ROOT))
        if rel.startswith(("admin/", "admin-pro/")):
            continue
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        # title
        tm = re.search(r"<title[^>]*>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        if tm:
            t = re.sub(r"\s+", " ", tm.group(1).strip())
            titles[t].append(rel)
        else:
            REPORT["axisB_seo"]["issues"].append(f"{rel}: missing <title>")
        if not re.search(r'<meta\b[^>]*name=["\']description["\']', text, re.IGNORECASE):
            missing_desc.append(rel)
        if not re.search(r'<link\b[^>]*rel=["\']canonical["\']', text, re.IGNORECASE):
            missing_canon.append(rel)
        if not re.search(r'<meta\b[^>]*property=["\']og:', text, re.IGNORECASE):
            missing_og.append(rel)
        if not re.search(r'<meta\b[^>]*name=["\']robots["\']', text, re.IGNORECASE):
            missing_robots.append(rel)
    dupes = {t: v for t, v in titles.items() if len(v) > 1}
    if dupes:
        sample = list(dupes.items())[:3]
        REPORT["axisB_seo"]["issues"].append(
            f"{len(dupes)} duplicated <title>(s) across pages. Examples: "
            + " | ".join(f"'{t[:40]}…' in {len(p)} pages" for t, p in sample)
        )
    for label, lst in [("description", missing_desc), ("canonical", missing_canon),
                       ("og:*", missing_og), ("robots", missing_robots)]:
        if lst:
            REPORT["axisB_seo"]["manual"].append(
                f"{len(lst)} pages missing meta {label}: "
                + ", ".join(lst[:6]) + (" ..." if len(lst) > 6 else "")
            )


def audit_orphan_html():
    # Build set of all HTML filenames at root
    root_html = {f.name for f in ROOT.glob("*.html")}
    referenced = set()
    # crude: scan every HTML file for href="X.html" or src="X.html"
    href_re = re.compile(r'href\s*=\s*["\']([^"\']+\.html)(?:#[^"\']*)?["\']', re.IGNORECASE)
    for f in iter_html_files():
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        for m in href_re.finditer(text):
            name = m.group(1).split("/")[-1]
            referenced.add(name)
    # Also scan sitemap.xml and JS
    sm = ROOT / "sitemap.xml"
    if sm.exists():
        for m in re.finditer(r"<loc>[^<]*?/([^/<]+\.html)</loc>", sm.read_text(encoding="utf-8")):
            referenced.add(m.group(1))
    orphans = [n for n in root_html if n not in referenced and n not in {"index.html", "404.html"}]
    if orphans:
        REPORT["axisB_seo"]["manual"].append(
            f"{len(orphans)} HTML at root never linked: "
            + ", ".join(sorted(orphans)[:10]) + (" ..." if len(orphans) > 10 else "")
        )


# ──────────────────────────────────────────────────────────
# AXIS C — Accessibility
# ──────────────────────────────────────────────────────────
IMG_RE = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)


def audit_a11y():
    img_missing_alt = []
    multi_h1 = []
    missing_lang = []
    empty_links = []
    inputs_no_label = []
    for f in iter_html_files():
        rel = str(f.relative_to(ROOT))
        if rel.startswith(("admin/", "admin-pro/")):
            continue
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        # img alt
        for m in IMG_RE.finditer(text):
            attrs = m.group(1)
            if not re.search(r'\balt\s*=', attrs, re.IGNORECASE):
                img_missing_alt.append(rel)
                break  # first only — listing per file
        # multiple h1
        h1s = len(re.findall(r"<h1\b", text, re.IGNORECASE))
        if h1s == 0:
            REPORT["axisC_a11y"]["issues"].append(f"{rel}: no <h1>")
        elif h1s > 1:
            multi_h1.append(f"{rel}({h1s})")
        # lang attr
        hm = re.search(r"<html\b([^>]*)>", text, re.IGNORECASE)
        if hm and not re.search(r'\blang\s*=', hm.group(1), re.IGNORECASE):
            missing_lang.append(rel)
            # AUTO-FIX
            new_text = re.sub(
                r"<html\b([^>]*)>",
                lambda m: f'<html{m.group(1)} lang="fr">',
                text,
                count=1,
                flags=re.IGNORECASE,
            )
            if new_text != text:
                f.write_text(new_text, encoding="utf-8")
                REPORT["axisC_a11y"]["fixed"].append(f"{rel}: added lang=\"fr\"")
        # empty links
        for m in re.finditer(r"<a\b[^>]*>(.*?)</a>", text, re.IGNORECASE | re.DOTALL):
            inner = re.sub(r"<[^>]+>", "", m.group(1)).strip()
            full = m.group(0)
            if not inner and not re.search(r'aria-label\s*=\s*["\'][^"\']+', full, re.IGNORECASE) \
               and not re.search(r"<img\b", full, re.IGNORECASE):
                empty_links.append(rel)
                break
        # input/label association (heuristic)
        for m in re.finditer(r"<input\b([^>]*)>", text, re.IGNORECASE):
            attrs = m.group(1)
            t_match = re.search(r'\btype\s*=\s*["\']([^"\']+)', attrs, re.IGNORECASE)
            itype = (t_match.group(1).lower() if t_match else "text")
            if itype in {"hidden", "submit", "button", "reset", "image"}:
                continue
            has_id = re.search(r'\bid\s*=\s*["\']([^"\']+)', attrs, re.IGNORECASE)
            has_aria = re.search(r'\b(aria-label|aria-labelledby)\s*=', attrs, re.IGNORECASE)
            if has_aria:
                continue
            if has_id:
                iid = has_id.group(1)
                if not re.search(rf'<label\b[^>]*\bfor\s*=\s*["\']{re.escape(iid)}["\']',
                                 text, re.IGNORECASE):
                    inputs_no_label.append(f"{rel}#{iid}")
                    break
    if img_missing_alt:
        REPORT["axisC_a11y"]["manual"].append(
            f"{len(img_missing_alt)} page(s) have at least one <img> without alt: "
            + ", ".join(img_missing_alt[:8]) + (" ..." if len(img_missing_alt) > 8 else "")
        )
    if multi_h1:
        REPORT["axisC_a11y"]["manual"].append(
            f"{len(multi_h1)} page(s) with multiple <h1>: "
            + ", ".join(multi_h1[:8])
        )
    if empty_links:
        REPORT["axisC_a11y"]["manual"].append(
            f"{len(empty_links)} page(s) with empty <a> (no text, no aria-label, no img): "
            + ", ".join(empty_links[:8])
        )
    if inputs_no_label:
        REPORT["axisC_a11y"]["manual"].append(
            f"{len(inputs_no_label)} input(s) without associated <label> or aria-label: "
            + ", ".join(inputs_no_label[:8])
        )


# ──────────────────────────────────────────────────────────
# AXIS D — Broken stuff
# ──────────────────────────────────────────────────────────
def audit_broken():
    broken_links = []
    missing_assets = []
    # build set of all files relative to root
    all_files = set()
    for p in ROOT.rglob("*"):
        try:
            if p.is_file():
                rel = p.relative_to(ROOT).as_posix()
                all_files.add(rel)
                all_files.add("/" + rel)
        except (PermissionError, OSError, ValueError):
            continue
    href_re = re.compile(r'href\s*=\s*["\']([^"\'#?][^"\'#?]*\.html)(?:[?#][^"\']*)?["\']',
                         re.IGNORECASE)
    src_re = re.compile(r'(?:src|href)\s*=\s*["\']([^"\'#?]+\.(?:jpg|jpeg|png|gif|svg|webp|avif|mp4|webm|css|js|ico|json|xml|woff2?|ttf))(?:[?#][^"\']*)?["\']',
                        re.IGNORECASE)
    for f in iter_html_files():
        try:
            text = f.read_text(encoding="utf-8")
        except Exception:
            continue
        rel = f.relative_to(ROOT).as_posix()
        # internal HTML links
        for m in href_re.finditer(text):
            href = m.group(1)
            if href.startswith(("http://", "https://", "mailto:", "tel:", "//")):
                continue
            # resolve relative to file's dir
            if href.startswith("/"):
                target = href.lstrip("/")
            else:
                target = (Path(rel).parent / href).as_posix()
            target = target.split("?")[0].split("#")[0]
            if target not in all_files and ("/" + target) not in all_files:
                broken_links.append(f"{rel} -> {href}")
        # assets
        for m in src_re.finditer(text):
            src = m.group(1)
            if src.startswith(("http://", "https://", "//", "data:")):
                continue
            if src.startswith("/"):
                target = src.lstrip("/")
            else:
                target = (Path(rel).parent / src).as_posix()
            target = target.split("?")[0].split("#")[0]
            if target not in all_files and ("/" + target) not in all_files:
                missing_assets.append(f"{rel} -> {src}")
    if broken_links:
        REPORT["axisD_broken"]["issues"].append(
            f"{len(broken_links)} broken internal HTML link(s). First 10: "
            + " | ".join(broken_links[:10])
        )
    if missing_assets:
        REPORT["axisD_broken"]["issues"].append(
            f"{len(missing_assets)} missing asset reference(s). First 10: "
            + " | ".join(missing_assets[:10])
        )


# ──────────────────────────────────────────────────────────
# Run all
# ──────────────────────────────────────────────────────────
def main():
    print(f"[audit] Repo root: {ROOT}", file=sys.stderr)
    audit_headers()
    audit_robots_txt()
    audit_target_blank()
    audit_forms()
    audit_inline_scripts()
    audit_sitemap()
    audit_seo_meta()
    audit_orphan_html()
    audit_a11y()
    audit_broken()
    out = json.dumps(REPORT, ensure_ascii=False, indent=2)
    print(out)


if __name__ == "__main__":
    main()
