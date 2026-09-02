// homogenize-localbusiness-name.mjs — aligne LocalBusiness.name des pages locales
// sur l'entité canonique de la home ("HELP Confort Saint-Omer"). SÛR : parse JSON réel,
// n'écrit que si tous les blocs ld+json reparsent. Ne touche QUE les objets @type LocalBusiness.
// La ville reste couverte par areaServed. Usage: node scripts/seo/homogenize-localbusiness-name.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';

const CANON = 'HELP Confort Saint-Omer';
const LB_TYPES = new Set(['LocalBusiness','Plumber','Electrician','HVACBusiness','Locksmith',
  'GeneralContractor','HomeAndConstructionBusiness','RoofingContractor','HousePainter','Contractor']);
const PREFIXES = ['depannage-','plombier-','chauffagiste-','serrurier-','electricien-','vitrier-','menuisier-','pmr-','travaux-','volets-'];
const dry = process.argv.includes('--dry');
const root = process.cwd();

function isLocalPage(f){ return f.endsWith('.html') && PREFIXES.some(p => f.startsWith(p)); }
function walk(obj, fn){ if(Array.isArray(obj)) obj.forEach(x=>walk(x,fn)); else if(obj && typeof obj==='object'){ fn(obj); Object.values(obj).forEach(v=>walk(v,fn)); } }

let changed=0, filesChanged=0, skipped=0;
for(const f of fs.readdirSync(root).filter(isLocalPage)){
  const html = fs.readFileSync(f,'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m, out=html, fileTouched=false, ok=true;
  const blocks=[];
  while((m=re.exec(html))) blocks.push({full:m[0], json:m[1]});
  for(const b of blocks){
    let data; try{ data=JSON.parse(b.json); }catch(e){ ok=false; break; }
    let touched=false;
    walk(data, o=>{
      const t=o['@type'];
      const types=Array.isArray(t)?t:[t];
      if(types.some(x=>LB_TYPES.has(x)) && typeof o.name==='string' && /HELP Confort/i.test(o.name) && o.name!==CANON){
        o.name=CANON; touched=true;
      }
    });
    if(touched){
      const newJson=JSON.stringify(data);
      try{ JSON.parse(newJson); }catch(e){ ok=false; break; }
      out=out.replace(b.full, '<script type="application/ld+json">'+newJson+'</script>');
      fileTouched=true; changed++;
    }
  }
  if(!ok){ console.error('SKIP (JSON invalide):', f); skipped++; continue; }
  if(fileTouched){
    // sanity : re-vérifier que tous les blocs du fichier de sortie reparsent
    let allOk=true; const re2=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g; let mm;
    while((mm=re2.exec(out))){ try{JSON.parse(mm[1]);}catch(e){allOk=false;} }
    if(!allOk){ console.error('ABORT fichier (revalidation KO):', f); skipped++; continue; }
    if(!dry) fs.writeFileSync(f, out);
    filesChanged++;
    console.log((dry?'[dry] ':'')+'updated', f);
  }
}
console.log(`\n${dry?'[DRY] ':''}LocalBusiness.name -> "${CANON}" : ${changed} objets, ${filesChanged} fichiers${skipped?', '+skipped+' skip':''}`);
