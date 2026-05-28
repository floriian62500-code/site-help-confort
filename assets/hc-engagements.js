/* ============================================================
   HC-ENGAGEMENTS — Composant "Zéro mauvaise surprise"
   Injecte une bande d'engagements pro avant le footer
   Utilisation : ajouter <div data-hc-engagements></div> dans une page
   OU : auto-injection si data-attribute body[data-hc-engagements="auto"]
   ============================================================ */
(function () {
  'use strict';

  var ENGAGEMENTS_HTML = '\
  <section class="hc-eng" aria-label="Nos engagements">\
    <div class="hc-eng-wrap">\
      <div class="hc-eng-head">\
        <span class="hc-eng-eyebrow">Notre engagement</span>\
        <h2 class="hc-eng-title">Zéro <em>mauvaise surprise</em>.<br>Du premier appel à la fin du chantier.</h2>\
        <p class="hc-eng-sub">Parce qu\'un dépannage ou des travaux à la maison, ça ne doit pas être source de stress. On vous engage par écrit&nbsp;:</p>\
      </div>\
      <div class="hc-eng-grid">\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-1">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/></svg>\
          </div>\
          <h3>Devis ferme avant intervention</h3>\
          <p>Le prix annoncé est le prix payé. Pas de surprise sur la facture, pas de "frais cachés" ajoutés en fin de chantier.</p>\
        </article>\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-2">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\
          </div>\
          <h3>Rendez-vous tenus</h3>\
          <p>On vous appelle 30 min avant. On arrive à l\'heure. Si on est en retard, on vous prévient. C\'est la base.</p>\
        </article>\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-3">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>\
          </div>\
          <h3>Garantie pièces &amp; main d\'œuvre</h3>\
          <p>Tout ce qu\'on installe est couvert <strong>1 an minimum</strong>. Si ça casse, on revient à nos frais sans discussion.</p>\
        </article>\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-4">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>\
          </div>\
          <h3>Satisfait ou intervention reprise</h3>\
          <p>Si le résultat ne vous convient pas, on revient sans facturer une seconde fois. <strong>4,7/5 sur 343 avis Google</strong>, c\'est notre standard.</p>\
        </article>\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-5">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>\
          </div>\
          <h3>Artisans locaux salariés</h3>\
          <p>Pas de sous-traitance "à la commande". Notre équipe est <strong>salariée à Saint-Omer &amp; Dunkerque</strong>, formée et assurée.</p>\
        </article>\
        <article class="hc-eng-card">\
          <div class="hc-eng-icon hc-eng-ic-6">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>\
          </div>\
          <h3>Paiement après intervention</h3>\
          <p>Vous ne payez qu\'<strong>après vérification</strong> du travail. CB, virement, chèque ou paiement en ligne sécurisé Stripe.</p>\
        </article>\
      </div>\
      <div class="hc-eng-bottom">\
        <a href="contact.html#rappel" class="hc-eng-btn hc-eng-btn-primary">\
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\
          Demander un devis ferme\
        </a>\
        <a href="tel:+33366100134" class="hc-eng-btn hc-eng-btn-secondary">\
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>\
          Appeler 03 66 10 01 34\
        </a>\
      </div>\
    </div>\
  </section>';

  var ENGAGEMENTS_CSS = '\
.hc-eng{background:linear-gradient(180deg,#F7FBFD 0%,#fff 100%);padding:70px 20px 80px;position:relative;overflow:hidden}\
.hc-eng::before{content:"";position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(13,160,207,.08),transparent 70%);border-radius:50%;pointer-events:none}\
.hc-eng::after{content:"";position:absolute;bottom:-100px;left:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(255,107,26,.06),transparent 70%);border-radius:50%;pointer-events:none}\
.hc-eng-wrap{max-width:1180px;margin:0 auto;position:relative;z-index:1}\
.hc-eng-head{text-align:center;max-width:760px;margin:0 auto 50px}\
.hc-eng-eyebrow{display:inline-block;padding:5px 14px;background:rgba(13,160,207,.10);color:#0DA0CF;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:18px}\
.hc-eng-title{font-family:"Inter",sans-serif;font-size:clamp(1.9rem,4vw,2.7rem);font-weight:800;line-height:1.2;margin:0 0 18px;color:#0A1428;letter-spacing:-.022em}\
.hc-eng-title em{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:600;color:#FF6B1A}\
.hc-eng-sub{font-size:1.06rem;color:#475569;margin:0;line-height:1.55}\
.hc-eng-grid{display:grid;grid-template-columns:1fr;gap:18px;margin-bottom:40px}\
@media (min-width:640px){.hc-eng-grid{grid-template-columns:1fr 1fr;gap:20px}}\
@media (min-width:1024px){.hc-eng-grid{grid-template-columns:repeat(3,1fr);gap:24px}}\
.hc-eng-card{background:#fff;border:1px solid #E5EDF3;border-radius:18px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;position:relative}\
.hc-eng-card:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(10,20,40,.08);border-color:rgba(13,160,207,.30)}\
.hc-eng-icon{width:52px;height:52px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:#fff;margin-bottom:18px;flex-shrink:0;transition:transform .25s ease}\
.hc-eng-card:hover .hc-eng-icon{transform:scale(1.08) rotate(-3deg)}\
.hc-eng-icon svg{width:24px;height:24px}\
.hc-eng-ic-1{background:linear-gradient(135deg,#0DA0CF,#1FC4F0);box-shadow:0 8px 18px rgba(13,160,207,.30)}\
.hc-eng-ic-2{background:linear-gradient(135deg,#22C55E,#16A34A);box-shadow:0 8px 18px rgba(34,197,94,.30)}\
.hc-eng-ic-3{background:linear-gradient(135deg,#FF6B1A,#FFB400);box-shadow:0 8px 18px rgba(255,107,26,.30)}\
.hc-eng-ic-4{background:linear-gradient(135deg,#FFB400,#F59E0B);box-shadow:0 8px 18px rgba(245,158,11,.30)}\
.hc-eng-ic-5{background:linear-gradient(135deg,#7C3AED,#A855F7);box-shadow:0 8px 18px rgba(124,58,237,.30)}\
.hc-eng-ic-6{background:linear-gradient(135deg,#635BFF,#5A52E8);box-shadow:0 8px 18px rgba(99,91,255,.30)}\
.hc-eng-card h3{font-size:1.1rem;font-weight:800;color:#0A1428;margin:0 0 8px;line-height:1.25;letter-spacing:-.015em}\
.hc-eng-card p{font-size:.94rem;color:#475569;line-height:1.55;margin:0}\
.hc-eng-card p strong{color:#0A1428;font-weight:700}\
.hc-eng-bottom{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:10px}\
.hc-eng-btn{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:12px;text-decoration:none;font-size:.95rem;font-weight:700;letter-spacing:-.005em;transition:all .25s ease}\
.hc-eng-btn-primary{background:linear-gradient(135deg,#FF6B1A,#FF8F4D);color:#fff;box-shadow:0 10px 24px rgba(255,107,26,.30)}\
.hc-eng-btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(255,107,26,.40)}\
.hc-eng-btn-secondary{background:#0A1428;color:#fff}\
.hc-eng-btn-secondary:hover{background:#0DA0CF;transform:translateY(-2px);box-shadow:0 10px 22px rgba(13,160,207,.30)}\
@media (max-width:560px){.hc-eng{padding:50px 16px 60px}.hc-eng-card{padding:22px 20px}.hc-eng-btn{padding:12px 18px;font-size:.88rem}}';

  function inject() {
    // Injecter le CSS une seule fois
    if (!document.getElementById('hc-eng-style')) {
      var st = document.createElement('style');
      st.id = 'hc-eng-style';
      st.textContent = ENGAGEMENTS_CSS;
      document.head.appendChild(st);
    }
    // Injecter le HTML sur tous les placeholders
    document.querySelectorAll('[data-hc-engagements]').forEach(function (el) {
      if (el.dataset.hcEngagementsDone) return;
      el.innerHTML = ENGAGEMENTS_HTML;
      el.dataset.hcEngagementsDone = '1';
    });
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
