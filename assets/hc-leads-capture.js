// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Capture des leads depuis les formulaires du site
// Inclure ce script sur toutes les pages qui ont un formulaire
// Usage : <form data-hc-lead="devis"> ... </form>
// Les champs doivent avoir les attributs name="" cohérents
// ═══════════════════════════════════════════════════════════════

(function() {
  const SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  // Charge Supabase JS si pas déjà présent
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) return resolve(window.supabase);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = () => resolve(window.supabase);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function pushLead(payload) {
    const sb = await loadSupabase();
    const client = sb.createClient(SUPABASE_URL, SUPABASE_KEY);
    return client.from('leads').insert([payload]);
  }

  // Récupère les UTM depuis l'URL courante
  function getUtm() {
    const p = new URLSearchParams(location.search);
    const utm = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(k => {
      const v = p.get(k);
      if (v) utm[k] = v;
    });
    return utm;
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
          utm: getUtm()
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Envoi en cours…';
        }

        try {
          const { error } = await pushLead(payload);
          if (error) throw error;

          // Succès : afficher message + reset form
          showMessage(form, true, 'Demande envoyée avec succès ! Nous vous contacterons rapidement.');
          form.reset();

          // Si callback custom défini, on l'appelle
          if (typeof window.onHCLeadSubmit === 'function') window.onHCLeadSubmit(payload);
        } catch (err) {
          console.error('Lead submit error:', err);
          showMessage(form, false, 'Erreur d\'envoi. Veuillez nous appeler directement au 03 21 38 27 56.');
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
