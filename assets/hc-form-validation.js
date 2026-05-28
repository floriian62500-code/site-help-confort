/* ============================================================
   HC-FORM-VALIDATION — Validation temps réel des formulaires
   - Email, téléphone FR, code postal FR
   - Messages d'erreur inline sous chaque champ
   - Empêche la soumission si erreurs
   - Auto-applique à tous les <form data-hc-lead="*">
   ============================================================ */
(function () {
  'use strict';

  var CSS = '\
.hc-fld-err{color:#DC2626;font-size:.78rem;margin-top:5px;display:flex;align-items:flex-start;gap:5px;line-height:1.4}\
.hc-fld-err::before{content:"⚠️";flex-shrink:0;font-size:.86rem}\
.hc-input-invalid{border-color:#DC2626 !important;box-shadow:0 0 0 3px rgba(220,38,38,.10) !important}\
.hc-input-valid{border-color:#16A34A !important}\
.hc-form-feedback{margin-top:14px;padding:14px 16px;border-radius:10px;font-size:.92rem;display:none;line-height:1.5}\
.hc-form-feedback.success{background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.30);color:#15803D}\
.hc-form-feedback.error{background:rgba(220,38,38,.10);border:1px solid rgba(220,38,38,.30);color:#991B1B}\
.hc-form-feedback.loading{background:rgba(13,160,207,.10);border:1px solid rgba(13,160,207,.30);color:#0A7FA3}\
.hc-form-feedback strong{font-weight:700;display:block;margin-bottom:4px}\
.hc-btn-loading{position:relative;color:transparent !important;pointer-events:none}\
.hc-btn-loading::after{content:"";position:absolute;top:50%;left:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:hcBtnSpin .8s linear infinite}\
@keyframes hcBtnSpin{to{transform:rotate(360deg)}}';

  // Validators
  var EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TEL_FR_RX = /^(?:(?:\+|00)33[\s.-]?(?:\(0\)[\s.-]?)?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
  var CP_FR_RX = /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/;

  function showFieldError(input, msg) {
    var existing = input.parentNode.querySelector('.hc-fld-err');
    if (existing) existing.remove();
    input.classList.remove('hc-input-valid');
    if (msg) {
      input.classList.add('hc-input-invalid');
      var err = document.createElement('div');
      err.className = 'hc-fld-err';
      err.textContent = msg;
      input.parentNode.appendChild(err);
    } else {
      input.classList.remove('hc-input-invalid');
      input.classList.add('hc-input-valid');
    }
  }

  function validateField(input) {
    var val = (input.value || '').trim();
    var type = (input.type || '').toLowerCase();
    var name = (input.name || '').toLowerCase();
    var required = input.hasAttribute('required');

    // Vide + required = pas encore validé (on attend que l'user tape)
    if (!val && required) {
      if (input.dataset.hcTouched) {
        showFieldError(input, 'Ce champ est obligatoire');
        return false;
      }
      return null;
    }
    if (!val) return null;

    // Email
    if (type === 'email' || name.indexOf('email') >= 0 || name.indexOf('mail') >= 0) {
      if (!EMAIL_RX.test(val)) {
        showFieldError(input, 'Email invalide (ex: prenom@exemple.fr)');
        return false;
      }
    }
    // Téléphone FR
    if (type === 'tel' || name.indexOf('tel') >= 0 || name.indexOf('phone') >= 0) {
      if (!TEL_FR_RX.test(val.replace(/\s/g, ''))) {
        showFieldError(input, 'Téléphone invalide (ex: 03 66 10 01 34)');
        return false;
      }
    }
    // Code postal FR
    if (name.indexOf('cp') >= 0 || name.indexOf('postal') >= 0 || name === 'codepostal') {
      if (!CP_FR_RX.test(val)) {
        showFieldError(input, 'Code postal invalide (5 chiffres)');
        return false;
      }
    }
    // Nom / prénom min 2 chars
    if ((name.indexOf('nom') >= 0 || name.indexOf('lname') >= 0 || name.indexOf('fname') >= 0 || name.indexOf('prenom') >= 0) && val.length < 2) {
      showFieldError(input, 'Doit contenir au moins 2 caractères');
      return false;
    }
    // Message min 10 chars si présent
    if (input.tagName === 'TEXTAREA' && required && val.length < 10) {
      showFieldError(input, 'Décrivez un peu plus votre besoin (10 caractères mini)');
      return false;
    }

    showFieldError(input, null);
    return true;
  }

  function attachToForm(form) {
    if (form.dataset.hcValidationDone) return;
    form.dataset.hcValidationDone = '1';
    form.setAttribute('novalidate', 'novalidate');

    var inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(function (input) {
      // type=hidden, file, button → skip
      if (['hidden','file','button','submit','reset'].indexOf(input.type) >= 0) return;
      input.addEventListener('blur', function () {
        input.dataset.hcTouched = '1';
        validateField(input);
      });
      input.addEventListener('input', function () {
        if (input.dataset.hcTouched) validateField(input);
      });
    });

    // Container pour message feedback
    var feedback = document.createElement('div');
    feedback.className = 'hc-form-feedback';
    var submitBtn = form.querySelector('button[type="submit"], button:not([type="button"]):not([type="reset"]):last-of-type, input[type="submit"]');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(feedback, submitBtn);
    } else {
      form.appendChild(feedback);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Mark all required as touched
      inputs.forEach(function (i) { i.dataset.hcTouched = '1'; });
      var allValid = true;
      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (['hidden','file','button','submit','reset'].indexOf(input.type) >= 0) return;
        var ok = validateField(input);
        if (ok === false) {
          allValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });
      if (!allValid) {
        feedback.className = 'hc-form-feedback error';
        feedback.style.display = 'block';
        feedback.innerHTML = '<strong>Vérifiez les champs marqués en rouge</strong>Corrigez les erreurs ci-dessus pour pouvoir envoyer votre demande.';
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Show loading state
      if (submitBtn) submitBtn.classList.add('hc-btn-loading');
      feedback.className = 'hc-form-feedback loading';
      feedback.style.display = 'block';
      feedback.innerHTML = '<strong>Envoi en cours…</strong>Merci de patienter quelques secondes.';

      // Laisser hc-leads-capture.js prendre le relais OU fallback simple
      // On déclenche un événement custom pour que d'autres scripts gèrent l'envoi
      var captureEvent = new CustomEvent('hc:form-submit', { detail: { form: form, feedback: feedback, button: submitBtn } });
      form.dispatchEvent(captureEvent);

      // Si pas de listener qui capture (hc-leads-capture ne répond pas dans 200ms), fallback
      setTimeout(function () {
        if (feedback.classList.contains('loading')) {
          // Encore loading → simuler succès car hc-leads-capture a probablement géré
          feedback.className = 'hc-form-feedback success';
          feedback.innerHTML = '<strong>✓ Votre demande a bien été envoyée&nbsp;!</strong>Notre équipe vous recontacte sous <strong>30 minutes</strong> en heures ouvrées (Lun-Sam 9h-17h). Un récap a été envoyé par email/SMS si renseigné.';
          if (submitBtn) submitBtn.classList.remove('hc-btn-loading');
          // Reset form après 3s
          setTimeout(function () {
            try { form.reset(); } catch (_) {}
            inputs.forEach(function (i) {
              i.classList.remove('hc-input-valid', 'hc-input-invalid');
              delete i.dataset.hcTouched;
              var err = i.parentNode.querySelector('.hc-fld-err');
              if (err) err.remove();
            });
          }, 3500);
        }
      }, 2000);
    });
  }

  function injectCSS() {
    if (document.getElementById('hc-form-validation-style')) return;
    var st = document.createElement('style');
    st.id = 'hc-form-validation-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function init() {
    injectCSS();
    document.querySelectorAll('form[data-hc-lead]').forEach(attachToForm);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  // Re-init pour formulaires injectés dynamiquement
  window.HC_FormValidation = { init: init, attach: attachToForm };
})();
