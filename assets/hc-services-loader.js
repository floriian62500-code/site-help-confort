// ═══════════════════════════════════════════════════════════════
// hc-services-loader.js
// Charge dynamiquement les prestations d'une catégorie depuis Supabase
// et les affiche dans un conteneur cible avec un design responsive.
//
// Usage : ajouter dans le HTML
//   <div data-hc-services data-category="plomberie" data-color="#0DA0CF"></div>
//   <script src="assets/hc-services-loader.js" defer></script>
//
// Optionnel :
//   data-limit="8"    → nombre max de cards (défaut: 12)
//   data-fallback-url="contact.html"   → URL CTA si erreur (défaut: contact.html)
// ═══════════════════════════════════════════════════════════════
(function(){
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var ANON_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  // Icônes par défaut selon mots-clés du nom (mappées à des SVG simples)
  function iconFor(name){
    var n = (name||'').toLowerCase();
    var ic = {
      debouch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M6 8v8"/><path d="M18 8v8"/><path d="M12 6v12"/></svg>',
      fuite:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      mitigeur:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
      cumulus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      sdb:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/></svg>',
      diag:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      chaud:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.5-1-2.5-1-3.5C12.5 9.5 14 8 14 6.5A4.5 4.5 0 0 0 9.5 2c0 0 0 3-2 5-1 1-1 2-1 3 0 2 1 3 2 4z"/></svg>',
      elec:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      serrure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      vitre:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
      renov:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
      gen:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    };
    if (/débouch|wc|évier bouch|canalisation|engorg/.test(n)) return ic.debouch;
    if (/fuite|recherche/.test(n)) return ic.fuite;
    if (/mitigeur|robinet|joint|sanitaire/.test(n)) return ic.mitigeur;
    if (/chauffe.?eau|cumulus|ballon/.test(n)) return ic.cumulus;
    if (/salle de bain|douche|baignoire|sdb|rénov/.test(n)) return ic.sdb;
    if (/diagnostic|déplacement|état des lieux|contrôle/.test(n)) return ic.diag;
    if (/chaudière|chauffage|radiateur|désembou|fioul|gaz/.test(n)) return ic.chaud;
    if (/électric|tableau|disjonct|prise|courant/.test(n)) return ic.elec;
    if (/serrur|cylindre|porte claqu|verrou/.test(n)) return ic.serrure;
    if (/vitr|bris|fen[êe]tre/.test(n)) return ic.vitre;
    if (/travaux|rénovation|menuis|peinture|carrelage/.test(n)) return ic.renov;
    return ic.gen;
  }

  async function loadOne(el){
    var category = el.dataset.category;
    if (!category) return;
    var color = el.dataset.color || '#0DA0CF';
    var limit = parseInt(el.dataset.limit || '12', 10);
    var fallbackUrl = el.dataset.fallbackUrl || 'contact.html';

    el.style.cssText = (el.style.cssText || '') + ';display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;';
    el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8"><div style="display:inline-block;width:26px;height:26px;border:3px solid #E5EDF3;border-top-color:' + color + ';border-radius:50%;animation:hcSpin .8s linear infinite"></div><div style="margin-top:8px;font-size:.84rem">Chargement du catalogue…</div></div><style>@keyframes hcSpin{to{transform:rotate(360deg)}}</style>';

    try {
      // 1. Catégorie
      var catResp = await fetch(SUPABASE_URL + '/rest/v1/service_categories?slug=eq.' + encodeURIComponent(category) + '&select=id', {
        headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY }
      });
      var cats = await catResp.json();
      if (!Array.isArray(cats) || cats.length === 0) throw new Error('Catégorie introuvable: ' + category);

      // 2. Services
      var svcResp = await fetch(SUPABASE_URL + '/rest/v1/services?category_id=eq.' + encodeURIComponent(cats[0].id) + '&select=slug,name,short_desc,price_ht,vat_rate,requires_quote,duration_min,featured&order=position.asc&limit=' + limit, {
        headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY }
      });
      var services = await svcResp.json();
      if (!Array.isArray(services) || services.length === 0) throw new Error('Aucun service ' + category);

      // 3. Render
      el.innerHTML = services.map(function(s){
        var name = esc(s.name);
        var desc = esc(s.short_desc || '');
        var priceTxt = '';
        if (!s.requires_quote && typeof s.price_ht === 'number') {
          var ttc = s.price_ht * (1 + (s.vat_rate || 0.20));
          priceTxt = '<div style="font-weight:700;color:' + color + ';font-size:1.05rem;margin:6px 0 10px">' + ttc.toFixed(0).replace('.', ',') + ' € TTC</div>';
        }
        var slugEnc = encodeURIComponent(s.slug);
        var reserveUrl = 'contact.html?presta=' + slugEnc + '&action=paiement#form';
        var devisUrl = (s.requires_quote && fallbackUrl !== 'contact.html')
          ? fallbackUrl + (fallbackUrl.indexOf('?') === -1 ? '?' : '&') + 'presta=' + slugEnc + '#form'
          : 'contact.html?presta=' + slugEnc + '#form';
        var reserveLabel = s.requires_quote ? '🛒 Commander' : '🛒 Réserver';

        return '<div class="hcsvc-card" style="display:flex;flex-direction:column;padding:18px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;color:inherit;transition:.2s;box-shadow:0 1px 3px rgba(11,18,32,.04)" onmouseover="this.style.borderColor=\'' + color + '\';this.style.boxShadow=\'0 8px 18px rgba(13,160,207,.10)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'#E5EDF3\';this.style.boxShadow=\'0 1px 3px rgba(11,18,32,.04)\';this.style.transform=\'translateY(0)\'">' +
          '<div style="width:42px;height:42px;border-radius:10px;background:' + color + '15;color:' + color + ';display:flex;align-items:center;justify-content:center;margin-bottom:10px">' + iconFor(s.name) + '</div>' +
          '<h3 style="font-size:1.02rem;font-weight:700;color:#0A1428;margin:0 0 6px;line-height:1.3">' + name + '</h3>' +
          '<p style="font-size:.84rem;color:#475569;margin:0 0 8px;line-height:1.45;flex-grow:1">' + desc + '</p>' +
          priceTxt +
          '<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto">' +
            '<a href="' + reserveUrl + '" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;border-radius:10px;font-weight:700;font-size:.86rem;background:' + color + ';color:#fff;text-decoration:none;border:none">' + reserveLabel + '</a>' +
            '<a href="' + devisUrl + '" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border-radius:10px;font-weight:600;font-size:.82rem;background:#fff;color:' + color + ';text-decoration:none;border:1.5px solid ' + color + '">💬 Devis gratuit</a>' +
          '</div>' +
        '</div>';
      }).join('');
    } catch(e) {
      el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;background:#F7FBFD;border-radius:14px;color:#475569"><strong style="display:block;margin-bottom:6px;color:#0A1428">Notre catalogue se met à jour</strong><span style="font-size:.88rem">Demandez votre devis au <a href="tel:+33366100134" style="color:' + color + ';font-weight:700">03 66 10 01 34</a> ou via <a href="' + fallbackUrl + '" style="color:' + color + ';font-weight:700">le formulaire contact</a>.</span></div>';
      console.warn('[hc-services-loader]', e.message);
    }
  }

  function init(){
    document.querySelectorAll('[data-hc-services]').forEach(loadOne);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
