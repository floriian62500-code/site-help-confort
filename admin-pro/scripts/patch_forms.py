#!/usr/bin/env python3
"""Patche tous les formulaires du site public pour utiliser le système leads Supabase."""
import re, os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

# Liste des fichiers HTML publics (exclure admin-pro et actualites/)
files = [f for f in glob.glob('*.html') if not f.startswith('404')]
files += sorted(glob.glob('actualites/*.html'))[:5]  # limiter actualités pour test

count_modified = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    original = content

    # ─── 1. Patcher chatUrgForm (chat d'urgence flottant)
    # Ajouter data-hc-lead="urgence" si pas déjà présent
    if 'id="chatUrgForm"' in content and 'data-hc-lead' not in re.search(r'<form id="chatUrgForm"[^>]*>', content).group(0):
        content = re.sub(
            r'<form id="chatUrgForm"([^>]*?)>',
            r'<form id="chatUrgForm"\1 data-hc-lead="urgence">',
            content
        )

    # ─── 2. Patcher modaux mailto (carrieres, contact, espace-client, pro, sinistres)
    # Remplacer action="mailto:..." par data-hc-lead="..."
    if 'mailto:saint-omer@helpconfort' in content:
        # Détecter le type selon le fichier
        type_map = {
            'carrieres.html': 'candidature',
            'contact.html': 'contact',
            'espace-client.html': 'espace_client',
            'pro.html': 'professionnel',
            'sinistres.html': 'sinistre'
        }
        lead_type = type_map.get(f, 'contact')
        # On garde le form mais on neutralise mailto et on ajoute data-hc-lead
        content = re.sub(
            r'<form([^>]*?)action="mailto:[^"]*"([^>]*?)>',
            lambda m: f'<form{m.group(1)}action="javascript:void(0)"{m.group(2)} data-hc-lead="{lead_type}">',
            content
        )

    # ─── 3. Patcher formspree
    if 'formspree.io' in content:
        content = re.sub(
            r'<form action="https://formspree\.io[^"]*"([^>]*?)>',
            r'<form action="javascript:void(0)"\1 data-hc-lead="urgence_form">',
            content
        )

    # ─── 4. Patcher m-reserve-form (modal réservation plombier)
    if 'id="m-reserve-form"' in content and 'data-hc-lead' not in (re.search(r'<form[^>]*id="m-reserve-form"[^>]*>', content) or re.match('', '')).group(0):
        content = re.sub(
            r'<form([^>]*?)id="m-reserve-form"([^>]*?)>',
            r'<form\1id="m-reserve-form"\2 data-hc-lead="reservation">',
            content
        )

    # ─── 5. Patcher sousForm (souscription contrats entretien)
    if 'id="sousForm"' in content and 'data-hc-lead' not in (re.search(r'<form[^>]*id="sousForm"[^>]*>', content) or re.match('', '')).group(0):
        content = re.sub(
            r'<form([^>]*?)id="sousForm"([^>]*?)>',
            r'<form\1id="sousForm"\2 data-hc-lead="souscription">',
            content
        )

    # ─── 6. Ajouter le script de capture juste avant </body>
    # Vérifier qu'il n'est pas déjà inclus
    if 'data-hc-lead' in content and 'hc-leads-capture.js' not in content:
        # Pour les fichiers à la racine
        rel_path = 'assets/hc-leads-capture.js' if '/' not in f else '../assets/hc-leads-capture.js'
        content = re.sub(
            r'</body>',
            f'<script src="{rel_path}"></script>\n</body>',
            content,
            count=1
        )

    if content != original:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        count_modified += 1
        print(f'  ✓ {f}')

print(f'\nModifié {count_modified} fichier(s)')
