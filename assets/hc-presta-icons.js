/* ============================================================
   HC-PRESTA-ICONS — Remplace emojis génériques par SVG dédiés
   + Regroupement visuel par métier dans la grille "Tout voir"
   ============================================================ */
(function () {
  'use strict';

  // Mapping slug/keyword → SVG inline stylé (24x24 viewBox, plat, monochrome)
  // Couleur héritée de currentColor (sera teintée selon le métier)
  var ICONS = {
    // ═══ PLOMBERIE ═══
    'fuite-visuelle': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8c-8 12-16 20-16 30a16 16 0 0 0 32 0c0-10-8-18-16-30z" fill="currentColor" fill-opacity=".15"/><circle cx="32" cy="40" r="3" fill="currentColor"/><path d="M28 30c-1 2-2 4-2 6"/></svg>',
    'fuite-technique': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="26" r="14" fill="currentColor" fill-opacity=".10"/><circle cx="26" cy="26" r="6"/><path d="M37 37l13 13"/><path d="M22 26h8M26 22v8"/></svg>',
    'desengorgement': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12h32v8H16z" fill="currentColor" fill-opacity=".15"/><path d="M22 20v32M42 20v32"/><path d="M22 36c4 4 16 4 20 0"/><circle cx="32" cy="48" r="2" fill="currentColor"/></svg>',
    'debouchage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12h32v8H16z" fill="currentColor" fill-opacity=".15"/><path d="M22 20v32M42 20v32"/><path d="M22 36c4 4 16 4 20 0"/><circle cx="32" cy="48" r="2" fill="currentColor"/></svg>',
    'chasse-nicoll': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="10" width="28" height="22" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M20 32h24l-3 18a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z" fill="currentColor" fill-opacity=".08"/><circle cx="32" cy="20" r="3"/></svg>',
    'chasse-geberit': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="10" width="28" height="22" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M20 32h24l-3 18a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z" fill="currentColor" fill-opacity=".08"/><circle cx="32" cy="20" r="3"/></svg>',
    'wc': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="10" width="28" height="22" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M20 32h24l-3 18a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z" fill="currentColor" fill-opacity=".08"/><circle cx="32" cy="20" r="3"/></svg>',
    'detartrage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6L20 28h24z" fill="currentColor" fill-opacity=".18"/><path d="M20 28v18a12 12 0 0 0 24 0V28" fill="currentColor" fill-opacity=".10"/><path d="M28 38l4 4 4-4"/></svg>',
    'chauffe-eau': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="8" width="24" height="48" rx="6" fill="currentColor" fill-opacity=".12"/><circle cx="32" cy="22" r="3"/><path d="M28 32h8M28 38h8M28 44h8"/><path d="M26 56h12"/></svg>',
    'ballon': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="8" width="24" height="48" rx="6" fill="currentColor" fill-opacity=".12"/><circle cx="32" cy="22" r="3"/><path d="M28 32h8M28 38h8M28 44h8"/><path d="M26 56h12"/></svg>',
    'sanitaire': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 36h24v18a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="currentColor" fill-opacity=".10"/><path d="M28 36V14a4 4 0 0 1 8 0v22"/><circle cx="32" cy="12" r="2" fill="currentColor"/></svg>',

    // ═══ CHAUFFAGE ═══
    'chaudiere': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="44" rx="4" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="22" r="5"/><path d="M22 36h20M22 42h20"/><path d="M28 50v6M36 50v6"/></svg>',
    'entretien-chaudiere': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="44" rx="4" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="22" r="5"/><path d="M22 36h20M22 42h20"/><path d="M44 50l4 4-4 4M52 56h-8"/></svg>',
    'depannage-chaudiere': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="44" rx="4" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="22" r="5"/><path d="M22 36h20M22 42h20"/><path d="M38 4l-6 10h12l-6 10" fill="currentColor" fill-opacity=".3"/></svg>',
    'desembouage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="20" width="40" height="22" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M18 26v10M26 26v10M34 26v10M42 26v10"/><circle cx="48" cy="48" r="5"/><path d="M48 44v2M48 50v2M44 48h2M50 48h2"/></svg>',
    'radiateur': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="20" width="40" height="22" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M18 26v10M26 26v10M34 26v10M42 26v10"/><path d="M18 46v6M46 46v6"/></svg>',
    'pompe-chaleur': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="48" height="36" rx="4" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="4" fill="currentColor"/><path d="M32 18v4M32 42v4M18 32h4M42 32h4M22 22l3 3M39 39l3 3M22 42l3-3M39 25l3-3"/></svg>',
    'contrat-chauffage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="40" height="48" rx="4" fill="currentColor" fill-opacity=".10"/><path d="M20 22h24M20 30h24M20 38h16"/><path d="M40 46l4 4 8-8" stroke-width="3"/></svg>',
    'contrat': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="40" height="48" rx="4" fill="currentColor" fill-opacity=".10"/><path d="M20 22h24M20 30h24M20 38h16"/><path d="M40 46l4 4 8-8" stroke-width="3"/></svg>',

    // ═══ ÉLECTRICITÉ ═══
    'panne-electrique': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M36 4L16 36h12l-4 24 24-36H36z" fill="currentColor" fill-opacity=".18"/></svg>',
    'tableau-electrique': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="4" fill="currentColor" fill-opacity=".08"/><rect x="16" y="18" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="34" y="18" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="16" y="28" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="34" y="28" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="16" y="38" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="34" y="38" width="14" height="6" rx="1" fill="currentColor" fill-opacity=".3"/></svg>',
    'prise': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="22" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="24" r="3" fill="currentColor"/><circle cx="32" cy="40" r="3" fill="currentColor"/></svg>',
    'electricite': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M36 4L16 36h12l-4 24 24-36H36z" fill="currentColor" fill-opacity=".18"/></svg>',

    // ═══ SERRURERIE ═══
    'porte-claquee': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="8" width="36" height="48" rx="3" fill="currentColor" fill-opacity=".10"/><circle cx="40" cy="32" r="2" fill="currentColor"/><path d="M40 36v6"/></svg>',
    'ouverture-porte': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="8" width="36" height="48" rx="3" fill="currentColor" fill-opacity=".10"/><circle cx="40" cy="32" r="2" fill="currentColor"/><path d="M40 36v6"/></svg>',
    'serrure': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="28" width="32" height="28" rx="4" fill="currentColor" fill-opacity=".12"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><circle cx="32" cy="42" r="3" fill="currentColor"/></svg>',
    'blindage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 4l20 8v18c0 14-9 24-20 30C21 54 12 44 12 30V12z" fill="currentColor" fill-opacity=".15"/><path d="M24 30l6 6 12-12" stroke-width="3"/></svg>',
    'porte-securite': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 4l20 8v18c0 14-9 24-20 30C21 54 12 44 12 30V12z" fill="currentColor" fill-opacity=".15"/><path d="M24 30l6 6 12-12" stroke-width="3"/></svg>',
    'a2p': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 4l20 8v18c0 14-9 24-20 30C21 54 12 44 12 30V12z" fill="currentColor" fill-opacity=".15"/><path d="M24 30l6 6 12-12" stroke-width="3"/></svg>',

    // ═══ VITRERIE ═══
    'vitrage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="3" fill="currentColor" fill-opacity=".10"/><path d="M32 10v44M10 32h44"/></svg>',
    'bris-glace': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="3" fill="currentColor" fill-opacity=".08"/><path d="M32 10l-6 14 18 8-12 8 6 14" fill="currentColor" fill-opacity=".3"/></svg>',
    'double-vitrage': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="3" fill="currentColor" fill-opacity=".10"/><path d="M32 10v44M10 32h44"/></svg>',
    'fenetre': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="3" fill="currentColor" fill-opacity=".10"/><path d="M32 10v44M10 32h44"/></svg>',
    'velux': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 50L32 14l24 36z" fill="currentColor" fill-opacity=".10"/><path d="M32 14v36M16 38h32"/></svg>',
    'mise-en-securite': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="3" fill="currentColor" fill-opacity=".10"/><path d="M32 10v44M10 32h44"/><path d="M20 20l24 24M44 20L20 44" stroke-width="2" stroke-dasharray="3 3"/></svg>',

    // ═══ MENUISERIE / TRAVAUX ═══
    'menuiserie': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 56L32 8l24 48z" fill="currentColor" fill-opacity=".10"/><circle cx="32" cy="36" r="4" fill="currentColor"/></svg>',
    'volet': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="40" height="44" rx="3" fill="currentColor" fill-opacity=".10"/><path d="M18 20h28M18 28h28M18 36h28M18 44h28"/></svg>',
    'isolation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 56v-20l24-20 24 20v20z" fill="currentColor" fill-opacity=".12"/><path d="M22 56V42h20v14"/></svg>',
    'salle-de-bain': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 30v18a6 6 0 0 0 6 6h24a6 6 0 0 0 6-6V30" fill="currentColor" fill-opacity=".10"/><path d="M10 30h44"/><path d="M22 16v8M22 16h12a6 6 0 0 1 6 6"/></svg>',
    'renovation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 56v-24l24-24 24 24v24z" fill="currentColor" fill-opacity=".12"/><rect x="26" y="40" width="12" height="16"/></svg>',
    'pmr': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="14" r="5" fill="currentColor" fill-opacity=".3"/><path d="M28 24h14l4 16h10M44 40a12 12 0 1 1-22 5"/></svg>',
    'adaptation': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="14" r="5" fill="currentColor" fill-opacity=".3"/><path d="M28 24h14l4 16h10M44 40a12 12 0 1 1-22 5"/></svg>',
    'autre': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="22" fill="currentColor" fill-opacity=".08"/><path d="M26 26a6 6 0 0 1 12 0c0 3-3 5-6 5v4M32 42v.01"/></svg>'
  };

  // Détecte le slug → icône
  function getIcon(prestaId, label) {
    var src = (prestaId + ' ' + (label || '')).toLowerCase();
    // Tri par priorité (mots les plus spécifiques en premier)
    var ordered = ['fuite-technique','fuite-visuelle','chauffe-eau','ballon-eau','entretien-chaudiere','depannage-chaudiere','tableau-electrique','panne-electrique','double-vitrage','bris-glace','ouverture-porte','porte-claquee','porte-securite','salle-de-bain','contrat-chauffage','chasse-nicoll','chasse-geberit','contrat','radiateur','desembouage','desengorgement','debouchage','detartrage','sanitaire','chaudiere','pompe-chaleur','blindage','a2p','serrure','vitrage','fenetre','velux','menuiserie','volet','isolation','renovation','pmr','adaptation','prise','electricite','autre'];
    for (var i = 0; i < ordered.length; i++) {
      var k = ordered[i];
      if (src.indexOf(k) >= 0 && ICONS[k]) return ICONS[k];
      // Aussi tester sans tiret
      if (src.indexOf(k.replace(/-/g, ' ')) >= 0 && ICONS[k]) return ICONS[k];
      if (src.indexOf(k.replace(/-/g, '')) >= 0 && ICONS[k]) return ICONS[k];
    }
    return ICONS.autre;
  }

  function replaceIcons(root) {
    if (!root) return;
    root.querySelectorAll('.pp-card, .apm-item').forEach(function (card) {
      if (card.dataset.hcIconDone) return;
      var iconEl = card.querySelector('.pp-icon, .apm-item-icon');
      if (!iconEl) return;
      var labelEl = card.querySelector('.pp-label, .apm-item-label');
      var label = labelEl ? labelEl.textContent.trim() : '';
      var pid = card.dataset.prestaId || '';
      var svg = getIcon(pid, label);
      iconEl.innerHTML = svg;
      iconEl.classList.add('hc-icon-svg');
      card.dataset.hcIconDone = '1';
    });
  }

  var CSS = '\
.hc-icon-svg{padding:0 !important;background:transparent !important}\
.hc-icon-svg svg{width:42px !important;height:42px !important;color:var(--pp-c1,#0DA0CF) !important;display:block !important}\
.apm-item .hc-icon-svg svg{width:36px !important;height:36px !important}\
\
/* Grouping visuel modal "Tout voir" */\
.apm-group-head{background:linear-gradient(135deg,var(--apm-c-bg,rgba(13,160,207,.06)),transparent);padding:14px 16px !important;border-radius:10px !important;border-left:4px solid var(--apm-c-border,#0DA0CF) !important;margin-top:18px !important;margin-bottom:12px !important;display:flex !important;align-items:center !important;gap:10px !important}\
.apm-group-head h4{font-size:1rem !important;font-weight:800 !important;color:#0A1428 !important;letter-spacing:-.01em;margin:0 !important}\
.apm-group-head .apm-group-emoji{font-size:1.4rem !important;line-height:1 !important}\
.apm-group-head .apm-count{margin-left:auto;background:var(--apm-c-border,#0DA0CF);color:#fff !important;font-weight:800;font-size:.78rem;padding:2px 10px;border-radius:999px;line-height:1.4}\
';

  function init() {
    if (!document.getElementById('hc-presta-icons-style')) {
      var st = document.createElement('style');
      st.id = 'hc-presta-icons-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    replaceIcons(document);

    // Observer pour MAJ continue
    var moTarget = document.body;
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) replaceIcons(n.parentNode || n);
        });
      });
    });
    mo.observe(moTarget, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
