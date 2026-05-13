#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
centralize-tracking.py — Remplace les blocs de tracking inline (GTM/GA4/Clarity)
par un unique <script src="/assets/tracking.js" defer></script>.

Aussi : supprime le <noscript> iframe GTM (inutile tant que tracking inerte).

Idempotent : si la page contient déjà le include de tracking.js, on saute.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Bloc tracking inline : du marqueur <!-- HC-TRACKING-V1 --> jusqu'à la fin
# du dernier script Clarity (avant </script> + ligne vide ou meta og).
# On cible le bloc exact présent sur toutes les pages.
TRACKING_BLOCK_RX = re.compile(
    r"<!--\s*HC-TRACKING-V1\s*-->.*?</script>\s*\n\s*\n",
    re.DOTALL,
)

# Fallback : ancien format sans marqueur HC-TRACKING-V1
LEGACY_BLOCK_RX = re.compile(
    r"<!--\s*Google Tag Manager.*?</script>\s*\n"
    r"(?:\s*<!--\s*End Google Tag Manager\s*-->\s*\n)?"
    r"\s*<!--\s*Google Analytics 4.*?</script>\s*\n"
    r"(?:\s*<!--\s*Microsoft Clarity.*?</script>\s*\n)?",
    re.DOTALL,
)

NOSCRIPT_GTM_RX = re.compile(
    r"<!--\s*HC-GTM-NOSCRIPT-V1\s*-->\s*\n"
    r"<noscript><iframe src=\"https://www\.googletagmanager\.com/ns\.html\?id=GTM-XXXXXXX\""
    r"[^<]*</iframe></noscript>\s*\n",
    re.DOTALL,
)

# Fallback noscript sans marqueur
LEGACY_NOSCRIPT_RX = re.compile(
    r"<noscript><iframe src=\"https://www\.googletagmanager\.com/ns\.html\?id=GTM-XXXXXXX\""
    r"[^<]*</iframe></noscript>\s*\n",
    re.DOTALL,
)

REPLACEMENT = (
    '<!-- HC-TRACKING-V2 (centralisé dans assets/tracking.js) -->\n'
    '<script src="/assets/tracking.js" defer></script>\n\n'
)


def process(path: Path) -> tuple[bool, str]:
    text = path.read_text(encoding="utf-8")
    original = text

    # Idempotence : on ne touche pas si déjà migré.
    if "HC-TRACKING-V2" in text and "G-XXXXXXXXXX" not in text and "GTM-XXXXXXX" not in text:
        return False, "déjà migré"

    # Remplace bloc tracking
    new_text, n1 = TRACKING_BLOCK_RX.subn(REPLACEMENT, text)
    if n1 == 0:
        new_text, n1 = LEGACY_BLOCK_RX.subn(REPLACEMENT, new_text)

    # Supprime noscript GTM (tracking inerte => iframe inutile)
    new_text, n2 = NOSCRIPT_GTM_RX.subn("", new_text)
    if n2 == 0:
        new_text, n2 = LEGACY_NOSCRIPT_RX.subn("", new_text)

    if new_text == original:
        return False, "aucun bloc tracking trouvé"

    # Sauvegarde
    path.write_text(new_text, encoding="utf-8")
    return True, f"refactoré (blocs: {n1}, noscript: {n2})"


def main():
    # Cible : toutes les pages HTML qui contiennent les placeholders
    # MAIS pas les fichiers de documentation (wizard-ga4.html notamment)
    EXCLUDE = {
        "admin-pro/wizard-ga4.html",      # doc d'activation : mention légitime
    }

    targets = []
    for p in ROOT.rglob("*.html"):
        rel = str(p.relative_to(ROOT))
        if "/.git/" in str(p) or "/node_modules/" in str(p) or "/scripts/tmp/" in str(p):
            continue
        if rel in EXCLUDE:
            continue
        try:
            t = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if "GTM-XXXXXXX" in t or "G-XXXXXXXXXX" in t or "CLARITY_ID" in t:
            targets.append(p)

    print(f"[centralize-tracking] {len(targets)} pages à traiter")
    ok = 0
    skipped = 0
    failed = []
    for p in targets:
        try:
            changed, msg = process(p)
            rel = p.relative_to(ROOT)
            if changed:
                ok += 1
                print(f"  ✓ {rel}  ({msg})")
            else:
                skipped += 1
                print(f"  - {rel}  ({msg})")
                failed.append(str(rel))
        except Exception as e:
            print(f"  ✗ {p.relative_to(ROOT)}  ERREUR: {e}")
            failed.append(str(p.relative_to(ROOT)))

    print(f"\n[centralize-tracking] OK: {ok}  ·  Sautées: {skipped}")
    if failed:
        print("\nFichiers sans bloc tracking détecté (à inspecter manuellement) :")
        for f in failed:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
