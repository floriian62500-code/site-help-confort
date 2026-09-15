import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const HcCart = require('../../assets/hc-cart.js');
let pass=0, fail=0;
const ok=(n,c)=>{ c?(pass++,console.log('  ✅',n)):(fail++,console.log('  ❌',n)); };
const P=(id,ttc)=>({id,slug:id,name:id,brand:'X',ttc,requires_quote:false,active:true});
const D=(id)=>({id,slug:id,name:id,requires_quote:true,active:true,ttc:0});

let c=HcCart.create();
// 1. panier vide
ok('vide: count 0 + mode vide', c.count()===0 && c.mode()==='vide' && !c.isPayable());
// 2. 1 chauffe-eau ferme
c.add(P('ce100',771));
ok('1 article: count 1, total 771, payable, mode paiement', c.count()===1 && c.totalTtcDisplay()===771 && c.isPayable() && c.mode()==='paiement');
// 3. doublon => incrémente qté
c.add(P('ce100',771));
ok('doublon: 1 ligne, qté 2, total 1542', c.lines().length===1 && c.lines()[0].qty===2 && c.totalTtcDisplay()===1542);
// 4. quantité explicite
c.setQty('ce100',1);
ok('setQty 1: total 771', c.totalTtcDisplay()===771);
// 5. 2 prestations même famille
c.add(P('ce150',837));
ok('2 même famille: 2 lignes, total 1608', c.lines().length===2 && c.totalTtcDisplay()===1608);
// 6. 2 familles différentes
c.add(P('serrure',150));
ok('2 familles: 3 lignes, total 1758', c.lines().length===3 && c.totalTtcDisplay()===1758);
// 7. suppression
c.remove('serrure');
ok('suppression: 2 lignes, total 1608', c.lines().length===2 && c.totalTtcDisplay()===1608);
// 8. produit diagnostic (devis) => mode mixte
c.add(D('renovation'));
ok('mixte: hasQuote true, mode mixte, NON payable', c.hasQuote() && c.mode()==='mixte' && !c.isPayable());
// 9. retrait des fermes => mode devis pur
c.remove('ce100'); c.remove('ce150');
ok('devis pur: mode devis, non payable', c.mode()==='devis' && !c.isPayable());
// 10. serverPayload = ids+qty seulement (pas de prix client)
c.clear(); c.add(P('ce100',771),2);
const pl=c.serverPayload();
ok('serverPayload: ids+qty, aucun prix', pl.length===1 && pl[0].id==='ce100' && pl[0].qty===2 && !('ttc' in pl[0]));
// 11. persistance (même store)
const store=HcCart.create().store; const c2=HcCart.create(store); c2.add(P('x',100)); const c3=HcCart.create(store);
ok('persistance: relecture du store', c3.count()===1 && c3.totalTtcDisplay()===100);
// 12. qty 0 => retrait
c3.setQty('x',0); ok('setQty 0 => retrait', c3.count()===0 && c3.mode()==='vide');

console.log(`\nRÉSULTAT PANIER : ${pass} PASS / ${fail} FAIL`);
process.exit(fail>0?1:0);
