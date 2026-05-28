/* ============================================================
   HC-TRACKING — GA4 Web Vitals + funnel conversion
   - Mesure LCP, CLS, INP, FCP, TTFB et envoie à GA4
   - Track funnel : view → calculateur → form → submit → tel_click
   - Track scroll depth 25/50/75/100%
   ============================================================ */
(function () {
  'use strict';

  // Vérifier GA4 (window.gtag)
  function gaSend(eventName, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
      } else {
        // Queue pour gtag différé
        (window.dataLayer = window.dataLayer || []).push({ event: eventName, ...(params || {}) });
      }
    } catch (e) { /* silent */ }
  }

  // ─── WEB VITALS ───
  function onCLS(cb) {
    var clsValue = 0;
    var clsEntries = [];
    try {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
      });
      po.observe({ type: 'layout-shift', buffered: true });
      // Report on hide
      ['visibilitychange', 'pagehide'].forEach(function (e) {
        window.addEventListener(e, function () {
          if (document.visibilityState === 'hidden') {
            po.disconnect();
            cb({ name: 'CLS', value: clsValue, rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor' });
          }
        });
      });
    } catch (e) {}
  }

  function onLCP(cb) {
    try {
      var po = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        var last = entries[entries.length - 1];
        cb({
          name: 'LCP',
          value: last.startTime,
          rating: last.startTime < 2500 ? 'good' : last.startTime < 4000 ? 'needs-improvement' : 'poor'
        });
      });
      po.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
  }

  function onINP(cb) {
    var maxDur = 0;
    try {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.duration > maxDur) {
            maxDur = entry.duration;
            cb({
              name: 'INP',
              value: maxDur,
              rating: maxDur < 200 ? 'good' : maxDur < 500 ? 'needs-improvement' : 'poor'
            });
          }
        });
      });
      po.observe({ type: 'event', durationThreshold: 16, buffered: true });
    } catch (e) {}
  }

  function onFCP(cb) {
    try {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.name === 'first-contentful-paint') {
            cb({
              name: 'FCP',
              value: entry.startTime,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
            });
          }
        });
      });
      po.observe({ type: 'paint', buffered: true });
    } catch (e) {}
  }

  function onTTFB(cb) {
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        var ttfb = nav.responseStart;
        cb({
          name: 'TTFB',
          value: ttfb,
          rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
        });
      }
    } catch (e) {}
  }

  function reportVital(metric) {
    gaSend('web_vital', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      page_path: location.pathname
    });
  }

  // ─── FUNNEL CONVERSION ───
  function trackFunnel() {
    // Step 1 : page view (automatique GA4)

    // Step 2 : calculateur — interaction premier clic
    document.addEventListener('click', function (e) {
      var calcOpt = e.target.closest('.hc-calc-opt, .hc-calc-type, .hc-calc-urg');
      if (calcOpt) {
        gaSend('calculator_step', {
          step_type: calcOpt.dataset.metier ? 'metier' : (calcOpt.dataset.type ? 'type' : 'urgence'),
          value: calcOpt.dataset.metier || calcOpt.dataset.type || calcOpt.dataset.urgence
        });
      }
    }, { passive: true });

    // Step 3 : focus 1er champ formulaire
    document.querySelectorAll('form[data-hc-lead] input, form[data-hc-lead] textarea').forEach(function (input) {
      input.addEventListener('focus', function () {
        if (!input.form.dataset.hcFunnelStart) {
          input.form.dataset.hcFunnelStart = '1';
          gaSend('form_start', {
            form_type: input.form.dataset.hcLead || 'unknown',
            page_path: location.pathname
          });
        }
      }, { once: false });
    });

    // Step 4 : submit formulaire (déjà capté via hc:form-submit ?)
    document.addEventListener('hc:form-submit', function (e) {
      var form = e.detail && e.detail.form;
      gaSend('form_submit', {
        form_type: (form && form.dataset.hcLead) || 'unknown',
        page_path: location.pathname
      });
    });

    // Step 5 : clic téléphone (conversion)
    document.addEventListener('click', function (e) {
      var tel = e.target.closest('a[href^="tel:"]');
      if (tel) {
        gaSend('phone_click', {
          page_path: location.pathname,
          phone_number: tel.getAttribute('href').replace('tel:', ''),
          link_text: (tel.textContent || '').trim().substring(0, 50)
        });
      }
      var mail = e.target.closest('a[href^="mailto:"]');
      if (mail) {
        gaSend('email_click', {
          page_path: location.pathname,
          email: mail.getAttribute('href').replace('mailto:', '')
        });
      }
      var sms = e.target.closest('a[href^="sms:"]');
      if (sms) {
        gaSend('sms_click', { page_path: location.pathname });
      }
    }, { passive: true });
  }

  // ─── SCROLL DEPTH ───
  function trackScrollDepth() {
    var depths = [25, 50, 75, 100];
    var reported = {};
    function check() {
      var doc = document.documentElement;
      var sh = doc.scrollHeight - doc.clientHeight;
      if (sh <= 0) return;
      var pct = Math.round((window.scrollY / sh) * 100);
      depths.forEach(function (d) {
        if (pct >= d && !reported[d]) {
          reported[d] = 1;
          gaSend('scroll_depth', { depth_pct: d, page_path: location.pathname });
        }
      });
    }
    window.addEventListener('scroll', check, { passive: true });
  }

  // ─── TIME ON PAGE ───
  function trackTimeOnPage() {
    var start = Date.now();
    var sent = {};
    var checkpoints = [10, 30, 60, 120, 300]; // secondes
    function check() {
      var elapsed = Math.floor((Date.now() - start) / 1000);
      checkpoints.forEach(function (c) {
        if (elapsed >= c && !sent[c]) {
          sent[c] = 1;
          gaSend('time_on_page', { time_seconds: c, page_path: location.pathname });
        }
      });
    }
    setInterval(check, 5000);
  }

  // ─── BANDIT INTERACTION ───
  function trackInteractions() {
    // Mégamenu ouvert
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-has-menu]')) {
        gaSend('megamenu_open', { menu_type: e.target.closest('[data-has-menu]').dataset.hasMenu });
      }
      // CTA clic
      var cta = e.target.closest('.seo-cta, .nv-hero-cta, .hc-eng-btn, .hero4-cta');
      if (cta && cta.href) {
        gaSend('cta_click', {
          cta_text: (cta.textContent || '').trim().substring(0, 50),
          cta_destination: cta.href,
          page_path: location.pathname
        });
      }
    }, { passive: true });
  }

  function init() {
    // Web vitals
    onLCP(reportVital);
    onCLS(reportVital);
    onINP(reportVital);
    onFCP(reportVital);
    onTTFB(reportVital);

    // Funnel
    trackFunnel();
    trackScrollDepth();
    trackTimeOnPage();
    trackInteractions();

    // Mark loaded
    gaSend('hc_tracking_ready', { version: '1.0.0', page_path: location.pathname });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
