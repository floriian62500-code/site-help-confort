#!/usr/bin/env python3
"""
Injecte le bloc qualification "Quel est votre besoin ?" 3 voies (Dépannage / Installation / Travaux)
sur les 4 pages métier (chauffagiste, électricien, serrurier, travaux).
Le bloc est inséré juste avant la section "<section class=\"hc-services-section\""
pour qu'il apparaisse comme premier rendu après le hero.
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# CSS partagé (mêmes classes mq- que sur plombier, pour cohérence visuelle)
SHARED_CSS = '''<style id="mq-shared">
.m-qualif{padding:clamp(60px,8vw,100px) 0;background:linear-gradient(180deg,#F7FBFD 0%,#fff 100%)}
.m-qualif .container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}
.mq-head{text-align:center;max-width:720px;margin:0 auto clamp(36px,5vw,60px)}
.mq-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,rgba(13,160,207,.12),rgba(31,196,240,.08));color:#0DA0CF;border-radius:999px;font-size:.76rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px}
.mq-title{font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:800;color:#0A1428;letter-spacing:-.02em;margin:0 0 12px;line-height:1.1}
.mq-title em{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:500;color:#0DA0CF}
.mq-lead{font-size:clamp(1rem,1.2vw,1.1rem);color:#475569;line-height:1.6;margin:0}
.mq-grid{display:grid;gap:22px;grid-template-columns:1fr;max-width:1240px;margin:0 auto}
@media(min-width:720px){.mq-grid{grid-template-columns:repeat(3,1fr)}}
.mq-card{position:relative;display:flex;flex-direction:column;background:#fff;border:1.5px solid #E5EDF3;border-radius:22px;padding:28px 26px 24px;text-decoration:none;color:inherit;box-shadow:0 4px 16px rgba(10,20,40,.04);transition:all .3s cubic-bezier(.16,1,.3,1);overflow:hidden}
.mq-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--mq-c,#0DA0CF),var(--mq-c2,#1FC4F0));transform:scaleX(0);transform-origin:left;transition:transform .35s ease}
.mq-card:hover{transform:translateY(-6px);border-color:var(--mq-c,#0DA0CF);box-shadow:0 24px 48px -12px rgba(10,20,40,.14)}
.mq-card:hover::before{transform:scaleX(1)}
.mq-card-urgent{--mq-c:#E11D48;--mq-c2:#FF4D6D}
.mq-card-install{--mq-c:#0DA0CF;--mq-c2:#1FC4F0}
.mq-card-renov{--mq-c:#FF6B1A;--mq-c2:#FF8F4D}
.mq-card-icon{width:56px;height:56px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--mq-c,#0DA0CF),var(--mq-c2,#1FC4F0));margin-bottom:18px;box-shadow:0 8px 18px -4px color-mix(in srgb,var(--mq-c,#0DA0CF) 35%,transparent)}
.mq-card-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.04em;margin-bottom:12px;width:fit-content}
.mq-pill-urgent{background:rgba(225,29,72,.10);color:#BE1238}
.mq-pill-install{background:rgba(13,160,207,.10);color:#0A7FA3}
.mq-pill-renov{background:rgba(255,107,26,.12);color:#C2510A}
.mq-card-title{font-size:1.35rem;font-weight:800;color:#0A1428;letter-spacing:-.01em;margin:0 0 8px;line-height:1.2}
.mq-card-desc{font-size:.96rem;color:#475569;line-height:1.5;margin:0 0 18px}
.mq-card-desc strong{color:#0A1428;font-weight:700}
.mq-card-list{list-style:none;margin:0 0 22px;padding:0;display:flex;flex-direction:column;gap:9px;flex:1}
.mq-card-list li{font-size:.92rem;color:#0A1428;line-height:1.35;padding-left:4px}
.mq-card-foot{display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid #F1F5F9;gap:8px;flex-wrap:wrap}
.mq-card-tag{font-size:.76rem;color:#64748b;font-weight:600}
.mq-card-cta{font-size:.9rem;font-weight:800;color:var(--mq-c,#0DA0CF);letter-spacing:-.01em;transition:transform .2s ease}
.mq-card:hover .mq-card-cta{transform:translateX(4px)}
.mq-urgence{max-width:980px;margin:clamp(28px,4vw,48px) auto 0;display:flex;align-items:center;gap:18px;padding:18px 24px;background:linear-gradient(135deg,rgba(225,29,72,.06),rgba(225,29,72,.02));border:1.5px solid rgba(225,29,72,.20);border-radius:18px;flex-wrap:wrap}
.mq-urgence-icon{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:12px;background:#E11D48;color:#fff;flex-shrink:0;box-shadow:0 6px 16px rgba(225,29,72,.30);animation:mqRingPulse 1.8s ease-in-out infinite}
@keyframes mqRingPulse{0%,100%{box-shadow:0 6px 16px rgba(225,29,72,.30),0 0 0 0 rgba(225,29,72,.40)}50%{box-shadow:0 6px 16px rgba(225,29,72,.40),0 0 0 10px rgba(225,29,72,0)}}
.mq-urgence-text{flex:1;line-height:1.35;min-width:200px}
.mq-urgence-text strong{display:block;color:#0A1428;font-weight:800;font-size:.98rem;margin-bottom:2px}
.mq-urgence-text span{display:block;color:#64748b;font-size:.86rem}
.mq-urgence-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:linear-gradient(135deg,#E11D48,#BE1238);color:#fff;text-decoration:none;border-radius:12px;font-weight:800;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 22px rgba(225,29,72,.32);transition:all .25s ease;flex-shrink:0}
.mq-urgence-cta:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(225,29,72,.42)}
@media(max-width:720px){.mq-urgence{flex-direction:column;text-align:center;padding:20px 18px}.mq-urgence-text{min-width:0}.mq-urgence-cta{width:100%;justify-content:center}}
</style>
'''

# Contenu spécifique par métier
CONTENT = {
    'chauffagiste-saint-omer.html': {
        'title': 'Quel est votre <em>besoin</em> chauffage ?',
        'lead': 'Panne, entretien, remplacement ou pompe à chaleur — le bon parcours selon votre situation.',
        'urgent': {
            'desc': 'Plus de chauffage <strong>là, maintenant</strong>.',
            'items': ['🔥 Chaudière en panne, code erreur', '🚿 Plus d\'eau chaude', '🥶 Radiateur froid', '💨 Désembouage', '⚙️ Réparation pompe / vanne'],
            'tag': 'Intervention rapide',
        },
        'install': {
            'desc': 'Un équipement à <strong>poser ou remplacer</strong>.',
            'items': ['♨️ Remplacement chaudière (gaz, fioul, condensation)', '🌡️ Pompe à chaleur (PAC) air/eau', '💧 Ballon thermodynamique', '📊 Régulation, thermostat connecté', '🔄 Mise aux normes gaz'],
            'tag': 'Devis sous 48h',
        },
        'renov': {
            'desc': 'Un <strong>projet complet</strong> à concevoir.',
            'items': ['🏠 Rénovation système chauffage entier', '🔁 Conversion fioul → PAC ou bois', '💰 Étude aides MaPrimeRénov\' / CEE', '📐 Bilan thermique', '🌿 Énergie renouvelable'],
            'tag': 'Acc. de A à Z',
        }
    },
    'electricien-saint-omer.html': {
        'title': 'Quel est votre <em>besoin</em> électrique ?',
        'lead': 'Panne, mise aux normes ou rénovation complète — choisissez votre voie pour gagner du temps.',
        'urgent': {
            'desc': 'Panne ou court-circuit <strong>en cours</strong>.',
            'items': ['⚡ Panne de courant générale', '🔌 Disjoncteur qui saute en boucle', '💡 Pas d\'éclairage dans une pièce', '🚨 Court-circuit, odeur de brûlé', '🔋 Tableau électrique défaillant'],
            'tag': 'Intervention rapide',
        },
        'install': {
            'desc': 'Un équipement à <strong>poser ou remplacer</strong>.',
            'items': ['🔧 Remplacement tableau électrique', '🔌 Pose prises / interrupteurs', '💡 Éclairage LED, spots encastrés', '🚪 Visiophone, motorisation portail', '🔋 Borne de recharge VE'],
            'tag': 'Devis sous 48h',
        },
        'renov': {
            'desc': 'Une <strong>rénovation complète</strong> de l\'installation.',
            'items': ['🏠 Mise aux normes NF C 15-100', '⚡ Refonte complète tableau + circuits', '🔄 Diagnostic électrique avant vente', '🏗️ Création réseau neuf, extension', '📊 Domotique, smart home'],
            'tag': 'Étude technique',
        }
    },
    'serrurier-saint-omer.html': {
        'title': 'Quel est votre <em>besoin</em> serrurerie ou vitrerie ?',
        'lead': 'Porte claquée, serrure HS, bris de glace — réagissons vite avec la bonne solution.',
        'urgent': {
            'desc': 'Vous êtes <strong>bloqué dehors</strong> ou en danger.',
            'items': ['🚪 Porte claquée, clé cassée', '🔑 Serrure bloquée, ne tourne plus', '💥 Bris de glace, vitre cassée', '🪟 Vitre fissurée à l\'urgence', '🔓 Effraction, porte forcée'],
            'tag': 'Intervention 7j/7',
        },
        'install': {
            'desc': 'Renforcer ou <strong>remplacer</strong> votre installation.',
            'items': ['🔒 Changement serrure A2P', '🛡️ Blindage de porte, certif assurance', '🪟 Remplacement double vitrage', '🚪 Pose porte blindée', '🏠 Cylindre haute sécurité'],
            'tag': 'Devis sous 48h',
        },
        'renov': {
            'desc': 'Un <strong>projet sécurité</strong> ou rénovation menuiserie.',
            'items': ['🛡️ Audit sécurité maison complète', '🪟 Rénovation menuiseries extérieures', '🔐 Coffre-fort, contrôle d\'accès', '🚨 Alarme + serrurerie connectée', '🏗️ Étude post-effraction'],
            'tag': 'Acc. complet',
        }
    },
    'travaux-saint-omer.html': {
        'title': 'Quel est votre <em>projet</em> travaux ?',
        'lead': 'De la petite réparation à la rénovation complète, on adapte le parcours à votre projet.',
        'urgent': {
            'desc': 'Une <strong>petite intervention</strong> à régler vite.',
            'items': ['🪛 Pose d\'étagère, fixation murale', '🧱 Rebouchage trous, fissures', '🚪 Réglage porte, gonds', '🔧 Petits travaux multitâches', '🏠 Dépannage menuiserie légère'],
            'tag': 'Intervention rapide',
        },
        'install': {
            'desc': 'Un <strong>poste à rénover</strong> chez vous.',
            'items': ['🎨 Peinture intérieure pièce/façade', '🪜 Pose parquet, carrelage, sol', '🧱 Plâtrerie, cloison, faux-plafond', '🪟 Pose menuiseries, volets', '🚪 Pose porte intérieure / extérieure'],
            'tag': 'Devis sous 48h',
        },
        'renov': {
            'desc': 'Une <strong>rénovation globale</strong> ou extension.',
            'items': ['🛁 Salle de bain clés en main', '🍳 Cuisine équipée + plomberie', '♿ Adaptation PMR (douche, accès, monte-escalier)', '🏠 Rénovation maison entière', '🌿 Aides MaPrimeRénov\' incluses'],
            'tag': 'Étude + visite',
        }
    },
}

# Marker pour insérer juste avant la 1ère section principale après hero
MARKER_RE = re.compile(r'(<!-- ─── NOS PRESTATIONS [^→]*?─── -->|<!-- NOS PRESTATIONS|<section class="hc-services-section")', re.I)


def build_qualif_block(metier_name, ctx):
    return f'''
<!-- ═══════════════════════════════════════════════════════════════
     QUALIFICATION 3 BLOCS — {metier_name}
═══════════════════════════════════════════════════════════════ -->
<section class="m-qualif" aria-label="Quel est votre besoin">
  <div class="container">
    <div class="mq-head">
      <span class="mq-eyebrow">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Aide à la décision
      </span>
      <h2 class="mq-title">{ctx['title']}</h2>
      <p class="mq-lead">{ctx['lead']}</p>
    </div>
    <div class="mq-grid">
      <a href="nos-prestations.html#cat-{metier_name}" class="mq-card mq-card-urgent">
        <div class="mq-card-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="mq-card-pill mq-pill-urgent">⚡ Réservable en ligne</div>
        <h3 class="mq-card-title">Dépannage rapide</h3>
        <p class="mq-card-desc">{ctx['urgent']['desc']}</p>
        <ul class="mq-card-list">
          {''.join(f'<li>{i}</li>' for i in ctx['urgent']['items'])}
        </ul>
        <div class="mq-card-foot">
          <span class="mq-card-tag">{ctx['urgent']['tag']}</span>
          <span class="mq-card-cta">Voir les interventions →</span>
        </div>
      </a>
      <a href="contact.html?sujet=installation#form" class="mq-card mq-card-install">
        <div class="mq-card-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div class="mq-card-pill mq-pill-install">✏️ Devis sous 48h</div>
        <h3 class="mq-card-title">Installation &amp; remplacement</h3>
        <p class="mq-card-desc">{ctx['install']['desc']}</p>
        <ul class="mq-card-list">
          {''.join(f'<li>{i}</li>' for i in ctx['install']['items'])}
        </ul>
        <div class="mq-card-foot">
          <span class="mq-card-tag">{ctx['install']['tag']}</span>
          <span class="mq-card-cta">Demander un devis →</span>
        </div>
      </a>
      <a href="travaux-saint-omer.html" class="mq-card mq-card-renov">
        <div class="mq-card-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="mq-card-pill mq-pill-renov">🏗️ Visite technique</div>
        <h3 class="mq-card-title">Travaux &amp; rénovation</h3>
        <p class="mq-card-desc">{ctx['renov']['desc']}</p>
        <ul class="mq-card-list">
          {''.join(f'<li>{i}</li>' for i in ctx['renov']['items'])}
        </ul>
        <div class="mq-card-foot">
          <span class="mq-card-tag">{ctx['renov']['tag']}</span>
          <span class="mq-card-cta">Étudier mon projet →</span>
        </div>
      </a>
    </div>
    <div class="mq-urgence">
      <div class="mq-urgence-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <div class="mq-urgence-text">
        <strong>Situation d'urgence ? Sécurité en jeu ?</strong>
        <span>Appelez directement, on prend en charge en priorité.</span>
      </div>
      <a href="tel:+33366100134" class="mq-urgence-cta">03 66 10 01 34</a>
    </div>
  </div>
</section>
'''


updated = 0
skipped = 0
no_match = []

for fname, ctx in CONTENT.items():
    p = ROOT / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    if 'class="m-qualif"' in text or 'class="mq-grid"' in text:
        skipped += 1
        print(f'  ⏭ {fname} (déjà présent)')
        continue

    # Trouver le marker pour insérer avant
    m = MARKER_RE.search(text)
    if not m:
        no_match.append(fname)
        continue

    metier_label = fname.replace('-saint-omer.html', '')
    block = build_qualif_block(metier_label, ctx)
    # Préfixer le CSS si pas déjà
    if 'mq-shared' not in text:
        block = SHARED_CSS + block

    new_text = text[:m.start()] + block + '\n\n' + text[m.start():]
    p.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  ✔ {fname}')

print(f'\nUpdated: {updated} fichiers')
print(f'Skipped (déjà présent): {skipped}')
if no_match:
    print(f'No marker found: {no_match}')
