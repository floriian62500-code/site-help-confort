// Vérification de la signature d'un webhook Stripe — logique pure, testable sans réseau.
//
// Pourquoi ce fichier existe : la fonction `stripe-webhook` DÉPLOYÉE lit l'en-tête `stripe-signature`
// puis l'ignore. La ligne de vérification est commentée derrière un `TODO`, et le corps de la
// requête est exploité tel quel. Conséquence : un tiers peut fabriquer un événement et faire passer
// une ligne de `payments` en « payé » sans qu'un euro ait été versé, ou la passer en « remboursé ».
//
// Ce module ne fait qu'une chose : dire si une charge utile vient bien de Stripe.
//
// Règles tenues, et chacune compte :
//   · le secret vient de l'ENVIRONNEMENT, jamais de `app_settings` — cette table est lisible par
//     tout compte authentifié (voir le paquet SECURITY-RLS-SECRETS) ;
//   · pas de secret configuré → on REFUSE. Jamais de repli « on fait confiance au corps » ;
//   · comparaison en temps constant : une comparaison qui s'arrête au premier octet different
//     laisse deviner la signature octet par octet ;
//   · tolérance sur l'horodatage : sans elle, une requête valide capturée une fois peut être
//     rejouée indéfiniment.

export type Verdict =
  | { ok: true; evenement: unknown }
  | { ok: false; code: number; motif: string };

const encodeur = new TextEncoder();

/** Compare deux chaînes sans court-circuit : la durée ne dépend pas du nombre d'octets communs. */
export function egalConstant(a: string, b: string): boolean {
  const x = encodeur.encode(a), y = encodeur.encode(b);
  // Longueurs différentes : on compare quand même, pour ne pas révéler la longueur par le temps.
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** En-tête Stripe : « t=1699999999,v1=abc...,v1=def... » (plusieurs v1 pendant une rotation). */
export function analyserEntete(entete: string): { t: number; signatures: string[] } | null {
  if (!entete) return null;
  let t = NaN;
  const signatures: string[] = [];
  for (const partie of entete.split(',')) {
    const i = partie.indexOf('=');
    if (i < 0) continue;
    const cle = partie.slice(0, i).trim(), valeur = partie.slice(i + 1).trim();
    if (cle === 't') t = Number(valeur);
    else if (cle === 'v1') signatures.push(valeur);
  }
  if (!Number.isFinite(t) || !signatures.length) return null;
  return { t, signatures };
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const cle = await crypto.subtle.importKey('raw', encodeur.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cle, encodeur.encode(message));
  return [...new Uint8Array(sig)].map((o) => o.toString(16).padStart(2, '0')).join('');
}

/**
 * @param corps      le corps BRUT de la requête — pas l'objet reparsé : la signature porte sur les
 *                   octets exacts, et re-sérialiser un JSON change l'ordre ou les espaces.
 * @param entete     valeur de l'en-tête `stripe-signature`
 * @param secret     `STRIPE_WEBHOOK_SECRET` (variable d'environnement)
 * @param maintenant horodatage en secondes, injecté pour que les tests soient déterministes
 * @param tolerance  fenêtre acceptée, en secondes (5 minutes, la valeur recommandée par Stripe)
 */
export async function verifier(
  corps: string,
  entete: string | null,
  secret: string | undefined,
  maintenant: number = Math.floor(Date.now() / 1000),
  tolerance = 300,
): Promise<Verdict> {
  if (!secret) return { ok: false, code: 503, motif: 'secret_absent' };
  if (!entete) return { ok: false, code: 400, motif: 'signature_absente' };

  const parse = analyserEntete(entete);
  if (!parse) return { ok: false, code: 400, motif: 'entete_illisible' };

  const age = Math.abs(maintenant - parse.t);
  if (age > tolerance) return { ok: false, code: 400, motif: 'horodatage_hors_tolerance' };

  const attendue = await hmacHex(secret, `${parse.t}.${corps}`);
  // Une seule signature valide suffit : Stripe en envoie plusieurs pendant une rotation de secret.
  let valide = false;
  for (const s of parse.signatures) if (egalConstant(attendue, s)) valide = true;
  if (!valide) return { ok: false, code: 400, motif: 'signature_invalide' };

  try {
    return { ok: true, evenement: JSON.parse(corps) };
  } catch {
    return { ok: false, code: 400, motif: 'corps_illisible' };
  }
}
