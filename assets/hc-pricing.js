/* ============================================================
   HC-PRICING — Tableau pricing 3 formules contrats d'entretien
   Essentiel / Confort (recommandé) / Premium
   CTA = lien Stripe direct (Payment Links créés via paiements.html)
   Utilisation : <div data-hc-pricing></div>
   ============================================================ */
(function () {
  'use strict';

  var PLANS = [
    {
      key: 'essentiel',
      label: 'Essentiel',
      tagline: 'L\'obligatoire, bien fait.',
      price: '12,90 €',
      period: '/mois',
      annuel: '154,80 € / an',
      color: '#0DA0CF',
      colorSoft: 'rgba(13,160,207,.10)',
      contractUrl: 'contact.html?presta=Contrat+d%27entretien&objet=Souscription+Essentiel#form',
      features: [
        { ok: true, label: 'Entretien annuel chaudière (gaz, fioul)' },
        { ok: true, label: 'Attestation légale envoyée' },
        { ok: true, label: 'Vérification sécurité gaz' },
        { ok: true, label: 'Rappel automatique' },
        { ok: false, label: 'Dépannage prioritaire' },
        { ok: false, label: 'Pièces incluses' },
        { ok: false, label: 'VMC + adoucisseur' }
      ],
      badge: ''
    },
    {
      key: 'confort',
      label: 'Confort',
      tagline: 'Le standard de nos clients.',
      price: '19,90 €',
      period: '/mois',
      annuel: '238,80 € / an',
      color: '#FF6B1A',
      colorSoft: 'rgba(255,107,26,.10)',
      contractUrl: 'contact.html?presta=Contrat+d%27entretien&objet=Souscription+Confort#form',
      features: [
        { ok: true, label: 'Tout l\'Essentiel' },
        { ok: true, label: 'Dépannage prioritaire (intervention sous 24h)' },
        { ok: true, label: 'Petites pièces incluses (joint, vanne)' },
        { ok: true, label: 'Désembouage tous les 5 ans' },
        { ok: true, label: 'Pas de majoration soir/week-end' },
        { ok: false, label: 'Pièces lourdes (circulateur, vase) incluses' },
        { ok: false, label: 'VMC + adoucisseur' }
      ],
      badge: 'Recommandé'
    },
    {
      key: 'premium',
      label: 'Premium',
      tagline: 'Tranquillité totale.',
      price: '29,90 €',
      period: '/mois',
      annuel: '358,80 € / an',
      color: '#7C3AED',
      colorSoft: 'rgba(124,58,237,.10)',
      contractUrl: 'contact.html?presta=Contrat+d%27entretien&objet=Souscription+Premium#form',
      features: [
        { ok: true, label: 'Tout le Confort' },
        { ok: true, label: 'Pièces lourdes incluses (circulateur, vanne 3 voies, vase)' },
        { ok: true, label: 'Entretien VMC bisannuel' },
        { ok: true, label: 'Adoucisseur entretien annuel' },
        { ok: true, label: 'Intervention sous 4h en urgence' },
        { ok: true, label: 'Ligne directe technicien' },
        { ok: true, label: 'Bilan énergétique annuel' }
      ],
      badge: 'Tout-en-un'
    }
  ];

  var CSS = '\
.hc-pricing{padding:70px 20px 80px;background:linear-gradient(180deg,#F7FBFD,#fff);position:relative;overflow:hidden}\
.hc-pricing-wrap{max-width:1180px;margin:0 auto;position:relative}\
.hc-pricing-head{text-align:center;margin-bottom:50px;max-width:760px;margin-left:auto;margin-right:auto}\
.hc-pricing-eyebrow{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;background:rgba(255,107,26,.10);color:#FF6B1A;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}\
.hc-pricing-eyebrow::before{content:"📋"}\
.hc-pricing h2{font-family:"Inter",sans-serif;font-size:clamp(1.9rem,4vw,2.7rem);font-weight:800;color:#0A1428;margin:0 0 12px;letter-spacing:-.022em;line-height:1.2}\
.hc-pricing h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#FF6B1A;font-weight:600}\
.hc-pricing-sub{color:#475569;margin:0;font-size:1.06rem;line-height:1.55}\
.hc-pricing-grid{display:grid;grid-template-columns:1fr;gap:20px;align-items:stretch}\
@media(min-width:768px){.hc-pricing-grid{grid-template-columns:1fr 1fr 1fr;gap:18px}}\
.hc-pricing-card{background:#fff;border:2px solid #E5EDF3;border-radius:20px;padding:32px 26px;display:flex;flex-direction:column;gap:18px;position:relative;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}\
.hc-pricing-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(10,20,40,.08)}\
.hc-pricing-card.is-featured{border-color:var(--p-c);box-shadow:0 12px 36px rgba(255,107,26,.18)}\
.hc-pricing-card.is-featured:hover{box-shadow:0 24px 50px rgba(255,107,26,.25)}\
.hc-pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--p-c);color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:999px;box-shadow:0 6px 14px rgba(0,0,0,.12);white-space:nowrap}\
.hc-pricing-head-card{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}\
.hc-pricing-label{font-size:1.4rem;font-weight:800;color:#0A1428;margin:0;letter-spacing:-.02em}\
.hc-pricing-tagline{font-size:.86rem;color:#64748b;margin:0;font-style:italic;line-height:1.4}\
.hc-pricing-price-block{text-align:center;padding:22px 0;border-top:1px solid #F1F5F9;border-bottom:1px solid #F1F5F9}\
.hc-pricing-price{font-size:2.6rem;font-weight:900;color:#0A1428;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}\
.hc-pricing-period{font-size:1rem;color:#94a3b8;font-weight:600;letter-spacing:-.01em}\
.hc-pricing-annuel{display:block;font-size:.78rem;color:#94a3b8;margin-top:6px;font-weight:600}\
.hc-pricing-features{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;flex:1}\
.hc-pricing-feat{display:flex;align-items:flex-start;gap:9px;font-size:.92rem;line-height:1.5;color:#475569}\
.hc-pricing-feat-ic{width:18px;height:18px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:800;margin-top:2px}\
.hc-pricing-feat.ok .hc-pricing-feat-ic{background:rgba(34,197,94,.15);color:#15803D}\
.hc-pricing-feat.ok .hc-pricing-feat-ic::before{content:"✓"}\
.hc-pricing-feat.ko .hc-pricing-feat-ic{background:rgba(148,163,184,.15);color:#94a3b8}\
.hc-pricing-feat.ko .hc-pricing-feat-ic::before{content:"−"}\
.hc-pricing-feat.ko{color:#94a3b8}\
.hc-pricing-cta{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;background:var(--p-soft,#F7FBFD);color:var(--p-c,#0DA0CF);border:2px solid var(--p-c,#0DA0CF);border-radius:12px;text-decoration:none;font-weight:800;font-size:.96rem;transition:all .2s ease;cursor:pointer;font-family:inherit}\
.hc-pricing-cta:hover{background:var(--p-c,#0DA0CF);color:#fff;transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.10)}\
.hc-pricing-card.is-featured .hc-pricing-cta{background:var(--p-c);color:#fff}\
.hc-pricing-card.is-featured .hc-pricing-cta:hover{background:#0A1428;border-color:#0A1428}\
.hc-pricing-bottom{margin-top:40px;text-align:center;padding:24px;background:#F7FBFD;border:1px solid #E5EDF3;border-radius:14px;font-size:.92rem;color:#475569;line-height:1.6}\
.hc-pricing-bottom strong{color:#0A1428;font-weight:700}';

  function buildCard(plan) {
    var styles = 'style="--p-c:' + plan.color + ';--p-soft:' + plan.colorSoft + '"';
    var featured = plan.key === 'confort' ? 'is-featured' : '';
    var badge = plan.badge ? '<div class="hc-pricing-badge">' + plan.badge + '</div>' : '';
    var features = plan.features.map(function (f) {
      return '<li class="hc-pricing-feat ' + (f.ok ? 'ok' : 'ko') + '"><span class="hc-pricing-feat-ic" aria-hidden="true"></span>' + f.label + '</li>';
    }).join('');
    return '\
    <article class="hc-pricing-card ' + featured + '" ' + styles + '>\
      ' + badge + '\
      <div class="hc-pricing-head-card">\
        <h3 class="hc-pricing-label">' + plan.label + '</h3>\
        <p class="hc-pricing-tagline">' + plan.tagline + '</p>\
      </div>\
      <div class="hc-pricing-price-block">\
        <span class="hc-pricing-price">' + plan.price + '</span>\
        <span class="hc-pricing-period">' + plan.period + '</span>\
        <small class="hc-pricing-annuel">soit ' + plan.annuel + '</small>\
      </div>\
      <ul class="hc-pricing-features">' + features + '</ul>\
      <a href="' + plan.contractUrl + '" class="hc-pricing-cta">Souscrire ' + plan.label + ' →</a>\
    </article>';
  }

  function build() {
    return '\
    <section class="hc-pricing" aria-label="Formules contrats d\'entretien">\
      <div class="hc-pricing-wrap">\
        <div class="hc-pricing-head">\
          <span class="hc-pricing-eyebrow">Contrats d\'entretien</span>\
          <h2>3 formules, <em>1 vraie tranquillité</em></h2>\
          <p class="hc-pricing-sub">Entretien légal annuel + dépannage prioritaire + pièces incluses (selon formule). Sans engagement de durée — résiliation libre.</p>\
        </div>\
        <div class="hc-pricing-grid">' + PLANS.map(buildCard).join('') + '</div>\
        <div class="hc-pricing-bottom">\
          ✅ <strong>Sans engagement</strong> · Résiliation 1 clic depuis votre espace client · Annulé = remboursement au prorata.<br>\
          Vous avez un cas spécifique (VMC, adoucisseur, climatisation) ? <a href="tel:+33366100134" style="color:#0DA0CF;font-weight:700">Appelez-nous au 03 66 10 01 34</a> on adapte.\
        </div>\
      </div>\
    </section>';
  }

  function init() {
    if (!document.getElementById('hc-pricing-style')) {
      var st = document.createElement('style');
      st.id = 'hc-pricing-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-pricing]').forEach(function (el) {
      if (el.dataset.hcPricingDone) return;
      el.dataset.hcPricingDone = '1';
      el.innerHTML = build();
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
