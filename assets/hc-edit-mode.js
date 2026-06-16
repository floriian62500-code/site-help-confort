(function(){
var h=location.hostname;
if(!/staging|netlify\.app/.test(h)||/depan59-62\.fr$/.test(h)||/\/admin-pro\/|\/admin\//.test(location.pathname))return;
var q=new URLSearchParams(location.search);
if(q.get('edit')==='1')document.cookie='hc_edit=1; path=/; max-age=86400';
if(q.get('edit')==='0')document.cookie='hc_edit=; path=/; max-age=0';
if(!/(?:^|;\s*)hc_edit=1/.test(document.cookie))return;
if(window.__HCEM)return;window.__HCEM=true;
var SU='https://btcbjwqiivhpwoszomhg.supabase.co';
var P=(function(){var p=location.pathname;if(p==='/'||!p)return 'index.html';if(p.endsWith('/'))p+='index.html';if(!/\.html?$/i.test(p))p+='.html';return p.replace(/^\//,'')})();
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function tok(){return localStorage.getItem('hc_gh_token')||''}
function toast(m,t){var d=document.createElement('div');d.className='hcem-toast '+(t||'');d.textContent=m;document.body.appendChild(d);setTimeout(function(){d.classList.add('show')},10);setTimeout(function(){d.classList.remove('show');setTimeout(function(){d.remove()},300)},3000)}
function setSt(m,t){var e=document.getElementById('hcem-st');if(e){e.textContent=m;e.className='hcem-st '+(t||'')}}
var css=`
#hcem-bar{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:linear-gradient(90deg,#FF6B1A,#FF8A4A);color:#fff;padding:10px 18px;display:flex;align-items:center;gap:18px;font:600 .86rem Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.20);height:48px}
#hcem-bar .l{display:flex;align-items:center;gap:10px}
#hcem-bar .dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:hcemP 1.6s ease-in-out infinite}
@keyframes hcemP{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}
#hcem-bar .pg{background:rgba(0,0,0,.2);padding:3px 10px;border-radius:6px;font:500 .78rem ui-monospace,monospace}
#hcem-bar .m{flex:1;text-align:center;font-weight:500;font-size:.82rem}
.hcem-st.saving{color:#FFE0B2}.hcem-st.ok{color:#A7F3D0;font-weight:700}.hcem-st.err{color:#FECACA;font-weight:700}
#hcem-bar button{background:rgba(0,0,0,.25);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:7px;padding:6px 13px;font:700 .82rem inherit;cursor:pointer}
#hcem-bar button:hover{background:rgba(0,0,0,.4)}
#hcem-bar .qt{background:rgba(255,255,255,.18)}
body.hcem-on{padding-top:48px}
.hcem-ed{outline:1px dashed rgba(13,160,207,.45);outline-offset:2px;border-radius:3px;cursor:text;transition:outline .12s,background .12s;position:relative}
.hcem-ed:hover{outline:2px solid #0DA0CF;background:rgba(13,160,207,.06)}
.hcem-ed.ing{outline:2px solid #FF6B1A;background:rgba(255,107,26,.08)}
.hcem-ed-img{cursor:pointer}
.hcem-ed-img:hover{outline:3px solid #0DA0CF;outline-offset:2px;box-shadow:0 0 0 8px rgba(13,160,207,.2)}
.hcem-sb{position:absolute;top:-38px;left:0;background:#0A1428;color:#fff;border-radius:8px;padding:4px;display:flex;gap:4px;z-index:2147483646;box-shadow:0 8px 20px rgba(0,0,0,.3);white-space:nowrap;font:inherit}
.hcem-sb button{border:0;background:#22C55E;color:#fff;padding:6px 14px;border-radius:6px;font:700 .78rem inherit;cursor:pointer}
.hcem-sb button.cc{background:#64748b}
.hcem-md{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147483646;display:flex;align-items:center;justify-content:center;font:Inter,system-ui,sans-serif}
.hcem-md .pn{background:#fff;border-radius:14px;padding:24px;max-width:560px;width:90%;box-shadow:0 24px 60px rgba(0,0,0,.4)}
.hcem-md h3{margin:0 0 6px;font:800 1.1rem inherit;color:#0A1428}
.hcem-md p{margin:0 0 16px;color:#64748b;font-size:.86rem;line-height:1.45}
.hcem-md .dp{border:2px dashed #CBD5E1;border-radius:10px;padding:32px;text-align:center;color:#64748b;cursor:pointer}
.hcem-md .dp:hover,.hcem-md .dp.over{border-color:#0DA0CF;background:#EFF8FE;color:#0DA0CF}
.hcem-md .ac{display:flex;gap:8px;margin-top:18px;justify-content:flex-end}
.hcem-md .ac button{padding:9px 16px;border-radius:8px;border:0;font:700 .86rem inherit;cursor:pointer;background:#F1F5F9;color:#475569}
.hcem-toast{position:fixed;bottom:24px;right:24px;background:#0A1428;color:#fff;padding:12px 20px;border-radius:10px;z-index:2147483647;font:700 .88rem Inter,system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.3);transform:translateY(8px);opacity:0;transition:all .25s}
.hcem-toast.show{opacity:1;transform:translateY(0)}
.hcem-toast.ok{background:#22C55E}.hcem-toast.err{background:#EF4444}`;
function init(){
var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
var bar=document.createElement('div');bar.id='hcem-bar';
bar.innerHTML='<div class="l"><span class="dot"></span><strong>Mode édition WYSIWYG</strong><span class="pg">'+esc(P)+'</span></div><div class="m"><span class="hcem-st" id="hcem-st">Prêt — clique sur n\'importe quel texte/image</span></div><div><button id="hcem-seo" title="Éditer titre + meta description">🔧 SEO</button> <button id="hcem-i">ℹ️</button> <button class="qt" id="hcem-q">✕ Quitter</button></div>';
document.body.appendChild(bar);document.body.classList.add('hcem-on');
document.getElementById('hcem-q').onclick=function(){document.cookie='hc_edit=; path=/; max-age=0';location.href=location.pathname+'?edit=0'};
document.getElementById('hcem-i').onclick=function(){alert('💡 Clique sur n\'importe quel texte/image pour modifier. Tes modifs partent sur STAGING (jamais en prod tant que tu n\'as pas validé via le widget orange).\n\nPath actuel : '+P)};
document.getElementById('hcem-seo').onclick=function(){startSeo()};
tagAll();
new MutationObserver(tagAll).observe(document.body,{childList:true,subtree:true});
}
function tagBgImages(){
document.querySelectorAll('div,section,article,aside,header,footer,figure,picture,span,a,button').forEach(function(el){
if(el.classList.contains('hcem-ed'))return;
if(el.closest('#hcem-bar')||el.closest('.hcem-md')||el.closest('.hcem-sb'))return;
var bg=getComputedStyle(el).backgroundImage;
if(!bg||bg==='none'||!bg.startsWith('url('))return;
var m=bg.match(/url\(["']?([^"'\)]+)["']?\)/);if(!m)return;
var url=m[1];if(!url||url.startsWith('data:')||url.startsWith('http'))return;
var w=el.offsetWidth,h=el.offsetHeight;if(w<40||h<40||w>900)return;
el.classList.add('hcem-ed','hcem-ed-bg');el.dataset.hcemT='b';el.dataset.hcemBgUrl=url;
})}
function tagAll(){
tagBgImages();
document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,li,strong,em,label,figcaption,blockquote,summary,td,th,img').forEach(function(el){
if(el.classList.contains('hcem-ed'))return;
if(el.closest('#hcem-bar')||el.closest('.hcem-md')||el.closest('.hcem-sb'))return;
if(el.closest('script,style,noscript,header.hc-nav-bar'))return;
if(el.tagName==='IMG'){el.classList.add('hcem-ed','hcem-ed-img');el.dataset.hcemT='i';return}
var txt=(el.innerText||el.textContent||'').trim();if(!txt||txt.length<2)return;
var hb=false;for(var i=0;i<el.children.length;i++){if(/^(DIV|SECTION|ARTICLE|UL|OL|P|H[1-6]|FORM)$/.test(el.children[i].tagName)){hb=true;break}}
if(hb)return;
el.classList.add('hcem-ed');el.dataset.hcemT='t';
});
}
var cur=null;
function kh(e){if(e.key==='Escape'){e.preventDefault();cancelT(cur)}else if(e.key==='Enter'&&!e.shiftKey&&cur&&cur.tagName!=='P'&&cur.tagName!=='LI'){e.preventDefault();saveT(cur)}}
function startT(el){
if(cur)return;cur=el;
el.dataset.hcemO=el.innerText;el.contentEditable='true';el.classList.add('ing');el.focus();
var sb=document.createElement('div');sb.className='hcem-sb';sb.contentEditable='false';
sb.innerHTML='<button class="sv">💾 Save</button><button class="cc">✕ Cancel</button>';
el.appendChild(sb);
sb.querySelector('.sv').onmousedown=function(e){e.preventDefault();saveT(el)};
sb.querySelector('.cc').onmousedown=function(e){e.preventDefault();cancelT(el)};
el.addEventListener('keydown',kh);
var s=getSelection(),r=document.createRange();r.selectNodeContents(el);r.collapse(false);s.removeAllRanges();s.addRange(r);
}
function cleanT(el){var sb=el.querySelector('.hcem-sb');if(sb)sb.remove();el.contentEditable='false';el.classList.remove('ing');el.removeEventListener('keydown',kh);cur=null}
function cancelT(el){if(!el)return;el.innerText=el.dataset.hcemO||'';cleanT(el)}
function saveT(el){if(!el)return;
var nt=el.innerText.replace(/\s*💾 Save\s*✕ Cancel\s*$/,'').trim();
var ot=(el.dataset.hcemO||'').trim();
if(nt===ot){cleanT(el);return}
var tk=tok();if(!tk){alert('⚠️ Renseigne ton PAT GitHub d\'abord (depuis /admin-pro/photos.html)');cancelT(el);return}
setSt('💾 Save...','saving');
fetch(SU+'/functions/v1/hc-content-save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page_path:P,original_text:ot,new_text:nt,token:tk})})
.then(function(r){return r.json()}).then(function(d){
if(d.success){setSt('✅ '+(d.commit_sha||'').slice(0,7)+' — Netlify ~1 min','ok');toast('✅ Sauvegardé','ok');el.innerText=nt;cleanT(el)}
else{setSt('❌ '+(d.error||'err'),'err');toast('❌ '+(d.error||'erreur'),'err');cancelT(el)}
}).catch(function(e){setSt('❌ '+e.message,'err');toast('❌ Réseau','err');cancelT(el)});
}
function startI(img){
var src=img.getAttribute('src')||'';
var ip=src.replace(/^https?:\/\/[^/]+/,'').replace(/^\//,'').split('?')[0].split('#')[0];
if(!ip||ip.startsWith('data:')){alert('⚠️ Image externe non modifiable');return}
var m=document.createElement('div');m.className='hcem-md';
m.innerHTML='<div class="pn"><h3>📸 Remplacer image</h3><p>Path : <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font:.84rem ui-monospace,monospace">'+esc(ip)+'</code></p><div class="dp" id="hcemd"><div style="font-size:2rem">📤</div><strong>Glisse-dépose ou clique</strong><input type="file" accept="image/*,.svg" style="display:none"></div><div class="ac"><button>Annuler</button></div></div>';
document.body.appendChild(m);
var d=m.querySelector('#hcemd'),inp=d.querySelector('input');
d.onclick=function(){inp.click()};
inp.onchange=function(e){var f=e.target.files[0];if(f)upI(f,ip,m,img)};
d.ondragover=function(e){e.preventDefault();d.classList.add('over')};
d.ondragleave=function(){d.classList.remove('over')};
d.ondrop=function(e){e.preventDefault();d.classList.remove('over');var f=e.dataTransfer.files[0];if(f)upI(f,ip,m,img)};
m.querySelector('.ac button').onclick=function(){m.remove()};
m.onclick=function(e){if(e.target===m)m.remove()};
}
function upI(f,ip,m,el){
var tk=tok();if(!tk){alert('⚠️ Renseigne PAT GitHub (depuis /admin-pro/photos.html)');return}
setSt('📸 Upload '+f.name+'...','saving');
var r=new FileReader();
r.onload=function(){
var b64=String(r.result).split(',')[1];
fetch(SU+'/functions/v1/gh-push-inline',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:tk,owner:'floriian62500-code',repo:'site-help-confort',branch:'staging',message:'feat(wysiwyg): img '+ip+' ('+Math.round(f.size/1024)+'KB)',files:[{path:ip,content_b64:b64}]})})
.then(function(x){return x.json()}).then(function(d){
if(d.success){setSt('✅ Image uploadée','ok');toast('✅ Image remplacée','ok');el.src=el.src.split('?')[0]+'?t='+Date.now();m.remove()}
else{setSt('❌ '+(d.error||'err'),'err');toast('❌ '+(d.error||'erreur'),'err')}
}).catch(function(e){setSt('❌ '+e.message,'err');toast('❌ Réseau','err')})};
r.readAsDataURL(f);
}
document.addEventListener('click',function(e){
if(!e.target.closest)return;
var ed=e.target.closest('.hcem-ed');if(!ed)return;
if(ed.dataset.hcemT==='t'){if(cur&&cur!==ed)return;if(ed.contentEditable==='true')return;e.preventDefault();e.stopPropagation();startT(ed)}
else if(ed.dataset.hcemT==='i'||ed.dataset.hcemT==='b'){e.preventDefault();e.stopPropagation();startI(ed)}
},true);
function startSeo(){
  var head = document.head;
  var titleEl = head.querySelector('title');
  var metaEl = head.querySelector('meta[name="description"]');
  var oldTitle = titleEl ? titleEl.textContent : '';
  var oldDesc = metaEl ? metaEl.getAttribute('content') : '';
  var m=document.createElement('div');m.className='hcem-md';
  m.innerHTML='<div class="pn"><h3>🔧 Mode SEO — Titre + Description</h3><p>Modifie le <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font:.84rem ui-monospace,monospace">&lt;title&gt;</code> et la <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font:.84rem ui-monospace,monospace">&lt;meta description&gt;</code> de cette page. Sauvegarde directement sur staging.</p><label style="display:block;margin-bottom:6px;font-weight:600;color:#0A1428">Titre (60 car. max recommandés)</label><input id="hcem-seo-t" type="text" style="width:100%;padding:8px 10px;border:1px solid #CBD5E1;border-radius:6px;font:.86rem inherit;margin-bottom:14px" value="'+esc(oldTitle)+'"><label style="display:block;margin-bottom:6px;font-weight:600;color:#0A1428">Meta description (160 car. max)</label><textarea id="hcem-seo-d" rows="3" style="width:100%;padding:8px 10px;border:1px solid #CBD5E1;border-radius:6px;font:.86rem inherit;resize:vertical">'+esc(oldDesc)+'</textarea><div class="ac"><button id="hcem-seo-c">Annuler</button><button id="hcem-seo-s" style="background:#22C55E;color:#fff">💾 Sauvegarder</button></div></div>';
  document.body.appendChild(m);
  m.querySelector('#hcem-seo-c').onclick=function(){m.remove()};
  m.onclick=function(e){if(e.target===m)m.remove()};
  m.querySelector('#hcem-seo-s').onclick=function(){
    var nt=(m.querySelector('#hcem-seo-t').value||'').trim();
    var nd=(m.querySelector('#hcem-seo-d').value||'').trim();
    var tk=tok();if(!tk){alert('⚠️ Renseigne ton PAT GitHub d\'abord (depuis /admin-pro/photos.html)');return}
    setSt('💾 SEO save...','saving');
    var jobs=[];
    if(nt!==oldTitle){jobs.push({find:'<title>'+oldTitle+'</title>',replace:'<title>'+nt+'</title>'})}
    if(nd!==oldDesc){
      var oldMetaTag='<meta name="description" content="'+oldDesc+'">';
      var newMetaTag='<meta name="description" content="'+nd+'">';
      jobs.push({find:oldMetaTag,replace:newMetaTag});
    }
    if(jobs.length===0){setSt('Aucun changement','');toast('ℹ️ Aucun changement','');m.remove();return}
    var done=0,errs=[];
    jobs.forEach(function(j){
      fetch(SU+'/functions/v1/gh-edit-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:tk,owner:'floriian62500-code',repo:'site-help-confort',branch:'staging',file_path:P,find:j.find,replace:j.replace,message:'feat(seo): '+P+' '+(j.find.indexOf('<title>')>=0?'titre':'description')})}).then(function(r){return r.json()}).then(function(d){
        done++;
        if(!d.success)errs.push(d.error||'err');
        if(done===jobs.length){
          if(errs.length){setSt('❌ '+errs.join(' / '),'err');toast('❌ '+errs.join(' / '),'err')}
          else{setSt('✅ SEO sauvegardé — Netlify ~1 min','ok');toast('✅ SEO mis à jour','ok');if(titleEl&&nt!==oldTitle)titleEl.textContent=nt;if(metaEl&&nd!==oldDesc)metaEl.setAttribute('content',nd);m.remove()}
        }
      }).catch(function(e){done++;errs.push(e.message);if(done===jobs.length){setSt('❌ '+errs.join(' / '),'err');toast('❌ Réseau','err')}});
    });
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();