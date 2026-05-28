/* ============================================================
   HC-TOOLS-SHOWCASE — Section mise en avant des 5 outils
   Calculateur, Simulateur aides, Comparateur, Slider, Carte
   Utilisation : <div data-hc-tools-showcase></div>
   ============================================================ */
(function () {
  'use strict';

  var TOOLS = [
    {
      icon: '🧮',
      color: '#0DA0CF',
      colorSoft: 'rgba(13,160,207,.12)',
      title: 'Calculateur prix',
      desc: '3 questions, une fourchette de prix en 30 secondes. Métier, type d\'intervention, urgence — résultat immédiat.',
      cta: 'Tester maintenant',
      href: 'devis-express.html',
      tag: 'Nouveau'
    },
    {
      icon: '💰',
      color: '#22C55E',
      colorSoft: 'rgba(34,197,94,.12)',
      title: 'Simulateur d\'aides',
      desc: 'MaPrimeRenov + CEE + chèque énergie. Estimation 2026 selon vos revenus et travaux. Devis pré-rempli si éligible.',
      cta: 'Calculer mes aides',
      href: 'aides.html',
      tag: 'Aides 2026'
    },
    {
      icon: '⚖️',
      color: '#FF6B1A',
      colorSoft: 'rgba(255,107,26,.12)',
      title: 'Comparateur équipements',
      desc: 'Chaudières, pompes à chaleur, chauffe-eau. Prix posés, aides, avantages — comparez 8 solutions en un coup d\'œil.',
      cta: 'Comparer',
      href: 'tarifs.html',
      tag: 'Pratique'
    },
    {
      icon: '🎞️',
      color: '#FFB400',
      colorSoft: 'rgba(255,180,0,.12)',
      title: 'Avant / Après',
      desc: 'Faites glisser le curseur sur nos chantiers réels et découvrez la transformation. Photos de vrais projets clients.',
      cta: 'Voir les chantiers',
      href: 'avant-apres.html',
      tag: 'Interactif'
    },
    {
      icon: '🗺️',
      color: '#7C3AED',
      colorSoft: 'rgba(124,58,237,.12)',
      title: 'Carte d\'intervention',
      desc: '4 zones principales + 80 communes couvertes. Trouvez votre ville en un clic et accédez à sa page dédiée.',
      cta: 'Voir la carte',
      href: 'nos-villes.html',
      tag: 'Géolocalisé'
    },
    {
      icon: '💬',
      color: '#635BFF',
      colorSoft: 'rgba(99,91,255,.12)',
      title: 'Assistant chat',
      desc: 'Bouton flottant en bas-droite. Posez votre question (métier, prix, zones, horaires) — réponse instantanée 24/7.',
      cta: 'Ouvrir le chat ↘',
      href: '#hcChatFab',
      tag: 'Auto-IA'
    }
  ];

  var CSS = '\
.hc-tools{padding:70px 20px 80px;background:linear-gradient(180deg,#F7FBFD 0%,#fff 100%);position:relative;overflow:hidden}\
.hc-tools::before{content:"";position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(13,160,207,.08),transparent 70%);border-radius:50%;pointer-events:none}\
.hc-tools-wrap{max-width:1240px;margin:0 auto;position:relative;z-index:1}\
.hc-tools-head{text-align:center;margin-bottom:48px;max-width:760px;margin-left:auto;margin-right:auto}\
.hc-tools-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(13,160,207,.10);color:#0DA0CF;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}\
.hc-tools-eyebrow::before{content:"🛠️"}\
.hc-tools h2{font-family:"Inter",sans-serif;font-size:clamp(1.9rem,4vw,2.7rem);font-weight:800;color:#0A1428;margin:0 0 14px;letter-spacing:-.022em;line-height:1.2}\
.hc-tools h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#FF6B1A;font-weight:600}\
.hc-tools-sub{color:#475569;margin:0;font-size:1.06rem;line-height:1.55}\
.hc-tools-grid{display:grid;grid-template-columns:1fr;gap:18px}\
@media (min-width:640px){.hc-tools-grid{grid-template-columns:1fr 1fr;gap:20px}}\
@media (min-width:1024px){.hc-tools-grid{grid-template-columns:repeat(3,1fr);gap:24px}}\
.hc-tools-card{position:relative;background:#fff;border:1px solid #E5EDF3;border-radius:20px;padding:28px 26px;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:14px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;overflow:hidden;cursor:pointer}\
.hc-tools-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:var(--tool-c,#0DA0CF);transform:scaleX(0);transform-origin:left;transition:transform .35s ease}\
.hc-tools-card:hover{transform:translateY(-5px);box-shadow:0 24px 50px rgba(10,20,40,.10);border-color:var(--tool-c,#0DA0CF)}\
.hc-tools-card:hover::before{transform:scaleX(1)}\
.hc-tools-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}\
.hc-tools-ic{width:56px;height:56px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;background:var(--tool-soft,rgba(13,160,207,.12));font-size:1.8rem;flex-shrink:0;transition:transform .25s ease}\
.hc-tools-card:hover .hc-tools-ic{transform:scale(1.08) rotate(-4deg)}\
.hc-tools-tag{display:inline-flex;align-items:center;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;color:var(--tool-c,#0DA0CF);background:var(--tool-soft,rgba(13,160,207,.10));white-space:nowrap}\
.hc-tools-card h3{font-size:1.2rem;font-weight:800;color:#0A1428;margin:0;letter-spacing:-.015em;line-height:1.25}\
.hc-tools-card p{font-size:.94rem;color:#475569;line-height:1.6;margin:0;flex:1}\
.hc-tools-cta{display:inline-flex;align-items:center;gap:6px;color:var(--tool-c,#0DA0CF);font-weight:800;font-size:.92rem;letter-spacing:-.005em;margin-top:4px}\
.hc-tools-cta svg{transition:transform .2s ease}\
.hc-tools-card:hover .hc-tools-cta svg{transform:translateX(4px)}';

  function buildCard(tool) {
    var styles = 'style="--tool-c:' + tool.color + ';--tool-soft:' + tool.colorSoft + '"';
    var href = tool.href === '#hcChatFab' ? 'javascript:void(0)' : tool.href;
    var onclick = tool.href === '#hcChatFab' ? ' onclick="var f=document.getElementById(\'hcChatFab\');if(f)f.click();"' : '';
    return '\
    <a href="' + href + '" class="hc-tools-card" ' + styles + onclick + '>\
      <div class="hc-tools-card-head">\
        <div class="hc-tools-ic">' + tool.icon + '</div>\
        <span class="hc-tools-tag">' + tool.tag + '</span>\
      </div>\
      <h3>' + tool.title + '</h3>\
      <p>' + tool.desc + '</p>\
      <span class="hc-tools-cta">' + tool.cta + '\
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>\
      </span>\
    </a>';
  }

  function buildSection() {
    return '\
    <section class="hc-tools" aria-label="Nos outils interactifs">\
      <div class="hc-tools-wrap">\
        <div class="hc-tools-head">\
          <span class="hc-tools-eyebrow">Outils interactifs</span>\
          <h2>Tout ce qu\'il vous faut <em>pour décider</em></h2>\
          <p class="hc-tools-sub">6 outils gratuits pour estimer, comparer, simuler et choisir en toute confiance. Pas d\'inscription, pas de spam — juste de l\'info utile.</p>\
        </div>\
        <div class="hc-tools-grid">' + TOOLS.map(buildCard).join('') + '</div>\
      </div>\
    </section>';
  }

  function inject() {
    if (!document.getElementById('hc-tools-style')) {
      var st = document.createElement('style');
      st.id = 'hc-tools-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-tools-showcase]').forEach(function (el) {
      if (el.dataset.hcToolsDone) return;
      el.dataset.hcToolsDone = '1';
      el.innerHTML = buildSection();
    });
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
