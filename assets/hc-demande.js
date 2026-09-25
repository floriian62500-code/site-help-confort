/*! HELP Confort — module « Ma demande » v2 : balisage + interface.
 *  Un seul code pour deux mises en scène :
 *    - page /catalogue.html (mode « page », liens entrants et partage) ;
 *    - fenêtre premium ouverte depuis l'accueil (mode « overlay » : modale desktop, feuille plein écran mobile).
 *  Dépend de assets/hc-demande-core.js (cœur pur, testé) et assets/hc-cart.js. Styles : assets/hc-demande.css. */
(function (root) {
  'use strict';
  var mounted = null, api = null, overlay = null, opener = null, lastY = 0;

  var TPL = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
 <defs>
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></symbol>
  <symbol id="i-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></symbol>
  <symbol id="i-tool" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.1-2.1z"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></symbol>
  <symbol id="f-plomberie" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></symbol>
  <symbol id="f-chauffage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z"/></symbol>
  <symbol id="f-electricite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></symbol>
  <symbol id="f-serrurerie" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></symbol>
  <symbol id="f-vitrerie" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/></symbol>
  <symbol id="f-menuiserie" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="1"/><path d="M8 8v3M13 8v3M18 8v3"/></symbol>
  <symbol id="f-renovation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.1-2.1z"/></symbol>
  <symbol id="f-volets" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M4 14h16"/></symbol>
  <symbol id="f-pmr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2"/><path d="M12 7v6M8.5 9.5h7M9.5 13l-2 8M14.5 13l2 8"/></symbol>
  <symbol id="f-sinistre" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>
  <symbol id="f-entretien" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></symbol>
  <symbol id="f-autre" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .3c0 1.7-2.5 2-2.5 3.7M12 17h.01"/></symbol>
 </defs>
</svg>

<div class="app" id="app" data-step="choix">
 <header class="top">
  <div class="top-in">
   <button class="top-back" id="topBack" type="button" aria-label="Revenir à l'étape précédente" hidden><svg width="20" height="20"><use href="#i-back"/></svg></button>
   <a class="top-logo" href="/" aria-label="HELP Confort — accueil du site"><img src="/images/logo-HC.png" alt="HELP Confort" width="101" height="38" decoding="async"></a>
   <div class="top-prog" id="topProg" hidden>
    <span class="tp-label" id="tpLabel"></span>
    <span class="tp-bar" aria-hidden="true"><span class="tp-fill" id="tpFill"></span></span>
   </div>
   <div class="top-right">
    <span class="sim-badge" id="simBadge" hidden title="Recette : l’envoi est simulé, aucune donnée n’est transmise"><span class="sb-dot" aria-hidden="true"></span>Recette<span class="sb-more"> · envoi simulé</span></span>
    <a class="top-phone" href="tel:+33366100134" aria-label="Appeler l'agence au 03 66 10 01 34"><span class="dot" aria-hidden="true"></span><svg width="17" height="17" aria-hidden="true"><use href="#i-phone"/></svg><span class="t">03 66 10 01 34</span></a>
    <a class="top-close" href="/" aria-label="Quitter (votre demande reste enregistrée sur cet appareil)"><svg width="20" height="20" aria-hidden="true"><use href="#i-x"/></svg></a>
   </div>
  </div>
 </header>

 <main class="body">
  <div class="stage" id="stage">

   <!-- 0 · ENTRÉE -->
   <section class="step" data-step="choix" aria-labelledby="h-choix">
    <div class="choix">
     <p class="eyebrow"><i aria-hidden="true"></i>HELP Confort · agence de Saint-Omer</p>
     <h1 id="h-choix" tabindex="-1">Comment <span class="nw">pouvons-nous</span> vous aider&nbsp;?</h1>
     <p class="lede">Des techniciens salariés, un interlocuteur humain et des prix clairs, autour de Saint-Omer.</p>
     <div class="resume" id="resume" hidden></div>
     <div class="choix-grid">
      <button class="choice" type="button" data-choose="intervention">
       <span class="choice-ic"><svg width="28" height="28" aria-hidden="true"><use href="#i-tool"/></svg></span>
       <span class="choice-t">J'ai besoin d'une intervention</span>
       <span class="choice-d">Dépannage, remplacement ou entretien. Vous voyez le prix avant d'envoyer votre demande.</span>
       <span class="choice-tags"><span>Plomberie</span><span>Chauffage</span><span>Électricité</span><span>Serrurerie</span></span>
       <span class="choice-go">Commencer <i aria-hidden="true"><svg width="18" height="18"><use href="#i-arrow"/></svg></i></span>
      </button>
      <button class="choice choice--devis" type="button" data-choose="devis">
       <span class="choice-ic"><svg width="28" height="28" aria-hidden="true"><use href="#i-doc"/></svg></span>
       <span class="choice-t">Je veux un devis</span>
       <span class="choice-d">Travaux, rénovation ou projet sur mesure. Devis gratuit et sans engagement, étudié par un technicien.</span>
       <span class="choice-tags"><span>Rénovation</span><span>Salle de bain</span><span>Menuiserie</span><span>Adaptation PMR</span></span>
       <span class="choice-go">Commencer <i aria-hidden="true"><svg width="18" height="18"><use href="#i-arrow"/></svg></i></span>
      </button>
     </div>
     <p class="urgent-line">Une urgence&nbsp;? Appelez le <a href="tel:+33366100134">03 66 10 01 34</a> · lun–ven 9h–17h, sam 9h–16h</p>
     <p class="urgent-line" id="closedLine" hidden></p>
    </div>
   </section>

   <!-- LIEU (intervention 1 · devis 4) -->
   <section class="step card" data-step="lieu" aria-labelledby="h-lieu">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-lieu" tabindex="-1">Où <span class="nw">devons-nous</span> intervenir&nbsp;?</h1>
     <p class="q-sub">Nous vérifions tout de suite que votre adresse est dans notre zone.</p>
    </header>
    <div class="q-body">
     <div class="field" id="fld-adresse">
      <label for="f-adresse">Adresse</label>
      <div class="inp-wrap">
       <svg width="20" height="20" aria-hidden="true"><use href="#i-pin"/></svg>
       <input id="f-adresse" type="text" autocomplete="off" data-autocomplete-skip role="combobox" aria-autocomplete="list" aria-controls="acList" aria-expanded="false" placeholder="Numéro et rue, ex. 12 rue de Dunkerque">
       <ul class="ac" id="acList" role="listbox" aria-label="Adresses suggérées" hidden></ul>
      </div>
      <p class="err">Indiquez le numéro et la rue.</p>
     </div>
     <div class="row-cp">
      <div class="field" id="fld-cp"><label for="f-cp">Code postal</label><input id="f-cp" inputmode="numeric" autocomplete="postal-code" placeholder="ex. 62500"><p class="err">Code postal à 5 chiffres, ex. 62500.</p></div>
      <div class="field" id="fld-ville"><label for="f-ville">Ville</label><input id="f-ville" type="text" autocomplete="address-level2" placeholder="ex. Saint-Omer"><p class="err">Indiquez la ville.</p></div>
     </div>
     <div class="zone" id="zoneBox" role="status" aria-live="polite" hidden></div>
    </div>
    <footer class="q-actions"><button class="btn-primary" type="button" data-next="lieu">Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- INTERVENTION 2 · BESOIN -->
   <section class="step card" data-step="besoin" aria-labelledby="h-besoin">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-besoin" tabindex="-1">Que <span class="nw">devons-nous</span> faire&nbsp;?</h1>
     <p class="q-sub">Choisissez le domaine concerné. Vous pourrez ajouter d'autres interventions ensuite.</p>
    </header>
    <div class="q-body">
     <div class="tiles" id="famTiles" role="group" aria-label="Domaines d'intervention"></div>
     <p class="alt-line">Des travaux ou un besoin qui n'apparaît pas ici&nbsp;? <button class="link" type="button" data-switch-devis>Demander un devis</button></p>
    </div>
   </section>

   <!-- INTERVENTION · ACCÈS AUX TARIFS (règle métier : identification avant prix) -->
   <section class="step card" data-step="acces" aria-labelledby="h-acces">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-acces" tabindex="-1">Affichez les tarifs</h1>
     <p class="q-sub" id="accesSub">Indiquez comment vous joindre pour les afficher.</p>
    </header>
    <div class="q-body">
     <form id="pgForm" novalidate autocomplete="on">
      <div class="row2">
       <div class="field" id="fld-pg-prenom"><label for="pg-prenom">Prénom</label><input id="pg-prenom" type="text" autocomplete="given-name"><p class="err">Indiquez votre prénom.</p></div>
       <div class="field" id="fld-pg-nom"><label for="pg-nom">Nom</label><input id="pg-nom" type="text" autocomplete="family-name"><p class="err">Indiquez votre nom.</p></div>
      </div>
      <div class="row2">
       <div class="field" id="fld-pg-tel"><label for="pg-tel">Téléphone</label><input id="pg-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="ex. 06 12 34 56 78"><p class="err">Numéro de téléphone français attendu, par exemple 06 12 34 56 78.</p></div>
       <div class="field" id="fld-pg-email"><label for="pg-email">Email <span class="opt">· facultatif</span></label><input id="pg-email" type="email" inputmode="email" autocomplete="email" placeholder="ex. vous@exemple.fr"><p class="err">Adresse email invalide (vous pouvez aussi laisser ce champ vide).</p></div>
      </div>
      <button type="submit" class="sr-only" tabindex="-1" aria-hidden="true">Afficher les tarifs</button>
     </form>
     <div class="note"><svg width="20" height="20" aria-hidden="true"><use href="#i-info"/></svg><span><strong>Pourquoi&nbsp;?</strong> Nos tarifs sont établis pour notre zone d'intervention. En les affichant, vos coordonnées sont transmises à l'agence, qui peut vous rappeler à ce sujet. Jamais revendues ni cédées à des tiers (<a href="/mentions-legales.html" target="_blank" rel="noopener">mentions légales</a>).</span></div>
     <p class="reserve-line">Les tarifs affichés correspondent à des forfaits, sous réserve de vérification sur place : si le besoin constaté diffère, un ajustement ou un devis complémentaire vous est proposé avant intervention.</p>

    </div>
    <footer class="q-actions"><button class="btn-primary" type="submit" form="pgForm" id="pgSubmit">Afficher les tarifs <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- INTERVENTION 3 · PRÉCISION -->
   <section class="step card" data-step="precision" aria-labelledby="h-precision">
    <header class="q">
     <p class="q-kicker"><span id="precFam"></span> · <button class="link" type="button" data-go="besoin" aria-label="Changer de domaine">changer</button></p>
     <h1 id="h-precision" tabindex="-1">Précisez votre besoin</h1>
     <div class="seg" role="tablist" aria-label="Façon de choisir">
      <button type="button" role="tab" id="tab-liste" aria-selected="true" data-prec="liste"><span class="lg">Je sais ce qu'il me faut</span><span class="sm">Je sais</span></button>
      <button type="button" role="tab" id="tab-aide" aria-selected="false" data-prec="aide"><span class="lg">Aidez-moi à choisir</span><span class="sm">Aidez-moi</span></button>
     </div>
    </header>
    <div class="q-body">
     <div class="aide" id="precAide" hidden>
      <p class="mini-q">Que <span class="nw">se passe-t-il</span>&nbsp;?</p>
      <div class="chips" id="probChips" role="group" aria-label="Situation"></div>
     </div>
     <div class="search" id="precSearchWrap"><svg width="19" height="19" aria-hidden="true"><use href="#i-search"/></svg><input id="precSearch" type="search" placeholder="Rechercher une intervention" aria-label="Rechercher une intervention"></div>
     <p class="hint" id="precClosed" hidden></p>
     <p class="list-h" id="offersHead" aria-live="polite"></p>
     <div class="offers" id="offers"></div>
    </div>
    <footer class="q-actions"><button class="sum-handle" type="button" data-open-sheet hidden></button><span class="hint grow" id="precHint">Cochez au moins une intervention pour continuer</span><button class="btn-primary" type="button" data-next="precision" id="precNext" disabled>Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- INTERVENTION 4-5 · MA DEMANDE (multi-interventions + récapitulatif) -->
   <section class="step card" data-step="demande" aria-labelledby="h-demande">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-demande" tabindex="-1">Votre demande</h1>
     <p class="q-sub">Vérifiez vos interventions. Vous pouvez en ajouter d'autres dans la même demande.</p>
    </header>
    <div class="q-body">
     <div id="demandeList"></div>
     <button class="add-more" type="button" data-go="besoin"><svg width="18" height="18" aria-hidden="true"><use href="#i-plus"/></svg>Ajouter une autre intervention</button>
     <div class="note note--warm reserve"><svg width="20" height="20" aria-hidden="true"><use href="#i-info"/></svg><span><strong>Important — prix sous réserve de vérification sur place :</strong> le montant affiché correspond au forfait que vous avez sélectionné. Il est valable si la situation constatée sur place correspond à ce forfait. Si le technicien constate un besoin différent ou complémentaire, un ajustement tarifaire ou un devis complémentaire vous est proposé <strong>avant</strong> toute intervention : aucun supplément n’est engagé sans votre accord.</span></div>
     <div class="note"><svg width="20" height="20" aria-hidden="true"><use href="#i-shield"/></svg><span><strong>Aucun paiement demandé à l’envoi :</strong> vous réglez après l'intervention (un paiement en ligne facultatif peut vous être proposé à la confirmation pour les forfaits à prix ferme). Un prix ferme couvre la prestation telle que décrite ; si un supplément s'avérait nécessaire, il vous est proposé avant d'intervenir. Lors du rappel, l'agence fixe le créneau avec vous.</span></div>
    </div>
    <footer class="q-actions"><button class="sum-handle" type="button" data-open-sheet hidden></button><button class="btn-primary" type="button" data-next="demande">Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- COORDONNÉES (intervention 6 · devis 5) -->
   <section class="step card" data-step="coordonnees" aria-labelledby="h-coord">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-coord" tabindex="-1">Vos coordonnées</h1>
     <p class="q-sub" id="coordSub">Pour vous rappeler et confirmer votre demande.</p>
    </header>
    <div class="q-body">
     <div class="ctx-line"><svg width="18" height="18" aria-hidden="true"><use href="#i-pin"/></svg><span id="coordLieu"></span><button class="link rc-mod" type="button" data-go="lieu" aria-label="Modifier l'adresse">Modifier</button></div>
     <div class="ctx-line" id="coordKnown" hidden><svg width="18" height="18" aria-hidden="true"><use href="#i-user"/></svg><span id="coordKnownTxt"></span><button class="link rc-mod" type="button" data-edit-contact aria-label="Modifier vos coordonnées">Modifier</button></div>
     <div class="row2" id="coordRow1">
      <div class="field" id="fld-prenom"><label for="f-prenom">Prénom</label><input id="f-prenom" type="text" autocomplete="given-name"><p class="err">Indiquez votre prénom.</p></div>
      <div class="field" id="fld-nom"><label for="f-nom">Nom</label><input id="f-nom" type="text" autocomplete="family-name"><p class="err">Indiquez votre nom.</p></div>
     </div>
     <div class="row2" id="coordRow2">
      <div class="field" id="fld-tel"><label for="f-tel">Téléphone</label><input id="f-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="ex. 06 12 34 56 78"><p class="err">Numéro de téléphone français attendu, par exemple 06 12 34 56 78.</p></div>
      <div class="field" id="fld-email"><label for="f-email">Email <span class="opt">· facultatif</span></label><input id="f-email" type="email" inputmode="email" autocomplete="email" placeholder="ex. vous@exemple.fr"><p class="err">Adresse email invalide (vous pouvez aussi laisser ce champ vide).</p></div>
     </div>
    </div>
    <footer class="q-actions"><button class="sum-handle" type="button" data-open-sheet hidden></button><button class="btn-primary" type="button" data-next="coordonnees">Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- INTERVENTION 7 · PRISE EN CHARGE -->
   <section class="step card" data-step="creneau" aria-labelledby="h-creneau">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-creneau" tabindex="-1">Quand <span class="nw">souhaitez-vous</span> l'intervention&nbsp;?</h1>
     <p class="q-sub">Donnez vos préférences : l'agence fixe ensuite le créneau avec vous, selon les disponibilités réelles des techniciens.</p>
    </header>
    <div class="q-body">
     <div class="opt-group">
      <p class="mini-q" id="lbl-quand">Délai souhaité</p>
      <div class="opts" role="radiogroup" aria-labelledby="lbl-quand" id="quandOpts">
       <button type="button" class="opt-card" role="radio" aria-checked="false" data-quand="asap"><strong>Dès que possible</strong><span>Situation urgente</span></button>
       <button type="button" class="opt-card" role="radio" aria-checked="false" data-quand="semaine"><strong>Dans la semaine</strong><span>Sans urgence particulière</span></button>
       <button type="button" class="opt-card" role="radio" aria-checked="false" data-quand="date"><strong>À partir d'une date</strong><span>Vous choisissez le jour</span></button>
      </div>
      <p class="form-err" id="errCreneau" role="alert" hidden></p>
      <div class="field date-f" id="fld-date" hidden><label for="f-date">À partir du</label><input id="f-date" type="date"><p class="err">Choisissez une date à venir.</p></div>
     </div>
     <div class="opt-group">
      <p class="mini-q" id="lbl-rappel">Quand pouvons-nous vous rappeler&nbsp;?</p>
      <div class="chips" role="radiogroup" aria-labelledby="lbl-rappel" id="rappelOpts">
       <button type="button" class="chip" role="radio" aria-checked="true" data-rappel="asap">Au plus tôt</button>
       <button type="button" class="chip" role="radio" aria-checked="false" data-rappel="matin">Le matin</button>
       <button type="button" class="chip" role="radio" aria-checked="false" data-rappel="aprem">L'après-midi</button>
      </div>
     </div>
     <div class="field"><label for="f-precisions">Précisions pour le technicien <span class="opt">· facultatif</span></label><textarea id="f-precisions" rows="3" maxlength="1200" placeholder="Étage, digicode, accès, description du problème…"></textarea></div>
     <div class="note note--warm"><svg width="20" height="20" aria-hidden="true"><use href="#i-info"/></svg><span id="creneauNote">Ce n'est pas encore un rendez-vous ferme : aucun créneau n'est réservé en ligne. L'agence vous rappelle sous 24&nbsp;h ouvrées au plus tard, aux heures d'ouverture (lun–ven 9h–17h, sam 9h–16h), pour le fixer avec vous.</span></div>
    </div>
    <footer class="q-actions"><button class="sum-handle" type="button" data-open-sheet hidden></button><button class="btn-primary" type="button" id="sendIntervention">Envoyer ma demande <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- DEVIS 1 · TRAVAUX -->
   <section class="step card" data-step="dv-metier" aria-labelledby="h-dvm">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-dvm" tabindex="-1">Quels travaux envisagez-vous&nbsp;?</h1>
     <p class="q-sub">Choisissez jusqu'à trois domaines.</p>
    </header>
    <div class="q-body"><div class="tiles tiles--4" id="dvTiles" role="group" aria-label="Domaines des travaux"></div><p class="alt-line">Un autre type de travaux&nbsp;? <button class="link" type="button" data-dvm="Autre" id="dvAutre" aria-pressed="false">Autre besoin, je le décris ensuite</button></p></div>
    <footer class="q-actions"><button class="btn-primary" type="button" data-next="dv-metier" id="dvMetierNext" disabled>Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- DEVIS 2 · PROJET -->
   <section class="step card" data-step="dv-projet" aria-labelledby="h-dvp">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-dvp" tabindex="-1">Parlez-nous de votre projet</h1>
     <p class="q-sub">Quelques lignes suffisent : le technicien vous recontacte pour les détails.</p>
    </header>
    <div class="q-body">
     <div class="opt-group">
      <p class="mini-q" id="lbl-nature">Type de projet <span class="opt">· facultatif</span></p>
      <div class="chips" role="radiogroup" aria-labelledby="lbl-nature" id="natureOpts"></div>
     </div>
     <div class="field" id="fld-desc"><label for="dv-desc">Votre projet</label><textarea id="dv-desc" aria-describedby="descHint" rows="5" maxlength="2000" placeholder="Ex. remplacer la baignoire par une douche à l'italienne, pièce de 6 m², maison de 1990…"></textarea><p class="hint" id="descHint">10 caractères minimum.</p><p class="err">Ajoutez quelques mots (10 caractères minimum).</p></div>
    </div>
    <footer class="q-actions"><button class="btn-primary" type="button" data-next="dv-projet">Continuer <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- DEVIS 3 · PHOTOS -->
   <section class="step card" data-step="dv-photos" aria-labelledby="h-dvph">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-dvph" tabindex="-1">Ajoutez des photos</h1>
     <p class="q-sub">Facultatif, mais utile : le technicien chiffre plus vite et plus juste.</p>
    </header>
    <div class="q-body">
     <label class="drop" id="drop" for="dv-photos">
      <span class="drop-ic"><svg width="26" height="26" aria-hidden="true"><use href="#i-camera"/></svg></span>
      <span><strong>Choisir des photos</strong><span>Depuis votre téléphone ou votre ordinateur · jusqu'à 3 photos</span></span>
      <input id="dv-photos" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple>
     </label>
     <ul class="thumbs" id="thumbs" aria-live="polite"></ul>
     <p class="form-err" id="errPhotos" role="alert" hidden></p>
     <div class="note"><svg width="20" height="20" aria-hidden="true"><use href="#i-shield"/></svg><span>Les photos sont transmises de façon sécurisée à l'agence, juste après l'envoi de votre demande. Elles ne sont jamais publiées.</span></div>
    </div>
    <footer class="q-actions"><button class="link skip grow" type="button" data-next="dv-photos" id="dvPhotosSkip">Passer cette étape</button><button class="btn-primary" type="button" id="dvPhotosNext">Ajouter des photos</button></footer>
   </section>

   <!-- DEVIS 6 · VÉRIFICATION + ENVOI -->
   <section class="step card" data-step="dv-recap" aria-labelledby="h-dvr">
    <header class="q">
     <p class="q-kicker" data-kicker></p>
     <h1 id="h-dvr" tabindex="-1">Vérifiez votre demande de devis</h1>
     <p class="q-sub">Un technicien étudie votre projet. L'agence vous recontacte sous 24&nbsp;h ouvrées, puis vous transmet un devis gratuit et sans engagement.</p>
    </header>
    <div class="q-body">
     <div class="rows" id="dvRows"></div>
     <p class="legal">Vos informations servent uniquement à traiter votre demande. <a href="/mentions-legales.html" target="_blank" rel="noopener">Mentions légales</a>.</p>
     <p class="form-err" id="errDevis" role="alert" hidden></p>
    </div>
    <footer class="q-actions"><button class="btn-primary" type="button" id="sendDevis">Envoyer ma demande de devis <svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button></footer>
   </section>

   <!-- CONFIRMATION -->
   <section class="step" data-step="envoye" aria-labelledby="h-envoye">
    <div class="done" id="done"></div>
   </section>

  </div>

  <aside class="recap" id="recap" aria-label="Récapitulatif de votre demande">
   <div class="recap-card"><p class="recap-t">Votre demande</p><div id="recapBody"></div></div>
   <div class="recap-next" id="recapNext"><p class="recap-t">Et ensuite&nbsp;?</p><ol><li><b>1</b><span><strong>Vous envoyez votre demande</strong>Elle part directement à l’agence, sans engagement.</span></li><li><b>2</b><span><strong>L'agence vous recontacte</strong>Sous 24&nbsp;h ouvrées, aux heures d'ouverture.</span></li><li><b>3</b><span><strong>Rendez-vous fixé ensemble</strong>Avec un technicien salarié de l'agence.</span></li></ol></div>
   <div class="trust">
    <p>Agence HELP Confort de Saint-Omer</p>
    <ul>
     <li><svg width="16" height="16" aria-hidden="true"><use href="#i-check"/></svg>Techniciens salariés, pas de sous-traitance</li>
     <li><svg width="16" height="16" aria-hidden="true"><use href="#i-check"/></svg>Un interlocuteur humain du début à la fin</li>
    </ul>
    <small>Joignable lun–ven 9h–17h · sam 9h–16h</small>
   </div>
  </aside>
 </main>
</div>

<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetT" hidden>
 <div class="sheet-bg" data-close-sheet></div>
 <div class="sheet-panel">
  <div class="sheet-grab" aria-hidden="true"></div>
  <div class="sheet-head"><p id="sheetT">Votre demande</p><button type="button" data-close-sheet aria-label="Fermer le récapitulatif"><svg width="20" height="20" aria-hidden="true"><use href="#i-x"/></svg></button></div>
  <div id="sheetBody"></div>
 </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

<script src="/assets/hc-cart.js"></script>`;

  // ---------- montage ----------
  function mount(container, opts) {
    if (mounted) return api;
    opts = opts || {};
    container.classList.add('hcd');
    if (opts.mode === 'overlay') container.classList.add('hcd--overlay');
    container.innerHTML = TPL;
    mounted = container;
    syncHeight();
    api = boot(opts);
    return api;
  }
  function syncHeight() {
    if (!mounted) return;
    if (!mounted.classList.contains('hcd--overlay')) { mounted.style.removeProperty('--hcd-vh'); return; }
    // Bureau : la fenêtre s'ajuste à son contenu (ancrée en haut) → la hauteur de référence est la hauteur MAXIMALE
    // disponible, jamais celle du contenu (sinon la colonne de droite serait bridée). Mobile : plein écran.
    var desk = root.innerWidth > 760, pad = Math.max(26, Math.round(root.innerHeight * 0.05));
    mounted.style.setProperty('--hcd-vh', (desk ? Math.min(940, root.innerHeight - pad - 26) : mounted.clientHeight) + 'px');
  }
  root.addEventListener('resize', syncHeight);

  function boot(opts) {
  var OVERLAY = !!(opts && opts.mode === 'overlay');
  var C = root.HcDemandeCore; if (!C) return null;
  function scrollToTop() { if (OVERLAY) { if (mounted) mounted.scrollTop = 0; } else window.scrollTo(0, 0); }
  function lockScroll(on) { var el = OVERLAY ? mounted : document.body; if (el) el.style.overflow = on ? 'hidden' : ''; }
  var SUPA = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
  // Backend LOCAL (E2E isolé) : uniquement localhost + ?backend=local. Jamais sur preview/prod.
  try { var hn = location.hostname; if ((hn === 'localhost' || hn === '127.0.0.1') && new URLSearchParams(location.search).get('backend') === 'local') { SUPA = 'http://localhost:54321'; KEY = window.__LOCAL_ANON || ''; console.warn('[HC][E2E-LOCAL] backend local actif'); } } catch (e) {}
  // SIMULATED_FOR_UI : sur Deploy Preview / poste local, l'envoi est SIMULÉ PAR DÉFAUT (incident 2026-09-17 : un lead réel créé depuis un onglet de recette sans ?simulate=1).
  // Envoi réel volontaire (E2E maîtrisé) : ?live=1 dans l'onglet (badge rouge). Domaine de production : toujours réel, jamais simulé.
  var SIM = false;
  try { if (C.simulationAllowed(location.hostname)) { var sp = new URLSearchParams(location.search); if (sp.get('live') === '1') sessionStorage.setItem('hc_live', '1'); if (sp.get('live') === '0' || sp.get('simulate') === '1') sessionStorage.removeItem('hc_live'); SIM = sessionStorage.getItem('hc_live') !== '1'; } } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = C.esc, app = $('#app');
  var cart = window.HcCart ? window.HcCart.create() : null;
  var STORE = 'hc_demande_v2', STORE_PII = 'hc_demande_v2_pii';
  var ALL = [], byId = {}, byFam = {}, FAMS = [], loaded = false, loadFailed = false;
  var dvFiles = [];
  function ic(id, s) { s = s || 18; return '<svg width="' + s + '" height="' + s + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  var state = (function () {
    var s = null, pii = null;
    try { s = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {}
    try { pii = JSON.parse(sessionStorage.getItem(STORE_PII) || 'null'); } catch (e) {}
    if (!s || s.v !== 2 || (s.updatedAt && Date.now() - s.updatedAt > 7 * 864e5)) {
      if (s && s.v === 2 && cart) { try { cart.clear(); } catch (e) {} } // brouillon expiré (> 7 j) : on repart proprement
      s = null; pii = null;
    }
    var st = C.mergeState(s, pii);
    if (C.piiExpired(st, Date.now())) { C.stripPii(st); try { sessionStorage.removeItem(STORE_PII); } catch (e) {} }
    return st;
  })();
  try { C.purgeLegacy(localStorage); } catch (e) {}
  // Brouillon non personnel → localStorage ; identité, adresse et textes libres → sessionStorage (onglet courant)
  function save() {
    state.updatedAt = Date.now(); var parts = C.splitState(state);
    try { localStorage.setItem(STORE, JSON.stringify(parts.draft)); } catch (e) {}
    try { sessionStorage.setItem(STORE_PII, JSON.stringify(parts.pii)); } catch (e) {}
  }
  var pendingEntry = null;
  // Étape d'entrée d'un lien explicite (accueil, page d'atterrissage) : « retour » y ramène à la page d'origine, pas à l'écran générique.
  function atEntryStep(step) { return !!state._entryStep && step === state._entryStep; }
  function exitTunnel() {
    if (OVERLAY) { if (root.HcDemande) root.HcDemande.close(); return; } // fenêtre : fermée, l'accueil retrouve sa place et son URL
    var st = history.state || {}, fromSite = !!document.referrer && document.referrer.indexOf(location.origin + '/') === 0;
    if (fromSite && typeof st.idx === 'number') { try { history.go(-(st.idx + 1)); return; } catch (e) {} } // page : retour à la page du site d'où l'on vient
    location.assign('/');
  }
  // Tous les champs de saisie du module, présents et futurs : aucune valeur d'une demande précédente ne reste dans la page
  function clearFields() {
    Array.prototype.forEach.call((mounted || document).querySelectorAll('input, textarea'), function (el) {
      if (/^(checkbox|radio|hidden|button|submit|reset)$/i.test(el.type || '')) return;
      try { el.value = ''; } catch (e) {}
    });
  }
  // Nouvelle demande : état vierge (le statut d'accès aux tarifs, non personnel, est conservé)
  function startClean() {
    var pg = { ok: state._priceGateOk, at: state._priceGateAt };
    if (cart) cart.clear(); dvFiles = []; state = C.emptyState(); state._priceGateOk = pg.ok; state._priceGateAt = pg.at;
    try { sessionStorage.removeItem(STORE_PII); } catch (e) {}
    clearFields();
  }
  // Après envoi : plus aucune donnée personnelle dans l'état (le récapitulatif reste dans l'onglet), dossier clos → la demande
  // suivante aura sa propre référence (jamais celle d'un dossier finalisé, qui serait traitée comme un doublon)
  function forgetIdentityAfterSend() { var e = C.emptyState(); state.contact = e.contact; state.lieu = e.lieu; state._cid = null; clearFields(); }
  // ---------- Mesure du tunnel (P0.4) ----------
  // Toujours consigné en mémoire (window.__hcFunnel, contrôle recette : rien ne sort du navigateur).
  // Envoi GA4 via window.hcGtag (créé par assets/tracking.js APRÈS consentement) : production uniquement, hors simulation.
  var trackQ = [];
  function consentValue() { try { return localStorage.getItem('hc-consent') || ''; } catch (e) { return ''; } }
  function track(ev, p) {
    var params = C.trackParams(Object.assign({ module: 'demande_v2', mode: state.mode || null }, p || {}));
    try { var log = (window.__hcFunnel = window.__hcFunnel || []); log.push({ ev: ev, p: params, t: Date.now() }); if (log.length > 200) log.shift(); } catch (e) {}
    var d = C.trackDecision({ host: location.hostname, sim: SIM, consent: consentValue(), gtagReady: typeof window.hcGtag === 'function' });
    if (d === 'send') { try { window.hcGtag('event', ev, params); } catch (e) {} }
    else if (d === 'queue' && trackQ.length < 50) trackQ.push([ev, params]);
  }
  function flushTrack() { if (typeof window.hcGtag !== 'function') return; while (trackQ.length) { var x = trackQ.shift(); try { window.hcGtag('event', x[0], x[1]); } catch (e) {} } }
  window.addEventListener('load', flushTrack);
  function markStart(entry) { maintStart(entry); var k = 'hc_fs_' + state.mode; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {} track('hc_demande_start', { entry: entry }); }
  // Campagnes « entretien » (Google Ads / Meta) : événements dédiés, une fois par session et par famille, sans donnée personnelle.
  function maintFamily() { return C.serviceFamily({ slugs: cart ? cart.lines().map(function (l) { return l.slug; }) : [], metiers: state.devis && state.devis.metiers, src: state.src }); }
  function maintOnce(ev, key, p) {
    var f = maintFamily(); if (!f) return;
    var k = 'hc_mt_' + key + '_' + f; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
    track(ev, Object.assign({ service_family: f, src: state.src || null }, p || {}));
  }
  function maintStart(entry) { maintOnce('start_maintenance_funnel', 'start', { entry: entry || null }); }
  function maintContact() { maintOnce('maintenance_contact_entered', 'contact'); }
  function leadTracked(type, p, data) {
    var sim = !!(data && data.simulated), fam = p && p.service_family;
    if (fam) track('maintenance_submit', { service_family: fam, lead_type: type, src: state.src || null, simulated: sim });
    track('generate_lead', Object.assign({ lead_type: type, simulated: sim }, p || {}));
    try { ['hc_fs_intervention', 'hc_fs_devis', 'hc_mt_start_chaudiere', 'hc_mt_contact_chaudiere', 'hc_mt_start_ramonage', 'hc_mt_contact_ramonage'].forEach(function (k) { sessionStorage.removeItem(k); }); } catch (e) {}
  }
  // Attribution : UTM/gclid/fbclid mémorisés AVEC consentement (tracking.js) + page d'atterrissage d'origine (non personnelle)
  function attribution() {
    var a = null; try { a = C.attributionFrom(sessionStorage.getItem('hc_utm'), sessionStorage.getItem('hc_referrer')); } catch (e) { a = null; }
    if (state.src) { a = a || {}; a.landing = state.src; }
    return a;
  }
  // Référence de dossier unique : l'accès aux tarifs et l'envoi final alimentent le MÊME dossier (aucun doublon).
  function cid() {
    if (state._cid) return state._cid;
    var v = '';
    try { v = (crypto.randomUUID ? crypto.randomUUID() : ''); } catch (e) { v = ''; }
    if (!v) v = 'hc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    state._cid = v; save();
    return v;
  }
  // Signal d'activité (aucun email) : garde le dossier « en cours » à jour pour la relance d'abandon.
  function pingIntent(step) {
    if (SIM || !state._cid || !C.contactValid(state.contact)) return;
    try {
      var b = C.gatePayload({ contact: state.contact, lieu: state.lieu, famLabel: famName(state.fam), fam: state.fam, page: location.href, attribution: attribution(), cid: state._cid, step: step });
      fetch(SUPA + '/functions/v1/submit-lead-v6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(b) }).catch(function () {});
    } catch (e) {}
  }

  // ---------- Règle tarifs (P0) ----------
  function pgSessionOk() { try { return sessionStorage.getItem('hc_pg') === '1'; } catch (e) { return false; } }
  function priceGatePassed() { return C.priceGatePassed(state, pgSessionOk(), Date.now()); }

  // ---------- Micro-feedback ----------
  var toastT = null;
  function toast(msg) { var t = $('#toast'); t.innerHTML = ic('i-check', 17) + '<span>' + esc(msg) + '</span>'; t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4000); }
  function busy(btn, on, label) { if (!btn) return; if (on) { btn.dataset.html = btn.innerHTML; btn.classList.add('is-busy'); btn.disabled = true; btn.textContent = label || '…'; } else { btn.classList.remove('is-busy'); btn.disabled = false; if (btn.dataset.html) btn.innerHTML = btn.dataset.html; } }
  function focusBad(el) { if (!el) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } var go2 = function () { var f = el.closest('.field') || el; try { f.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { f.scrollIntoView(); } }; if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(go2); }); else go2(); }
  function mark(fieldId, bad) { var f = document.getElementById(fieldId); if (!f) return; f.classList.toggle('is-bad', !!bad); var i = f.querySelector('input,textarea'), er = f.querySelector('.err'); if (er && !er.id) { er.id = fieldId + '-err'; er.setAttribute('aria-live', 'polite'); } if (i) { var ids = (i.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean); if (er) ids = ids.filter(function (x) { return x !== er.id; }); if (bad) { i.setAttribute('aria-invalid', 'true'); if (er) ids.push(er.id); } else { i.removeAttribute('aria-invalid'); } if (ids.length) i.setAttribute('aria-describedby', ids.join(' ')); else i.removeAttribute('aria-describedby'); } }

  // ---------- Routage ----------
  function ctx() { return { mode: state.mode, gateOk: priceGatePassed(), lieuOk: C.lieuValid(state.lieu), fam: state.fam, lines: cart ? cart.count() : 0, contactOk: C.contactValid(state.contact), dv: state.devis, sent: state.sent }; }
  function famName(slug) { var f = FAMS.filter(function (x) { return x.slug === slug; })[0]; return f ? f.name : ''; }
  var ENTER = {};
  function go(step, o) {
    o = o || {};
    var m = C.modeForStep(step); if (m) state.mode = m;
    var target = C.guardStep(step, ctx());
    if (target === 'acces' && step !== 'acces') state._pgPending = step;
    var prevShown = state.step; state.step = target; save();
    if (o.noHash && target !== step) { try { var cs0 = history.state || {}; history.replaceState({ step: target, from: cs0.from, idx: cs0.idx, base: cs0.base }, '', '#step=' + target + (state.mode === 'intervention' && state.fam ? '&cat=' + encodeURIComponent(state.fam) : '')); } catch (e) {} }
    app.setAttribute('data-step', target); app.setAttribute('data-mode', state.mode || '');
    $$('.step').forEach(function (s) { var on = s.getAttribute('data-step') === target; s.classList.toggle('is-active', on); s.classList.toggle('is-back', on && !!o.back); });
    renderKickers(target);
    if (ENTER[target]) ENTER[target](o);
    renderProgress(target); renderRecap();
    $('#topBack').hidden = !C.prevStep(state.mode, target);
    $('#topBack').setAttribute('aria-label', atEntryStep(target) ? 'Quitter et revenir à la page précédente' : 'Revenir à l’étape précédente');
    closeSheet();
    if (!o.noHash) { var h = '#step=' + target + (state.mode === 'intervention' && state.fam ? '&cat=' + encodeURIComponent(state.fam) : ''); if (location.hash !== h) { try { var cs = history.state || {}, ix = typeof cs.idx === 'number' ? cs.idx : 0; history[o.replace ? 'replaceState' : 'pushState']({ step: target, from: o.replace ? cs.from : prevShown, idx: o.replace ? ix : ix + 1, base: !!cs.base }, '', h); } catch (e) {} } }
    if (!o.keepScroll) scrollToTop();
    if (!o.initial) { var h1 = $('.step.is-active h1'); if (h1) try { h1.focus({ preventScroll: true }); } catch (e) {} }
    var pgx = C.progress(state.mode, target);
    if (state.mode && target !== 'choix' && target !== 'envoye') markStart(target);
    track('hc_step_view', { step: target, step_index: pgx ? pgx.index : 0 });
  }
  function renderKickers(step) {
    var kick = state.mode === 'devis' ? 'Demande de devis' : "Demande d'intervention", fn = famName(state.fam);
    $$('[data-kicker]').forEach(function (k) { var withFam = state.mode === 'intervention' && fn && (step === 'lieu' || step === 'acces'); k.textContent = withFam ? kick + ' · ' + fn : kick; if (withFam && step === 'lieu') { var b = document.createElement('button'); b.type = 'button'; b.className = 'link'; b.setAttribute('data-clearfam', ''); b.setAttribute('aria-label', 'Changer de domaine'); b.textContent = 'changer'; k.appendChild(document.createTextNode(' · ')); k.appendChild(b); } });
  }
  function next(from) {
    var back = state._returnTo; state._returnTo = null;
    if (back && C.flowIndex(state.mode, back) > C.flowIndex(state.mode, from) && C.guardStep(back, ctx()) === back) return go(back, { replace: true });
    go(C.nextStep(state.mode, from, { fam: state.fam }));
  }
  function renderProgress(step) {
    var p = C.progress(state.mode, step), box = $('#topProg');
    box.hidden = !p && step !== 'choix';
    if (p) { $('#tpLabel').innerHTML = '<span class="tp-n">Étape ' + p.index + ' sur ' + p.total + '</span><span class="tp-name"> · <b>' + esc(p.label) + '</b></span>'; $('#tpFill').style.width = Math.round(p.index / p.total * 100) + '%'; }
    else if (step === 'choix') { $('#tpLabel').innerHTML = '<b>Votre demande</b> · reprendre ou démarrer'; $('#tpFill').style.width = '0%'; } // l'en-tête garde son contexte
  }
  // Réassurance : UNE ligne légère sous le formulaire, affichée seulement quand la colonne de droite est masquée
  // (mobile / tablette). Ni téléphone (barre du haut), ni mention de paiement (note de l'étape « Ma demande »).
  function addLightAssure() {
    var html = ic('i-check', 14) + 'Agence HELP Confort de Saint-Omer · techniciens salariés';
    $$('.step.card').forEach(function (s) {
      if (s.querySelector('.m-assure')) return;
      var f = document.createElement('p'); f.className = 'm-assure'; f.innerHTML = html;
      var act = s.querySelector('.q-actions');
      if (act) act.parentNode.insertBefore(f, act); else s.appendChild(f); // étapes sans barre d'actions (ex. Besoin)
    });
  }

  // ---------- Récapitulatif contextuel (colonne desktop + feuille mobile) ----------
  function lieuTxt() { var l = state.lieu; return C.lieuValid(l) ? [l.adresse, [l.cp, l.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ') : ''; }
  function contactTxt() { var c = state.contact; if (C.contactValid(c)) return c.prenom + ' ' + c.nom + ' · ' + C.phoneDisplay(c.tel); if (c.prenom || c.tel) return [c.prenom, C.phoneDisplay(c.tel)].filter(Boolean).join(' · '); return ''; }
  function sec(k, v, step, extra) {
    if (!v) return '';
    var canEdit = step && C.guardStep(step, ctx()) === step;
    return '<div class="rc"><p class="rc-k"><span>' + esc(k) + '</span>' + (canEdit ? '<button type="button" data-go="' + step + '" aria-label="Modifier : ' + esc(k) + '">Modifier</button>' : '') + '</p>' +
      '<div class="rc-v">' + v + '</div>' + (extra || '') + '</div>';
  }
  function zoneBadge() { var z = state.lieu.zone; if (!z || !C.lieuValid(state.lieu)) return ''; var t = ({ in: 'Dans notre zone', edge: 'Limite de zone', out: 'Hors zone habituelle', unknown: 'Zone à confirmer' })[z.status]; return '<span class="rc-z rc-z--' + z.status + '">' + ic(z.status === 'in' ? 'i-check' : 'i-info', 13) + esc(t) + (z.km != null && z.km >= 5 ? ' · ' + z.km + ' km' : '') + '</span>'; }
  function linePrice(l) { var s = byId[l.id]; var k = s ? C.priceKind(s) : (l.requires_quote ? 'devis' : 'ferme'); if (k === 'devis') return 'Sur devis'; if (k === 'confirmer') return C.eur(l.ttc) + ' / ' + C.perUnit(s); return C.eur((Number(l.ttc) || 0) * (l.qty || 1)); }
  function recapHtml() {
    var gate = priceGatePassed(), h = '';
    if (state.mode === 'devis') {
      h += sec('Travaux', esc((state.devis.metiers || []).join(', ')), 'dv-metier');
      h += sec('Projet', state.devis.desc ? esc(state.devis.desc.length > 110 ? state.devis.desc.slice(0, 107) + '…' : state.devis.desc) : '', 'dv-projet');
      h += sec('Photos', dvFiles.length ? dvFiles.length + ' photo' + (dvFiles.length > 1 ? 's' : '') : (state.devis.photosSeen ? 'Aucune (facultatif)' : ''), 'dv-photos');
      h += sec('Lieu', esc(lieuTxt()), 'lieu', zoneBadge());
      h += sec('Coordonnées', esc(contactTxt()), 'coordonnees');
      var jl = cart ? cart.lines() : [];
      if (jl.length) h += sec('Interventions jointes', jl.map(function (l) { return '<div class="rc-line"><span>' + esc(l.name) + '</span>' + (priceGatePassed() ? '<span>' + esc(linePrice(l)) + '</span>' : '') + '</div>'; }).join(''), 'dv-recap');
      return h;
    }
    h += sec('Lieu', esc(lieuTxt()), 'lieu', zoneBadge());
    var lines = cart ? cart.lines() : [], lh = '';
    if (lines.length) {
      lh = lines.map(function (l) { return '<div class="rc-line"><span>' + esc(l.name) + ((l.qty || 1) > 1 ? ' ×' + l.qty : '') + '</span>' + (gate ? '<span>' + esc(linePrice(l)) + '</span>' : '') + '</div>'; }).join('');
      var tot = C.firmTotal(lines, byId);
      if (gate && tot > 0) lh += '<div class="rc-total"><span>Prix fermes</span><span>' + C.eur(tot) + ' TTC</span></div><p class="rc-reserve">Sous réserve de vérification sur place.</p>'; // P0 : aucun montant sans identification
    }
    if (!lh && state.fam && famName(state.fam)) lh = esc(famName(state.fam)) + ' · à préciser';
    h += sec('Interventions', lh, lines.length ? 'demande' : 'besoin');
    h += sec('Prise en charge', esc(C.priseText(state.prise)), 'creneau');
    h += sec('Coordonnées', esc(contactTxt()), 'coordonnees');
    return h;
  }
  // Avancement du parcours dans la colonne « Votre demande » : le client voit toujours où il en est.
  function flowStepsHtml() {
    var f = C.FLOWS[state.mode]; if (!f) return '';
    var cur = C.flowIndex(state.mode, state.step), p = C.progress(state.mode, state.step);
    return '<ol class="rc-steps">' + f.map(function (st, i) {
      var cls = cur >= 0 && i < cur ? 'is-done' : (i === cur ? 'is-now' : '');
      var dot = cur >= 0 && i < cur ? '<svg width="12" height="12" aria-hidden="true"><use href="#i-check"/></svg>' : (i + 1);
      var label = (i === cur && p && p.label) ? p.label : (C.LABELS[st] || st); // même nom que l'en-tête (ex. « Tarifs »)
      return '<li class="' + cls + '">' + '<span class="rc-dot">' + dot + '</span>' + esc(label) + (i === cur ? '<span class="sr-only"> (étape en cours)</span>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function renderRecap() {
    var html = recapHtml() || '<p class="rc-empty">Votre demande se construit ici, étape par étape.</p>';
    $('#recapBody').innerHTML = flowStepsHtml() + html;
    var nx = $('#recapNext'); if (nx && !nx.querySelector('.rc-steps')) nx.insertAdjacentHTML('afterbegin', flowStepsHtml());
    else if (nx) nx.querySelector('.rc-steps').outerHTML = flowStepsHtml();
    if (!$('#sheet').hidden) $('#sheetBody').innerHTML = html;
    var n = cart ? cart.count() : 0, gate = priceGatePassed(), txt = '';
    if (state.mode === 'intervention' && n > 0) { var tot = C.firmTotal(cart.lines(), byId); txt = '<span><strong>Ma demande</strong> · ' + n + ' intervention' + (n > 1 ? 's' : '') + (gate && tot > 0 ? ' · ' + C.eur(tot) : '') + '</span>' + ic('i-up', 18); }
    else if (state.mode === 'devis' && (state.devis.metiers || []).length) { txt = '<span><strong>Ma demande</strong> · devis ' + esc(state.devis.metiers.join(', ')) + '</span>' + ic('i-up', 18); }
    $$('[data-open-sheet]').forEach(function (b) { b.innerHTML = txt; b.hidden = !txt; });
  }
  var sheetOpener = null;
  function openSheet(btn) { sheetOpener = btn || null; if (btn) btn.setAttribute('aria-expanded', 'true'); $('#sheetBody').innerHTML = recapHtml(); $('#sheet').hidden = false; lockScroll(true); var c = $('.sheet-head button'); if (c) c.focus(); }
  function closeSheet() { if ($('#sheet').hidden) return; $$('[data-open-sheet]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); $('#sheet').hidden = true; lockScroll(false); if (sheetOpener) try { sheetOpener.focus(); } catch (e) {} }

  // ---------- Entrée ----------
  function renderClosed() { var a = C.agencyStatus(new Date()); app.classList.toggle('is-closed', !a.open); var t = a.open ? '' : 'L\u2019agence est fermée en ce moment : premier rappel possible ' + a.next + '. Vous pouvez envoyer votre demande dès maintenant.'; var cl = $('#closedLine'); if (cl) { cl.textContent = t; cl.hidden = !t; } var pc = $('#precClosed'); if (pc) { pc.textContent = t; pc.hidden = !t; } }
  ENTER.choix = function () {
    renderClosed();
    var box = $('#resume'), n = cart ? cart.count() : 0, label = '';
    if (n > 0) label = n + ' intervention' + (n > 1 ? 's' : ''); // aucune donnée personnelle (ville, nom…) sur la carte de reprise
    else if ((state.devis.metiers || []).length) label = 'Devis ' + state.devis.metiers.join(', ') + ((state.devis.photos || 0) > 0 && !dvFiles.length ? ' · photos à rajouter' : '');
    else if (!state.sent && state.mode && C.lieuValid(state.lieu)) label = state.mode === 'devis' ? 'Demande de devis' : "Demande d'intervention";
    if (!label && C.hasDraft(state, n)) label = state.mode === 'devis' ? 'Demande de devis commencée' : 'Demande commencée';
    box.hidden = !label;
    var resumeOnly = !!pendingEntry && !!label, sc = $('.step[data-step="choix"]');
    if (sc) sc.classList.toggle('is-resume', resumeOnly);
    // Le client vient de cliquer « Ramonage » : lui proposer « Nouvelle demande » lui ferait
    // rechoisir ce qu'il vient de choisir. Quand l'intention entrante a un nom, on l'affiche, et
    // c'est elle le bouton principal — l'ancien brouillon devient l'option secondaire.
    var intention = libelleEntree(pendingEntry);
    $('#h-choix').innerHTML = !resumeOnly ? 'Comment <span class="nw">pouvons-nous</span> vous aider&nbsp;?'
      : intention ? 'Vous avez une demande en cours' : 'Reprendre votre demande&nbsp;?';
    if (label) {
      var repartir = intention
        ? '<button type="button" class="btn-soft" data-reset>Démarrer ' + esc(intention) + ' ' + ic('i-arrow', 16) + '</button>'
        : '<button type="button" class="link" data-reset>Nouvelle demande</button>';
      var reprendre = intention
        ? '<button type="button" class="link" data-resume>Continuer&nbsp;: ' + esc(label) + '</button>'
        : '<button type="button" class="btn-soft" data-resume>Reprendre ' + ic('i-arrow', 16) + '</button>';
      var carte = '<span class="resume-txt"><strong>' + (intention ? 'Demande en cours sur votre appareil' : 'Vous avez une demande en cours') + '</strong><span>' + esc(label) + '</span></span>';
      // L'intention d'abord dans le DOM comme à l'écran : c'est elle que le client vient de demander.
      box.innerHTML = intention ? carte + repartir + reprendre : carte + repartir + reprendre;
    }
  };

  // Nom lisible de l'intention portée par un lien d'entrée. Null si le lien n'en porte aucune :
  // on n'invente pas un libellé pour une entrée générique.
  function libelleEntree(h) {
    if (!h) return null;
    if (h.sujet && SUJETS[h.sujet]) return SUJETS[h.sujet].libelle;
    if (h.presta && C.focusConnu(h.presta)) return C.focusLibelle(h.presta);
    if (h.entretien) return 'Contrat d\'entretien';
    return null;
  }

  // ---------- Lieu + zone ----------
  var adr = $('#f-adresse'), cpI = $('#f-cp'), viI = $('#f-ville'), acL = $('#acList'), zoneBox = $('#zoneBox');
  var acItems = [], acHl = -1, acT = null, acSeq = 0, geoT = null, geoSeq = 0;
  ENTER.lieu = function () { clearTimeout(acT); acSeq++; acHide(); adr.value = state.lieu.adresse || ''; cpI.value = state.lieu.cp || ''; viI.value = state.lieu.ville || ''; ['fld-adresse', 'fld-cp', 'fld-ville'].forEach(function (f) { mark(f, false); }); if (state.lieu.zone && (state.lieu.cp || '').length === 5) showZone(state.lieu.zone); else zoneBox.hidden = true; };
  function acHide() { acL.hidden = true; acL.innerHTML = ''; acItems = []; acHl = -1; adr.setAttribute('aria-expanded', 'false'); adr.removeAttribute('aria-activedescendant'); }
  function acSearch(q) {
    if (q.length < 3) { acHide(); return; }
    var seq = ++acSeq;
    fetch('https://api-adresse.data.gouv.fr/search/?limit=5&autocomplete=1&lat=' + C.AGENCE.lat + '&lon=' + C.AGENCE.lon + '&q=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (seq !== acSeq || document.activeElement !== adr) return; // réponse tardive : ne jamais rouvrir la liste hors focus
        acItems = ((d && d.features) || []).filter(function (f) { return f.properties && /housenumber|street|locality|municipality/.test(f.properties.type); });
        if (!acItems.length) { acHide(); return; }
        acL.innerHTML = acItems.map(function (f, i) { var p = f.properties; return '<li role="option" id="ac-' + i + '"><button type="button" data-ac="' + i + '" tabindex="-1"><span class="ac-ic">' + ic('i-pin', 17) + '</span><span><span class="ac-main">' + esc(p.type === 'municipality' ? p.city : p.name) + '</span><span class="ac-sub">' + esc([p.postcode, p.city].filter(Boolean).join(' ')) + '</span></span></button></li>'; }).join('');
        acL.hidden = false; adr.setAttribute('aria-expanded', 'true');
      }).catch(acHide); // API indisponible → saisie manuelle, jamais bloquant
  }
  function acPick(i) {
    var f = acItems[i]; if (!f) return; var p = f.properties, g = f.geometry && f.geometry.coordinates;
    var street = p.type === 'municipality' ? '' : (p.name || '');
    state.lieu = { adresse: street, cp: p.postcode || '', ville: p.city || '', lat: g ? g[1] : null, lon: g ? g[0] : null, zone: null };
    adr.value = street; cpI.value = state.lieu.cp; viI.value = state.lieu.ville;
    acHide(); ['fld-adresse', 'fld-cp', 'fld-ville'].forEach(function (x) { mark(x, false); });
    showZone(C.zoneFor(state.lieu.lat, state.lieu.lon, state.lieu.cp)); save(); renderRecap();
    if (!street) { adr.placeholder = 'Ajoutez le numéro et la rue'; adr.focus(); } else { var b = $('[data-next="lieu"]'); if (b) b.focus(); }
  }
  function showZone(z) {
    state.lieu.zone = z; var t = C.zoneText(z, state.lieu.ville); if (!t) { zoneBox.hidden = true; return; }
    zoneBox.className = 'zone zone--' + z.status;
    zoneBox.innerHTML = '<span class="zone-ic">' + ic(z.status === 'in' ? 'i-check' : 'i-info', 17) + '</span><span><strong>' + esc(t.title) + '</strong><p>' + esc(t.text) + '</p></span>';
    zoneBox.hidden = false;
  }
  function geocodeCommune() {
    var cp = (cpI.value || '').trim(), ville = (viI.value || '').trim();
    if (!C.cpOk(cp)) { zoneBox.hidden = true; state.lieu.zone = null; return; }
    var seq = ++geoSeq; clearTimeout(geoT);
    geoT = setTimeout(function () {
      fetch('https://api-adresse.data.gouv.fr/search/?type=municipality&limit=1&postcode=' + cp + '&q=' + encodeURIComponent(ville || cp))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (seq !== geoSeq) return; var f = d && d.features && d.features[0];
          if (f && f.geometry) { var g = f.geometry.coordinates; if (!viI.value && f.properties.city) { viI.value = f.properties.city; state.lieu.ville = f.properties.city; } showZone(C.zoneFor(g[1], g[0], cp)); }
          else showZone(C.zoneFor(null, null, cp));
          save(); renderRecap();
        }).catch(function () { if (seq === geoSeq) { showZone(C.zoneFor(null, null, cp)); save(); } });
    }, 350);
  }
  adr.addEventListener('input', function () { state.lieu.adresse = this.value; save(); mark('fld-adresse', false); clearTimeout(acT); var v = this.value.trim(); acT = setTimeout(function () { acSearch(v); }, 180); });
  adr.addEventListener('keydown', function (e) {
    if (acL.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); acHl = e.key === 'ArrowDown' ? Math.min(acItems.length - 1, acHl + 1) : Math.max(0, acHl - 1); $$('#acList button').forEach(function (b, i) { b.classList.toggle('is-hl', i === acHl); b.parentNode.setAttribute('aria-selected', String(i === acHl)); }); adr.setAttribute('aria-activedescendant', 'ac-' + acHl); }
    else if (e.key === 'Enter' && acHl >= 0) { e.preventDefault(); acPick(acHl); }
    else if (e.key === 'Escape') acHide();
  });
  adr.addEventListener('blur', function () { clearTimeout(acT); acSeq++; setTimeout(acHide, 180); });
  acL.addEventListener('mousedown', function (e) { var b = e.target.closest('[data-ac]'); if (b) { e.preventDefault(); acPick(parseInt(b.getAttribute('data-ac'), 10)); } });
  cpI.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 5); state.lieu.cp = this.value; state.lieu.lat = state.lieu.lon = null; mark('fld-cp', false); save(); geocodeCommune(); });
  viI.addEventListener('input', function () { state.lieu.ville = this.value; state.lieu.lat = state.lieu.lon = null; mark('fld-ville', false); save(); geocodeCommune(); });
  function submitLieu() {
    var l = state.lieu; l.adresse = adr.value.trim(); l.cp = cpI.value.trim(); l.ville = viI.value.trim();
    var bA = !C.nameOk(l.adresse), bC = !C.cpOk(l.cp), bV = !C.nameOk(l.ville);
    mark('fld-adresse', bA); mark('fld-cp', bC); mark('fld-ville', bV); save();
    if (bA) return focusBad(adr); if (bC) return focusBad(cpI); if (bV) return focusBad(viI);
    if (!l.zone) { l.zone = C.zoneFor(l.lat, l.lon, l.cp); save(); }
    if (state.mode === 'intervention' && state.fam && loaded && byFam[state.fam] && !C.famHasPrices(byFam[state.fam]) && !(cart && cart.count())) return switchToDevis(state.fam, true);
    next('lieu');
  }

  // ---------- Besoin (métiers du catalogue) ----------
  ENTER.besoin = function () { renderFamilies(); };
  function renderFamilies() {
    var box = $('#famTiles');
    if (loadFailed) { box.innerHTML = '<div class="empty" style="grid-column:1/-1">Le catalogue est momentanément indisponible. Appelez-nous au <a href="tel:+33366100134">03 66 10 01 34</a> ou <button class="link" type="button" data-switch-devis>décrivez votre besoin</button>.</div>'; return; }
    if (!loaded) { box.innerHTML = new Array(7).join('<div class="tile sk"></div>'); return; }
    box.innerHTML = FAMS.map(function (f) {
      var on = state.fam === f.slug;
      return '<button type="button" class="tile" data-fam="' + esc(f.slug) + '" aria-pressed="' + on + '"><span class="tile-ck">' + ic('i-check', 14) + '</span><span class="tile-ic">' + ic(famIcon(f.slug), 24) + '</span><span class="tile-t">' + esc(f.name) + '</span><span class="tile-n">' + esc(C.FAM_HINTS[f.slug] || (f.count + ' interventions')) + '</span></button>';
    }).join('');
  }
  function famIcon(slug) { return document.getElementById('f-' + slug) ? 'f-' + slug : 'i-tool'; }
  function pickFamily(el) {
    var slug = el.getAttribute('data-fam');
    $$('#famTiles .tile').forEach(function (t) { t.setAttribute('aria-pressed', String(t === el)); });
    if (state.fam !== slug) { state.fam = slug; state.prob = null; $('#precSearch').value = ''; }
    save();
    if (loaded && !C.famHasPrices(byFam[slug]) && !(cart && cart.count())) return setTimeout(function () { switchToDevis(slug, true); }, 240); // métier entièrement sur devis : pas d'écran « tarifs »
    setTimeout(function () { go('precision'); }, 240);
  }

  function devisMetierFor(slug) {
    var fn = C.norm(famName(slug).split(' ')[0]);
    var hit = DV_METIERS.filter(function (m) { return C.norm(m[0]) === fn; })[0];
    return hit ? hit[0] : null;
  }
  function switchToDevis(slug, fromQuoteOnly) {
    var m = slug ? devisMetierFor(slug) : null;
    var from = state.mode === 'intervention' && state.step !== 'choix' ? state.step : null;
    state.mode = 'devis'; state._fromIntervention = !!fromQuoteOnly; state._devisFrom = fromQuoteOnly ? null : from;
    if (m && (state.devis.metiers || []).indexOf(m) < 0) state.devis.metiers = [m].concat(state.devis.metiers || []).slice(0, 3);
    save();
    if (fromQuoteOnly) toast('Ces travaux sont chiffrés sur devis, gratuitement');
    else if (cart && cart.count()) toast('Vos interventions choisies seront jointes à votre demande de devis');
    go(m ? 'dv-projet' : 'dv-metier');
  }

  // ---------- Accès aux tarifs (identification avant affichage des prix) ----------
  ENTER.acces = function () {
    var f = famName(state.fam), v = state.lieu.ville;
    $('#accesSub').textContent = (f ? f + ' à ' + v : 'Votre intervention à ' + v) + ' : indiquez comment vous joindre, les tarifs s\u2019affichent aussitôt.';
    [['pg-prenom', 'prenom'], ['pg-nom', 'nom'], ['pg-tel', 'tel'], ['pg-email', 'email']].forEach(function (p) { var e = document.getElementById(p[0]); if (e && !e.value) e.value = state.contact[p[1]] || ''; });
    ['fld-pg-prenom', 'fld-pg-nom', 'fld-pg-tel', 'fld-pg-email'].forEach(function (x) { mark(x, false); });
  };
  [['pg-prenom', 'fld-pg-prenom'], ['pg-nom', 'fld-pg-nom'], ['pg-tel', 'fld-pg-tel'], ['pg-email', 'fld-pg-email']].forEach(function (x) { document.getElementById(x[0]).addEventListener('input', function () { mark(x[1], false); }); });
  function submitGate(e) {
    if (e) e.preventDefault();
    var btn = $('#pgSubmit'); if (btn.classList.contains('is-busy')) return;
    var pr = $('#pg-prenom'), no = $('#pg-nom'), tel = $('#pg-tel'), em = $('#pg-email');
    var bP = !C.nameOk(pr.value), bN = !C.nameOk(no.value), bT = !C.phoneOk(tel.value), bE = !!em.value.trim() && !C.emailOk(em.value);
    mark('fld-pg-prenom', bP); mark('fld-pg-nom', bN); mark('fld-pg-tel', bT); mark('fld-pg-email', bE);
    if (bP) return focusBad(pr); if (bN) return focusBad(no); if (bT) return focusBad(tel); if (bE) return focusBad(em);
    state.contact.prenom = pr.value.trim(); state.contact.nom = no.value.trim(); state.contact.tel = tel.value.trim(); state.contact.email = em.value.trim(); save();
    busy(btn, true, 'Affichage des tarifs…');
    var pending = state._pgPending && state._pgPending !== 'acces' ? state._pgPending : 'precision';
    var body = C.gatePayload({ contact: state.contact, lieu: state.lieu, famLabel: famName(state.fam), fam: state.fam, page: location.href, attribution: attribution(), cid: cid(), step: 'acces' });
    var p = SIM ? simulate('price_gate') : fetch(SUPA + '/functions/v1/submit-lead-v6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(body) })
      .then(function (r) { return r.ok ? r.json().catch(function () { return {}; }) : Promise.reject(r.status); });
    // Référence d'un dossier déjà finalisé (ancien brouillon) : abandonnée, l'envoi final en créera une nouvelle
    p.then(function (r) { if (r && r.duplicate) state._cid = null; track('hc_tarifs_access', { cat: state.fam, lead: 'ok' }); }, function () { track('hc_tarifs_access', { cat: state.fam, lead: 'echec' }); }).then(function () {
      state._priceGateOk = true; state._priceGateAt = Date.now(); try { sessionStorage.setItem('hc_pg', '1'); } catch (e2) {} state._pgPending = null; save(); maintContact();
      busy(btn, false);
      go(pending, { replace: true });
    });
  }
  $('#pgForm').addEventListener('submit', submitGate);

  // ---------- Précision : catalogue ou aide au choix ----------
  function inCart(id) { try { return !!(cart && cart.lines().some(function (l) { return l.id === id; })); } catch (e) { return false; } }
  function priceBlock(s) {
    var k = C.priceKind(s);
    if (k === 'devis') return '<span class="price price--devis"><span class="price-n">Sur devis</span><span class="price-l">chiffré après diagnostic</span></span>';
    if (k === 'confirmer') return '<span class="price price--confirmer"><span class="price-n">' + C.eur(s.price_ttc) + '</span><span class="price-l">TTC / ' + esc(C.perUnit(s)) + ' · à confirmer</span></span>';
    return '<span class="price"><span class="price-n">' + C.eur(s.price_ttc) + ' <small>TTC</small></span></span>';
  }
  function detailsBlock(s) {
    var inc = Array.isArray(s.includes) ? s.includes : [], meta = [];
    if (s.warranty) meta.push(esc(s.warranty));
    if (s.duration_min) meta.push('durée estimée ' + (s.duration_min >= 60 ? (Math.round(s.duration_min / 30) / 2).toString().replace('.', ',') + ' h' : s.duration_min + ' min'));
    var opts = Array.isArray(s.variants) ? s.variants.filter(function (v) { return v && v.label; }) : [];
    if (!inc.length && !meta.length && !opts.length) return '';
    return '<details class="more"><summary>' + ic('i-down', 16) + 'Ce qui est inclus</summary>' +
      (inc.length ? '<ul>' + inc.map(function (x) { return '<li>' + ic('i-check', 15) + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' : '') +
      (meta.length ? '<p class="meta">' + meta.join(' · ') + '</p>' : '') +
      (opts.length ? '<p class="meta">Option possible : ' + esc(opts.map(function (v) { var m = String(v.info || '').match(/\+\s?([\d\s]+,\d{2})\s?€\s?HT/), vat = Number(s.vat_rate); var ttc = (m && vat >= 0 && vat < 1) ? parseFloat(m[1].replace(/\s/g, '').replace(',', '.')) * (1 + vat) : null; return v.label + (ttc ? ' (+' + C.eur(ttc) + ' TTC)' : ''); }).join(', ')) + ' — précisée avec vous au rappel ; le prix affiché est celui de la version de base.</p>' : '') + '</details>';
  }
  function offerHtml(s, reco, showFam) {
    var on = inCart(s.id), hasVar = Array.isArray(s.variants) && s.variants.some(function (v) { return v && v.label; });
    return '<article class="offer' + (on ? ' is-in' : '') + '" data-offer="' + esc(s.id) + '">' +
      (reco ? '<p class="offer-badge">' + ic('i-spark', 14) + 'Conseillé</p>' : '') +
      '<button type="button" class="offer-pick" data-toggle="' + esc(s.id) + '" aria-pressed="' + on + '">' +
      '<span class="tick" aria-hidden="true">' + ic('i-check', 15) + '</span>' +
      '<span class="offer-txt"><span class="offer-t">' + esc(s.name) + '</span>' +
      (showFam && s.category_name ? '<span class="offer-d">' + esc(s.category_name) + '</span>' : '') +
      (s.short_desc ? '<span class="offer-d offer-desc">' + esc(s.short_desc) + '</span>' : '') +
      (hasVar ? '<span class="offer-d">Prix de la version de base ; option de gamme possible (voir le détail).</span>' : '') + '</span>' +
      priceBlock(s) + '<span class="sr-only">' + (on ? ', dans votre demande' : ', ajouter à votre demande') + '</span></button>' +
      detailsBlock(s) + '</article>';
  }
  ENTER.precision = function () { renderClosed(); renderOffers(); };
  function renderOffers() {
    var off = $('#offers'), head = $('#offersHead');
    if (!priceGatePassed()) { off.innerHTML = ''; head.textContent = ''; return; } // P0 : aucun prix rendu sans identification
    if (!loaded) { off.innerHTML = '<div class="empty">Chargement des interventions…</div>'; return; }
    $('#precFam').textContent = famName(state.fam);
    var aide = state.precMode === 'aide';
    $('#tab-liste').setAttribute('aria-selected', String(!aide)); $('#tab-aide').setAttribute('aria-selected', String(aide));
    $('#precAide').hidden = !aide; $('#precSearchWrap').hidden = aide;
    var toutes = byFam[state.fam] || [];
    // Le client est arrivé avec une intention précise : on lui montre d'abord ce qu'il est venu
    // chercher, avec un moyen visible de revenir à toute la famille. On ne l'oblige pas à chercher.
    var cible = C.focusFiltre(toutes, state.focus), cibleActive = state.focus && cible.length < toutes.length;
    var list = cibleActive ? cible : toutes, q = C.norm($('#precSearch').value), items = [], reco = null, html = '';
    if (q.length >= 2) {
      var sr = C.searchOffers(ALL, $('#precSearch').value); items = sr.items;
      head.textContent = items.length ? (sr.approx ? 'Résultats approchants pour « ' : items.length + ' résultat' + (items.length > 1 ? 's' : '') + ' pour « ') + $('#precSearch').value.trim() + ' »' : '';
      var multi = items.some(function (s) { return s.category_slug !== state.fam; });
      html = items.map(function (s) { return offerHtml(s, false, multi); }).join('') || '<div class="empty">Aucune intervention ne correspond. <button class="link" type="button" data-switch-devis>Décrivez votre besoin pour un devis</button>.</div>';
    } else if (aide) {
      var probs = C.diagFor(state.fam, list);
      $('#probChips').innerHTML = probs.map(function (p) { return '<button type="button" class="chip" data-prob="' + p.id + '" aria-pressed="' + (state.prob === p.id) + '">' + esc(p.label) + '</button>'; }).join('') +
        '<button type="button" class="chip" data-prob="inconnu" aria-pressed="' + (state.prob === 'inconnu') + '">Je ne sais pas</button>';
      if (!state.prob) { head.textContent = ''; html = ''; }
      else {
        var sg = C.suggest(state.fam, list, state.prob); reco = sg.best;
        head.textContent = reco ? (state.prob === 'inconnu' ? 'Un technicien identifie la panne sur place' : 'Notre conseil pour cette situation') : '';
        html = (reco ? offerHtml(reco, true) : '') + (sg.others.length ? '<p class="list-h" style="margin-top:18px">Autres possibilités</p>' + sg.others.map(function (s) { return offerHtml(s); }).join('') : '');
        if (!reco) html = '<div class="empty">Un technicien doit voir la situation. <button class="link" type="button" data-switch-devis>Demander un devis gratuit</button>.</div>';
      }
    } else {
      head.textContent = cibleActive
        ? C.focusLibelle(state.focus) + ' · ' + list.length + ' prestation' + (list.length > 1 ? 's' : '') + ' · prix TTC'
        : list.length + ' intervention' + (list.length > 1 ? 's' : '') + ' · prix TTC, fermes sauf mention';
      var all = state.showAll === state.fam, shown = all ? list : list.filter(function (x, i) { return i < 6 || inCart(x.id); });
      html = shown.map(function (x) { return offerHtml(x); }).join('') + (shown.length < list.length ? '<button type="button" class="more-btn" data-showall>Voir les ' + (list.length - shown.length) + ' autres interventions</button>' : '');
      if (cibleActive) html += '<p class="alt-line">Besoin d\'autre chose en ' + esc(famName(state.fam).toLowerCase()) + '&nbsp;? <button class="link" type="button" data-focus-off>Voir les ' + toutes.length + ' interventions de la famille</button></p>';
    }
    if (loaded) html += '<p class="alt-line">Vous ne trouvez pas votre besoin&nbsp;? <button class="link" type="button" data-switch-devis>Décrivez votre besoin (devis gratuit)</button></p>';
    off.innerHTML = html;
    updatePrecCta();
  }
  function updatePrecCta() { var n = cart ? cart.count() : 0; $('#precNext').disabled = n < 1; $('#precHint').hidden = n > 0; }
  function toggleLine(id) {
    var s = byId[id]; if (!s || !cart) return;
    if (inCart(id)) { cart.remove(id); track('hc_demande_remove', { item: s.slug, cat: state.fam, from: state.step }); }
    else { cart.add({ id: s.id, slug: s.slug, name: s.name, brand: s.brand, ttc: s.price_ttc, requires_quote: !C.priced(s), active: s.active }); track('hc_demande_add', { item: s.slug, cat: state.fam, price_kind: C.priceKind(s), lines: cart.count() }); maintStart('prestation'); }
    save();
    var on = inCart(id);
    $$('[data-offer="' + id + '"]').forEach(function (card) { card.classList.toggle('is-in', on); var b = card.querySelector('[data-toggle]'); if (b) { b.setAttribute('aria-pressed', String(on)); var sr = b.querySelector('.sr-only'); if (sr) sr.textContent = on ? ', dans votre demande' : ', ajouter à votre demande'; } });
    updatePrecCta(); renderRecap();
    if (state.step === 'demande') renderDemande();
  }

  // ---------- Ma demande ----------
  ENTER.demande = function () { renderNext(); renderDemande(); };
  function zoneNoteHtml() { var z = state.lieu.zone; return z && (z.status === 'edge' || z.status === 'out') ? '<div class="note note--warm">' + ic('i-info', 20) + '<span>Votre adresse est à plus de 50 km de l\u2019agence : les prix affichés incluent le déplacement dans la limite de 55 km. L\u2019agence vous confirme le déplacement lors du rappel.</span></div>' : ''; }
  function renderDemande() {
    var box = $('#demandeList');
    if (!priceGatePassed()) { box.innerHTML = ''; return; } // P0
    var lines = cart ? cart.lines() : [];
    if (!lines.length) { box.innerHTML = '<div class="empty">Votre demande est vide. <button class="link" type="button" data-go="besoin">Choisir une intervention</button></div>'; return; }
    function kindOf(l) { var s = byId[l.id]; return s ? C.priceKind(s) : (l.requires_quote ? 'devis' : 'ferme'); }
    function row(l) { var s = byId[l.id] || {}; return '<article class="dl"><div><h3>' + esc(l.name) + ((l.qty || 1) > 1 ? ' ×' + l.qty : '') + '</h3>' + (s.id ? detailsBlock(s) : '') + '</div><div class="dl-side">' + (s.id ? priceBlock(s) : '<p class="price"><span class="price-n">' + esc(linePrice(l)) + '</span></p>') + '<button type="button" class="dl-rm" data-remove="' + esc(l.id) + '" aria-label="Retirer « ' + esc(l.name) + ' »">' + ic('i-trash', 15) + 'Retirer</button></div></article>'; }
    var g = { ferme: [], confirmer: [], devis: [] }; lines.forEach(function (l) { g[kindOf(l)].push(l); });
    var h = '';
    if (g.ferme.length) { var tot = C.firmTotal(g.ferme, byId); h += '<section class="grp"><header class="grp-h"><h2>Prix ferme</h2><p>Montant connu à l’avance, tel que décrit</p></header>' + g.ferme.map(row).join('') + '<div class="grp-total"><span>Total des prix fermes</span><strong>' + C.eur(tot) + ' TTC</strong></div></section>'; }
    if (g.confirmer.length) h += '<section class="grp"><header class="grp-h"><h2>Prix à confirmer</h2><p>Tarif unitaire : le montant dépend des mesures prises sur place</p></header>' + g.confirmer.map(row).join('') + '</section>';
    h += zoneNoteHtml();
    if (g.devis.length) h += '<section class="grp"><header class="grp-h"><h2>Sur devis</h2><p>Chiffré gratuitement par le technicien après diagnostic</p></header>' + g.devis.map(row).join('') + '</section>';
    box.innerHTML = h;
  }

  // ---------- Coordonnées ----------
  var CF = [['f-prenom', 'prenom', 'fld-prenom'], ['f-nom', 'nom', 'fld-nom'], ['f-tel', 'tel', 'fld-tel'], ['f-email', 'email', 'fld-email']];
  // Une information n'est demandée qu'une fois : ce qui a été saisi à l'accès aux tarifs
  // n'est jamais redemandé. On n'affiche que les champs manquants, ou un récapitulatif modifiable.
  function missingContact() {
    var c = state.contact, m = [];
    if (!C.nameOk(c.prenom)) m.push('prenom');
    if (!C.nameOk(c.nom)) m.push('nom');
    if (!C.phoneOk(c.tel)) m.push('tel');
    if (String(c.email || '').trim() && !C.emailOk(c.email)) m.push('email');
    return m;
  }
  function contactSummary() {
    var c = state.contact, who = [c.prenom, c.nom].filter(Boolean).join(' ').trim();
    return [who, c.tel ? C.phoneDisplay(c.tel) : '', String(c.email || '').trim()].filter(Boolean).join(' · ');
  }
  ENTER.coordonnees = function () {
    pingIntent('coordonnees');
    CF.forEach(function (x) { document.getElementById(x[0]).value = state.contact[x[1]] || ''; mark(x[2], false); });
    $('#coordLieu').textContent = lieuTxt() || 'Adresse à compléter';
    var miss = missingContact(), edit = !!state._editContact;
    var known = $('#coordKnown');
    // Récapitulatif compact quand tout est déjà connu et que le client n'a pas demandé à modifier
    known.hidden = edit || !!miss.length || !contactSummary();
    if (!known.hidden) $('#coordKnownTxt').textContent = contactSummary();
    CF.forEach(function (x) {
      var show = edit || miss.indexOf(x[1]) >= 0;
      document.getElementById(x[2]).hidden = !show;
    });
    // Les rangées vides ne laissent pas de trou dans la mise en page
    ['coordRow1', 'coordRow2'].forEach(function (id) {
      var row = document.getElementById(id);
      row.hidden = !$$('.field', row).some(function (f) { return !f.hidden; });
    });
    var base = state.mode === 'devis' ? 'Pour vous transmettre votre devis et vous recontacter si besoin.' : 'Pour vous rappeler et confirmer votre intervention.';
    $('#coordSub').textContent = !known.hidden ? 'Nous avons déjà ce qu’il faut pour vous rappeler — vérifiez et continuez.'
      : (miss.length && !edit ? 'Il ne manque plus que ' + (miss.length > 1 ? 'quelques informations' : { prenom: 'votre prénom', nom: 'votre nom', tel: 'votre téléphone', email: 'un email valide' }[miss[0]]) + '.' : base);
  };
  CF.forEach(function (x) { document.getElementById(x[0]).addEventListener('input', function () { state.contact[x[1]] = this.value; mark(x[2], false); save(); renderRecap(); }); });
  function submitContact() {
    var c = state.contact;
    CF.forEach(function (x) { if (!document.getElementById(x[2]).hidden) c[x[1]] = document.getElementById(x[0]).value.trim(); });
    save();
    var bad = [!C.nameOk(c.prenom), !C.nameOk(c.nom), !C.phoneOk(c.tel), !!String(c.email || '').trim() && !C.emailOk(c.email)];
    CF.forEach(function (x, i) { mark(x[2], bad[i]); });
    var first = bad.indexOf(true);
    if (first >= 0) {
      // Un champ invalide caché (issu de l'accès aux tarifs) est rouvert pour correction
      if (document.getElementById(CF[first][2]).hidden) { state._editContact = true; save(); ENTER.coordonnees(); }
      return focusBad(document.getElementById(CF[first][0]));
    }
    state._editContact = false; save();
    track('hc_coordonnees_ok'); maintContact();
    next('coordonnees');
  }

  // ---------- Prise en charge ----------
  function hoursLine() { var a = C.agencyStatus(new Date()); return a.open ? '' : ' L\u2019agence est fermée en ce moment : premier rappel possible ' + a.next + '.'; }
  ENTER.creneau = function () {
    var p = state.prise; $('#errCreneau').hidden = true;
    $('#creneauNote').textContent = 'Ce n\u2019est pas encore un rendez-vous ferme : aucun créneau n\u2019est réservé en ligne. L\u2019agence vous rappelle sous 24 h ouvrées au plus tard, aux heures d\u2019ouverture (lun–ven 9h–17h, sam 9h–16h), pour le fixer avec vous.' + hoursLine();
    $$('#quandOpts [data-quand]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-quand') === p.quand)); });
    $$('#rappelOpts [data-rappel]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-rappel') === (p.rappel || 'asap'))); });
    $('#fld-date').hidden = p.quand !== 'date';
    var today = new Date(); var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    $('#f-date').min = iso; $('#f-date').value = p.date || ''; $('#f-precisions').value = p.precisions || '';
  };
  $('#f-date').addEventListener('change', function () { var ok = C.dateOk(this.value); state.prise.date = ok ? this.value : ''; mark('fld-date', !ok && !!this.value); save(); renderRecap(); });
  $('#f-precisions').addEventListener('input', function () { state.prise.precisions = this.value; save(); });

  // ---------- Devis ----------
  // Prestations demandées depuis l'accueil mais ABSENTES du catalogue : elles partent en devis,
  // avec le métier et une description déjà remplis. Aucun parcours de paiement n'est proposé,
  // puisqu'il n'y a pas de prix ferme à payer (décision Florian du 22/09 : pas d'écriture au catalogue).
  var SUJETS = {
    ramonage: { libelle: 'Ramonage', metier: 'Chauffage', nature: 'Entretien', desc: 'Ramonage : cheminée, conduit ou poêle. Merci de me rappeler pour convenir d\'une date et me confirmer le tarif.' },
    'poele-insert': { libelle: 'Entretien de poêle ou d\'insert', metier: 'Chauffage', nature: 'Entretien', desc: 'Entretien de poêle ou d\'insert, ramonage compris. Merci de me rappeler pour convenir d\'une date et me confirmer le tarif.' }
  };
  var DV_METIERS = [['Plomberie', 'f-plomberie'], ['Chauffage', 'f-chauffage'], ['Électricité', 'f-electricite'], ['Serrurerie', 'f-serrurerie'], ['Vitrerie', 'f-vitrerie'], ['Menuiserie', 'f-menuiserie'], ['Rénovation', 'f-renovation'], ['Salle de bain', 'f-plomberie'], ['Volets', 'f-volets'], ['Adaptation PMR', 'f-pmr'], ['Sinistre assurance', 'f-sinistre'], ['Contrat entretien', 'f-entretien']];
  var NATURES = ['Réparation', 'Remplacement', 'Installation neuve', 'Rénovation', 'Mise aux normes', 'Entretien'];
  ENTER['dv-metier'] = function () {
    var sel = state.devis.metiers || [];
    var autreOn = sel.indexOf('Autre') >= 0;
    $('#dvTiles').innerHTML = DV_METIERS.map(function (m) { var on = sel.indexOf(m[0]) >= 0; return '<button type="button" class="tile" data-dvm="' + esc(m[0]) + '" aria-pressed="' + on + '"><span class="tile-ck">' + ic('i-check', 14) + '</span><span class="tile-ic">' + ic(m[1], 22) + '</span><span class="tile-t">' + esc(m[0]) + '</span></button>'; }).join('');
    syncAutre(autreOn);
    $('#dvMetierNext').disabled = !sel.length;
  };
  function syncAutre(on) { var a = $('#dvAutre'); if (!a) return; a.setAttribute('aria-pressed', String(on)); a.textContent = on ? 'Autre besoin ajouté · retirer' : 'Autre besoin, je le décris ensuite'; }
  function toggleMetier(el) {
    var m = el.getAttribute('data-dvm'), sel = state.devis.metiers = state.devis.metiers || [], i = sel.indexOf(m);
    if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 3) { toast('Trois domaines maximum'); return; } sel.push(m); }
    if (el.id === 'dvAutre') syncAutre(i < 0); else el.setAttribute('aria-pressed', String(i < 0));
    $('#dvMetierNext').disabled = !sel.length; save(); renderRecap(); if (i < 0) maintStart('devis');
  }
  var DV_EX = { 'Rénovation': 'Ex. repeindre un salon de 25 m², murs et plafond, maison des années 1990…', 'Salle de bain': 'Ex. remplacer la baignoire par une douche à l\u2019italienne, pièce de 6 m²…', 'Plomberie': 'Ex. déplacer l\u2019évier de la cuisine, créer une arrivée d\u2019eau au garage…', 'Chauffage': 'Ex. remplacer une chaudière fioul de 20 ans, maison de 110 m²…', 'Électricité': 'Ex. mise aux normes du tableau électrique, maison ancienne…', 'Menuiserie': 'Ex. remplacer une porte d\u2019entrée et deux fenêtres…', 'Volets': 'Ex. motoriser trois volets roulants…', 'Adaptation PMR': 'Ex. installer une douche de plain-pied et des barres d\u2019appui…' };
  ENTER['dv-projet'] = function () {
    $('#dv-desc').placeholder = DV_EX[(state.devis.metiers || [])[0]] || 'Ex. décrivez les travaux, la pièce concernée, les dimensions approximatives…';
    $('#natureOpts').innerHTML = NATURES.map(function (n) { return '<button type="button" class="chip" role="radio" data-nature="' + esc(n) + '" aria-checked="' + (state.devis.nature === n) + '">' + esc(n) + '</button>'; }).join('');
    $('#dv-desc').value = state.devis.desc || ''; mark('fld-desc', false); descHint();
  };
  function descHint() { var n = ($('#dv-desc').value || '').trim().length; $('#descHint').textContent = n >= 10 ? n + ' caractères' : 'Encore ' + (10 - n) + ' caractère' + (10 - n > 1 ? 's' : ''); }
  $('#dv-desc').addEventListener('input', function () { state.devis.desc = this.value; mark('fld-desc', false); descHint(); save(); });
  var MAX_PH = 3, MAX_SZ = 8 * 1024 * 1024;
  function photosLostNote() { var lost = (state.devis.photos || 0) > 0 && !dvFiles.length; var e = $('#errPhotos'); if (lost) { e.textContent = 'Vos photos n\u2019ont pas pu être conservées après la fermeture de la page : ajoutez-les à nouveau si vous le souhaitez.'; e.hidden = false; } return lost; }
  ENTER['dv-photos'] = function () { $('#errPhotos').hidden = true; photosLostNote(); renderThumbs(); };
  function renderThumbs() {
    var ul = $('#thumbs'); ul.innerHTML = '';
    dvFiles.forEach(function (f, i) {
      var li = document.createElement('li'); var img = document.createElement('img'); img.alt = 'Photo ' + (i + 1);
      img.onerror = function () { li.innerHTML = ic('i-image', 30); li.appendChild(rm); }; img.src = URL.createObjectURL(f);
      var rm = document.createElement('button'); rm.type = 'button'; rm.setAttribute('aria-label', 'Retirer la photo ' + (i + 1)); rm.innerHTML = ic('i-x', 15);
      rm.addEventListener('click', function () { dvFiles.splice(i, 1); state.devis.photos = dvFiles.length; save(); renderThumbs(); renderRecap(); var nb = $$('#thumbs button')[Math.max(0, i - 1)] || $('#dvPhotosNext'); if (nb) nb.focus(); });
      li.appendChild(img); li.appendChild(rm); ul.appendChild(li);
    });
    var b = $('#dvPhotosNext'); b.innerHTML = dvFiles.length ? 'Continuer avec ' + dvFiles.length + ' photo' + (dvFiles.length > 1 ? 's' : '') + ' ' + ic('i-arrow', 18) : ic('i-camera', 18) + ' Ajouter des photos';
    $('#dvPhotosSkip').hidden = dvFiles.length > 0;
    if (dvFiles.length < MAX_PH && /maximum/.test($('#errPhotos').textContent)) $('#errPhotos').hidden = true;
  }
  function addPhotos(list) {
    var err = $('#errPhotos'); err.hidden = true; var msg = '';
    Array.prototype.forEach.call(list || [], function (f) {
      if (dvFiles.length >= MAX_PH) { msg = 'Trois photos maximum.'; return; }
      if (!(/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name))) { msg = '« ' + f.name + ' » : format non pris en charge.'; return; }
      if (f.size > MAX_SZ) { msg = '« ' + f.name + ' » dépasse 8 Mo.'; return; }
      dvFiles.push(f);
    });
    if (msg) { err.textContent = msg; err.hidden = false; }
    state.devis.photos = dvFiles.length; save();
    renderThumbs(); renderRecap();
  }
  $('#dv-photos').addEventListener('change', function () { addPhotos(this.files); this.value = ''; });
  var drop = $('#drop');
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); if (ev === 'drop' && e.dataTransfer) addPhotos(e.dataTransfer.files); }); });
  function renderNext() { var dv = state.mode === 'devis'; var steps = dv ? [['Vous envoyez votre demande', 'Gratuit et sans engagement.'], ['L\u2019agence vous recontacte', 'Sous 24 h ouvrées, pour préciser votre projet.'], ['Vous recevez votre devis', 'Vous décidez ensuite, sans engagement.']] : [['Vous envoyez votre demande', 'Elle part directement à l\u2019agence, sans engagement.'], ['L\u2019agence vous recontacte', 'Sous 24 h ouvrées, aux heures d\u2019ouverture.'], ['Rendez-vous fixé ensemble', 'Avec un technicien salarié de l\u2019agence.']]; $('#recapNext ol').innerHTML = steps.map(function (x, i) { return '<li><b>' + (i + 1) + '</b><span><strong>' + esc(x[0]) + '</strong>' + esc(x[1]) + '</span></li>'; }).join(''); }
  ENTER['dv-recap'] = function () {
    renderNext();
    state.devis.photosSeen = true; save();
    $('#errDevis').hidden = true;
    var d = state.devis, rows = [['Travaux', (d.metiers || []).join(', '), 'dv-metier'], ['Type de projet', d.nature || 'Non précisé', 'dv-projet'], ['Projet', d.desc, 'dv-projet'], ['Photos', dvFiles.length ? dvFiles.length + ' photo' + (dvFiles.length > 1 ? 's' : '') : 'Aucune', 'dv-photos'], ['Lieu', lieuTxt(), 'lieu'], ['Contact', [state.contact.prenom + ' ' + state.contact.nom, C.phoneDisplay(state.contact.tel), state.contact.email].filter(function (x) { return String(x || '').trim(); }).join(' · '), 'coordonnees']];
    if (!dvFiles.length && (state.devis.photos || 0) > 0) rows[3][1] = 'À rajouter : non conservées après fermeture de la page';
    $('#dvRows').innerHTML = rows.map(function (r) { return '<div class="rw"><span class="rw-k">' + esc(r[0]) + '</span><span class="rw-v">' + esc(r[1]) + '</span><button type="button" class="link" data-go="' + r[2] + '" aria-label="Modifier : ' + esc(r[0]) + '">Modifier</button></div>'; }).join('') +
      (cart ? cart.lines() : []).map(function (l) { return '<div class="rw"><span class="rw-k">Intervention jointe</span><span class="rw-v">' + esc(l.name + ' · ' + linePrice(l)) + '</span><button type="button" class="link" data-unjoin="' + esc(l.id) + '" aria-label="Retirer « ' + esc(l.name) + ' » de la demande">Retirer</button></div>'; }).join('');
  };

  // ---------- Envoi réel (REAL_BACKEND) ou simulé (SIMULATED_FOR_UI, recette uniquement) ----------
  function simulate(kind) { console.info('[HC][SIMULATION] envoi « ' + kind + ' » simulé — aucune donnée transmise'); return new Promise(function (res) { setTimeout(function () { res({ success: true, id: null, simulated: true }); }, 650); }); }
  function postLead(payload) {
    if (SIM) return simulate(payload.form_type);
    return fetch(SUPA + '/functions/v1/submit-lead-v6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok ? j : Promise.reject(j); }); });
  }
  function sendIntervention() {
    var btn = $('#sendIntervention'), err = $('#errCreneau'), p = state.prise; if (btn.classList.contains('is-busy')) return;
    err.hidden = true;
    if (!p.quand) { err.textContent = 'Choisissez un délai souhaité.'; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); var q = $('#quandOpts [data-quand]'); if (q) q.focus({ preventScroll: true }); return; }
    if (p.quand === 'date' && !C.dateOk(p.date)) { mark('fld-date', true); focusBad($('#f-date')); return; }
    var lines = cart.lines(), fam = maintFamily();
    var payload = C.interventionPayload({ lines: lines, byId: byId, contact: state.contact, lieu: state.lieu, prise: p, cartMode: cart.mode(), page: location.href, attribution: attribution(), cid: cid() });
    track('hc_demande_submit', { lines: lines.length, quote_lines: lines.filter(function (l) { return l.requires_quote; }).length, zone: state.lieu.zone && state.lieu.zone.status });
    busy(btn, true, 'Envoi en cours…');
    postLead(payload).then(function (data) {
      state.sent = { mode: 'intervention', ref: C.refFromId(data && data.id), simulated: !!(data && data.simulated), at: Date.now(), prenom: state.contact.prenom, nom: state.contact.nom,
        leadId: (data && data.id) || null, payToken: (data && data.pay_token) || null,
        allFirm: lines.length > 0 && lines.every(function (l) { var sv = byId[l.id]; return sv ? C.priceKind(sv) === 'ferme' : !l.requires_quote; }),
        lines: lines.map(function (l) { var sv = byId[l.id] || {}; return { name: l.name + ((l.qty || 1) > 1 ? ' ×' + l.qty : ''), price: linePrice(l), kind: sv.id ? C.priceKind(sv) : (l.requires_quote ? 'devis' : 'ferme'), includes: Array.isArray(sv.includes) ? sv.includes.slice(0, 8) : [] }; }),
        total: C.firmTotal(lines, byId), lieu: lieuTxt(), prise: C.priseText(p), tel: C.phoneDisplay(state.contact.tel), email: state.contact.email || '' };
      cart.clear(); state.prise = C.emptyState().prise; state.fam = null; state.prob = null; state.devis = C.emptyState().devis; forgetIdentityAfterSend(); save();
      busy(btn, false); leadTracked('intervention', { lines: lines.length, service_family: fam }, data); go('envoye', { replace: true });
    }).catch(function () { busy(btn, false); track('hc_demande_error'); err.textContent = "L'envoi n'a pas abouti. Vos informations sont conservées : réessayez, ou appelez le 03 66 10 01 34."; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  }
  function sendDevis() {
    var btn = $('#sendDevis'), err = $('#errDevis'); if (btn.classList.contains('is-busy')) return; err.hidden = true;
    var files = dvFiles.slice();
    var joined = cart ? cart.lines() : [], fam = maintFamily();
    var payload = C.devisPayload({ contact: state.contact, lieu: state.lieu, devis: state.devis, photos: files.length, lines: joined, byId: byId, page: location.href, attribution: attribution(), cid: cid() });
    var leadType = (state.devis.metiers || []).indexOf('Contrat entretien') >= 0 ? 'entretien' : 'devis';
    track('hc_demande_submit', { lead_type: leadType, lines: joined.length, photos: files.length, zone: state.lieu.zone && state.lieu.zone.status });
    busy(btn, true, 'Envoi en cours…');
    postLead(payload).then(function (data) {
      var up = (!SIM && files.length && data && data.id && data.upload_token) ? uploadPhotos(data.id, data.upload_token, files) : Promise.resolve(null);
      return up.then(function (res) { return { data: data, photos: res }; });
    }).then(function (r) {
      var stored = r.photos && typeof r.photos.stored === 'number' ? r.photos.stored : (Array.isArray(r.photos && r.photos.stored) ? r.photos.stored.length : null);
      state.sent = { mode: 'devis', ref: C.refFromId(r.data && r.data.id), simulated: !!(r.data && r.data.simulated), at: Date.now(), prenom: state.contact.prenom,
        nom: state.contact.nom, leadId: (r.data && r.data.id) || null,
        metiers: (state.devis.metiers || []).slice(), desc: state.devis.desc || '', lieu: lieuTxt(), photosSent: files.length, photosStored: stored, tel: C.phoneDisplay(state.contact.tel), email: state.contact.email || '', lines: joined.map(function (l) { return { name: l.name, price: linePrice(l) }; }) };
      state.devis = C.emptyState().devis; dvFiles = []; if (cart) cart.clear(); state.prise = C.emptyState().prise; state.fam = null; forgetIdentityAfterSend(); save();
      busy(btn, false); leadTracked(leadType, { lines: joined.length, photos: files.length, service_family: fam }, r.data); go('envoye', { replace: true });
    }).catch(function () { busy(btn, false); track('hc_demande_error'); err.textContent = "L'envoi n'a pas abouti. Vos informations sont conservées : réessayez, ou appelez le 03 66 10 01 34."; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  }
  function uploadPhotos(id, token, files) {
    var fd = new FormData(); fd.append('lead_id', id); fd.append('upload_token', token);
    files.slice(0, MAX_PH).forEach(function (f) { fd.append('files', f); });
    return fetch(SUPA + '/functions/v1/upload-lead-photos', { method: 'POST', body: fd }).then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; }).catch(function () { return null; });
  }

  // ---------- Confirmation ----------
  // ---------- Confirmation : espace récapitulatif du dossier (directive 5713247831) ----------
  // Le client relit TOUT son dossier ; s'il ne contient que des forfaits à prix ferme, il peut
  // (facultativement) le régler en ligne. Montant recalculé côté serveur, Stripe TEST en recette.
  var payReturn = null;
  try { payReturn = new URLSearchParams(location.search).get('hc_pay'); } catch (e) { payReturn = null; }
  if (payReturn) {
    if (state.sent) { state.sent.payState = ''; }
    try { history.replaceState(history.state, '', location.pathname + location.search.replace(/([?&])hc_pay=[^&]*&?/, '$1').replace(/[?&]$/, '') + location.hash); } catch (e) {}
  }
  function row(k, v) { return v ? '<div class="rw"><span class="rw-k">' + esc(k) + '</span><span class="rw-v">' + v + '</span><span></span></div>' : ''; }
  function payApi(mode, leadId, token) {
    var s = state.sent || {};
    return fetch(SUPA + '/functions/v1/create-payment-session', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId || s.leadId, pay_token: token || s.payToken, mode: mode, return_url: location.origin + location.pathname + location.search }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok ? j : Promise.reject(j); }); });
  }
  function checkPayment(attempt) {
    var s = state.sent; if (!s) return;
    attempt = attempt || 0; s.payState = 'checking'; ENTER.envoye();
    payApi('check').then(function (r) {
      if (!r || !r.available) s.payState = 'unavailable';
      else if (r.payment && r.payment.status === 'paid') { s.payment = r.payment; s.payState = 'paid'; }
      else if (!r.eligible) s.payState = 'ineligible';
      else if (payReturn === 'ok' && attempt < 6) { setTimeout(function () { checkPayment(attempt + 1); }, 2000); return; }
      else s.payState = payReturn === 'annule' ? 'cancelled' : (payReturn === 'ok' ? 'confirming' : 'ready');
      save(); ENTER.envoye();
    }, function () { s.payState = 'unavailable'; save(); ENTER.envoye(); });
  }
  function payBlockHtml(s) {
    if (s.mode === 'devis') return '';
    var p = s.payment, amount = C.eur(s.total || 0);
    if (p && p.status === 'paid') return '<div class="done-card pay pay--ok"><h2>' + ic('i-check', 20) + 'Paiement reçu</h2><p>' + esc(C.eur(p.amount || s.total)) + ' TTC le ' + esc(new Date(p.paid_at || Date.now()).toLocaleString('fr-FR')) + (p.simulated ? ' (simulation de recette, aucun débit)' : '') + (s.ref ? ' — dossier ' + esc(s.ref) : '') + '.</p><p class="pay-note">Rien de plus à régler sur place, sauf ajustement que vous auriez accepté après constat.</p></div>';
    if (s.payState === 'checking') return '<div class="done-card pay"><h2>Paiement en ligne</h2><p>Vérification…</p></div>';
    if (s.payState === 'confirming') return '<div class="done-card pay"><h2>Paiement en cours de confirmation</h2><p>La banque confirme votre paiement ; cette page se met à jour dans quelques instants. Votre dossier est conservé.</p></div>';
    if (s.payState === 'unavailable' || (!s.simulated && (!s.leadId || !s.payToken))) return '';
    if (!s.allFirm || !(s.total > 0) || s.payState === 'ineligible')
      return '<div class="done-card pay"><h2>Paiement</h2><p>Paiement disponible après validation de l’agence : ' + (s.allFirm ? 'le montant sera confirmé lors du rappel. ' : 'votre demande comprend une prestation chiffrée sur place ou sur devis. ') + 'Vous réglez après l’intervention.</p></div>';
    return '<div class="done-card pay"><h2>Payer en ligne <span class="opt">· facultatif</span></h2>'
      + '<p>Vous pouvez régler dès maintenant les forfaits à prix ferme de votre demande — <strong>' + esc(amount) + ' TTC</strong> — ou après l’intervention, comme vous préférez.</p>'
      + '<p class="reserve-line">' + esc('Le montant réglé correspond aux forfaits sélectionnés. Si le technicien constate un besoin différent ou complémentaire, un ajustement vous est proposé avant toute intervention : aucun supplément sans votre accord.') + '</p>'
      + (s.payState === 'cancelled' ? '<p class="pay-note">Paiement annulé : votre dossier est conservé, vous pouvez réessayer quand vous voulez.</p>' : '')
      + (s.payError ? '<p class="pay-note pay-note--bad" role="alert">' + esc(s.payError) + '</p>' : '')
      + '<button type="button" class="btn-primary" data-pay>' + (s.simulated ? 'Payer ' + esc(amount) + ' en ligne (simulation)' : 'Payer ' + esc(amount) + ' en ligne') + ' ' + ic('i-arrow', 18) + '</button>'
      + '<p class="pay-sub">Paiement sécurisé par carte · aucune donnée bancaire ne transite par ce site.</p></div>';
  }
  ENTER.envoye = function () {
    var s = state.sent, box = $('#done'); if (!s) return;
    var dv = s.mode === 'devis', h = '<span class="done-ic">' + ic('i-check', 40) + '</span>';
    h += '<h1 id="h-envoye" tabindex="-1">' + (s.prenom ? esc(s.prenom) + ', votre ' : 'Votre ') + (dv ? 'demande de devis est envoyée' : 'demande est envoyée') + '</h1>';
    if (s.ref) h += '<p class="done-ref">Référence de votre dossier · ' + esc(s.ref) + '</p>';
    else if (s.simulated) h += '<p class="done-ref">Référence de votre dossier · attribuée à l’enregistrement réel (HC-XXXXXXXX)</p>'; // simulation : emplacement visible, jamais de faux numéro
    if (s.simulated) h += '<p class="done-sim">Simulation de recette : aucune donnée n’a été transmise et aucun dossier n’a été créé.</p>';
    h += '<div class="done-card dossier"><h2>' + (dv ? 'Votre projet' : 'Votre dossier') + '</h2><div class="rows" style="padding:4px 18px">';
    h += row('Client', esc([s.prenom, s.nom].filter(Boolean).join(' ')));
    if (dv) {
      h += row('Travaux', esc((s.metiers || []).join(', '))) + row('Projet', s.desc ? esc(s.desc.length > 220 ? s.desc.slice(0, 217) + '…' : s.desc) : '');
      if (s.photosSent) h += row('Photos', esc(s.photosSent + ' envoyée' + (s.photosSent > 1 ? 's' : '') + (s.photosStored === 0 ? ' (non reçues — renvoyez-les en répondant à l’email de l’agence)' : '')));
      h += (s.lines || []).map(function (l) { return row('Intervention jointe', esc(l.name + ' · ' + l.price)); }).join('');
    } else {
      h += (s.lines || []).map(function (l) {
        var inc = (l.includes || []).length ? '<ul class="done-inc">' + l.includes.map(function (x) { return '<li>' + ic('i-check', 14) + esc(x) + '</li>'; }).join('') + '</ul>' : '';
        return '<div class="rw rw--line"><span class="rw-k">' + (l.kind === 'devis' ? 'Sur devis' : (l.kind === 'confirmer' ? 'À confirmer' : 'Prix ferme')) + '</span><span class="rw-v"><strong>' + esc(l.name) + '</strong>' + inc + '</span><span class="rw-v">' + esc(l.price) + '</span></div>';
      }).join('');
      if (s.total > 0) h += '<div class="rw rw--total"><span class="rw-k">Total des prix fermes</span><span></span><span class="rw-v">' + esc(C.eur(s.total)) + ' TTC</span></div>';
      h += row('Préférence', esc(s.prise || ''));
    }
    h += row('Adresse', esc(s.lieu)) + row('Téléphone', esc(s.tel || '')) + row('Email', esc(s.email || ''));
    h += '</div>';
    if (!dv && (s.lines || []).length) h += '<p class="reserve-line">' + esc('Les tarifs affichés correspondent à des forfaits, sous réserve de vérification sur place : si le besoin constaté diffère, un ajustement ou un devis complémentaire vous est proposé avant intervention.') + '</p>';
    h += '</div>';
    h += payBlockHtml(s);
    var paid = s.payment && s.payment.status === 'paid';
    var steps = dv
      ? [['Un technicien étudie votre projet', s.photosSent ? 'À partir de votre description et de vos photos.' : 'À partir de votre description.'], ['L’agence vous recontacte sous 24 h ouvrées', 'Pour préciser votre projet ; une visite sur place peut vous être proposée si nécessaire.' + hoursLine()], ['Vous recevez votre devis gratuit', 'Vous décidez ensuite, sans engagement.']]
      : [['L’agence vous rappelle', 'Sous 24 h ouvrées au plus tard, aux heures d’ouverture.' + hoursLine()], ['Le créneau est fixé avec vous', 'Les prix fermes restent ceux affichés si la situation correspond au forfait ; les prestations sur devis sont chiffrées après diagnostic.'], ['Le technicien intervient', paid ? 'Votre paiement est déjà reçu : rien à régler sur place, sauf ajustement accepté par vous.' : 'Vous réglez après l’intervention.']];
    h += '<div class="done-card"><h2>Et maintenant&nbsp;?</h2><ol class="timeline">' + steps.map(function (x, i) { return '<li><b>' + (i + 1) + '</b><strong>' + esc(x[0]) + '</strong><span>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>'
      + '<p class="done-agency"><strong>HELP Confort — agence de Saint-Omer</strong><br><a href="tel:+33366100134">03 66 10 01 34</a> · <a href="mailto:saint-omer@helpconfort.com">saint-omer@helpconfort.com</a><br>lun–ven 9h–17h · sam 9h–16h</p></div>';
    var modif = 'mailto:saint-omer@helpconfort.com?subject=' + encodeURIComponent('Modification de mon dossier ' + (s.ref || '')) + '&body=' + encodeURIComponent('Bonjour,\n\nJe souhaite modifier ma demande (dossier ' + (s.ref || '') + ') :\n\n');
    h += '<div class="done-actions"><button type="button" class="btn-ghost" data-print>Imprimer ou enregistrer en PDF</button>'
      + '<a class="btn-ghost" href="' + modif + '">Demander une modification</a>'
      + '<a class="btn-ghost" href="/">Retour à l’accueil</a><button type="button" class="btn-ghost" data-restart>Faire une autre demande</button></div>'
      + '<p class="legal" style="text-align:center"><button type="button" class="link" data-forget>Effacer mes informations de cet appareil</button></p>';
    box.innerHTML = h;
    if (!dv && !s.simulated && s.leadId && s.payToken && !s.payState && !paid) checkPayment(0);
  };

  // ---------- Événements (délégation) ----------
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return; var el;
    if (OVERLAY && (el = t.closest('.top-close') || t.closest('a[href="/"]'))) { e.preventDefault(); close(); return; } // overlay : on reste sur la page hôte
    if (t.closest('a[href^="tel:"]')) track('hc_call_click', { step: state.step });
    if ((el = t.closest('[data-choose]'))) { var md = el.getAttribute('data-choose'); pendingEntry = null; state._entryStep = null; if (state.sent || C.hasDraft(state, cart ? cart.count() : 0)) startClean(); state.mode = md; state.sent = null; state._returnTo = null; if (md === 'intervention') { state.fam = null; state.prob = null; state.precMode = 'liste'; } save(); return go(md === 'devis' ? 'dv-metier' : 'lieu'); }
    if ((el = t.closest('[data-next]'))) { var from = el.getAttribute('data-next'); if (from === 'dv-photos') { state.devis.photosSeen = true; save(); } if (from === 'lieu') return submitLieu(); if (from === 'coordonnees') return submitContact();
      if (from === 'dv-projet') { state.devis.desc = $('#dv-desc').value.trim(); save(); if (!C.descOk(state.devis.desc)) { mark('fld-desc', true); return focusBad($('#dv-desc')); } }
      return next(from); }
    if ((el = t.closest('[data-go]'))) { e.preventDefault(); var tg = el.getAttribute('data-go'), ti = C.flowIndex(state.mode, tg), ci = C.flowIndex(state.mode, state.step); state._returnTo = (ti >= 0 && ci > ti) ? state.step : null; if (tg === 'coordonnees') state._editContact = true; return go(tg); }
    if ((el = t.closest('[data-print]'))) { try { window.print(); } catch (e2) {} return; }
    if ((el = t.closest('[data-pay]'))) {
      var s0 = state.sent; if (!s0) return;
      if (s0.simulated) { s0.payment = { status: 'paid', amount: s0.total, paid_at: new Date().toISOString(), simulated: true }; s0.payState = 'paid'; save(); ENTER.envoye(); track('hc_payment', { lead_type: 'intervention', simulated: true }); return; }
      busy(el, true, 'Ouverture du paiement sécurisé…'); s0.payError = '';
      payApi('create').then(function (r) {
        if (r && r.url) { track('hc_payment', { lead_type: 'intervention', simulated: false }); location.href = r.url; return; }
        busy(el, false);
        if (r && r.already_paid) { s0.payment = r.payment; s0.payState = 'paid'; }
        else s0.payError = 'Le paiement en ligne n’est pas disponible pour le moment. Votre dossier est bien enregistré : vous réglerez après l’intervention.';
        save(); ENTER.envoye();
      }, function () { busy(el, false); s0.payError = 'Le paiement n’a pas pu s’ouvrir. Votre dossier est conservé : réessayez ou réglez après l’intervention.'; save(); ENTER.envoye(); });
      return;
    }
    if ((el = t.closest('[data-edit-contact]'))) { state._editContact = true; save(); ENTER.coordonnees(); var f1 = $$('.field', $('.step[data-step="coordonnees"]')).filter(function (x) { return !x.hidden; })[0]; var i1 = f1 && f1.querySelector('input'); if (i1) i1.focus(); return; }
    if ((el = t.closest('[data-fam]'))) return pickFamily(el);
    if ((el = t.closest('[data-toggle]'))) return toggleLine(el.getAttribute('data-toggle'));
    if ((el = t.closest('[data-unjoin]'))) { var uid = el.getAttribute('data-unjoin'), ul = cart && cart.lines().filter(function (x) { return x.id === uid; })[0]; if (cart) cart.remove(uid); save(); track('hc_demande_remove', { item: ul && ul.slug, from: 'dv-recap' }); ENTER['dv-recap'](); renderRecap(); toast('« ' + (ul ? ul.name : 'Intervention') + ' » retirée de la demande'); var nx = $('#dvRows [data-unjoin]') || $('#sendDevis'); if (nx) nx.focus(); return; }
    if ((el = t.closest('[data-remove]'))) { var rid = el.getAttribute('data-remove'); if (cart) { var rl = cart.lines().filter(function (x) { return x.id === rid; })[0]; cart.remove(rid); track('hc_demande_remove', { item: rl && rl.slug, from: 'demande' }); toast('« ' + (rl ? rl.name : 'Intervention') + ' » retirée de votre demande'); } save(); renderDemande(); renderRecap(); if (!cart.count()) go('besoin'); return; }
    if ((el = t.closest('[data-clearfam]'))) { state.fam = null; state.prob = null; save(); renderKickers(state.step); renderRecap(); return; }
    if ((el = t.closest('[data-focus-off]'))) { state.focus = null; save(); renderOffers(); return; }
    if ((el = t.closest('[data-showall]'))) { var nShown = $$('#offers .offer').length; state.showAll = state.fam; save(); renderOffers(); var nxt = $$('#offers .offer-pick')[nShown]; if (nxt) nxt.focus(); return; }
    if ((el = t.closest('[data-prec]'))) { state.precMode = el.getAttribute('data-prec'); $('#precSearch').value = ''; save(); return renderOffers(); }
    if ((el = t.closest('[data-prob]'))) { var pid = el.getAttribute('data-prob'); state.prob = pid; save(); renderOffers(); var np = $('#probChips [data-prob="' + pid + '"]'); if (np) np.focus(); return; }
    if ((el = t.closest('[data-quand]'))) { state.prise.quand = el.getAttribute('data-quand'); save(); $('#errCreneau').hidden = true; mark('fld-date', false); ENTER.creneau(); renderRecap(); if (state.prise.quand === 'date') $('#f-date').focus(); return; }
    if ((el = t.closest('[data-rappel]'))) { state.prise.rappel = el.getAttribute('data-rappel'); save(); ENTER.creneau(); return renderRecap(); }
    if ((el = t.closest('[data-dvm]'))) return toggleMetier(el);
    if ((el = t.closest('[data-nature]'))) { var nv = el.getAttribute('data-nature'); state.devis.nature = state.devis.nature === nv ? null : nv; save(); return $$('#natureOpts [data-nature]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-nature') === state.devis.nature)); }); }
    if ((el = t.closest('[data-switch-devis]'))) return switchToDevis(state.fam, false);
    if ((el = t.closest('[data-forget]'))) { if (cart) cart.clear(); dvFiles = []; state = C.emptyState(); pendingEntry = null; clearFields(); try { C.purgeDevice(localStorage, sessionStorage); } catch (e2) {} toast('Informations effacées de cet appareil'); return go('choix'); }
    if ((el = t.closest('[data-open-sheet]'))) return openSheet(el);
    if ((el = t.closest('[data-close-sheet]'))) return closeSheet();
    if ((el = t.closest('[data-resume]'))) { var viaEntry = !!pendingEntry; pendingEntry = null; var r; if (cart && cart.count()) { state.mode = 'intervention'; r = (resumeStep && C.flowIndex('intervention', resumeStep) >= 3) ? resumeStep : 'demande'; } else if ((state.devis.metiers || []).length) { state.mode = 'devis'; r = (resumeStep && C.flowIndex('devis', resumeStep) >= 0) ? resumeStep : 'dv-projet'; } else { r = resumeStep && resumeStep !== 'choix' && resumeStep !== 'envoye' ? resumeStep : (state.mode === 'devis' ? 'dv-metier' : 'lieu'); } if (viaEntry) state._entryStep = (C.FLOWS[state.mode] || [])[0] || r; save(); return go(r); }
    if ((el = t.closest('[data-reset]')) || (el = t.closest('[data-restart]'))) { var entry = pendingEntry; pendingEntry = null; startClean(); var to = entry ? applyEntry(entry) : 'choix'; state._entryStep = entry ? to : null; save(); return go(to); }
  });
  $('#topBack').addEventListener('click', function () {
    if (state.mode === 'devis' && state._fromIntervention && (state.step === 'dv-projet' || state.step === 'dv-metier')) { state.mode = 'intervention'; state._fromIntervention = false; state.fam = null; if (!String(state.devis.desc || '').trim() && !dvFiles.length) state.devis = C.emptyState().devis; save(); return go('besoin', { back: true, replace: true }); }
    if (state.mode === 'devis' && state._devisFrom && (state.step === 'dv-projet' || state.step === 'dv-metier')) { var bk = state._devisFrom; state._devisFrom = null; state.mode = 'intervention'; if (!String(state.devis.desc || '').trim() && !dvFiles.length) state.devis = C.emptyState().devis; save(); return go(bk, { back: true, replace: true }); }
    if (atEntryStep(state.step)) return exitTunnel();
    var p = C.prevStep(state.mode, state.step); if (!p) return; if (history.state && history.state.from === p) return history.back(); go(p, { back: true, replace: true }); });
  $('#sendIntervention').addEventListener('click', sendIntervention);
  $('#dvPhotosNext').addEventListener('click', function () { if (!dvFiles.length) return $('#dv-photos').click(); state.devis.photosSeen = true; save(); next('dv-photos'); });
  $('#sendDevis').addEventListener('click', sendDevis);
  $('#precSearch').addEventListener('input', function () { clearTimeout(this._t); this._t = setTimeout(renderOffers, 160); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#sheet').hidden) return closeSheet();
    if (e.key === 'Tab' && !$('#sheet').hidden) { var f = $$('#sheet button, #sheet a[href]').filter(function (x) { return x.offsetParent !== null; }); if (f.length) { var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } else if (!$('#sheet').contains(document.activeElement)) { e.preventDefault(); first.focus(); } } return; }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
    var grp = e.target.closest && e.target.closest('[role="radiogroup"],[role="tablist"]'); if (!grp) return;
    var items = $$('[role="radio"],[role="tab"]', grp); var i = items.indexOf(e.target); if (i < 0) return;
    e.preventDefault(); var n = items[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? items.length - 1 : 1)) % items.length];
    n.click(); var again = grp.id ? $('#' + grp.id + ' [' + ['data-quand', 'data-rappel', 'data-nature', 'data-prec'].filter(function (a) { return n.hasAttribute(a); }).map(function (a) { return a + '="' + n.getAttribute(a) + '"'; })[0] + ']') : null; (again || n).focus();
  });
  window.addEventListener('popstate', function () {
    if (OVERLAY && root.HcDemande && !root.HcDemande.isOpen()) return; // fenêtre fermée : le module ne touche plus à l'URL
    if (state.sent) return go('choix', { replace: true });
    var h = parseHash(); go(h.step || 'choix', { noHash: true, back: true });
  });

  // ---------- Liens entrants ----------
  function parseHash() {
    var h = location.hash || '', sm = h.match(/step=([a-z-]+)/), cm = h.match(/cat=([^&]+)/), sub = h.match(/[&?]s=(\d)/);
    var raw = sm ? sm[1] : (h === '#intervention' ? 'intervention' : (h === '#devis' ? 'devis' : (h === '#entretien' ? 'entretien' : null)));
    var r = { step: C.legacyStep(raw, sub ? parseInt(sub[1], 10) : null), cat: cm ? decodeURIComponent(cm[1]) : null, entretien: raw === 'entretien' };
    // Intention précise venue d'un lien d'entrée (bandeau saisonnier de l'accueil) :
    //   presta=<intention>  → on ouvre la famille ET on cible les prestations correspondantes
    //   sujet=<intention>   → prestation non vendue au catalogue : devis, contexte déjà rempli
    var pm = h.match(/[#&]presta=([a-z-]+)/); r.presta = pm && C.focusConnu(pm[1]) ? pm[1] : null;
    var jm = h.match(/[#&]sujet=([a-z-]+)/); r.sujet = jm ? jm[1] : null;
    if (raw === 'intervention') r.mode = 'intervention'; if (raw === 'devis' || raw === 'entretien') r.mode = 'devis';
    r.entry = (!sm && !!(raw || cm || r.presta || r.sujet)) || raw === 'entretien'; // lien d'entrée (accueil, pages métiers) ≠ navigation interne #step=…
    var srcm = h.match(/[#&]src=([a-z-]+)/); r.src = C.maintenanceSrc(srcm && srcm[1]); // page d'atterrissage « entretien » (campagnes)
    return r;
  }
  function loadCatalogue() {
    return fetch(SUPA + '/rest/v1/v_services_public?select=*&active=eq.true&order=position.asc', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) {
        ALL = Array.isArray(rows) ? rows : []; byId = {}; byFam = {}; FAMS = []; var seen = {};
        ALL.forEach(function (s) { byId[s.id] = s; var k = s.category_slug || 'autre'; (byFam[k] = byFam[k] || []).push(s); if (!seen[k]) { seen[k] = 1; FAMS.push({ slug: k, name: s.category_name || k, count: 0 }); } });
        FAMS.forEach(function (f) { f.count = byFam[f.slug].length; });
        loaded = true;
      }).catch(function () { loadFailed = true; });
  }

  // ---------- Démarrage ----------
  var resumeStep = state.step;
  var LIVE_PREVIEW = !SIM && C.simulationAllowed(location.hostname);
  $('#simBadge').hidden = !(SIM || LIVE_PREVIEW); if (LIVE_PREVIEW) { $('#simBadge').textContent = 'Recette · ENVOI RÉEL'; $('#simBadge').style.background = '#FEE2E2'; $('#simBadge').style.color = '#991B1B'; }
  app.classList.toggle('is-sim', SIM || LIVE_PREVIEW);
  renderClosed();
  (function () { var panel = $('.sheet-panel'), y0 = null; panel.addEventListener('touchstart', function (e) { y0 = panel.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true }); panel.addEventListener('touchmove', function (e) { if (y0 !== null && e.touches[0].clientY - y0 > 70) { y0 = null; closeSheet(); } }, { passive: true }); })();
  // Lien « Payer en ligne » de l'email client : on reconstitue un récapitulatif minimal du dossier
  // (renvoyé par le serveur au seul détenteur du jeton) puis on affiche l'écran final avec le paiement.
  function openPayLink(leadId, token) {
    payApi('check', leadId, token).then(function (r) {
      if (!r || !r.ok || !r.summary) throw new Error('lien');
      var sm = r.summary;
      state.sent = { mode: 'intervention', ref: sm.reference, prenom: sm.prenom || '', leadId: leadId, payToken: token, allFirm: !!r.eligible, total: sm.total,
        lines: (sm.lines || []).map(function (l) { return { name: l.name + (l.qty > 1 ? ' ×' + l.qty : ''), price: C.eur(l.amount) + ' TTC', kind: 'ferme', includes: [] }; }),
        payment: r.payment || null, payState: '', fromLink: true };
      save(); go('envoye', { replace: true });
    }).catch(function () { toast('Ce lien de paiement n’est plus valable. Votre dossier est conservé : l’agence vous rappelle.'); go('choix', { replace: true }); });
  }
  function applyEntry(h) {
    if (h.mode) state.mode = h.mode;
    if (h.src) state.src = h.src;
    // Entrée « intervention » sans métier : on repart du choix du besoin (pas de métier hérité d'une visite précédente)
    if (h.entry && h.mode === 'intervention' && !h.cat) { state.fam = null; state.prob = null; state.precMode = 'liste'; }
    if (h.cat) { state.mode = 'intervention'; state.fam = h.cat; }
    if (h.entretien && (state.devis.metiers || []).indexOf('Contrat entretien') < 0) state.devis.metiers = (state.devis.metiers || []).concat(['Contrat entretien']).slice(0, 3);
    // Intention précise : elle est mémorisée dans l'état, donc elle survit à la porte tarifs,
    // au rechargement et au retour arrière — c'est tout l'intérêt de ne pas la garder dans l'URL seule.
    if (h.presta) { state.mode = 'intervention'; state.focus = h.presta; state.precMode = 'liste'; }
    else if (h.cat) { state.focus = null; }
    // Sujet sans prestation au catalogue (ramonage, poêle/insert) : devis, avec le métier et la
    // description déjà posés. Le client ne repasse pas par « Que souhaitez-vous faire ? ».
    if (h.sujet && SUJETS[h.sujet]) {
      var su = SUJETS[h.sujet];
      // L'intention reste inscrite dans l'état durable (pas dans les données personnelles) : la
      // description, elle, vit en session et s'efface au bout de 2 h. Un sujet inconnu du catalogue
      // ne filtre rien (focusConnu le rejette), il sert uniquement de trace.
      state.mode = 'devis'; state.focus = h.sujet;
      if ((state.devis.metiers || []).indexOf(su.metier) < 0) state.devis.metiers = (state.devis.metiers || []).concat([su.metier]).slice(0, 3);
      if (!state.devis.nature) state.devis.nature = su.nature;
      if (!(state.devis.desc || '').trim()) state.devis.desc = su.desc;
      return h.step || 'dv-projet';
    }
    return h.step || (h.cat ? 'lieu' : 'choix');
  }
  // Entrée (chargement de la page ou ouverture de l'overlay depuis un CTA) : lien d'entrée avec une demande
  // en cours → jamais de pré-remplissage silencieux, choix explicite Reprendre / Nouvelle demande.
  function goEntry() {
    var pl = (location.hash || '').match(/payer=([0-9a-f-]{36})\.([0-9a-f]{32,})/i);
    if (pl) { try { history.replaceState(null, '', location.pathname + location.search + '#step=envoye'); } catch (e) {} openPayLink(pl[1], pl[2]); return {}; }
    // Données personnelles inactives depuis plus de 2 h (onglet resté ouvert, fenêtre rouverte) : effacées avant tout affichage
    if (C.piiExpired(state, Date.now())) { C.stripPii(state); clearFields(); try { sessionStorage.removeItem(STORE_PII); } catch (e) {} }
    var h = parseHash(), start;
    // Nouvelle demande depuis un lien d'entrée après un envoi : le récapitulatif précédent est purgé de l'onglet
    if (h.entry && state.sent) startClean();
    pendingEntry = null; // jamais d'entrée périmée d'une ouverture précédente
    if (h.entry && C.hasDraft(state, cart ? cart.count() : 0)) { pendingEntry = h; start = 'choix'; }
    else { if (h.entry) state._cid = null; start = applyEntry(h); } // nouvelle demande → nouvelle référence de dossier
    if (h.entry && !pendingEntry) state._entryStep = start; // lien explicite : « retour » depuis cette étape = page d'origine
    else if (!location.hash) state._entryStep = null; // entrée générique volontaire : l'écran de choix est l'étape précédente
    save();
    go(start, { replace: true, initial: true });
    return h;
  }
  addLightAssure();
  var hp = goEntry();
  loadCatalogue().then(function () {
    if (hp.cat && !byFam[hp.cat]) { state.fam = null; save(); }
    if (ENTER[state.step] && ['besoin', 'precision', 'demande', 'acces'].indexOf(state.step) >= 0) go(state.step, { replace: true, initial: true, keepScroll: true });
    else { renderKickers(state.step); renderRecap(); }
  });
  return { goEntry: goEntry, go: go, state: function () { return state; } };
  }

  // ---------- fenêtre premium (overlay) ----------
  var ENTRY_HASH = /^#(step=|cat=|intervention$|devis$|entretien$)/;
  function shell() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'hcd-overlay';
    overlay.id = 'hcdOverlay';
    overlay.hidden = true;
    overlay.innerHTML = '<div class="hcd-backdrop" data-hcd-close></div><div class="hcd-modal" role="dialog" aria-modal="true" aria-label="Votre demande — HELP Confort"><div class="hcd-modal-body"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target.closest('[data-hcd-close]')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || overlay.hidden) return;
      var sheet = document.getElementById('sheet');
      if (sheet && !sheet.hidden) return; // la feuille interne se ferme d'abord
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || overlay.hidden) return;
      var f = Array.prototype.slice.call(overlay.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    root.addEventListener('popstate', function () {
      if (isOpen()) { if (!ENTRY_HASH.test(location.hash)) close(true); return; }
      // « suivant » du navigateur après une fermeture : la demande rouvre à l'étape quittée (brouillon intact)
      if (overlay.hidden && ENTRY_HASH.test(location.hash) && history.state && history.state.base) open(location.hash);
    });
    return overlay;
  }
  function open(hash, trigger) {
    var o = shell();
    opener = trigger || document.activeElement;
    if (hash && location.hash !== hash) { try { history.pushState({ hcd: 1, idx: 0, base: true }, '', hash); } catch (e) { location.hash = hash; } } // base : la page hôte est l'entrée précédente
    lastY = root.scrollY || 0;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    o.hidden = false;
    setInert(true);
    var body = o.querySelector('.hcd-modal-body');
    if (!mounted) mount(body, { mode: 'overlay' });
    else { syncHeight(); if (api && api.goEntry) api.goEntry(); }
    void o.offsetWidth; // force le calcul de style : l'ouverture marche aussi dans un onglet d'arrière-plan
    o.classList.add('is-open');
    root.requestAnimationFrame(function () { syncHeight(); });
    setTimeout(function () { var h = o.querySelector('.step.is-active h1'); if (h) try { h.focus({ preventScroll: true }); } catch (e) {} }, 60);
    return api;
  }
  function setInert(on) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === overlay) return;
      if (on) { el.setAttribute('aria-hidden', 'true'); el.inert = true; }
      else { el.removeAttribute('aria-hidden'); el.inert = false; }
    });
  }
  function close(fromHistory) {
    if (!overlay || overlay.hidden || !overlay.classList.contains('is-open')) return;
    setInert(false);
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; if (opener && opener.focus) try { opener.focus(); } catch (e) {} }, 240);
    try {
      // Fermeture (croix, Échap, fond, retour depuis l'étape d'entrée) : on dépile les étapes de la demande au lieu d'ajouter une entrée
      // (sinon « précédent » rouvrait une URL de demande fenêtre fermée) ; entrée directe par lien : URL nettoyée sur place.
      if (!fromHistory && ENTRY_HASH.test(location.hash)) { var st = history.state || {}; if (st.base && typeof st.idx === 'number') history.go(-(st.idx + 1)); else history.replaceState(null, '', location.pathname + location.search); }
      else if (fromHistory) setTimeout(function () { if (ENTRY_HASH.test(location.hash)) history.replaceState({}, '', location.pathname + location.search); }, 30);
    } catch (e) {}
  }
  function isOpen() { return !!overlay && !overlay.hidden && overlay.classList.contains('is-open'); } // en cours de fermeture = fermée

  root.HcDemande = { mount: mount, open: open, close: close, isOpen: isOpen, api: function () { return api; } };
})(window);
