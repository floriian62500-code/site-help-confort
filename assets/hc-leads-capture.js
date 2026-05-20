// ═══════════════════════════════════════════════════════════════
// HELP Confort — Capture des leads depuis les formulaires du site
// Inclure ce script sur toutes les pages qui ont un formulaire
// Usage : <form data-hc-lead="devis"> ... </form>
// Les champs doivent avoir les attributs name="" cohérents
// ═══════════════════════════════════════════════════════════════

(function() {
  const SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  // ─── HC-FIX 2026-05-20 ────────────────────────────────────────────────
  // On n'utilise PLUS le client supabase-js anon : la clé sb_publishable_*
  // se fait rejeter par RLS (bug 0 leads). On passe par l'Edge Function
  // submit-lead (service_role côté serveur, anon-callable, verify_jwt=false).
  // L'Edge Function gère aussi le déclenchement de notify-lead côté serveur.
  // ─────────────────────────────────────────────────────────────────────
  const SUBMIT_LEAD_URL = SUPABASE_URL + '/functions/v1/submit-lead';

  async function pushLead(payload) {
    try {
      const r = await fetch(SUBMIT_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.error) {
        return { data: null, error: new Error(data.error || ('HTTP ' + r.status)) };
      }
      return { data: { id: data.id }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Récupère les UTM depuis l'URL courante
  function getUtm() {
    const p = new URLSearchParams(location.search);
    const utm = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(k => {
      const v = p.get(k);
      if (v) utm[k] = v;
    });
    // Fallback : récupère aussi depuis sessionStorage (capté au landing par tracking.js)
    try {
      const stored = JSON.parse(sessionStorage.getItem('hc_utm') || '{}');
      Object.keys(stored).forEach(k => { if (!utm[k] && stored[k]) utm[k] = stored[k]; });
    } catch(_){}
    return utm;
  }
  // Récupère les hidden fields hc_* injectés par tracking.js (UTM persistantes)
  function getHiddenUtm(form){
    const obj = {};
    try {
      ['hc_utm_source','hc_utm_medium','hc_utm_campaign','hc_utm_term','hc_utm_content','hc_gclid','hc_fbclid','hc_referrer','hc_page_path','hc_landing_ts'].forEach(k => {
        const inp = form.querySelector('[name="'+k+'"]');
        if (inp && inp.value) obj[k.replace(/^hc_/,'')] = inp.value;
      });
    } catch(_){}
    return obj;
  }

  // Hook tous les formulaires marqués (sauf ceux qui ont leur propre handler onsubmit)
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-hc-lead]').forEach(form => {
      // SKIP : formulaires qui ont déjà leur propre handler (ex : sousForm wizard)
      if (form.hasAttribute('onsubmit') || form.dataset.hcLeadSkip === '1') return;
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"],input[type="submit"]');
        const origBtn = submitBtn ? submitBtn.innerHTML : '';

        // ─── Anti-bot honeypot : si le champ caché "website" est rempli, c'est un bot ───
        const honeypot = (formData.get('website') || '').toString().trim();
        if (honeypot) {
          console.warn('[hc-leads] Bot détecté via honeypot (website rempli)');
          // On simule un succès silencieusement (pour ne pas révéler le piège)
          showMessage(form, true, 'Demande envoyée avec succès !');
          form.reset();
          return;
        }

        // Construire le payload
        const payload = {
          nom: (formData.get('nom') || formData.get('name') || formData.get('prenom_nom') || '').toString().trim() || 'Anonyme',
          email: (formData.get('email') || formData.get('mail') || '').toString().trim() || null,
          telephone: (formData.get('telephone') || formData.get('tel') || formData.get('phone') || '').toString().trim() || null,
          ville: (formData.get('ville') || formData.get('city') || '').toString().trim() || null,
          code_postal: (formData.get('code_postal') || formData.get('cp') || formData.get('zip') || '').toString().trim() || null,
          metier: (formData.get('metier') || formData.get('service') || '').toString().trim() || null,
          type_demande: form.dataset.hcLead || 'devis',
          message: (formData.get('message') || formData.get('description') || formData.get('demande') || '').toString().trim() || null,
          source: 'formulaire_site',
          source_page: location.pathname + location.search,
          source_referer: document.referrer || null,
          utm: Object.assign({}, getUtm(), getHiddenUtm(form))
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Envoi en cours…';
        }

        try {
          const { data, error } = await pushLead(payload);
          if (error) throw error;

          // Succès : afficher message + reset form
          showMessage(form, true, 'Demande envoyée avec succès ! Nous vous contacterons rapidement.');
          form.reset();

          // Si callback custom défini, on l'appelle
          if (typeof window.onHCLeadSubmit === 'function') window.onHCLeadSubmit(payload);
        } catch (err) {
          console.error('Lead submit error:', err);
          showMessage(form, false, 'Erreur d\'envoi. Veuillez nous appeler directement au 03 66 10 01 34.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtn;
          }
        }
      });
    });
  });

  function showMessage(form, success, msg) {
    let box = form.querySelector('.hc-lead-msg');
    if (!box) {
      box = document.createElement('div');
      box.className = 'hc-lead-msg';
      box.style.cssText = 'padding:12px 14px;border-radius:10px;margin-top:14px;font-size:.92rem;font-weight:600;line-height:1.5';
      form.appendChild(box);
    }
    box.style.background = success ? 'rgba(0,170,80,.10)' : 'rgba(217,45,32,.10)';
    box.style.color = success ? '#007033' : '#a51919';
    box.style.borderLeft = '3px solid ' + (success ? '#00aa50' : '#d92d20');
    box.textContent = msg;
    box.scrollIntoView({ behavior:'smooth', block:'center' });
  }
})();
