#!/usr/bin/env python3
"""
Audit & fix the href of intervention cards in the .m-services-grid block of
each métier page. Conservative: only re-writes when a confident mapping match
is found. Reports unmatched cards instead of guessing.
"""
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

METIER_FILES = [
    "plombier-saint-omer.html",
    "chauffagiste-saint-omer.html",
    "electricien-saint-omer.html",
    "serrurier-saint-omer.html",
    "vitrier-saint-omer.html",
    "menuisier-saint-omer.html",
    "volets-saint-omer.html",
    "pmr-saint-omer.html",
    "travaux-saint-omer.html",
]


def norm(s):
    """lowercase + strip accents + collapse whitespace"""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"\s+", " ", s).strip()
    return s


# Per-métier mapping: list of (list_of_keywords, expected_href)
# Order matters: more specific keywords first.
MAPPINGS = {
    "plombier-saint-omer.html": [
        (["urgence plomberie", "urgence"],         "index.html?wizard=depannage#hc-reservation"),
        (["recherche de fuite", "fuite"],          "prestations/recherche-fuite.html#details"),
        (["debouchage", "deboucher"],              "prestations/debouchage.html#details"),
        (["chauffe-eau", "ballon eau chaude"],     "prestations/chauffe-eau.html#details"),
        (["salle de bain", "renovation salle de bain", "douche italienne"], "prestations/salle-de-bain.html#details"),
        (["sanitaire", "wc", "lavabo"],            "prestations/sanitaire.html#details"),
        (["reseaux", "reseau plomberie", "canalisations"], "prestations/reseaux-plomberie.html#details"),
    ],
    "chauffagiste-saint-omer.html": [
        (["desembouage"],                          "prestations/desembouage.html#details"),
        (["urgence chaudiere"],                    "index.html?wizard=depannage#hc-reservation"),
        (["depannage chaudiere"],                  "prestations/depannage-chaudiere.html#details"),
        (["remplacement chaudiere"],               "prestations/remplacement-chaudiere.html#details"),
        (["ramonage"],                             "prestations/ramonage.html#details"),
        (["entretien annuel", "entretien chaudiere"], "contrats-entretien.html"),
    ],
    "electricien-saint-omer.html": [
        (["consuel", "attestation consuel"],       "contact.html?metier=Électricité&objet=Consuel#form"),
        (["urgence electrique", "urgence elec"],   "index.html?wizard=depannage#hc-reservation"),
        (["depannage electrique"],                 "prestations/depannage-electrique.html#details"),
        (["tableau electrique", "tableau"],        "prestations/tableau-electrique.html#details"),
        (["recherche de panne", "recherche panne"], "prestations/recherche-panne-elec.html#details"),
        (["vmc"],                                  "prestations/vmc.html#details"),
        (["luminaire", "pose luminaire"],          "prestations/luminaire.html#details"),
    ],
    "serrurier-saint-omer.html": [
        (["porte blindee", "a2p", "blindage"],     "contact.html?metier=Serrurerie&objet=Porte blindée#form"),
        (["porte claquee 24h", "porte claquee"],   "prestations/porte-claquee.html#details"),
        (["porte fermee a cle", "cle bloquee", "porte fermee"], "prestations/porte-fermee-cle.html#details"),
        (["ouverture de porte", "ouverture porte"], "prestations/ouverture-porte.html#details"),
        (["changement cylindre", "cylindre"],      "prestations/changement-cylindre.html#details"),
    ],
    "vitrier-saint-omer.html": [
        (["vitre cassee 24h", "mise en securite"], "prestations/mise-securite-vitrerie.html#details"),
        (["vitrage insert", "insert poele"],       "prestations/vitrage-insert-poele.html#details"),
        (["remplacement panneau de porte", "vitrage panneau", "panneau porte", "panneau de porte"], "prestations/vitrerie-panneau-porte.html#details"),
        (["double vitrage", "triple vitrage", "simple vitrage", "vitrage simple", "vitrage double", "vitrage triple"], "prestations/vitrage-simple-double-triple.html#details"),
        (["fenetre complete", "fenetres completes", "fenetre", "fenetres"], "prestations/fenetres-completes.html#details"),
    ],
    "menuisier-saint-omer.html": [
        (["porte d'entree", "porte d entree", "porte entree"], "prestations/porte-entree.html#details"),
        (["porte de garage", "porte garage"],      "prestations/porte-garage.html#details"),
        (["portail", "cloture"],                   "prestations/portail-cloture.html#details"),
        (["baie vitree", "coulissant"],            "prestations/coulissant-baie-vitree.html#details"),
        (["fenetre", "fenetres bois"],             "prestations/fenetres-bois-alu-pvc.html#details"),
        (["garde-corps", "garde corps", "rampe"],  "prestations/garde-corps-rampes.html#details"),
        (["parquet"],                              "prestations/parquet.html#details"),
        (["panneau de porte", "remplacement panneau"], "prestations/remplacement-panneau-porte.html#details"),
    ],
    "volets-saint-omer.html": [
        (["volet battant"],                        "contact.html?metier=Volets&objet=Volet battant#form"),
        (["stores exterieurs", "stores"],          "contact.html?metier=Volets&objet=Stores#form"),
        (["volet roulant", "tablier", "motorisation"], "prestations/volet-roulant.html#details"),
    ],
    "pmr-saint-omer.html": [
        (["maprimeadapt", "aides pmr"],            "aides.html#elig"),
        (["monte-escalier", "monte escalier"],     "contact.html?metier=PMR&objet=Monte-escalier#form"),
        (["barres d'appui", "barres d appui"],     "contact.html?metier=PMR&objet=Barres d appui#form"),
        (["wc pmr", "wc rehausse"],                "contact.html?metier=PMR&objet=WC PMR#form"),
        (["elargissement portes", "portes pmr"],   "contact.html?metier=PMR&objet=Portes PMR#form"),
        (["douche pmr", "douche a l'italienne", "douche a l italienne", "douche italienne", "salle de bain"], "prestations/salle-de-bain.html#details"),
    ],
    "travaux-saint-omer.html": [
        (["tous corps d'etat", "tous corps d etat"], "contact.html?metier=Rénovation&objet=Tous corps d état#form"),
        (["renovation salle de bain", "salle de bain"], "prestations/salle-de-bain.html#details"),
        (["renovation cuisine", "cuisine"],        "contact.html?metier=Rénovation&objet=Cuisine#form"),
        (["adaptation pmr", "pmr"],                "pmr-saint-omer.html"),
        (["carrelage", "faience"],                 "contact.html?metier=Rénovation&objet=Carrelage#form"),
        (["peinture", "revetements"],              "contact.html?metier=Rénovation&objet=Peinture#form"),
    ],
}


# Regex to find a single <a ... class="m-svc..."> ... </a> block inside .m-services-grid
# We extract the whole grid first, then iterate.

GRID_RE = re.compile(
    r'(<div\s+class="m-services-grid"[^>]*>)(.*?)(</div>\s*</div>\s*</section>)',
    re.DOTALL | re.IGNORECASE,
)

# Anchor opening tag with class containing m-svc (and not m-svc-...).
ANCHOR_RE = re.compile(
    r'<a\s+([^>]*?)class="(m-svc[^"]*?)"([^>]*)>(.*?)</a>',
    re.DOTALL | re.IGNORECASE,
)

HREF_RE = re.compile(r'href="([^"]*)"', re.IGNORECASE)
H3_RE = re.compile(r'<h3[^>]*>(.*?)</h3>', re.DOTALL | re.IGNORECASE)


def best_match(h3_text, rules):
    n = norm(h3_text)
    for keywords, target in rules:
        for kw in keywords:
            if norm(kw) in n:
                return target
    return None


def process_file(path, filename):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    grid_match = GRID_RE.search(content)
    if not grid_match:
        return {
            "file": filename,
            "cards": [],
            "fixed": [],
            "unmatched": [],
            "error": "no m-services-grid found",
        }

    pre, grid_body, post = grid_match.group(1), grid_match.group(2), grid_match.group(3)
    rules = MAPPINGS.get(filename, [])

    cards = []
    fixed = []
    unmatched = []

    def replace_anchor(m):
        before = m.group(1)
        cls = m.group(2)
        after = m.group(3)
        inner = m.group(4)

        # Skip if class has m-hero-service or m-cta etc. (only true m-svc cards)
        if "m-hero-service" in cls or "m-cta" in cls:
            return m.group(0)

        href_m = HREF_RE.search(before) or HREF_RE.search(after)
        if not href_m:
            return m.group(0)
        current = href_m.group(1)

        h3_m = H3_RE.search(inner)
        if not h3_m:
            return m.group(0)
        h3_raw = re.sub(r"<[^>]+>", "", h3_m.group(1))
        h3_text = re.sub(r"\s+", " ", h3_raw).strip()

        cards.append((h3_text, current))

        # Skip "safe" targets we do not want to touch
        if "partenaires.html" in current:
            return m.group(0)
        if current.startswith("tel:") or current.startswith("mailto:"):
            return m.group(0)

        expected = best_match(h3_text, rules)
        if expected is None:
            unmatched.append((h3_text, current))
            return m.group(0)

        if current == expected:
            return m.group(0)  # idempotent

        fixed.append((h3_text, current, expected))
        # replace href attribute
        new_before = HREF_RE.sub(f'href="{expected}"', before, count=1)
        new_after = after
        if not HREF_RE.search(before):
            new_after = HREF_RE.sub(f'href="{expected}"', after, count=1)
        return f'<a {new_before}class="{cls}"{new_after}>{inner}</a>'

    new_grid_body = ANCHOR_RE.sub(replace_anchor, grid_body)

    if new_grid_body != grid_body:
        new_content = content[: grid_match.start()] + pre + new_grid_body + post + content[grid_match.end():]
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)

    return {
        "file": filename,
        "cards": cards,
        "fixed": fixed,
        "unmatched": unmatched,
        "error": None,
    }


def main():
    results = []
    for fn in METIER_FILES:
        p = os.path.join(ROOT, fn)
        if not os.path.exists(p):
            results.append({"file": fn, "error": "missing file", "cards": [], "fixed": [], "unmatched": []})
            continue
        r = process_file(p, fn)
        results.append(r)

    print("=" * 70)
    print("AUDIT REPORT — métier card routing")
    print("=" * 70)
    total_cards = total_fixed = total_unmatched = 0
    for r in results:
        print()
        print(f"## {r['file']}")
        if r["error"]:
            print(f"  ERROR: {r['error']}")
            continue
        print(f"  cards found  : {len(r['cards'])}")
        print(f"  cards fixed  : {len(r['fixed'])}")
        for h3, old, new in r["fixed"]:
            print(f"    - [{h3}]")
            print(f"        OLD: {old}")
            print(f"        NEW: {new}")
        if r["unmatched"]:
            print(f"  unmatched    : {len(r['unmatched'])}")
            for h3, cur in r["unmatched"]:
                print(f"    ? [{h3}] -> kept {cur}")
        total_cards += len(r["cards"])
        total_fixed += len(r["fixed"])
        total_unmatched += len(r["unmatched"])
    print()
    print("=" * 70)
    print(f"TOTAL cards={total_cards}  fixed={total_fixed}  unmatched={total_unmatched}")
    print("=" * 70)


if __name__ == "__main__":
    main()
