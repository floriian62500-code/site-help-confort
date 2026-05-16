// ═══════════════════════════════════════════════════════════════════════════
// refresh-meta-token — Auto-refresh permanent du token Facebook
// ═══════════════════════════════════════════════════════════════════════════
// Stratégie : transformer le token user (qui expire en 1-60j) en un
// PAGE ACCESS TOKEN qui ne expire JAMAIS tant que :
//   - L'utilisateur reste admin de la page
//   - Le mot de passe Facebook n'est pas changé
//   - L'app Meta n'est pas révoquée
//
// Source : https://developers.facebook.com/docs/pages/access-tokens
//   "Page Access Tokens [obtenus via /me/accounts] don't expire."
//
// Cette fonction :
//   1. Lit app_settings.meta (page_access_token actuel + app_id/secret)
//   2. Tente un appel /me/accounts avec le token actuel
//   3. Si OK → extrait le Page Access Token de la page configurée → garantit qu'on en a un qui ne expire pas
//   4. Si KO (token expiré) → tente l'échange long-lived via app_secret
//   5. Met à jour app_settings.meta.page_access_token + meta.token_refreshed_at
//   6. Renvoie le statut détaillé pour debug
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GRAPH = 'https://graph.facebook.com/v21.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Récupère config Meta actuelle
    const { data: settings, error: sErr } = await sb.from('app_settings').select('value').eq('key', 'meta').single();
    if (sErr || !settings) return json({ error: 'Config Meta absente', detail: sErr?.message }, 404);

    const cfg = settings.value || {};
    const currentToken: string = cfg.page_access_token || cfg.user_access_token;
    const pageId: string = cfg.fb_page_id;
    const appId: string = cfg.app_id || cfg.fb_app_id;
    const appSecret: string = cfg.app_secret || cfg.fb_app_secret;

    if (!currentToken) return json({ error: 'Token Meta absent (config.page_access_token vide)' }, 400);
    if (!pageId) return json({ error: 'fb_page_id absent dans settings.meta' }, 400);

    // 1.bis — Court-circuit : si le token actuel est déjà valide ET permanent
    // (expires_at == 0), pas la peine de tenter quoi que ce soit, sinon on
    // casse un token qui marche très bien.
    if (appId && appSecret) {
      try {
        const appAccessToken = `${appId}|${appSecret}`;
        const dbg = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(currentToken)}&access_token=${encodeURIComponent(appAccessToken)}`);
        const dbgD = await dbg.json();
        const info = dbgD.data || {};
        if (info.is_valid === true && info.type === 'PAGE' && (info.expires_at === 0 || !info.expires_at)) {
          return json({
            ok: true,
            refreshed: false,
            token_source: 'already_permanent',
            token_info: info,
            message: 'Page Access Token déjà permanent, aucun refresh nécessaire',
          });
        }
      } catch (_) {
        // En cas d'erreur de debug_token, on continue avec la logique de refresh
      }
    }

    // 2. Stratégie pour obtenir un Page Access Token PERMANENT :
    //
    //    Règle Facebook : un Page Access Token dérivé de /me/accounts hérite
    //    de la durée de vie du User Token utilisé. Donc :
    //      - User Token court (1h)    → Page Token court (1h)
    //      - User Token long-lived (60j) → Page Token PERMANENT (jamais d'expiry)
    //
    //    Conséquence : si on a app_id + app_secret, on DOIT toujours faire
    //    l'échange long-lived d'abord, puis appeler /me/accounts avec le
    //    résultat. Sinon on retombera dans 1h.
    //
    //    L'appel direct n'est conservé qu'en fallback (cas où app_secret manque).
    let pageAccessToken: string | null = null;
    let tokenSource = 'unknown';
    let debugInfo: any = {};

    // Étape A (prioritaire) : échange long-lived puis /me/accounts
    if (appId && appSecret) {
      try {
        const exchangeUrl = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(currentToken)}`;
        const er = await fetch(exchangeUrl);
        const ed = await er.json();
        debugInfo.attempt_exchange = { status: er.status, has_token: !!ed.access_token, error: ed.error?.message };

        if (ed.access_token) {
          const ar = await fetch(`${GRAPH}/me/accounts?access_token=${encodeURIComponent(ed.access_token)}`);
          const ad = await ar.json();
          debugInfo.attempt_exchange_accounts = { status: ar.status, has_data: !!ad.data };

          if (ar.ok && ad.data) {
            const page = ad.data.find((p: any) => p.id === pageId) || ad.data[0];
            if (page?.access_token) {
              pageAccessToken = page.access_token;
              tokenSource = 'long_lived_exchange';
            }
          }
        }
      } catch (e) { debugInfo.attempt_exchange = { error: String(e) }; }
    }

    // Étape B (fallback) : appel direct /me/accounts sans échange.
    // Donnera un Page Token qui hérite de l'expiry du User Token courant
    // (durée probablement courte si app_secret n'est pas configuré).
    if (!pageAccessToken) {
      try {
        const r = await fetch(`${GRAPH}/me/accounts?access_token=${encodeURIComponent(currentToken)}`);
        const d = await r.json();
        debugInfo.attempt_direct = { status: r.status, has_data: !!d.data, error: d.error?.message };

        if (r.ok && d.data && Array.isArray(d.data)) {
          const page = d.data.find((p: any) => p.id === pageId) || d.data[0];
          if (page?.access_token) {
            pageAccessToken = page.access_token;
            tokenSource = 'me_accounts_direct';
          }
        }
      } catch (e) { debugInfo.attempt_direct = { error: String(e) }; }
    }

    // 3. Si on a un Page Access Token, on le sauvegarde
    if (pageAccessToken) {
      const updated = {
        ...cfg,
        page_access_token: pageAccessToken,
        token_refreshed_at: new Date().toISOString(),
        token_source: tokenSource,
      };
      const { error: upErr } = await sb.from('app_settings')
        .update({ value: updated, updated_at: new Date().toISOString() })
        .eq('key', 'meta');

      if (upErr) return json({ error: 'Save error', detail: upErr.message, debug: debugInfo }, 500);

      // Vérifie que ce token est bien valide via /debug_token
      let tokenInfo = null;
      try {
        if (appId && appSecret) {
          const appAccessToken = `${appId}|${appSecret}`;
          const dbg = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(pageAccessToken)}&access_token=${encodeURIComponent(appAccessToken)}`);
          const dbgD = await dbg.json();
          tokenInfo = dbgD.data || dbgD;
        }
      } catch (_) {}

      return json({
        ok: true,
        refreshed: true,
        token_source: tokenSource,
        token_info: tokenInfo,
        message: 'Page Access Token mis à jour (durée illimitée tant que l\'admin reste actif)',
        debug: debugInfo,
      });
    }

    // 4. Sinon, on n'a pas pu rafraîchir → token vraiment mort, action user requise
    return json({
      ok: false,
      refreshed: false,
      error: 'Token Meta expiré et non rafraîchissable automatiquement',
      action_required: 'Re-générer un token via Graph API Explorer + /me/accounts',
      wizard_url: '/admin-pro/wizard-meta.html',
      debug: debugInfo,
    }, 200); // 200 pour que l'appelant lise le message clair, pas un 5xx générique

  } catch (e) {
    console.error('[refresh-meta-token] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});
