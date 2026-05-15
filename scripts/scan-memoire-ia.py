#!/usr/bin/env python3
"""
scan-memoire-ia.py — Scan automatique croisant la mémoire IA + référentiel tarifs

Usage:
  python3 scripts/scan-memoire-ia.py [--quiet]

Sortie:
  - logs/scan-memoire-ia-YYYY-MM-DD-HHMM.json
  - logs/scan-memoire-ia-latest.json (lien symbolique)
  - stdout : rapport texte concis

Sondes appliquées (depuis admin-pro/MEMOIRE_IA_MAINTENANCE.md) :
  - #23 Tarif-orphelin (PRIORITÉ ABSOLUE)
  - #10 Script inexistant (sample)
  - #30bis Images vides dans JSON
  - #18 Payload-schema (audit léger via grep)
  - #19-22 sondes UI/composant (à venir)
"""
import re, os, json, sys, datetime

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUIET = '--quiet' in sys.argv

TUNNEL_PAGES = {
    'plombier-saint-omer.html', 'chauffagiste-saint-omer.html',
    'electricien-saint-omer.html', 'serrurier-saint-omer.html',
    'travaux-saint-omer.html', 'nos-prestations.html',
    'contact.html', 'contrats-entretien.html',
    'depannage-saint-omer.html', 'depannage-dunkerque.html',
}

# 1. Charge la mémoire bugs
mem_path = os.path.join(SITE, "admin-pro", "MEMOIRE_IA_MAINTENANCE.md")
with open(mem_path) as f: mem_md = f.read()
nb_bugs = len(re.findall(r"^### ", mem_md, re.M))

# 2. Charge le référentiel tarifs
tar_path = os.path.join(SITE, "admin-pro", "TARIFS_REFERENCE.md")
with open(tar_path) as f: tar_md = f.read()
validated = set(re.findall(r"\*\*(\d+)\s*€\*\*", tar_md))
# Contrats mensuels HT + main d'œuvre dunkerque + frais déplacement
validated.update({'9', '12', '13', '16', '23', '27', '53', '58', '60'})

# 3. Charge AGENT_TODO
todo_path = os.path.join(SITE, "admin-pro", "AGENT_TODO.md")
with open(todo_path) as f: todo_md = f.read()
nfaits = len(re.findall(r"^- \[x\]", todo_md, re.M))
nrest = len(re.findall(r"^- \[ \]", todo_md, re.M))
nbloq = len(re.findall(r"^- \[\?\]|^- \[!\]", todo_md, re.M))

# 4. Scan tarifs orphelins
public_pages = sorted([f for f in os.listdir(SITE) if f.endswith('.html') and not f.startswith('.') and f != '404.html'])
critique, majeur, mineur = [], [], []
for p in public_pages:
    with open(os.path.join(SITE, p), encoding='utf-8', errors='ignore') as f:
        content = f.read()
    for m in re.finditer(r"(\d+(?:[\s.]\d{3})?)\s*€", content):
        amount = m.group(1).replace(' ', '').replace('.', '')
        if amount in validated: continue
        start = max(0, m.start() - 200)
        end = min(len(content), m.end() + 100)
        ctx = content[start:end]
        if 'data-source=' in ctx: continue
        is_range = bool(re.search(r"entre\s+\d+\s*€?\s*(?:et|à)|fourchette|comptez\s+(?:entre|environ)", ctx, re.I))
        entry = {'page': p, 'amount': amount, 'context': re.sub(r"\s+", " ", ctx[180:280])}
        if p in TUNNEL_PAGES and not is_range:
            critique.append(entry)
        elif p in TUNNEL_PAGES:
            mineur.append(entry)
        else:
            majeur.append(entry)

# 5. Sonde JSON images
actu_path = os.path.join(SITE, "content", "actualites", "index.json")
imgs_vides = 0
total_actus = 0
if os.path.exists(actu_path):
    with open(actu_path) as f: actus = json.load(f)
    total_actus = len(actus)
    imgs_vides = sum(1 for a in actus if not a.get('image'))

# 6. Sonde scripts inexistants
broken_scripts = []
for p in public_pages:
    with open(os.path.join(SITE, p), encoding='utf-8', errors='ignore') as f:
        content = f.read()
    for m in re.finditer(r'<script src="(?!https?:)([^"#?]+)"', content):
        path = m.group(1)
        if not os.path.exists(os.path.join(SITE, path)):
            broken_scripts.append({'page': p, 'src': path})

# 7. Score santé
score = max(0, 100 - len(critique)*3 - len(majeur))

# 8. Sortie
ts = datetime.datetime.now().strftime("%Y-%m-%d-%H%M")
out = {
    'date': ts,
    'memoire_ia_bugs': nb_bugs,
    'tarifs_valides': len(validated),
    'tarifs_orphelins': {
        'critique_tunnel': len(critique),
        'majeur_info': len(majeur),
        'mineur_fourchette': len(mineur),
        'detail_critique': critique[:20],
    },
    'images_vides_json': {'absentes': imgs_vides, 'total': total_actus},
    'scripts_inexistants': broken_scripts,
    'agent_todo': {'faits': nfaits, 'restants': nrest, 'bloques': nbloq},
    'score_sante': score,
    'pages_scannees': len(public_pages),
}

logs_dir = os.path.join(SITE, "logs")
os.makedirs(logs_dir, exist_ok=True)
out_path = os.path.join(logs_dir, f"scan-memoire-ia-{ts}.json")
with open(out_path, "w") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

# Lien symbolique latest
latest = os.path.join(logs_dir, "scan-memoire-ia-latest.json")
try:
    if os.path.exists(latest) or os.path.islink(latest): os.remove(latest)
    os.symlink(out_path, latest)
except OSError:
    # Si pas de droits symlink, fallback en copie
    import shutil; shutil.copy(out_path, latest)

if not QUIET:
    print("══════════════════════════════════════════════════════")
    print(f"  SCAN MEMOIRE-IA · {ts}")
    print("══════════════════════════════════════════════════════")
    print(f"📚 Contexte : {nb_bugs} bugs · {len(validated)} tarifs · {len(public_pages)} pages")
    print()
    print(f"🔴 CRITIQUES : {len(critique)} tarifs orphelins en tunnel · {len(broken_scripts)} scripts cassés")
    print(f"🟠 MAJEURS  : {len(majeur)} tarifs orphelins en info · {imgs_vides}/{total_actus} images vides")
    print(f"🟡 MINEURS  : {len(mineur)} fourchettes pédagogiques")
    print()
    print(f"📊 AGENT_TODO : {nfaits} faits / {nrest} restants / {nbloq} bloqués")
    print()
    print(f"💯 Score : {score}/100")
    print(f"📁 Rapport : logs/scan-memoire-ia-{ts}.json")

sys.exit(0 if score >= 50 else 1)
