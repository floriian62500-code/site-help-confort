// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-22 (directive 5778526407, point 2.D).
// Cette fonction tournait en production SANS source dans le dépôt (déployée à la main le 2026-06-12).
// Code identique à la version déployée (seul cet en-tête a été ajouté) : version 1, verify_jwt = false (nécessaire : appelée par des
// balises <img> publiques, via partners.logo_url). Aucune modification de comportement ici.
//
// Dépendances et reproductibilité :
//   - supabase-js importé en « @2 » flottant (comme les autres fonctions du dépôt) : un redéploiement
//     prendrait la dernière 2.x du moment. Épingler la version exacte au prochain déploiement.
//   - variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (lecture de `partners` uniquement).
//   - appel sortant : https://www.google.com/s2/favicons (hôte fixe).
// Constat mineur (non corrigé ici, pour rester identique à la production) : les initiales du SVG de
// repli viennent du paramètre `name` sans échappement XML ; limitées à 2 caractères, elles peuvent
// casser le SVG mais pas injecter de script. Correctif d'une ligne proposé dans
// docs/security/PATCHS-2026-09-22.md.
//
// partner-logo — retourne soit le logo officiel d'un partenaire (Google Favicons sz=128), soit un SVG généré avec initiales
// Usage : GET /partner-logo?slug=ag-copro
//        ou GET /partner-logo?name=AG-Copro&domain=ag-copro.fr
// Cache 7 jours via header public, max-age=604800
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const COLORS = [
  '#0DA0CF', '#FB923C', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#14B8A6', '#F97316'
];
function hashStr(s: string): number {
  let h = 0; for (let i=0; i<s.length; i++) h = (h*31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function colorFor(name: string): string {
  return COLORS[hashStr(name) % COLORS.length];
}
function initials(name: string): string {
  const parts = name.replace(/[—\-_]/g, ' ').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}
function svgFallback(name: string): string {
  const init = initials(name);
  const color = colorFor(name);
  const fontSize = init.length === 1 ? 110 : init.length === 2 ? 90 : 70;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="96" fill="${color}" />
  <text x="100" y="100" font-family="Inter,Helvetica,Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${init}</text>
</svg>`;
}

async function fetchGoogleFavicon(domain: string): Promise<Uint8Array | null> {
  if (!domain) return null;
  try {
    const res = await fetch(`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    // Google retourne parfois 200 avec un favicon vide/générique de 16-64 bytes. On exige > 800 bytes pour valider.
    if (buf.byteLength < 800) return null;
    return buf;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  let name = url.searchParams.get('name') || '';
  let domain = url.searchParams.get('domain') || '';
  // Si slug fourni, lookup dans Supabase
  if (slug && !name) {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data } = await sb.from('partners').select('name, website').eq('slug', slug).maybeSingle();
    if (data) {
      name = data.name || slug;
      if (data.website) {
        try { domain = new URL(data.website).hostname.replace(/^www\./, ''); } catch {}
      }
    }
  }
  if (!name) name = slug || 'Partenaire';
  // Essai Google Favicon
  if (domain) {
    const png = await fetchGoogleFavicon(domain);
    if (png) {
      return new Response(png, {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' }
      });
    }
  }
  // Fallback : SVG généré avec initiales
  const svg = svgFallback(name);
  return new Response(svg, {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=604800, immutable' }
  });
});
