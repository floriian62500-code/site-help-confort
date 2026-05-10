#!/usr/bin/env python3
"""
download-fb-photos.py
═══════════════════════════════════════════════════════════════════════
Télécharge automatiquement les photos de couverture des posts Facebook
en lisant les permaliens depuis content/actualites/index.json.

Méthode : fetch de chaque page FB publique → extraction de la balise
<meta property="og:image"> → téléchargement de l'image.

Aucun token, aucune API, aucune permission Chrome — juste des requêtes HTTP.
Marche tant que les posts FB sont publics.

Usage :
  python3 scripts/download-fb-photos.py            # télécharge ce qui manque
  python3 scripts/download-fb-photos.py --force    # re-télécharge tout
  python3 scripts/download-fb-photos.py --dry-run  # test sans écrire

Prérequis :
  pip3 install requests
═══════════════════════════════════════════════════════════════════════
"""
import os, sys, json, re, argparse, time
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ pip3 install requests"); sys.exit(1)

SITE_ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = SITE_ROOT / "content" / "actualites" / "index.json"
IMG_DIR = SITE_ROOT / "images" / "posts"
ACTU_DIR = SITE_ROOT / "actualites"

ap = argparse.ArgumentParser()
ap.add_argument("--force", action="store_true", help="Re-télécharge même si l'image existe")
ap.add_argument("--dry-run", action="store_true", help="Test sans écrire")
args = ap.parse_args()

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
}

# Tentatives de regex pour extraire la photo, dans l'ordre de préférence
RX_OG_IMAGE = re.compile(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', re.I)
RX_OG_IMAGE_ALT = re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', re.I)
RX_FBCDN_JPG = re.compile(r'(https://[^"\'\\\s]+fbcdn[^"\'\\\s]+\.(?:jpg|jpeg|png))', re.I)

def extract_image_url(html_text):
    """Cherche la meilleure URL d'image dans la page Facebook."""
    for rx in (RX_OG_IMAGE, RX_OG_IMAGE_ALT):
        m = rx.search(html_text)
        if m:
            url = m.group(1).replace('&amp;', '&')
            return url
    # Fallback : premier lien fbcdn
    m = RX_FBCDN_JPG.search(html_text)
    if m:
        return m.group(1).replace('&amp;', '&')
    return None

def fetch_page(url, retries=2):
    """Récupère la page FB avec retry."""
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
            if r.ok and len(r.text) > 1000:
                return r.text
            print(f"  ⚠ Status {r.status_code} (taille {len(r.text)})")
        except Exception as e:
            print(f"  ⚠ Erreur tentative {attempt+1} : {e}")
        time.sleep(2)
    return None

def download_image(url, dest_path):
    try:
        r = requests.get(url, headers=HEADERS, timeout=60, stream=True)
        if not r.ok:
            print(f"  ⚠ Téléchargement échoué (status {r.status_code})")
            return False
        if not args.dry_run:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_path, 'wb') as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
        size = int(r.headers.get('Content-Length', 0)) or len(r.content)
        print(f"  ✓ Téléchargé ({size//1024} Ko)")
        return True
    except Exception as e:
        print(f"  ⚠ Erreur téléchargement : {e}")
        return False

def update_html_with_cover(slug, image_local):
    """Insère ou met à jour la balise <img cover> dans le HTML de l'article."""
    html_path = ACTU_DIR / f"{slug}.html"
    if not html_path.exists():
        print(f"  ⚠ {html_path.name} introuvable")
        return False

    content = html_path.read_text(encoding='utf-8')

    cover_block = (
        f'\n<div class="actu-cover" style="max-width:880px;margin:0 auto;padding:0 24px">'
        f'<img src="../{image_local}" alt="Photo de couverture" loading="lazy" '
        f'style="width:100%;border-radius:18px;margin:24px 0 0;box-shadow:0 14px 40px rgba(10,20,40,.12)"></div>\n'
    )

    # Si déjà présent, remplacer
    if 'class="actu-cover"' in content:
        content = re.sub(
            r'<div class="actu-cover"[^>]*>.*?</div>',
            cover_block.strip(), content, count=1, flags=re.DOTALL
        )
    else:
        # Insérer juste après </nav>
        content = content.replace('</nav>', '</nav>' + cover_block, 1)

    # Met à jour aussi la balise og:image
    content = re.sub(
        r'<meta property="og:image" content="[^"]*">',
        f'<meta property="og:image" content="https://www.helpconfort-saintomer.fr/{image_local}">',
        content
    )

    if not args.dry_run:
        html_path.write_text(content, encoding='utf-8')
    return True

def main():
    print("📥 Téléchargement des photos depuis les permaliens Facebook\n")
    if args.dry_run: print("⚠ DRY-RUN actif — aucun fichier ne sera écrit\n")

    if not INDEX_PATH.exists():
        print(f"❌ {INDEX_PATH} introuvable"); sys.exit(1)

    with open(INDEX_PATH, encoding='utf-8') as f:
        entries = json.load(f)

    n_done = n_skip = n_fail = n_already = 0

    for entry in entries:
        permalink = entry.get('source_facebook') or entry.get('permalink')
        slug = entry.get('url', '').replace('actualites/', '').replace('.html', '')
        if not permalink or not slug:
            n_skip += 1; continue

        ext = '.jpg'
        img_path = IMG_DIR / f"{slug}{ext}"
        rel_path = f"images/posts/{slug}{ext}"

        # Skip si image déjà présente
        if img_path.exists() and not args.force:
            print(f"⏭ {slug} — image déjà présente")
            # S'assure quand même que le HTML pointe dessus
            if entry.get('image') != rel_path:
                entry['image'] = rel_path
                update_html_with_cover(slug, rel_path)
            n_already += 1
            continue

        print(f"\n🔍 {slug}")
        print(f"  → {permalink[:80]}…")
        html_text = fetch_page(permalink)
        if not html_text:
            print(f"  ✗ Page Facebook inaccessible (login wall ?)")
            n_fail += 1
            continue

        img_url = extract_image_url(html_text)
        if not img_url:
            print(f"  ✗ Aucune balise og:image trouvée dans la page")
            n_fail += 1
            continue

        print(f"  📷 {img_url[:80]}…")
        if download_image(img_url, img_path):
            entry['image'] = rel_path
            update_html_with_cover(slug, rel_path)
            n_done += 1
        else:
            n_fail += 1

        time.sleep(1)  # politesse anti rate-limit

    # Sauve l'index mis à jour
    if not args.dry_run:
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✓ {n_done:>3} nouvelles photos téléchargées")
    print(f"⏭ {n_already:>3} déjà présentes")
    print(f"✗ {n_fail:>3} échecs (page non accessible ou pas d'image)")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

if __name__ == '__main__':
    main()
