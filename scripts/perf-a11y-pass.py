#!/usr/bin/env python3
"""
Perf & A11y pass:
- Add loading="lazy" to <img> tags missing loading attribute (except first/eager/fetchpriority)
- Add width/height to <img> tags missing them when local file exists
- Add aria-label to <input> tags lacking labels
- Validate internal links / image refs
"""
import os
import re
from pathlib import Path
from urllib.parse import urlparse, unquote

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path("/sessions/youthful-charming-goldberg/mnt/SITE INTERNET")

# Collect HTML files: root + prestations/
html_files = sorted(ROOT.glob("*.html"))
html_files += sorted((ROOT / "prestations").glob("*.html"))

img_lazy_added = 0
img_dim_added = 0
input_aria_added = 0
files_changed = set()

INPUT_TAG_RE = re.compile(r'<input\b([^>]*?)/?>', re.IGNORECASE | re.DOTALL)
IMG_TAG_RE = re.compile(r'<img\b([^>]*?)/?>', re.IGNORECASE | re.DOTALL)
LABEL_INPUT_RE = re.compile(r'<label\b[^>]*>[^<]*<input\b[^>]*?>', re.IGNORECASE | re.DOTALL)

# Aria-label inference rules
ARIA_RULES = [
    # (regex on tag attrs, label)
    (re.compile(r'id\s*=\s*["\']chatTel["\']', re.I), "Numéro de téléphone"),
    (re.compile(r'id\s*=\s*["\']resa-presta-search["\']', re.I), "Rechercher une prestation"),
    (re.compile(r'type\s*=\s*["\']search["\']', re.I), "Rechercher"),
    (re.compile(r'name\s*=\s*["\']search["\']', re.I), "Rechercher"),
    (re.compile(r'(name|id)\s*=\s*["\'](tel|telephone|phone)["\']', re.I), "Numéro de téléphone"),
    (re.compile(r'(name|id)\s*=\s*["\']email["\']', re.I), "Adresse email"),
    (re.compile(r'(name|id)\s*=\s*["\']prenom["\']', re.I), "Prénom"),
    (re.compile(r'(name|id)\s*=\s*["\']nom["\']', re.I), "Nom"),
    (re.compile(r'(name|id)\s*=\s*["\']cp["\']', re.I), "Code postal"),
    (re.compile(r'(name|id)\s*=\s*["\']codepostal["\']', re.I), "Code postal"),
    (re.compile(r'(name|id)\s*=\s*["\']ville["\']', re.I), "Ville"),
    (re.compile(r'(name|id)\s*=\s*["\']adresse["\']', re.I), "Adresse"),
    (re.compile(r'(name|id)\s*=\s*["\']message["\']', re.I), "Votre message"),
    (re.compile(r'(name|id)\s*=\s*["\'](date|datedebut|datedeb)["\']', re.I), "Date"),
    (re.compile(r'(name|id)\s*=\s*["\'](heure|time)["\']', re.I), "Heure"),
    (re.compile(r'(name|id)\s*=\s*["\']societe["\']', re.I), "Société"),
    (re.compile(r'(name|id)\s*=\s*["\']rgpd["\']', re.I), "Consentement RGPD"),
    (re.compile(r'(name|id)\s*=\s*["\']newsletter["\']', re.I), "Inscription à la newsletter"),
]


def has_attr(attrs: str, name: str) -> bool:
    return re.search(r'\b' + re.escape(name) + r'\s*=', attrs, re.I) is not None


def get_attr(attrs: str, name: str):
    m = re.search(r'\b' + re.escape(name) + r'\s*=\s*["\']([^"\']*)["\']', attrs, re.I)
    return m.group(1) if m else None


def is_in_label(html: str, tag_start: int) -> bool:
    """Check if input is wrapped inside a <label>...</label>"""
    before = html[:tag_start]
    # Find last <label and last </label
    last_open = before.rfind('<label')
    last_close = before.rfind('</label>')
    if last_open == -1:
        return False
    if last_close == -1 or last_close < last_open:
        # We are inside a label
        return True
    return False


def infer_aria_label(tag: str):
    for regex, label in ARIA_RULES:
        if regex.search(tag):
            return label
    # Fallback: use placeholder
    ph = get_attr(tag, "placeholder")
    if ph:
        return ph.strip()
    return None


def resolve_local(src: str, html_path: Path):
    """Resolve src to a Path; return None if external/data/non-existent."""
    if not src:
        return None
    if src.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:", "#")):
        return None
    src_clean = unquote(src.split("?")[0].split("#")[0])
    if src_clean.startswith("/"):
        candidate = ROOT / src_clean.lstrip("/")
    else:
        candidate = html_path.parent / src_clean
    candidate = candidate.resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return None
    return candidate if candidate.exists() else None


def process_imgs(html: str, html_path: Path):
    """Modify <img> tags: add loading=lazy and width/height when possible."""
    global img_lazy_added, img_dim_added
    parts = []
    last = 0
    first_img = True

    for m in IMG_TAG_RE.finditer(html):
        parts.append(html[last:m.start()])
        attrs = m.group(1)
        original = m.group(0)
        new_attrs = attrs

        has_loading = has_attr(attrs, "loading")
        has_fp = has_attr(attrs, "fetchpriority")
        has_w = has_attr(attrs, "width")
        has_h = has_attr(attrs, "height")
        src = get_attr(attrs, "src")

        # loading="lazy"
        if not has_loading and not has_fp and not first_img:
            new_attrs = new_attrs.rstrip() + ' loading="lazy"'
            img_lazy_added += 1
        first_img = False

        # width/height
        if not (has_w and has_h) and src and Image is not None:
            local = resolve_local(src, html_path)
            if local and local.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"):
                try:
                    with Image.open(local) as im:
                        w, h = im.size
                    if not has_w:
                        new_attrs = new_attrs.rstrip() + f' width="{w}"'
                    if not has_h:
                        new_attrs = new_attrs.rstrip() + f' height="{h}"'
                    img_dim_added += 1
                except Exception:
                    pass

        if new_attrs != attrs:
            # Rebuild tag
            self_closing = original.rstrip().endswith("/>")
            if self_closing:
                new_tag = f"<img{new_attrs} />"
            else:
                new_tag = f"<img{new_attrs}>"
            parts.append(new_tag)
        else:
            parts.append(original)
        last = m.end()
    parts.append(html[last:])
    return "".join(parts)


def process_inputs(html: str):
    """Add aria-label to inputs missing accessibility info."""
    global input_aria_added
    parts = []
    last = 0
    for m in INPUT_TAG_RE.finditer(html):
        parts.append(html[last:m.start()])
        attrs = m.group(1)
        original = m.group(0)
        itype = (get_attr(attrs, "type") or "text").lower()

        # Skip hidden / submit / button / image / reset
        if itype in ("hidden", "submit", "button", "image", "reset"):
            parts.append(original)
            last = m.end()
            continue

        # Skip if already labelled
        if has_attr(attrs, "aria-label") or has_attr(attrs, "aria-labelledby"):
            parts.append(original)
            last = m.end()
            continue

        # Skip if id has matching <label for="id"> elsewhere
        input_id = get_attr(attrs, "id")
        if input_id:
            label_for = re.search(
                r'<label\b[^>]*\bfor\s*=\s*["\']' + re.escape(input_id) + r'["\']',
                html, re.I,
            )
            if label_for:
                parts.append(original)
                last = m.end()
                continue

        # Skip if inside <label>...</label>
        if is_in_label(html, m.start()):
            parts.append(original)
            last = m.end()
            continue

        label = infer_aria_label(attrs)
        if not label:
            parts.append(original)
            last = m.end()
            continue

        new_attrs = attrs.rstrip() + f' aria-label="{label}"'
        self_closing = original.rstrip().endswith("/>")
        new_tag = f"<input{new_attrs} />" if self_closing else f"<input{new_attrs}>"
        parts.append(new_tag)
        input_aria_added += 1
        last = m.end()
    parts.append(html[last:])
    return "".join(parts)


# Process all HTML files
for path in html_files:
    try:
        html = path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Skip {path}: {e}")
        continue
    original = html
    html = process_imgs(html, path)
    html = process_inputs(html)
    if html != original:
        path.write_text(html, encoding="utf-8")
        files_changed.add(str(path))

# Validate internal links
print("\n=== Validation: broken refs ===")
broken_links = []
broken_imgs = []

A_HREF_RE = re.compile(r'<a\b[^>]*\bhref\s*=\s*["\']([^"\']+)["\']', re.I)
IMG_SRC_RE = re.compile(r'<img\b[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']', re.I)

for path in html_files:
    try:
        html = path.read_text(encoding="utf-8")
    except Exception:
        continue
    for m in A_HREF_RE.finditer(html):
        href = m.group(1)
        if href.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "data:", "javascript:")):
            continue
        # Strip query/fragment
        target = href.split("?")[0].split("#")[0]
        if not target:
            continue
        # Only check .html refs explicitly per task
        if not target.endswith(".html"):
            continue
        local = resolve_local(target, path)
        if not local:
            broken_links.append((str(path.relative_to(ROOT)), href))
    for m in IMG_SRC_RE.finditer(html):
        src = m.group(1)
        if src.startswith(("http://", "https://", "//", "data:")):
            continue
        local = resolve_local(src, path)
        if not local:
            broken_imgs.append((str(path.relative_to(ROOT)), src))

print(f"\n--- Summary ---")
print(f"Files changed: {len(files_changed)}")
print(f"Images: loading=lazy added: {img_lazy_added}")
print(f"Images: width/height added: {img_dim_added}")
print(f"Inputs: aria-label added: {input_aria_added}")
print(f"Broken .html links: {len(broken_links)}")
print(f"Broken local img src: {len(broken_imgs)}")

if broken_links:
    print("\nBROKEN LINKS:")
    for f, h in broken_links[:50]:
        print(f"  {f}  ->  {h}")
    if len(broken_links) > 50:
        print(f"  ... and {len(broken_links)-50} more")

if broken_imgs:
    print("\nBROKEN IMG SRC:")
    for f, s in broken_imgs[:50]:
        print(f"  {f}  ->  {s}")
    if len(broken_imgs) > 50:
        print(f"  ... and {len(broken_imgs)-50} more")
