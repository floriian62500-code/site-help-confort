#!/usr/bin/env python3
"""
Download REAL product photos for each prestation page from public sources.

Sources (in order of reliability):
1. Wikipedia Commons (CC-licensed, always works)
2. Direct supplier URLs (when known and stable)

For each of the 33 prestations, downloads a representative photo to
/images/prestations/<slug>.jpg

After download, the prestation pages can show the photo in their hero.
"""
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
import ssl

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(BASE, "images", "prestations")
os.makedirs(DEST, exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

# prestation slug → list of photo URLs to try (Wikipedia Commons preferred)
# Curated to represent each intervention type with a clear product photo
PHOTOS = {
    # MENUISERIE
    "porte-entree": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Porte_d%27entr%C3%A9e_dans_un_immeuble_haussmannien_-_2013-02-12_-_8.jpg/800px-Porte_d%27entr%C3%A9e_dans_un_immeuble_haussmannien_-_2013-02-12_-_8.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Holzt%C3%BCr_Eingang_Haus.jpg/800px-Holzt%C3%BCr_Eingang_Haus.jpg",
    ],
    "porte-garage": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Garagentor_Sektional.jpg/800px-Garagentor_Sektional.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Garage_doors_-_Edmonton%2C_Alberta_-_07.JPG/800px-Garage_doors_-_Edmonton%2C_Alberta_-_07.JPG",
    ],
    "portail-cloture": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Aluminium-Gartentor.jpg/800px-Aluminium-Gartentor.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Hekwerk_-_villa_Wilhelmina_4_-_Halsteren_-_Photo-1.jpg/800px-Hekwerk_-_villa_Wilhelmina_4_-_Halsteren_-_Photo-1.jpg",
    ],
    "fenetres-bois-alu-pvc": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Casement_window_-_typical_european.jpg/800px-Casement_window_-_typical_european.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/PVC_window_open.jpg/800px-PVC_window_open.jpg",
    ],
    "fenetres-completes": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Casement_window_-_typical_european.jpg/800px-Casement_window_-_typical_european.jpg",
    ],
    "coulissant-baie-vitree": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Sliding_glass_door_-_outside_view.jpg/800px-Sliding_glass_door_-_outside_view.jpg",
    ],
    "garde-corps-rampes": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Garde-corps_inox_balcon.jpg/800px-Garde-corps_inox_balcon.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Modern_steel_railing.jpg/800px-Modern_steel_railing.jpg",
    ],
    "remplacement-panneau-porte": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Holzt%C3%BCr_Eingang_Haus.jpg/800px-Holzt%C3%BCr_Eingang_Haus.jpg",
    ],
    "parquet": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Oak_floor.jpg/800px-Oak_floor.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Engineered_wood_floor.jpg/800px-Engineered_wood_floor.jpg",
    ],

    # CHAUFFAGE
    "remplacement-chaudiere": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Boiler_gas_condensing.jpg/800px-Boiler_gas_condensing.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Wandtherme_Gasheizung.jpg/800px-Wandtherme_Gasheizung.jpg",
    ],
    "depannage-chaudiere": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Wandtherme_Gasheizung.jpg/800px-Wandtherme_Gasheizung.jpg",
    ],
    "desembouage": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Radiator_in_room.jpg/800px-Radiator_in_room.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Heizk%C3%B6rper.jpg/800px-Heizk%C3%B6rper.jpg",
    ],
    "ramonage": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Chimney_sweep_at_work.jpg/800px-Chimney_sweep_at_work.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Schornsteinfeger.jpg/800px-Schornsteinfeger.jpg",
    ],

    # PLOMBERIE
    "chauffe-eau": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Electric_water_heater.jpg/800px-Electric_water_heater.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Cumulus_eau_chaude_sanitaire.jpg/800px-Cumulus_eau_chaude_sanitaire.jpg",
    ],
    "salle-de-bain": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Modern_bathroom_with_walk-in_shower.jpg/800px-Modern_bathroom_with_walk-in_shower.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Salle_de_bain_moderne.jpg/800px-Salle_de_bain_moderne.jpg",
    ],
    "recherche-fuite": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Water_pipe_leak.jpg/800px-Water_pipe_leak.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Plumber_at_work.jpg/800px-Plumber_at_work.jpg",
    ],
    "debouchage": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Plunger_in_a_sink.jpg/800px-Plunger_in_a_sink.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Plumber_at_work.jpg/800px-Plumber_at_work.jpg",
    ],
    "sanitaire": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Toilet_in_modern_bathroom.jpg/800px-Toilet_in_modern_bathroom.jpg",
    ],
    "reseaux-plomberie": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/PVC_pipes_under_a_sink.jpg/800px-PVC_pipes_under_a_sink.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pex_pipe_plumbing.jpg/800px-Pex_pipe_plumbing.jpg",
    ],

    # ELECTRICITE
    "tableau-electrique": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Electrical_panel_in_modern_home.jpg/800px-Electrical_panel_in_modern_home.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Tableau_%C3%A9lectrique_domestique.jpg/800px-Tableau_%C3%A9lectrique_domestique.jpg",
    ],
    "depannage-electrique": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Tableau_%C3%A9lectrique_domestique.jpg/800px-Tableau_%C3%A9lectrique_domestique.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Electrician_working_on_panel.jpg/800px-Electrician_working_on_panel.jpg",
    ],
    "recherche-panne-elec": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Electrician_working_on_panel.jpg/800px-Electrician_working_on_panel.jpg",
    ],
    "vmc": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/MVHR_unit_installed_in_loft.jpg/800px-MVHR_unit_installed_in_loft.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mechanical_ventilation_unit.jpg/800px-Mechanical_ventilation_unit.jpg",
    ],
    "luminaire": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Modern_ceiling_lighting.jpg/800px-Modern_ceiling_lighting.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/LED_ceiling_light.jpg/800px-LED_ceiling_light.jpg",
    ],

    # SERRURERIE
    "ouverture-porte": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Locksmith_at_work_on_door.jpg/800px-Locksmith_at_work_on_door.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Pin_tumbler_lock.jpg/800px-Pin_tumbler_lock.jpg",
    ],
    "changement-cylindre": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Pin_tumbler_lock.jpg/800px-Pin_tumbler_lock.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Door_lock_cylinder.jpg/800px-Door_lock_cylinder.jpg",
    ],
    "porte-claquee": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Locksmith_at_work_on_door.jpg/800px-Locksmith_at_work_on_door.jpg",
    ],
    "porte-fermee-cle": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Locksmith_at_work_on_door.jpg/800px-Locksmith_at_work_on_door.jpg",
    ],

    # VITRERIE
    "mise-securite-vitrerie": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Broken_glass_window.jpg/800px-Broken_glass_window.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Safety_glass_close_up.jpg/800px-Safety_glass_close_up.jpg",
    ],
    "vitrage-simple-double-triple": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Double_glazed_window.jpg/800px-Double_glazed_window.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Triple_glazed_window_unit.jpg/800px-Triple_glazed_window_unit.jpg",
    ],
    "vitrage-insert-poele": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Insert_de_chemin%C3%A9e.jpg/800px-Insert_de_chemin%C3%A9e.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Wood_burning_stove.jpg/800px-Wood_burning_stove.jpg",
    ],
    "vitrerie-panneau-porte": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Broken_glass_window.jpg/800px-Broken_glass_window.jpg",
    ],

    # VOLETS
    "volet-roulant": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Volet_roulant_PVC.jpg/800px-Volet_roulant_PVC.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rolling_shutter_PVC.jpg/800px-Rolling_shutter_PVC.jpg",
    ],
}

def download(url, slug):
    """Download URL to images/prestations/<slug>.jpg."""
    ext = ".jpg"
    if ".png" in url.lower():
        ext = ".png"
    elif ".svg" in url.lower():
        ext = ".svg"
    dest = os.path.join(DEST, slug + ext)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return ("SKIP", dest, "already exists")
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/*,*/*",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            "Referer": "https://commons.wikimedia.org/",
        })
        ctx = ssl.create_default_context()
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            content = resp.read()
        if len(content) < 1000:
            return ("FAIL", dest, "too small")
        with open(dest, "wb") as f:
            f.write(content)
        return ("OK", dest, f"{len(content)//1024} KB")
    except urllib.error.HTTPError as e:
        return ("FAIL", dest, f"HTTP {e.code}")
    except Exception as e:
        return ("FAIL", dest, f"{e}")

def main():
    print(f"Destination: {DEST}\n")
    ok, fail, skip = 0, 0, 0
    failed_list = []
    for slug, urls in PHOTOS.items():
        success = False
        for url in urls:
            status, dest, msg = download(url, slug)
            if status == "OK":
                print(f"  [OK     ] {slug:32} {msg:10}  {url[:90]}")
                ok += 1
                success = True
                break
            elif status == "SKIP":
                print(f"  [SKIPPED] {slug:32} {msg}")
                skip += 1
                success = True
                break
            # else FAIL — try next URL
        if not success:
            print(f"  [FAILED ] {slug:32} all {len(urls)} URLs failed")
            fail += 1
            failed_list.append(slug)
        time.sleep(0.5)
    print()
    print(f"OK:      {ok}/{len(PHOTOS)}")
    print(f"SKIPPED: {skip}")
    print(f"FAILED:  {fail}")
    if failed_list:
        print(f"\nFailed prestations (need manual photos):")
        for slug in failed_list:
            print(f"  - {slug}")
        print(f"\nFor manual replacement: save photo as /images/prestations/<slug>.jpg")

if __name__ == "__main__":
    main()
