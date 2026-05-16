#!/usr/bin/env python3
"""
sync-facebook-posts.py
═══════════════════════════════════════════════════════════════════════
Synchronise les publications Facebook → site HELP Confort Saint-Omer.

Pour chaque post de la page Facebook :
  1. Récupère le texte, la date, le lien permanent
  2. Télécharge l'image de couverture (full_picture) + images supplémentaires
  3. Génère un fichier HTML dans /actualites/<slug>.html
  4. Met à jour /content/actualites/index.json
  5. Récupère les stats (vues, réactions, partages, clics)

IDEMPOTENT : peut être relancé sans risque, ne crée pas de doublons.
Vérifie chaque post par son ID Facebook (stocké dans index.json).

Usage :
  python3 scripts/sync-facebook-posts.py            # synchro normale
  python3 scripts/sync-facebook-posts.py --dry-run  # test sans écrire
  python3 scripts/sync-facebook-posts.py --limit 10 # max 10 posts
  python3 scripts/sync-facebook-posts.py --force    # re-télécharge tout

Prérequis :
  pip3 install requests python-dotenv

Configuration : voir SETUP-API-FACEBOOK.md
═══════════════════════════════════════════════════════════════════════
"""
import os, sys, json, re, html, argparse, unicodedata
from datetime import datetime
from pathlib import Path

# ────────────────────────────────────────────────
# Dépendances
# ────────────────────────────────────────────────
try:
    import requests
except ImportError:
    print("❌ Dépendance manquante : pip3 install requests"); sys.exit(1)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / '.env')
except ImportError:
    # Fallback : lecture manuelle du .env
    env_path = Path(__file__).resolve().parent.parent / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.strip() and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# ────────────────────────────────────────────────
# Constantes
# ────────────────────────────────────────────────
SITE_ROOT = Path(__file__).resolve().parent.parent
ACTU_DIR = SITE_ROOT / "actualites"
IMG_DIR = SITE_ROOT / "images" / "posts"
INDEX_PATH = SITE_ROOT / "content" / "actualites" / "index.json"

GRAPH_VERSION = "v21.0"
GRAPH_BASE = f"https://graph.facebook.com/{GRAPH_VERSION}"

TOKEN = os.environ.get("FB_PAGE_ACCESS_TOKEN", "").strip()
PAGE_ID = os.environ.get("FB_PAGE_ID", "").strip()

if not TOKEN or not PAGE_ID:
    print("❌ Variables d'environnement manquantes.")
    print("   Crée un fichier .env à la racine du projet (voir SETUP-API-FACEBOOK.md) :")
    print("     FB_PAGE_ACCESS_TOKEN=EAA...")
    print("     FB_PAGE_ID=100064802658263")
    sys.exit(1)

# ────────────────────────────────────────────────
# Args
# ────────────────────────────────────────────────
ap = argparse.ArgumentParser()
ap.add_argument("--dry-run", action="store_true", help="N'écrit aucun fichier")
ap.add_argument("--limit", type=int, default=None, help="Limite le nombre de posts récupérés")
ap.add_argument("--force", action="store_true", help="Re-télécharge tout, même si déjà présent")
args = ap.parse_args()

# ────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────
MONTHS_FR = {1:'janvier',2:'février',3:'mars',4:'avril',5:'mai',6:'juin',7:'juillet',8:'août',9:'septembre',10:'octobre',11:'novembre',12:'décembre'}

def slugify(s, maxlen=60):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode('ascii')
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    s = re.sub(r'[\s_-]+', '-', s)
    return s[:maxlen].strip('-')

def auto_category(text):
    t = (text or '').lower()
    if any(k in t for k in ['soupape','manomètre','sécurité','urgence']): return 'Sécurité'
    if any(k in t for k in ['vitrage','vitre','bris de glace','vitrerie']): return 'Sécurité'
    if any(k in t for k in ['mitigeur','évier','douchette','robinet','plomberie','sanitaire']): return 'Conseils'
    if any(k in t for k in ['panneau','pvc','porte','menuiserie','volet']): return 'Conseils'
    if any(k in t for k in ['chaudière','chauffage','radiateur']): return 'Conseils'
    if any(k in t for k in ['électrique','électricité','tableau']): return 'Conseils'
    if any(k in t for k in ['hiver','été','printemps','automne','saison']): return 'Saisonnier'
    return 'Actualité agence'

def make_resume(text):
    if not text: return ''
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    candidate = ' '.join(lines[1:3]) if len(lines)>1 else lines[0]
    candidate = re.sub(r'^[^\w]+', '', candidate)
    if len(candidate) > 200:
        candidate = candidate[:200].rsplit(' ', 1)[0] + '…'
    return candidate.strip()

def first_line_clean(text):
    if not text: return 'Publication'
    first = next((l.strip() for l in text.split('\n') if l.strip()), 'Publication')
    return re.sub(r'^[^\w]+', '', first)[:120] or 'Publication'

LIST_MARKERS = re.compile(r'^([•✔]|\-)\s+(.+)$')

def text_to_html(text):
    if not text: return ''
    lines = text.split('\n')[1:]
    out, list_buf, para_buf = [], [], []
    def flush_para():
        if para_buf:
            esc = ' '.join(para_buf).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
            out.append(f'<p>{esc}</p>'); para_buf.clear()
    def flush_list():
        if list_buf:
            items = ''.join(f'<li>{x.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")}</li>' for x in list_buf)
            out.append(f'<ul class="actu-list">{items}</ul>'); list_buf.clear()
    for raw in lines:
        line = raw.strip()
        if not line: flush_para(); flush_list(); continue
        m = LIST_MARKERS.match(line)
        if m:
            flush_para(); list_buf.append(m.group(2).strip())
        else:
            flush_list(); para_buf.append(line)
    flush_para(); flush_list()
    return '\n      '.join(out)

# ────────────────────────────────────────────────
# Graph API
# ────────────────────────────────────────────────
def graph_get(endpoint, params=None):
    p = {'access_token': TOKEN}
    if params: p.update(params)
    url = f"{GRAPH_BASE}/{endpoint}"
    r = requests.get(url, params=p, timeout=30)
    if not r.ok:
        print(f"❌ Erreur API {r.status_code} sur {endpoint}")
        try: print(json.dumps(r.json(), indent=2, ensure_ascii=False))
        except: print(r.text[:500])
        sys.exit(1)
    return r.json()

def fetch_all_posts():
    """Récupère TOUS les posts (pagination automatique)."""
    fields = "id,message,created_time,permalink_url,full_picture,attachments{media,subattachments,type,url}"
    posts = []
    endpoint = f"{PAGE_ID}/posts"
    params = {'fields': fields, 'limit': 50}
    while True:
        data = graph_get(endpoint, params)
        posts.extend(data.get('data', []))
        if args.limit and len(posts) >= args.limit:
            posts = posts[:args.limit]; break
        nxt = data.get('paging', {}).get('next')
        if not nxt: break
        # Use the cursor 'after' in next call
        m = re.search(r'after=([^&]+)', nxt)
        if not m: break
        params['after'] = m.group(1); endpoint = f"{PAGE_ID}/posts"
    return posts

def fetch_insights(post_id):
    """Récupère vues, clics, engagement pour un post."""
    try:
        data = graph_get(f"{post_id}/insights",
                         {'metric': 'post_impressions,post_clicks,post_engaged_users'})
        out = {}
        for it in data.get('data', []):
            v = it.get('values', [{}])[0].get('value', 0)
            out[it['name']] = v
        return out
    except Exception:
        return {}

def download_image(url, dest_path):
    """Télécharge une image, ne re-télécharge pas si elle existe déjà (sauf --force)."""
    if dest_path.exists() and not args.force:
        return True
    try:
        r = requests.get(url, timeout=60, stream=True)
        if not r.ok: return False
        if not args.dry_run:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_path, 'wb') as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
        return True
    except Exception as e:
        print(f"  ⚠ Échec téléchargement {url[:60]}… : {e}")
        return False

# ────────────────────────────────────────────────
# Génération HTML
# ────────────────────────────────────────────────
def build_html(post_data):
    title = post_data['title_clean']
    title_html = html.escape(title)
    dt = datetime.fromisoformat(post_data['date'].replace('Z','+00:00'))
    date_long = f"{dt.day} {MONTHS_FR[dt.month]} {dt.year}"
    body_html = text_to_html(post_data['body'])
    resume = make_resume(post_data['body'])
    permalien = post_data['permalien']
    cat = post_data['categorie']
    img_local = post_data.get('image_local', '')
    img_tag = (f'<div class="actu-cover"><img src="../{img_local}" alt="{title_html}" loading="lazy"></div>'
               if img_local else '')
    stats = post_data.get('stats', {})
    vues = stats.get('vues', 0); reactions = stats.get('reactions', 0); partages = stats.get('partages', 0)

    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_html} — HELP Confort Saint-Omer</title>
<meta name="description" content="{html.escape(resume)}">
<link rel="canonical" href="https://www.helpconfort-saintomer.fr/actualites/{post_data['slug']}.html">

<meta property="og:type" content="article">
<meta property="og:title" content="{title_html}">
<meta property="og:description" content="{html.escape(resume)}">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="https://www.helpconfort-saintomer.fr/actualites/{post_data['slug']}.html">
<meta property="og:image" content="https://www.helpconfort-saintomer.fr/{img_local or 'logo-officiel.jpg'}">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css?v=1778352000">
<link rel="icon" type="image/svg+xml" href="../logo.svg">

<style>
  body{{background:#F7FBFD;color:#0A1428;font-family:'Inter',sans-serif;margin:0;line-height:1.65}}
  .actu-nav{{background:#0A1428;color:#fff;padding:14px 0}}
  .actu-nav .container{{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}}
  .actu-nav a{{color:#1FC4F0;text-decoration:none;font-weight:600;font-size:.92rem}}
  .actu-nav .home{{color:#fff;display:inline-flex;align-items:center;gap:8px}}
  .actu-nav .home img{{height:32px;width:auto}}
  .actu-cover{{max-width:880px;margin:0 auto;padding:0 24px}}
  .actu-cover img{{width:100%;border-radius:18px;margin:24px 0 0;box-shadow:0 14px 40px rgba(10,20,40,.12)}}
  .actu-hero{{padding:40px 0 30px}}
  .actu-hero .container{{max-width:780px;margin:0 auto;padding:0 24px}}
  .actu-hero .crumb{{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:18px}}
  .actu-hero .crumb a{{color:#0DA0CF;text-decoration:none}}
  .actu-hero h1{{font-size:2.1rem;line-height:1.2;margin:0 0 18px;color:#0A1428;font-weight:800}}
  .actu-hero .meta{{display:flex;flex-wrap:wrap;gap:14px;font-size:.86rem;color:#64748b;align-items:center}}
  .actu-hero .meta .cat{{background:#E6F8FE;color:#0DA0CF;padding:4px 12px;border-radius:999px;font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.5px}}
  .actu-hero .stats{{display:inline-flex;gap:14px;font-size:.84rem;color:#64748b;flex-wrap:wrap}}
  .actu-hero .stats strong{{color:#0A1428}}
  .actu-body{{max-width:780px;margin:0 auto;padding:30px 24px 60px;font-size:1.05rem}}
  .actu-body p{{margin:0 0 18px}}
  .actu-body .actu-list{{background:#fff;border:1px solid #EAF2F7;border-radius:14px;padding:18px 22px 18px 40px;margin:24px 0;list-style:none}}
  .actu-body .actu-list li{{position:relative;padding-left:22px;margin:8px 0}}
  .actu-body .actu-list li::before{{content:"✔";position:absolute;left:0;top:0;color:#0DA0CF;font-weight:800}}
  .fb-source{{margin:40px 0 0;padding:24px;background:linear-gradient(135deg,#1877F2 0%,#0DA0CF 100%);border-radius:16px;color:#fff;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}}
  .fb-source p{{margin:0;font-weight:600;font-size:.95rem}}
  .fb-source a{{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#1877F2;padding:10px 18px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.9rem}}
  .actu-cta{{margin:30px 0 0;padding:28px;background:#fff;border:2px solid #1FC4F0;border-radius:16px;text-align:center}}
  .actu-cta h3{{margin:0 0 8px;color:#0A1428;font-size:1.2rem}}
  .actu-cta p{{margin:0 0 16px;color:#64748b;font-size:.95rem}}
  .actu-cta a.btn{{display:inline-flex;align-items:center;gap:8px;background:#0DA0CF;color:#fff;padding:14px 28px;border-radius:12px;font-weight:800;text-decoration:none;font-size:1rem}}
  .actu-cta a.btn:hover{{background:#0A1428;transform:translateY(-1px)}}
  .actu-foot{{background:#0A1428;color:rgba(255,255,255,.72);padding:30px 0;text-align:center;font-size:.86rem}}
  .actu-foot a{{color:#1FC4F0;text-decoration:none}}
  @media (max-width:640px){{.actu-hero h1{{font-size:1.55rem}}}}
</style>
</head>
<body>

<nav class="actu-nav">
  <div class="container">
    <a href="../index.html" class="home"><img src="../logo.svg" alt="HELP Confort">HELP Confort</a>
    <a href="../actualites.html">← Toutes les actualités</a>
  </div>
</nav>

{img_tag}

<section class="actu-hero">
  <div class="container">
    <div class="crumb"><a href="../index.html">Accueil</a> · <a href="../actualites.html">Actualités</a></div>
    <h1>{title_html}</h1>
    <div class="meta">
      <span class="cat">{cat}</span>
      <span>· Publié le {date_long}</span>
      <span class="stats">· <strong>{vues}</strong> vues · <strong>{reactions}</strong> réactions · <strong>{partages}</strong> partages</span>
    </div>
  </div>
</section>

<article class="actu-body">
      {body_html}

      <div class="fb-source">
        <p>📘 Cette publication a été partagée sur notre page Facebook</p>
        <a href="{html.escape(permalien)}" target="_blank" rel="noopener">Voir le post Facebook →</a>
      </div>

      <div class="actu-cta">
        <h3>Besoin d'une intervention similaire&nbsp;?</h3>
        <p>Diagnostic clair, devis détaillé, intervention propre — sur Saint-Omer, Dunkerque et 55 km à la ronde.</p>
        <a href="../contact.html" class="btn">📞 Demander un devis gratuit</a>
      </div>
</article>

<footer class="actu-foot">
  <p>© 2026 SARL Dépan'Audo — Agence officielle HELP Confort · <a href="../mentions-legales.html">Mentions légales</a></p>
</footer>

</body>
</html>
'''

# ────────────────────────────────────────────────
# Pipeline principal
# ────────────────────────────────────────────────
def main():
    print(f"🔄 Synchronisation Facebook → site")
    print(f"   Page ID : {PAGE_ID}")
    if args.dry_run: print(f"   Mode    : DRY-RUN (aucun fichier ne sera écrit)")
    print()

    # 1. Récupère tous les posts
    print("📡 Récupération des posts depuis Facebook…")
    posts = fetch_all_posts()
    print(f"✓ {len(posts)} posts trouvés\n")

    # 2. Charge l'index existant pour éviter les doublons
    if INDEX_PATH.exists():
        with open(INDEX_PATH, encoding='utf-8') as f:
            existing = json.load(f)
    else:
        existing = []
    existing_fb_ids = {e.get('fb_id') for e in existing if e.get('fb_id')}

    # 3. Traite chaque post
    new_entries = []
    n_new = n_skip = n_img = 0

    for p in posts:
        fb_id = p.get('id')
        message = p.get('message', '').strip()
        if not message:
            continue
        # Skip if already imported (sauf --force)
        if fb_id in existing_fb_ids and not args.force:
            n_skip += 1; continue

        created = p.get('created_time', '')
        try:
            dt = datetime.fromisoformat(created.replace('Z','+00:00'))
        except:
            continue
        title = first_line_clean(message)
        slug = f"{dt.strftime('%Y-%m-%d')}-{slugify(title)}"
        cat = auto_category(message)
        permalien = p.get('permalink_url', '')

        # Téléchargement de l'image principale
        image_local = ''
        full_pic = p.get('full_picture')
        if full_pic:
            ext = '.jpg'
            img_path = IMG_DIR / f"{slug}{ext}"
            if download_image(full_pic, img_path):
                image_local = f"images/posts/{slug}{ext}"
                n_img += 1

        # Stats (best-effort)
        insights = fetch_insights(fb_id)
        stats = {
            'vues': insights.get('post_impressions', 0),
            'reactions': 0,  # nécessite endpoint séparé
            'partages': 0,
            'clics': insights.get('post_clicks', 0),
            'engagement': insights.get('post_engaged_users', 0),
        }

        post_data = {
            'fb_id': fb_id,
            'title_clean': title,
            'slug': slug,
            'date': dt.strftime('%Y-%m-%dT%H:%M:00'),
            'permalien': permalien,
            'body': message,
            'categorie': cat,
            'image_local': image_local,
            'stats': stats,
        }

        # Génération HTML
        html_content = build_html(post_data)
        if not args.dry_run:
            ACTU_DIR.mkdir(parents=True, exist_ok=True)
            (ACTU_DIR / f"{slug}.html").write_text(html_content, encoding='utf-8')

        new_entries.append({
            'fb_id': fb_id,
            'title': title,
            'date': post_data['date'],
            'categorie': cat,
            'zone': 'Les deux',
            'resume': make_resume(message),
            'image': image_local,
            'url': f"actualites/{slug}.html",
            'published': True,
            'source_facebook': permalien,
            'stats': stats,
        })
        n_new += 1
        print(f"  ✓ {slug}.html  [{cat}]  {'+image' if image_local else 'sans image'}")

    # 4. Merge avec existant : remplace ou ajoute
    if not args.dry_run:
        existing_by_id = {e.get('fb_id'): e for e in existing if e.get('fb_id')}
        # Ajoute/remplace les nouveaux
        for e in new_entries:
            existing_by_id[e['fb_id']] = e
        # Garde aussi les entrées non-FB (legacy)
        legacy = [e for e in existing if not e.get('fb_id')]
        merged = list(existing_by_id.values()) + legacy
        # Tri du plus récent au plus ancien
        merged.sort(key=lambda x: x.get('date', ''), reverse=True)
        INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)

    # 5. Bilan
    print()
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✓ {n_new:>3} nouveaux articles générés")
    print(f"⏭ {n_skip:>3} déjà présents (ignorés)")
    print(f"🖼 {n_img:>3} images téléchargées")
    if args.dry_run:
        print(f"⚠ DRY-RUN : aucun fichier n'a été écrit")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"🎉 Synchronisation terminée !")

if __name__ == '__main__':
    main()
