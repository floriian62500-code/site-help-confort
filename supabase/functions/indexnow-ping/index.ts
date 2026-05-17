// ═══════════════════════════════════════════════════════════════════════════
// indexnow-ping — Notifie Bing/Yandex/Seznam quand une page change
// v1.0 (2026-05-17)
// ═══════════════════════════════════════════════════════════════════════════
// Modes :
//   - URLs spécifiques : { urls: ["/realisations/slug-1", "/plombier-saint-omer"] }
//   - Sitemap complet  : { sitemap: true }  → ping toutes les URLs du sitemap
//   - Vide             : { } → ping le sitemap (équivalent sitemap:true)
//
// IndexNow API (https://www.indexnow.org) :
//   - Protocole partagé Bing + Yandex + Seznam (Google ne l'a pas adopté
//     mais découvre les nouvelles URLs via le sitemap ping classique)
//   - 1 ping = relais vers tous les moteurs partenaires
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const HOST = 'www.depan59-62.fr';
const KEY  = '9e0e7a806c9dc08d00dc44da895a8a1b';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function getSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return matches.map(m => m.replace(/<\/?loc>/g, '').trim());
}

async function pingIndexNow(urls: string[]): Promise<any> {
  if (urls.length === 0) return { ok: false, error: 'no urls' };

  // IndexNow accepte max 10000 URLs par batch
  const batch = urls.slice(0, 10000);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batch,
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    body: text,
    pinged: batch.length,
  };
}

async function pingGoogleSitemap(): Promise<any> {
  // Note : Google a déprécié le endpoint /ping en juin 2023. Maintenant ils
  // découvrent les nouveaux URLs via le crawling normal + Search Console.
  // On garde un tentative au cas où, mais on ne compte pas dessus.
  try {
    const res = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    return { google: res.status };
  } catch (e) {
    return { google: 'failed', error: String(e) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    let body: any = {};
    if (req.method === 'POST') {
      try { body = await req.json(); } catch { /* empty body */ }
    }

    let urls: string[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      // Normaliser : convertir paths relatifs en absolus
      urls = body.urls.map((u: string) => {
        if (u.startsWith('http')) return u;
        if (u.startsWith('/')) return `https://${HOST}${u}`;
        return `https://${HOST}/${u}`;
      });
    } else {
      // Mode sitemap : récupère toutes les URLs
      urls = await getSitemapUrls();
    }

    console.log(`[indexnow] Pinging ${urls.length} URLs`);
    const indexnowResult = await pingIndexNow(urls);
    const googleResult = await pingGoogleSitemap();

    return new Response(JSON.stringify({
      ok: indexnowResult.ok,
      pinged: indexnowResult.pinged,
      indexnow: indexnowResult,
      google: googleResult,
      urls_sample: urls.slice(0, 5),
    }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('[indexnow] crash:', e);
    return new Response(JSON.stringify({ error: 'server error', detail: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
