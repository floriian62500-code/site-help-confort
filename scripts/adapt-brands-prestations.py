#!/usr/bin/env python3
"""
Adapt brand pills on prestation pages.

Replaces the generic <section class="seo-section" id="marques">...</section>
block with a richer brand-card layout (logo + name + category) — same design
as porte-garage.html — and injects the new CSS if missing.
"""

import os
import re
from pathlib import Path

ROOT = Path("/Users/HP/Documents/Claude/Projects/SITE INTERNET/prestations")

# CSS snippet that must be present in each prestation page's <style>.
NEW_CSS = (
    ".seo-brands-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));"
    "gap:14px;margin-top:6px}"
    ".seo-brand-card{display:flex;flex-direction:column;align-items:center;justify-content:center;"
    "gap:8px;padding:18px 14px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;"
    "text-decoration:none;transition:all .18s ease;min-height:110px}"
    ".seo-brand-card:hover{transform:translateY(-2px);border-color:var(--c);"
    "box-shadow:0 8px 20px rgba(0,0,0,.08)}"
    ".seo-brand-logo{height:38px;max-width:100%;width:auto;object-fit:contain;display:block}"
    ".seo-brand-name{font-size:.84rem;font-weight:800;color:#0A1428;text-align:center;line-height:1.2}"
    ".seo-brand-cat{font-size:.72rem;color:#6b7384;text-align:center;line-height:1.3;font-weight:500}"
)

LEAD = (
    "HELP Confort travaille exclusivement avec des fabricants français "
    "et européens reconnus. Garantie constructeur en plus de notre garantie "
    "main d'œuvre."
)

# Brand mapping: slug -> list of (name, domain, category)
# For "placeholder" prestations the value is a tuple ("placeholder", title, subtitle).
BRANDS = {
    "chauffe-eau": [
        ("Atlantic", "atlantic-pro.fr", "Chauffe-eau électrique &amp; thermodynamique"),
        ("De Dietrich", "dedietrich-thermique.fr", "Chauffe-eau &amp; ballons"),
        ("Chaffoteaux", "chaffoteaux.fr", "Chauffe-eau &amp; chaudières"),
        ("Saunier Duval", "saunierduval.fr", "Chauffe-eau gaz"),
        ("Ariston", "ariston.com", "Chauffe-eau électriques"),
    ],
    "debouchage": [
        ("Geberit", "geberit.fr", "Évacuations &amp; WC"),
        ("Grohe", "grohe.fr", "Robinetterie &amp; écoulement"),
        ("Wavin", "wavin.com", "Réseaux d'évacuation"),
    ],
    "recherche-fuite": [
        ("Geberit", "geberit.fr", "Sanitaire encastré"),
        ("Grohe", "grohe.fr", "Robinetterie pro"),
        ("Comap", "comap.fr", "Plomberie &amp; raccords"),
    ],
    "salle-de-bain": [
        ("Grohe", "grohe.fr", "Robinetterie premium"),
        ("Hansgrohe", "hansgrohe.fr", "Douches &amp; mitigeurs"),
        ("Geberit", "geberit.fr", "Sanitaire encastré"),
        ("Jacob Delafon", "jacobdelafon.fr", "Sanitaire &amp; douche"),
        ("Roca", "roca.fr", "Lavabos &amp; WC"),
        ("Villeroy &amp; Boch", "villeroy-boch.fr", "Sanitaire haut de gamme"),
        ("Quare Design", "quaredesign.com", "Receveurs de douche"),
    ],
    "sanitaire": [
        ("Geberit", "geberit.fr", "Mécanismes WC &amp; encastrés"),
        ("Grohe", "grohe.fr", "Robinetterie"),
        ("Jacob Delafon", "jacobdelafon.fr", "Sanitaire complet"),
        ("Roca", "roca.fr", "WC &amp; lavabos"),
    ],
    "reseaux-plomberie": [
        ("Wavin", "wavin.com", "Tuyauterie PER &amp; PVC"),
        ("Comap", "comap.fr", "Raccords &amp; vannes"),
        ("Geberit", "geberit.fr", "Mapress &amp; évacuation"),
        ("Watts", "watts.com", "Sécurité &amp; régulation eau"),
    ],
    "remplacement-chaudiere": [
        ("Viessmann", "viessmann.fr", "Chaudières gaz &amp; PAC"),
        ("De Dietrich", "dedietrich-thermique.fr", "Chaudières &amp; PAC"),
        ("Frisquet", "frisquet.com", "Chaudières gaz haut de gamme"),
        ("Atlantic", "atlantic-pro.fr", "Chaudières &amp; PAC"),
        ("Saunier Duval", "saunierduval.fr", "Chaudières condensation"),
        ("Vaillant", "vaillant.fr", "Chaudières &amp; PAC"),
        ("Chaffoteaux", "chaffoteaux.fr", "Chaudières gaz"),
    ],
    "depannage-chaudiere": [
        ("Viessmann", "viessmann.fr", "SAV agréé"),
        ("De Dietrich", "dedietrich-thermique.fr", "SAV agréé"),
        ("Frisquet", "frisquet.com", "SAV agréé"),
        ("Atlantic", "atlantic-pro.fr", "SAV agréé"),
        ("Saunier Duval", "saunierduval.fr", "SAV agréé"),
        ("Vaillant", "vaillant.fr", "SAV agréé"),
    ],
    "desembouage": [
        ("Sentinel", "sentinelprotects.com", "Traitement circuit chauffage"),
        ("Fernox", "fernox.com", "Désembouage &amp; inhibiteurs"),
        ("Cillit", "cillit.com", "Traitement eau circuit"),
    ],
    "ramonage": ("placeholder", "Toutes marques de chaudières gaz, fioul, bois",
                 "Ramonage certifié – toutes installations"),
    "depannage-electrique": [
        ("Legrand", "legrand.fr", "Appareillage"),
        ("Schneider Electric", "schneider-electric.fr", "Tableaux &amp; disjoncteurs"),
        ("Hager", "hager.fr", "Coffrets &amp; modulaires"),
    ],
    "recherche-panne-elec": [
        ("Legrand", "legrand.fr", "Appareillage"),
        ("Schneider Electric", "schneider-electric.fr", "Tableaux"),
        ("Hager", "hager.fr", "Modulaires"),
        ("Chauvin Arnoux", "chauvin-arnoux.fr", "Mesure &amp; diagnostic"),
    ],
    "tableau-electrique": [
        ("Legrand", "legrand.fr", "Tableaux &amp; disjoncteurs"),
        ("Schneider Electric", "schneider-electric.fr", "Coffrets pré-équipés"),
        ("Hager", "hager.fr", "Modulaires &amp; différentiels"),
    ],
    "vmc": [
        ("Atlantic", "atlantic-pro.fr", "VMC simple &amp; double flux"),
        ("Aldes", "aldes.fr", "VMC hygroréglable"),
        ("Unelvent", "unelvent.com", "Bouches &amp; extracteurs"),
    ],
    "luminaire": [
        ("Philips", "philips.fr", "Ampoules LED &amp; luminaires"),
        ("Osram", "osram.fr", "Éclairage technique"),
        ("Legrand", "legrand.fr", "Appareillage &amp; dimmers"),
    ],
    "ouverture-porte": [
        ("Vachette", "vachette.fr", "Cylindres &amp; serrures"),
        ("Mottura", "mottura.com", "Serrures haute sécurité"),
        ("Bricard", "bricard.fr", "Serrures multipoints"),
        ("Pollux", "serrurerie-pollux.fr", "Cylindres anti-effraction"),
    ],
    "changement-cylindre": [
        ("Vachette", "vachette.fr", "Cylindres breveté A2P"),
        ("Mottura", "mottura.com", "Cylindres anti-effraction"),
        ("Bricard", "bricard.fr", "Cylindres &amp; clés"),
        ("Pollux", "serrurerie-pollux.fr", "Cylindres A2P"),
        ("Heracles", "heracles.fr", "Cylindres haute sécurité"),
    ],
    "porte-claquee": [
        ("Vachette", "vachette.fr", "Cylindres"),
        ("Mottura", "mottura.com", "Serrures"),
        ("Bricard", "bricard.fr", "Serrures multipoints"),
    ],
    "porte-fermee-cle": [
        ("Vachette", "vachette.fr", "Cylindres &amp; clés"),
        ("Mottura", "mottura.com", "Serrures"),
        ("Bricard", "bricard.fr", "Cylindres"),
    ],
    "mise-securite-vitrerie": [
        ("Saint-Gobain", "saint-gobain.com", "Vitrage feuilleté SP10"),
        ("AGC", "agc-glass.eu", "Vitrage anti-effraction"),
    ],
    "vitrage-simple-double-triple": [
        ("Saint-Gobain", "saint-gobain.com", "Climaplus / Planitherm"),
        ("AGC", "agc-glass.eu", "Iplus &amp; Stopray"),
        ("Pilkington", "pilkington.com", "Verre isolant haute performance"),
    ],
    "vitrage-insert-poele": [
        ("Saint-Gobain", "saint-gobain.com", "Vitrocéramique réfractaire"),
        ("Robax", "schott.com", "Vitrocéramique pour inserts"),
    ],
    "vitrerie-panneau-porte": [
        ("Saint-Gobain", "saint-gobain.com", "Vitrage de porte"),
        ("AGC", "agc-glass.eu", "Vitrage feuilleté de porte"),
    ],
    "fenetres-completes": [
        ("Velux", "velux.fr", "Fenêtres de toit"),
        ("Soprofen", "soprofen.fr", "Volets &amp; fermetures"),
        ("Schüco", "schueco.com", "Profilés aluminium"),
        ("Brémaud", "bremaud.com", "Fenêtres bois/PVC/alu"),
    ],
    "porte-entree": [
        ("Groupe Millet", "groupe-millet.com", "Portes d'entrée bois/alu/PVC"),
        ("Brémaud", "bremaud.com", "Portes alu &amp; PVC"),
        ("Kostum", "kostum.fr", "Portes sur mesure"),
        ("Jeld-Wen", "jeld-wen.fr", "Portes intérieures &amp; entrée"),
        ("Rozière", "roziere.fr", "Fabrication française"),
    ],
    "portail-cloture": [
        ("Soprofen", "soprofen.fr", "Portails &amp; clôtures alu"),
        ("SPPF", "sppf.fr", "Portails PVC &amp; alu"),
        ("Somfy", "somfy.fr", "Motorisation portails"),
    ],
    "fenetres-bois-alu-pvc": [
        ("Groupe Millet", "groupe-millet.com", "Fenêtres sur mesure"),
        ("Brémaud", "bremaud.com", "Bois / alu / PVC"),
        ("Kostum", "kostum.fr", "Fenêtres sur mesure"),
        ("Jeld-Wen", "jeld-wen.fr", "Fenêtres bois &amp; PVC"),
        ("Rozière", "roziere.fr", "Fabrication française"),
        ("Schüco", "schueco.com", "Aluminium premium"),
    ],
    "coulissant-baie-vitree": [
        ("Schüco", "schueco.com", "Baies coulissantes alu"),
        ("Kostum", "kostum.fr", "Coulissants sur mesure"),
        ("Groupe Millet", "groupe-millet.com", "Baies vitrées"),
        ("Brémaud", "bremaud.com", "Coulissants PVC &amp; alu"),
    ],
    "garde-corps-rampes": ("placeholder",
                           "Fabricants français certifiés",
                           "Tous matériels &amp; marques"),
    "remplacement-panneau-porte": ("placeholder",
                                    "Toutes essences bois &amp; PVC",
                                    "Tous matériels &amp; marques"),
    "parquet": [
        ("Parador", "parador.de", "Parquets contrecollés"),
        ("COREtec", "coretecfloors.com", "Sols vinyle premium"),
        ("Meister", "meister.com", "Parquets, stratifiés, vinyles"),
    ],
    "volet-roulant": [
        ("Somfy", "somfy.fr", "Motorisation"),
        ("Bubendorff", "bubendorff.com", "Volets roulants intégrés"),
        ("Soprofen", "soprofen.fr", "Volets &amp; coffres"),
        ("Profalux", "profalux.com", "Volets roulants haut de gamme"),
    ],
}


def build_cards(brand_list):
    """Return HTML for the seo-brands-grid for a list of brands."""
    if isinstance(brand_list, tuple) and brand_list[0] == "placeholder":
        # Single placeholder card without a logo.
        _, title, subtitle = brand_list
        return (
            '<div class="seo-brands-grid">\n'
            '<a href="../partenaires.html" class="seo-brand-card" style="grid-column:1/-1">\n'
            f'<span class="seo-brand-name">{title}</span>\n'
            f'<span class="seo-brand-cat">{subtitle}</span>\n'
            '</a>\n'
            '</div>'
        )
    parts = ['<div class="seo-brands-grid">']
    for name, domain, cat in brand_list:
        # Strip HTML entities for aria-label to keep it readable but valid.
        aria_name = name
        aria_cat = cat
        parts.append(
            f'<a href="https://www.{domain}/" class="seo-brand-card" target="_blank" '
            f'rel="noopener" aria-label="{aria_name} — {aria_cat}">\n'
            f'<img class="seo-brand-logo" src="https://logo.clearbit.com/{domain}?size=200" '
            f'alt="{aria_name}" loading="lazy" onerror="this.style.display=\'none\'">\n'
            f'<span class="seo-brand-name">{name}</span>\n'
            f'<span class="seo-brand-cat">{cat}</span>\n'
            '</a>'
        )
    parts.append('</div>')
    return "\n".join(parts)


def build_section(brand_list):
    """Return the full <section id='marques'>...</section> block."""
    return (
        '<section class="seo-section" id="marques">'
        '<h2>Les marques que nous installons</h2>'
        f'<p class="seo-section-lead">{LEAD}</p>'
        f'{build_cards(brand_list)}'
        '</section>'
    )


# Regex for the existing marques section. Non-greedy so it stops at the
# first </section>. We allow id="marques" or no id (older pages that have
# the heading "Les marques que nous installons").
SECTION_PATTERNS = [
    re.compile(
        r'<section class="seo-section" id="marques">.*?</section>',
        re.DOTALL,
    ),
    re.compile(
        r'<section class="seo-section">(?:(?!</section>).)*?marques que nous installons.*?</section>',
        re.DOTALL,
    ),
]

# Regex for the OLD style block .seo-brands-grid + .seo-brand (pill style).
OLD_CSS_LINE_RE = re.compile(
    r'\.seo-brands-grid\{display:flex;flex-wrap:wrap;gap:8px\}'
    r'\.seo-brand\{[^}]*\}(?:\.seo-brand:hover\{[^}]*\})?'
)


def process_file(path: Path, slug: str, brand_list) -> bool:
    """Update one prestation file. Returns True if file was modified."""
    text = path.read_text(encoding="utf-8")
    original = text

    new_section = build_section(brand_list)

    replaced = False
    for pat in SECTION_PATTERNS:
        new_text, n = pat.subn(new_section, text, count=1)
        if n > 0:
            text = new_text
            replaced = True
            break

    if not replaced:
        print(f"  [WARN] marques section not found in {path.name}")
        return False

    # CSS: replace old pill style with the new card CSS if present.
    if ".seo-brand-card" not in text:
        new_text, n = OLD_CSS_LINE_RE.subn(NEW_CSS, text, count=1)
        if n > 0:
            text = new_text
        else:
            # Fall back: inject before </style>
            text = text.replace("</style>", NEW_CSS + "</style>", 1)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main():
    modified = []
    skipped_no_mapping = []
    files = sorted(ROOT.glob("*.html"))
    for f in files:
        slug = f.stem
        if slug == "porte-garage":
            continue  # reference, already done
        if slug not in BRANDS:
            skipped_no_mapping.append(slug)
            continue
        changed = process_file(f, slug, BRANDS[slug])
        if changed:
            modified.append(f.name)

    print(f"\n== SUMMARY ==")
    print(f"Files modified: {len(modified)}")
    for m in modified:
        print(f"  - {m}")
    if skipped_no_mapping:
        print(f"\nSlugs with NO mapping (need manual review):")
        for s in skipped_no_mapping:
            print(f"  - {s}")
    print(f"\nDone.")


if __name__ == "__main__":
    main()
