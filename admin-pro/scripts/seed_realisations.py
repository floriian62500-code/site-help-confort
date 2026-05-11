#!/usr/bin/env python3
"""Génère un SQL d'import des 12 réalisations existantes dans Supabase."""
import json, re, unicodedata, sys

def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode('ascii').lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60]

def sql_str(s):
    if s is None: return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def map_metier(m):
    return {
        'Plomberie': 'plomberie',
        'Chauffage': 'chauffage',
        'Électricité': 'electricite',
        'Electricite': 'electricite',
        'Serrurerie': 'serrurerie',
        'Vitrerie': 'vitrerie',
        'Rénovation': 'renovation',
        'Renovation': 'renovation',
        'Menuiserie': 'renovation',
        'Multi-services': 'multiservice',
    }.get(m, 'multiservice')

data = json.load(open('content/realisations/index.json'))

out = []
out.append(f"-- Seed : {len(data)} réalisations depuis content/realisations/index.json")
out.append("-- Coller dans Supabase → SQL Editor → Run")
out.append("-- Les chantiers existants (slug unique) seront ignorés")
out.append("")
out.append("insert into public.realisations (title, slug, description, description_long, metier, ville, date_intervention, status, pinned, publish_targets, ai_generated, created_by, created_at, published_at) values")

rows = []
for i, r in enumerate(data):
    title = r.get('title', '')
    desc = r.get('description', '').replace('…', '...').strip()
    desc_short = desc[:200] + ('...' if len(desc) > 200 else '')
    metier = map_metier(r.get('metier', ''))
    ville = r.get('ville', 'Saint-Omer')
    date_int = r.get('date', '')[:10] or None
    published = r.get('published', True)
    status = 'publie' if published else 'brouillon'
    featured = r.get('featured', False)
    slug = slugify(title) + '-' + str(i)
    src_fb = r.get('source_facebook', '')
    stats = r.get('stats', {})
    ai_gen = {'imported_from': 'facebook_scrape', 'source_fb': src_fb, 'fb_stats': stats}
    publish_targets = {"site": True, "facebook": True, "instagram": False, "linkedin": False, "gbp": False}
    full_date = r.get('date', '')

    row = "  (" + ", ".join([
        sql_str(title),
        sql_str(slug),
        sql_str(desc_short),
        sql_str(desc),
        sql_str(metier),
        sql_str(ville),
        sql_str(date_int) if date_int else 'NULL',
        sql_str(status),
        'true' if featured else 'false',
        sql_str(json.dumps(publish_targets)) + '::jsonb',
        sql_str(json.dumps(ai_gen, ensure_ascii=False)) + '::jsonb',
        "'import_facebook'",
        sql_str(full_date) + '::timestamptz' if full_date else 'now()',
        (sql_str(full_date) + '::timestamptz') if (published and full_date) else 'NULL',
    ]) + ")"
    rows.append(row)

out.append(',\n'.join(rows))
out.append('on conflict (slug) do nothing;')

result = '\n'.join(out)
print(result)

# Aussi écrire en fichier sortie
with open('admin-pro/scripts/seed_realisations.sql', 'w') as f:
    f.write(result + '\n')
print(f"\n-- Fichier généré : admin-pro/scripts/seed_realisations.sql", file=sys.stderr)
