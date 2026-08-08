#!/usr/bin/env node
// gen-realisations.mjs — pré-rendu statique SEO/AEO des réalisations.
// Objectif : contenu stratégique + JSON-LD + index,follow DANS LE HTML INITIAL
// (exploitable par Google ET les moteurs IA qui n'exécutent pas JS).
// Source : Edge Function realisations-json (données publiées). Sortie : realisations/<slug>.html
// + mise à jour de _redirects (règles statiques par slug AVANT le fallback JS legacy).
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'realisations');
const SUPA = 'https://btcbjwqiivhpwoszomhg.supabase.co';
const SITE = 'https://www.depan59-62.fr';
const PHONE = '03 66 10 01 34', TEL = '+33366100134';

const METIERS = {
  plomberie:   { label: 'Plomberie',   page: 'plombier-saint-omer.html',    svc: 'Plomberie' },
  chauffage:   { label: 'Chauffage',   page: 'chauffagiste-saint-omer.html', svc: 'Chauffage' },
  electricite: { label: 'Électricité', page: 'electricien-saint-omer.html',  svc: 'Électricité' },
  'électricité':{label: 'Électricité', page: 'electricien-saint-omer.html',  svc: 'Électricité' },
  serrurerie:  { label: 'Serrurerie',  page: 'serrurier-saint-omer.html',    svc: 'Serrurerie' },
  vitrerie:    { label: 'Vitrerie',    page: 'vitrier-saint-omer.html',      svc: 'Vitrerie' },
  renovation:  { label: 'Rénovation',  page: 'travaux-saint-omer.html',      svc: 'Rénovation' },
  'rénovation':{ label: 'Rénovation',  page: 'travaux-saint-omer.html',      svc: 'Rénovation' },
  menuiserie:  { label: 'Menuiserie',  page: 'travaux-saint-omer.html',      svc: 'Menuiserie' },
  volets:      { label: 'Volets',      page: 'volets-saint-omer.html',       svc: 'Volets roulants' },
};
const metierOf = m => METIERS[String(m||'').toLowerCase()] || { label: 'Travaux', page: 'travaux-saint-omer.html', svc: 'Travaux' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsonesc = s => String(s ?? '').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\r\n]+/g,' ').trim();
// retire emojis + markdown décoratifs pour titres/h1 propres
const stripDeco = s => String(s ?? '')
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\*\*/g, '').replace(/[·•]+/g,' ').replace(/\s{2,}/g,' ').trim();
const cleanTitle = s => { let t = stripDeco(s).replace(/^[\s–—-]+/, '').trim(); return t.length > 68 ? t.slice(0,65).replace(/\s\S*$/,'')+'…' : t; };
const cleanText = s => stripDeco(String(s??'')).replace(/\s{2,}/g,' ').trim();
const metaDesc = s => { const t = cleanText(s); return (t.length > 155 ? t.slice(0,152).replace(/\s\S*$/,'')+'…' : t); };
const paragraphs = s => String(s??'').split(/\n{1,}/).map(p => cleanText(p)).filter(p => p.length > 1);

const HEADER = `<header style="background:rgba(255,255,255,.95);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(229,237,243,.6);padding:12px clamp(20px,4vw,64px);position:sticky;top:0;z-index:100">
<div style="max-width:1480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px">
<a href="/" style="display:flex;align-items:center;text-decoration:none"><img width="200" height="60" decoding="async" src="/logo-officiel.jpg" alt="HELP Confort Saint-Omer & Dunkerque" style="height:44px;width:auto"></a>
<nav style="display:flex;align-items:center;gap:16px">
<a href="/realisations.html" style="color:#0DA0CF;font-weight:600;text-decoration:none;font-size:.9rem">← Réalisations</a>
<a href="tel:${TEL}" style="background:#FF6B1A;color:#fff;padding:9px 16px;border-radius:10px;font-weight:800;text-decoration:none;font-size:.9rem">📞 ${PHONE}</a>
</nav></div></header>`;

const FOOTER = `<footer style="background:linear-gradient(180deg,#0A1428,#060E1D);color:rgba(255,255,255,.8);padding:44px clamp(20px,4vw,64px) 28px;margin-top:56px">
<div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px">
<div><strong style="color:#fff;font-size:1.05rem">HELP Confort — SARL Dépan'Audo</strong>
<p style="line-height:1.6;margin:10px 0;font-size:.9rem">Dépannage & rénovation à Saint-Omer, Dunkerque, Calais et communes voisines. Techniciens salariés, devis clair, garantie décennale.</p>
<p style="margin:4px 0"><a href="tel:${TEL}" style="color:#1FC4F0;font-weight:800;text-decoration:none;font-size:1.05rem">📞 ${PHONE}</a></p>
<p style="margin:4px 0;font-size:.86rem"><a href="mailto:saint-omer@helpconfort.com" style="color:rgba(255,255,255,.8);text-decoration:none">saint-omer@helpconfort.com</a></p>
<p style="margin:4px 0;font-size:.82rem;color:rgba(255,255,255,.55)">242 route de Boulogne, 62500 Saint-Martin-lez-Tatinghem</p></div>
<div><strong style="color:#fff;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase">Métiers</strong>
<ul style="list-style:none;padding:0;margin:12px 0;line-height:2;font-size:.9rem">
<li><a href="/plombier-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Plombier</a></li>
<li><a href="/chauffagiste-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Chauffagiste</a></li>
<li><a href="/electricien-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Électricien</a></li>
<li><a href="/serrurier-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Serrurier</a></li>
<li><a href="/vitrier-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Vitrier</a></li>
<li><a href="/travaux-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Rénovation</a></li></ul></div>
<div><strong style="color:#fff;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase">Zones</strong>
<ul style="list-style:none;padding:0;margin:12px 0;line-height:2;font-size:.9rem">
<li><a href="/depannage-saint-omer.html" style="color:rgba(255,255,255,.78);text-decoration:none">Saint-Omer (62500)</a></li>
<li><a href="/depannage-dunkerque.html" style="color:rgba(255,255,255,.78);text-decoration:none">Dunkerque (59140)</a></li>
<li><a href="/depannage-calais.html" style="color:rgba(255,255,255,.78);text-decoration:none">Calais (62100)</a></li>
<li><a href="/zones-intervention.html" style="color:rgba(255,255,255,.78);text-decoration:none">Toutes les zones</a></li></ul></div></div>
<p style="max-width:1200px;margin:28px auto 0;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);font-size:.78rem;color:rgba(255,255,255,.5)">© HELP Confort · SARL Dépan'Audo · <a href="/mentions-legales.html" style="color:rgba(255,255,255,.6)">Mentions légales</a> · <a href="/realisations.html" style="color:rgba(255,255,255,.6)">Nos réalisations</a></p></footer>`;

const HEAD_CSS = `.real-page{max-width:960px;margin:0 auto;padding:28px clamp(16px,4vw,40px) 40px}.real-back{display:inline-flex;align-items:center;gap:6px;font-size:.86rem;color:#0DA0CF;font-weight:600;text-decoration:none;margin-bottom:16px}.real-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.real-tag{padding:5px 12px;border-radius:999px;font-size:.78rem;font-weight:700}.real-tag.metier{background:rgba(13,160,207,.1);color:#0DA0CF}.real-tag.ville{background:rgba(255,107,26,.1);color:#FF6B1A}.real-tag.date{background:#F5F8FB;color:#475569}.real-h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;color:#0A1428;line-height:1.18;margin:0 0 14px}.real-lead{font-size:1.05rem;color:#475569;line-height:1.6;margin:0 0 24px;max-width:760px}.real-photo{border-radius:16px;overflow:hidden;background:#F5F8FB;box-shadow:0 8px 24px rgba(10,20,40,.08);margin-bottom:28px}.real-photo img{width:100%;height:auto;display:block;aspect-ratio:16/10;object-fit:cover}.real-grid{display:grid;grid-template-columns:1.7fr 1fr;gap:30px;align-items:start}.real-body{font-size:1rem;color:#0A1428;line-height:1.75}.real-body p{margin:0 0 14px}.real-side{position:sticky;top:80px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;padding:20px}.real-side h2{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#475569;margin:0 0 12px}.real-side-info div{font-size:.88rem;color:#0A1428;margin-bottom:8px}.real-side-info span{display:block;color:#475569;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;font-weight:600}.real-cta{display:flex;flex-direction:column;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid #E5EDF3}.real-cta a{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:10px;font-weight:700;font-size:.92rem;text-decoration:none}.real-cta .p{background:#FF6B1A;color:#fff}.real-cta .d{background:#0DA0CF;color:#fff}.real-similar{margin-top:44px;padding-top:32px;border-top:1px solid #E5EDF3}.real-similar h2{font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;color:#0A1428;margin:0 0 16px}.real-similar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}.real-sc{display:block;border:1px solid #E5EDF3;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit}.real-sc img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.real-sc div{padding:11px;font-size:.9rem;font-weight:700;color:#0A1428;line-height:1.35}@media(max-width:780px){.real-grid{grid-template-columns:1fr}.real-side{position:static}}`;

function page(r, all) {
  const m = metierOf(r.metier);
  const ville = r.ville || 'Saint-Omer';
  const title = cleanTitle(r.title);
  const h1 = title;
  const desc = metaDesc(r.description || r.title);
  const canonical = `${SITE}/realisations/${r.slug}`;
  const img = r.image_after || r.image_before || '';
  const date = (r.date_intervention || r.published_at || '').slice(0,10);
  const body = paragraphs(r.description_long || r.description || '');
  const bodyHtml = body.map(p => `<p>${esc(p)}</p>`).join('\n') || `<p>${esc(desc)}</p>`;
  const similar = all.filter(x => x.slug !== r.slug && String(x.metier).toLowerCase() === String(r.metier).toLowerCase()).slice(0,3);
  const similarHtml = similar.length ? `<section class="real-similar"><h2>Autres réalisations en ${esc(m.label.toLowerCase())}</h2><div class="real-similar-grid">${similar.map(s => `<a class="real-sc" href="/realisations/${esc(s.slug)}">${s.image_after?`<img src="${esc(s.image_after)}" alt="${esc(cleanTitle(s.title))}" loading="lazy">`:''}<div>${esc(cleanTitle(s.title))}</div></a>`).join('')}</div></section>` : '';

  const ld = {
    "@context":"https://schema.org","@type":"Article",
    "headline": jsonesc(title),
    "description": jsonesc(desc),
    ...(img?{"image":[img]}:{}),
    ...(date?{"datePublished":date,"dateModified":date}:{}),
    "author":{"@type":"Organization","name":"HELP Confort — SARL Dépan'Audo"},
    "publisher":{"@type":"Organization","name":"HELP Confort","logo":{"@type":"ImageObject","url":`${SITE}/logo-officiel.jpg`}},
    "mainEntityOfPage":canonical,
    "about":{"@type":"Service","serviceType":jsonesc(m.svc),"areaServed":jsonesc(ville),
      "provider":{"@type":"LocalBusiness","name":"HELP Confort Saint-Omer","telephone":TEL,
        "address":{"@type":"PostalAddress","streetAddress":"242 route de Boulogne","postalCode":"62500","addressLocality":"Saint-Martin-lez-Tatinghem","addressCountry":"FR"}}}
  };
  const breadcrumb = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":"Accueil","item":SITE+"/"},
    {"@type":"ListItem","position":2,"name":"Réalisations","item":SITE+"/realisations.html"},
    {"@type":"ListItem","position":3,"name":jsonesc(title),"item":canonical}]};

  return `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — HELP Confort Saint-Omer</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}">
${img?`<meta property="og:image" content="${esc(img)}">`:''}
<meta property="og:site_name" content="HELP Confort Saint-Omer / Dunkerque">
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://btcbjwqiivhpwoszomhg.supabase.co" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0A1428;background:#fff}a{color:#0DA0CF}${HEAD_CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
</head><body>
${HEADER}
<main class="real-page">
<a class="real-back" href="/realisations.html">← Toutes nos réalisations</a>
<div class="real-meta"><span class="real-tag metier">${esc(m.label)}</span><span class="real-tag ville">${esc(ville)}</span>${date?`<span class="real-tag date">${esc(date)}</span>`:''}</div>
<h1 class="real-h1">${esc(h1)}</h1>
<p class="real-lead">${esc(desc)}</p>
${img?`<figure class="real-photo"><img src="${esc(img)}" alt="${esc(title)} — intervention HELP Confort à ${esc(ville)}" width="960" height="600"></figure>`:''}
<div class="real-grid">
<div class="real-body"><h2 style="font-family:'Playfair Display',serif;font-size:1.4rem;margin:0 0 14px">Détail de l'intervention</h2>${bodyHtml}
<p style="margin-top:20px"><a href="/${esc(m.page)}" style="font-weight:700">→ En savoir plus sur nos services de ${esc(m.label.toLowerCase())} à ${esc(ville)}</a></p></div>
<aside class="real-side"><h2>Cette intervention</h2>
<div class="real-side-info">
<div><span>Métier</span><a href="/${esc(m.page)}" style="font-weight:700;text-decoration:none">${esc(m.label)}</a></div>
<div><span>Secteur</span>${esc(ville)} & environs</div>
${date?`<div><span>Réalisée le</span>${esc(date)}</div>`:''}</div>
<div class="real-cta">
<a class="p" href="tel:${TEL}">📞 ${PHONE}</a>
<a class="d" href="/contact.html">Demander un devis gratuit</a></div></aside>
</div>
${similarHtml}
</main>
${FOOTER}
</body></html>`;
}

// ── run ──
const res = await fetch(`${SUPA}/functions/v1/realisations-json`, { headers: { apikey: 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2' } });
let data = await res.json();
let list = Array.isArray(data) ? data : (data.realisations || data.data || data.items || []);
list = list.filter(r => r && r.slug && (r.status ? r.status === 'publie' : true));
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
let n = 0; const slugs = [];
for (const r of list) { writeFileSync(join(OUT, `${r.slug}.html`), page(r, list)); slugs.push(r.slug); n++; }

// _redirects : règles statiques par slug AVANT le fallback JS
const RP = join(ROOT, '_redirects');
let rc = readFileSync(RP, 'utf8');
rc = rc.replace(/\n# Réalisations pré-rendues[\s\S]*?(?=\n# Anciennes URLs|$)/, '\n'); // purge ancien bloc si relance
const block = `\n# Réalisations pré-rendues statiques (contenu indexable dans le HTML initial) — auto-généré\n` +
  slugs.map(s => `/realisations/${s} /realisations/${s}.html 200`).join('\n') + '\n';
rc = rc.replace(/(# Anciennes URLs)/, block.trimStart() + '\n$1');
writeFileSync(RP, rc);
console.log(`OK ${n} pages générées dans realisations/ · _redirects mis à jour (${slugs.length} règles).`);
