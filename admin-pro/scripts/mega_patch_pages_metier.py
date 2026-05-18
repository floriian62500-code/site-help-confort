#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
MEGA PATCH UNIFORMISATION PAGES MÉTIER × VILLE
═══════════════════════════════════════════════════════════════

Applique en une commande tous les patches d'harmonisation :

1. PRIORITÉ 1 — Suppression "Sous 1h ouvrée" partout (réputation)
   → Remplace par "Rapidement" ou retire le micro-texte
   → S'applique à TOUS les fichiers HTML du site

2. Bandeau trust V2 uniforme sur pages métier × ville
   → Insertion après le hero, avant la section "m-pourquoi-top"
   → Idempotent via marker HC-TRUST-BAND-V2

3. Fake avis "Mathieu D." / "Sophie L." → placeholder Google
   → Sur pages PMR uniquement (où l'incohérence est manifeste)
   → Plus tard : remplacement par avis dynamiques Supabase

Idempotent : peut être relancé plusieurs fois sans dupliquer.
Logs : print chaque modification pour traçabilité.
═══════════════════════════════════════════════════════════════
"""
import re
import os
import glob
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

# ─────────────────────────────────────────────────────────────
# PATCH 1 : Suppression "Sous 1h ouvrée"
# ─────────────────────────────────────────────────────────────
PATCH_1_REPLACEMENTS = [
    # CTA "Être rappelé" — retirer le <small>
    (r'<small>Sous 1h ouvrée</small>', '<small>Devis sous 24h</small>'),
    (r'<small>sous 1h ouvrée</small>', '<small>Devis sous 24h</small>'),

    # Phrases descriptives dans modales / cartes
    (r'rappelle sous 1h ouvrée', 'rappelle rapidement'),
    (r'rappelle sous 1h\s*ouvrée', 'rappelle rapidement'),
    (r'rappelle sous 1h ouvrée\s*avec\s+le\s+tarif', 'rappelle rapidement avec le tarif'),
    (r'on\s+vous\s+rappelle\s+sous\s+1h\s*ouvrée', 'on vous rappelle rapidement'),
    (r'vous\s+rappelle\s+sous\s+1h\s*ouvrée', 'vous rappelle rapidement'),

    # Sous-titres CTA cartes
    (r'>Sous 1h ouvrée<', '>Devis sous 24h<'),
    (r'>sous 1h ouvrée<', '>Devis sous 24h<'),

    # Cas générique restant (textes dans paragraphes ou alt)
    (r'\bsous 1h ouvrée\b', 'rapidement'),
    (r'\bSous 1h ouvrée\b', 'Rapidement'),
    (r'\b1h ouvrée\b', 'rapidement'),
]

# ─────────────────────────────────────────────────────────────
# PATCH 2 : Bandeau trust V2 uniforme
# ─────────────────────────────────────────────────────────────
TRUST_BAND_V2_MARKER = '<!-- HC-TRUST-BAND-V2 -->'

TRUST_BAND_V2_HTML = '''<!-- HC-TRUST-BAND-V2 -->
<section class="hc-trust-band" aria-label="Confiance et certifications HELP Confort" style="padding:20px 0;background:linear-gradient(180deg,#FAFCFD,#fff);border-bottom:1px solid #E5EDF3">
  <div class="container" style="max-width:1300px;margin:0 auto;padding:0 20px">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;align-items:center;justify-items:center">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.7rem;line-height:1">🏆</span>
        <div style="line-height:1.25">
          <strong style="display:block;color:#0A1428;font-size:.96rem">Qualibat RGE</strong>
          <span style="font-size:.76rem;color:#64748b">+ Handibat certifié</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.7rem;line-height:1">📄</span>
        <div style="line-height:1.25">
          <strong style="display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong>
          <span style="font-size:.76rem;color:#64748b">Gratuit, sans engagement</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.7rem;line-height:1">👨‍🔧</span>
        <div style="line-height:1.25">
          <strong style="display:block;color:#0A1428;font-size:.96rem">Techniciens salariés</strong>
          <span style="font-size:.76rem;color:#64748b">Diplômés et formés HC</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.7rem;line-height:1">📞</span>
        <div style="line-height:1.25">
          <strong style="display:block;color:#0A1428;font-size:.96rem">Standard ouvert</strong>
          <span style="font-size:.76rem;color:#64748b">Lun-Ven 9h-17h · Sam 9h-16h</span>
        </div>
      </div>
    </div>
  </div>
</section>'''

# Pattern : remplace "<!-- BANDEAU GARANTIES ... -->" + 0..N lignes vides + "<section m-pourquoi-top"
TRUST_BAND_PATTERN = re.compile(
    r'<!-- ─── BANDEAU GARANTIES — placé en haut juste après hero ─── -->'
    r'(\s*\n)*'
    r'(?P<existing_v2><!-- HC-TRUST-BAND-V2 -->.*?</section>\s*\n)?'
    r'(\s*\n)*'
    r'<section class="m-pourquoi-top"',
    re.DOTALL
)

# Pages cibles pour le bandeau trust (métier × ville + pages prestations majeures)
METIER_VILLE_GLOB = [
    'plombier-*.html',
    'chauffagiste-*.html',
    'electricien-*.html',
    'serrurier-*.html',
    'vitrier-*.html',
    'menuisier-*.html',
    'travaux-*.html',
    'volets-*.html',
    'pmr-*.html',
]

# ─────────────────────────────────────────────────────────────
# PATCH 3 : Fake avis "Mathieu D." / "Sophie L." (pages PMR)
# ─────────────────────────────────────────────────────────────
FAKE_REVIEWS_PATTERNS = [
    # Pattern bloc témoignage Mathieu D. (Fuite cuisine) - incohérent sur PMR
    re.compile(
        r'<div class="m-review-card[^"]*"[^>]*>\s*'
        r'(?:<div[^>]*>★★★★★</div>\s*)?'
        r'(?:<p[^>]*>«\s*Fuite sous l.évier.*?»\s*</p>\s*)'
        r'(?:<div[^>]*>.*?Mathieu D\..*?</div>\s*)?'
        r'</div>',
        re.DOTALL
    ),
]


# ═══════════════════════════════════════════════════════════════
# EXÉCUTION
# ═══════════════════════════════════════════════════════════════
def apply_patch_1_remove_1h_ouvree(content):
    """Patch 1 : Supprime toutes les mentions 'sous 1h ouvrée'."""
    new_content = content
    n_changes = 0
    for pattern, replacement in PATCH_1_REPLACEMENTS:
        before = new_content
        new_content = re.sub(pattern, replacement, new_content)
        if before != new_content:
            n_changes += 1
    return new_content, n_changes


def apply_patch_2_trust_band(content, filename):
    """Patch 2 : Insère bandeau trust V2 JUSTE APRÈS le commentaire BANDEAU GARANTIES.

    Que la page ait du contenu derrière (retours terrain) ou non,
    le trust band est inséré en tête (signaux de confiance d'abord).
    """
    if TRUST_BAND_V2_MARKER in content:
        # Déjà patché → on remplace l'ancien bloc pour update
        old_band_pattern = re.compile(
            r'<!-- HC-TRUST-BAND-V2 -->.*?</section>',
            re.DOTALL
        )
        new_content, n = old_band_pattern.subn(TRUST_BAND_V2_HTML, content)
        return new_content, n

    # Pas encore patché → insertion juste après le commentaire BANDEAU GARANTIES
    target_pattern = re.compile(
        r'(<!-- ─── BANDEAU GARANTIES — placé en haut juste après hero ─── -->)',
    )

    def replacement(m):
        return f'{m.group(1)}\n{TRUST_BAND_V2_HTML}'

    new_content, n = target_pattern.subn(replacement, content, count=1)
    return new_content, n


def apply_patch_3_fake_reviews(content, filename):
    """Patch 3 : Sur pages PMR, signale les fake reviews (à traiter manuellement)."""
    # Pour ce premier patch, on log seulement (suppression risquée sans connaître la structure exacte)
    if 'pmr-' not in filename and 'salle-de-bain-pmr' not in filename:
        return content, 0

    has_fake = ('Mathieu D.' in content and ('Fuite cuisine' in content or 'Fuite sous l\'évier' in content))
    if has_fake:
        # Pour l'instant, juste un commentaire HTML pour signaler à traiter
        marker = '<!-- HC-FAKE-REVIEWS-TODO: avis incohérents avec PMR à remplacer par sync Supabase -->'
        if marker not in content:
            content = content.replace(
                '<!-- ─── ',
                f'{marker}\n<!-- ─── ',
                1
            )
            return content, 1
    return content, 0


def process_file(filepath, is_metier_ville):
    """Applique tous les patches sur un fichier."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    content = original

    n1 = n2 = n3 = 0

    # Patch 1 : toutes les pages
    content, n1 = apply_patch_1_remove_1h_ouvree(content)

    # Patch 2 : seulement métier × ville
    if is_metier_ville:
        content, n2 = apply_patch_2_trust_band(content, filepath)

    # Patch 3 : seulement PMR
    content, n3 = apply_patch_3_fake_reviews(content, filepath)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return n1, n2, n3
    return 0, 0, 0


def main():
    # Liste cibles patch 2 (métier × ville)
    metier_ville_files = set()
    for pattern in METIER_VILLE_GLOB:
        for f in glob.glob(pattern):
            metier_ville_files.add(f)

    # Liste cibles patch 1 (tous les HTML root + prestations)
    all_html = set(glob.glob('*.html')) | set(glob.glob('prestations/*.html'))
    all_html = {f for f in all_html if not f.startswith('404')}

    print(f"\n🎯 MEGA PATCH — démarrage")
    print(f"   Pages métier × ville cibles : {len(metier_ville_files)}")
    print(f"   Total HTML à scanner : {len(all_html)}\n")

    stats = {'total_1': 0, 'total_2': 0, 'total_3': 0, 'files_changed': 0}

    for filepath in sorted(all_html):
        is_mv = filepath in metier_ville_files
        n1, n2, n3 = process_file(filepath, is_mv)
        if n1 or n2 or n3:
            stats['files_changed'] += 1
            stats['total_1'] += n1
            stats['total_2'] += n2
            stats['total_3'] += n3
            marks = []
            if n1: marks.append(f"P1×{n1}")
            if n2: marks.append(f"P2×{n2}")
            if n3: marks.append(f"P3×{n3}")
            print(f"  ✓ {filepath}  ({', '.join(marks)})")

    print(f"\n═══════════════════════════════════════════════")
    print(f"  ✅ FILES MODIFIÉS : {stats['files_changed']}")
    print(f"  ✅ P1 (remove 1h ouvrée)   : {stats['total_1']} remplacements")
    print(f"  ✅ P2 (trust band V2)      : {stats['total_2']} pages")
    print(f"  ✅ P3 (fake reviews tag)   : {stats['total_3']} pages PMR")
    print(f"═══════════════════════════════════════════════\n")


if __name__ == '__main__':
    main()
