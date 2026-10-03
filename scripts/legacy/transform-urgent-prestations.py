#!/usr/bin/env python3
"""Transform 8 urgent prestation pages from form-based devis to urgent intervention routing."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRESTA_DIR = ROOT / "prestations"

URGENT_FILES = [
    "recherche-fuite.html",
    "debouchage.html",
    "depannage-chaudiere.html",
    "depannage-electrique.html",
    "ouverture-porte.html",
    "porte-claquee.html",
    "porte-fermee-cle.html",
    "mise-securite-vitrerie.html",
]

# ---------- Transformation 1: hero CTA ----------
HERO_CTA_OLD = '<a href="#devis" class="seo-hero-cta seo-cta-primary">Demander un devis gratuit →</a>'
HERO_CTA_NEW = '<a href="/index.html?wizard=depannage#hc-reservation" class="seo-hero-cta seo-cta-primary" style="background:#FF6B1A !important;color:#fff !important">⚠ Demande d\'intervention urgente →</a>'

# ---------- Transformation 2: urgent banner before hero ----------
HERO_OPEN_OLD = '<section class="seo-hero">'
URGENT_BANNER = (
    '<div style="background:linear-gradient(135deg,#FF6B1A,#E55510);color:#fff;'
    'text-align:center;padding:14px clamp(20px,4vw,40px);font-weight:700;'
    'font-size:.92rem;letter-spacing:.02em">⚠ Intervention urgente — Appelez le '
    '<a href="tel:+33366100134" style="color:#fff;text-decoration:underline">03 66 10 01 34</a>'
    ' ou faites votre demande ci-dessous</div>'
)
HERO_OPEN_NEW = URGENT_BANNER + '<section class="seo-hero">'

# ---------- Transformation 3: replace whole aside ----------
URGENT_ASIDE = '''<aside class="seo-form-side" id="devis"><div class="seo-form-box" style="background:linear-gradient(180deg,#FFF3E0,#FFE5C8);border:2px solid #FF6B1A">
<div style="text-align:center;margin-bottom:18px"><div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#FF6B1A;color:#fff;font-size:1.8rem;margin-bottom:12px">⚠</div>
<h3 style="margin:0 0 6px;color:#0A1428">Intervention urgente</h3>
<p style="margin:0;font-size:.92rem;color:#6b7384">Décrivez votre situation, on vous rappelle sous 1h ouvrée</p></div>

<a href="tel:+33366100134" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:18px;background:#0A1428;color:#fff;text-decoration:none;border-radius:12px;font-weight:800;font-size:1.1rem;margin-bottom:14px;box-shadow:0 10px 24px rgba(10,20,40,.20)">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
03 66 10 01 34
</a>

<div style="position:relative;text-align:center;margin:14px 0"><span style="background:linear-gradient(180deg,#FFF3E0,#FFE5C8);padding:0 14px;color:#6b7384;font-size:.84rem;position:relative;z-index:1">ou</span><span style="position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.10)"></span></div>

<a href="/index.html?wizard=depannage#hc-reservation" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;background:linear-gradient(135deg,#FF6B1A,#E55510);color:#fff;text-decoration:none;border-radius:12px;font-weight:800;font-size:1rem;box-shadow:0 10px 24px rgba(255,107,26,.30)">
Décrire ma situation →
</a>

<p style="margin:14px 0 0;font-size:.78rem;color:#6b7384;text-align:center;line-height:1.5">Standard ouvert <strong>Lun-Ven 9h-17h</strong> et <strong>Sam 9h-16h</strong>. Hors horaires, partenaires d\'astreinte du réseau HELP Confort.</p>
</div></aside>'''

ASIDE_PATTERN = re.compile(
    r'<aside class="seo-form-side" id="devis">.*?</aside>',
    re.DOTALL,
)

IDEMPOTENT_MARKER = "Demande d'intervention urgente"


def transform_file(path: Path) -> dict:
    """Apply transformations to one file. Returns report dict."""
    report = {
        "file": path.name,
        "skipped": False,
        "hero_cta": False,
        "banner": False,
        "aside": False,
        "error": None,
    }
    try:
        content = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        report["error"] = "file not found"
        return report

    if IDEMPOTENT_MARKER in content:
        report["skipped"] = True
        return report

    new_content = content

    # T1: hero CTA
    if HERO_CTA_OLD in new_content:
        new_content = new_content.replace(HERO_CTA_OLD, HERO_CTA_NEW, 1)
        report["hero_cta"] = True

    # T2: banner before hero (only if not already injected)
    if URGENT_BANNER not in new_content and HERO_OPEN_OLD in new_content:
        new_content = new_content.replace(HERO_OPEN_OLD, HERO_OPEN_NEW, 1)
        report["banner"] = True

    # T3: replace whole aside block
    if ASIDE_PATTERN.search(new_content):
        new_content = ASIDE_PATTERN.sub(lambda m: URGENT_ASIDE, new_content, count=1)
        report["aside"] = True

    if new_content != content:
        path.write_text(new_content, encoding="utf-8")
    return report


def main():
    print(f"Transforming {len(URGENT_FILES)} urgent prestation pages...\n")
    reports = []
    for name in URGENT_FILES:
        path = PRESTA_DIR / name
        rep = transform_file(path)
        reports.append(rep)
        if rep["error"]:
            print(f"[ERROR] {rep['file']}: {rep['error']}")
        elif rep["skipped"]:
            print(f"[SKIP]  {rep['file']}: already transformed")
        else:
            applied = []
            if rep["hero_cta"]: applied.append("hero-CTA")
            if rep["banner"]:   applied.append("urgent-banner")
            if rep["aside"]:    applied.append("urgent-aside")
            print(f"[OK]    {rep['file']}: {', '.join(applied) if applied else 'no changes'}")

    # summary
    modified = sum(1 for r in reports if not r["skipped"] and not r["error"] and (r["hero_cta"] or r["banner"] or r["aside"]))
    skipped = sum(1 for r in reports if r["skipped"])
    errors = sum(1 for r in reports if r["error"])
    print(f"\nSummary: {modified} modified, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    main()
