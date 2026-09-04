/* hc-cart.js — logique panier multi-prestations (source unique). Refonte catalogue P0.
 * ⚠️ Le TTC stocké ici sert à l'AFFICHAGE. Le total PAYABLE doit être RECALCULÉ CÔTÉ SERVEUR
 *    à partir des IDs produit (anti-exploit montant client). Ne jamais envoyer ce total à Stripe.
 * UMD : utilisable en navigateur (localStorage) et en Node (test, storage injecté).
 */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.HcCart = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var KEY = 'hc_cart_v1';

  function makeStore() {
    try { if (typeof localStorage !== 'undefined') return localStorage; } catch (e) {}
    var mem = {};
    return { getItem: function (k) { return k in mem ? mem[k] : null; },
             setItem: function (k, v) { mem[k] = String(v); },
             removeItem: function (k) { delete mem[k]; } };
  }

  function Cart(store) {
    this.store = store || makeStore();
    this.items = this._read();
  }

  Cart.prototype._read = function () {
    try { var raw = this.store.getItem(KEY); var a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  };
  Cart.prototype.save = function () { this.store.setItem(KEY, JSON.stringify(this.items)); return this; };

  // item : {id, slug, name, brand, ttc(Number), requires_quote(Boolean), active(Boolean)}
  Cart.prototype.add = function (item, qty) {
    if (!item || !item.id) return this;
    qty = Math.max(1, parseInt(qty || 1, 10) || 1);
    var line = this.items.find(function (l) { return l.id === item.id; });
    if (line) { line.qty += qty; }               // doublon => incrémente la quantité
    else {
      this.items.push({
        id: item.id, slug: item.slug || '', name: item.name || item.slug || 'Prestation',
        brand: item.brand || '', ttc: Number(item.ttc) || 0,
        requires_quote: !!item.requires_quote, active: item.active !== false, qty: qty
      });
    }
    return this.save();
  };
  Cart.prototype.remove = function (id) {
    this.items = this.items.filter(function (l) { return l.id !== id; });
    return this.save();
  };
  Cart.prototype.setQty = function (id, qty) {
    qty = parseInt(qty, 10);
    var line = this.items.find(function (l) { return l.id === id; });
    if (!line) return this;
    if (!qty || qty < 1) return this.remove(id);   // qty 0 => retrait
    line.qty = qty; return this.save();
  };
  Cart.prototype.clear = function () { this.items = []; return this.save(); };

  Cart.prototype.lines = function () { return this.items.slice(); };
  Cart.prototype.count = function () { return this.items.reduce(function (n, l) { return n + l.qty; }, 0); };
  // Total TTC — AFFICHAGE seulement (le serveur recalcule pour le paiement).
  Cart.prototype.totalTtcDisplay = function () {
    return this.items.reduce(function (s, l) { return s + (Number(l.ttc) || 0) * l.qty; }, 0);
  };
  // A/B : le panier est-il 100% payable (toutes lignes prix ferme + actives) ?
  Cart.prototype.isPayable = function () {
    return this.items.length > 0 && this.items.every(function (l) {
      return l.active !== false && !l.requires_quote && Number(l.ttc) > 0;
    });
  };
  Cart.prototype.hasQuote = function () {
    return this.items.some(function (l) { return l.requires_quote; });
  };
  // Mode du panier : 'vide' | 'paiement' | 'devis' | 'mixte'
  Cart.prototype.mode = function () {
    if (this.items.length === 0) return 'vide';
    var payable = this.items.filter(function (l) { return !l.requires_quote; }).length;
    var quote = this.items.filter(function (l) { return l.requires_quote; }).length;
    if (quote === 0) return this.isPayable() ? 'paiement' : 'devis';
    if (payable === 0) return 'devis';
    return 'mixte';   // ferme + devis => demande globale sans paiement immédiat
  };
  // IDs+qty à envoyer au serveur (le serveur recalcule prix/total — jamais le client).
  Cart.prototype.serverPayload = function () {
    return this.items.map(function (l) { return { id: l.id, slug: l.slug, qty: l.qty }; });
  };

  return {
    create: function (store) { return new Cart(store); },
    Cart: Cart, KEY: KEY
  };
});
