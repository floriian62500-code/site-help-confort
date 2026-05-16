#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit RGPD strict — état par défaut consent (sonde P15).

Vérifie que `assets/hc-consent.js` ne dépose AUCUN cookie ni AUCUNE entrée
localStorage/sessionStorage tant que l'utilisateur n'a pas explicitement
cliqué sur "Accepter" (état par défaut = aucun traceur).

Vérifie également que `assets/tracking.js` est correctement gaté par un
test `localStorage.getItem('hc-consent') === 'granted'` en TÊTE de fichier
(early return si pas de consent), avant tout chargement GTM/GA4/Clarity.

Méthode : pour chaque écriture de stockage (`localStorage.setItem`,
`sessionStorage.setItem`, `document.cookie =`, `localStorage.removeItem`,
`indexedDB.open`), on remonte la pile de fonctions englobantes via un
parser à compteur d'accolades (string-aware, comment-aware) et on classe
l'appel selon l'origine de son exécution :

  ✅ OK   — déclenché par une action utilisateur explicite :
            • à l'intérieur d'un addEventListener('click', ...)
            • à l'intérieur de `persist(...)` (appelée uniquement par les
              listeners click Accepter/Refuser)
            • à l'intérieur de `hcConsentReset(...)` (exposée pour relire
              les préférences depuis mentions-legales)
  ❌ KO   — exécuté au chargement (IIFE, DOMContentLoaded, build, etc.)

Sorties :
  - admin-pro/audits/audit_consent_default_state_report.md
  - admin-pro/audits/audit_consent_default_state_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_consent_default_state_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_consent_default_state_report.json"

# Fichiers JS auditer (chemin relatif depuis ROOT)
CONSENT_JS = ROOT / "assets" / "hc-consent.js"
TRACKING_JS = ROOT / "assets" / "tracking.js"

# Fonctions considérées comme déclenchées par action utilisateur explicite.
# Tout storage-write à l'intérieur de ces scopes est OK.
USER_TRIGGERED_FUNCTIONS = {
    "persist",          # appelée uniquement par click Accept/Refuse
    "hcConsentReset",   # exposée pour rouvrir le banner
}

# Patterns d'écriture stockage à détecter (le pattern de cookie set est
# strict pour éviter les faux positifs sur la lecture `var x = document.cookie`).
STORAGE_WRITES = [
    ("localStorage.setItem",    re.compile(r"\blocalStorage\s*\.\s*setItem\s*\(")),
    ("localStorage.removeItem", re.compile(r"\blocalStorage\s*\.\s*removeItem\s*\(")),
    ("localStorage.clear",      re.compile(r"\blocalStorage\s*\.\s*clear\s*\(")),
    ("sessionStorage.setItem",  re.compile(r"\bsessionStorage\s*\.\s*setItem\s*\(")),
    ("sessionStorage.removeItem", re.compile(r"\bsessionStorage\s*\.\s*removeItem\s*\(")),
    ("document.cookie=",        re.compile(r"\bdocument\s*\.\s*cookie\s*=\s*(?!=)")),
    ("indexedDB.open",          re.compile(r"\bindexedDB\s*\.\s*open\s*\(")),
]


def strip_comments_and_strings(src: str) -> str:
    """Remplace les chaînes et les commentaires par des espaces (en gardant
    les positions de caractères et les retours à la ligne) pour que les
    regex et le compteur d'accolades n'aient pas de faux positifs."""
    out = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        # Commentaire ligne //
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            while i < n and src[i] != "\n":
                out.append(" ")
                i += 1
            continue
        # Commentaire bloc /* ... */
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            out.append("  ")
            i += 2
            while i < n - 1 and not (src[i] == "*" and src[i + 1] == "/"):
                out.append("\n" if src[i] == "\n" else " ")
                i += 1
            if i < n - 1:
                out.append("  ")
                i += 2
            continue
        # Chaînes ' " `
        if c in ("'", '"', "`"):
            quote = c
            out.append(" ")
            i += 1
            while i < n and src[i] != quote:
                if src[i] == "\\" and i + 1 < n:
                    out.append("  ")
                    i += 2
                    continue
                out.append("\n" if src[i] == "\n" else " ")
                i += 1
            if i < n:
                out.append(" ")
                i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


# Matche une déclaration de fonction nommée ou affectation `name = function(`.
# Le nom est capturé pour la classification.
FUNC_DECL = re.compile(
    r"(?:\bfunction\s+([A-Za-z_$][\w$]*)\s*\("                  # function NAME(
    r"|"
    r"(?:^|[\s;{,])(?:var|let|const)?\s*"
    r"(?:window\s*\.\s*)?([A-Za-z_$][\w$]*)\s*=\s*function\s*[A-Za-z_$]*\s*\(" # name = function(
    r")",
    re.M,
)

# Matche `addEventListener('click', ...)` ou similaire — la callback qui
# suit ouvre un nouveau scope tagué `__click_handler__`.
EVENT_LISTENER = re.compile(
    r"\.\s*addEventListener\s*\(\s*['\"]"
    r"(click|change|submit|input|keydown|keyup|keypress|focus|blur|"
    r"touchstart|touchend|pointerdown|pointerup)"
    r"['\"]"
    r"\s*,\s*function\b",
    re.I,
)


def parse_scopes(clean: str):
    """Parse le source nettoyé et retourne, pour chaque caractère du source,
    le NOM de la fonction englobante (string) — ou '<top>' si on est dans
    l'IIFE racine.

    Retourne une liste `scope_at` de longueur len(clean) où
    scope_at[i] = nom du scope englobant à la position i."""
    n = len(clean)
    scope_at = [None] * n  # rempli après

    # Pile de scopes : chaque entrée = (nom, depth_a_l_ouverture)
    stack = ["<top>"]
    depth = 0
    # Map depth_a_l_ouverture -> index dans stack (pour popper proprement
    # quand l'accolade se referme)
    depth_of_open = [0]  # depth_of_open[k] = depth quand stack[k] a été push

    # Pré-calcul des positions où une nouvelle fonction commence : on
    # cherche `function NAME(` ou `NAME = function(` ou `addEventListener(...,
    # function ...`. Pour chaque match, la prochaine `{` après le match
    # ouvre le scope nommé.
    pending_scope_open = {}  # position de `{` attendue -> nom de scope

    # On scanne le source. Pour chaque accolade ouvrante, on regarde si une
    # déclaration de fonction se trouve juste avant (dans la même
    # "déclaration") sans `{` intermédiaire.
    # Plus simple : on collecte d'abord toutes les positions de fonctions,
    # puis on associe chaque `{` au nom de la fonction qui le précède
    # immédiatement.

    func_positions = []  # liste (pos_apres_paren_fermante_approx, nom)
    for m in FUNC_DECL.finditer(clean):
        name = m.group(1) or m.group(2) or "<anonymous>"
        func_positions.append((m.end(), name))
    for m in EVENT_LISTENER.finditer(clean):
        func_positions.append((m.end(), "<click_handler>"))

    func_positions.sort()

    # Pour associer une accolade ouvrante à un nom, on prend la fonction la
    # plus récente dont la fin est avant cette accolade ET qu'aucune autre
    # `{` n'est venue entre les deux.
    last_func_idx = -1
    # On scanne caractère par caractère pour gérer les accolades.
    func_iter_idx = 0
    func_count = len(func_positions)

    for i, c in enumerate(clean):
        # Avancer le pointeur de fonctions jusqu'à inclure toutes les
        # fonctions dont la fin est <= i.
        while func_iter_idx < func_count and func_positions[func_iter_idx][0] <= i:
            last_func_idx = func_iter_idx
            func_iter_idx += 1

        scope_at[i] = stack[-1]

        if c == "{":
            depth += 1
            # Est-ce que ce `{` ouvre une fonction ?
            if last_func_idx >= 0:
                # Vérifier qu'aucune `{` n'est venue entre la fin de la
                # fonction et ce `{` (sinon c'est un bloc inner)
                # → on consomme cette fonction
                func_end_pos = func_positions[last_func_idx][0]
                # Compter les `{` entre func_end_pos et i (exclus)
                inner_braces = sum(1 for k in range(func_end_pos, i) if clean[k] == "{")
                if inner_braces == 0:
                    name = func_positions[last_func_idx][1]
                    stack.append(name)
                    depth_of_open.append(depth)
                    last_func_idx = -1  # consommé
                else:
                    # bloc anonyme {}
                    pass
        elif c == "}":
            # Fermer le scope si c'est l'accolade de la fonction du sommet
            if len(depth_of_open) > 1 and depth_of_open[-1] == depth:
                stack.pop()
                depth_of_open.pop()
            depth -= 1
            if depth < 0:
                depth = 0
    return scope_at


def line_of(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def scan_file_for_writes(path: pathlib.Path):
    """Retourne (findings, ok_writes, errored) :
       findings = liste de dicts {line, kind, snippet, scope, why}
       ok_writes = nombre d'écritures dans des scopes user-triggered
       errored = bool si le fichier n'existe pas."""
    if not path.exists():
        return None, 0, True

    raw = path.read_text(encoding="utf-8", errors="replace")
    clean = strip_comments_and_strings(raw)
    # Garde-fou : longueurs identiques
    assert len(clean) == len(raw), f"clean/raw mismatch on {path.name}"

    scope_at = parse_scopes(clean)

    findings = []
    ok_writes = 0

    for kind, pat in STORAGE_WRITES:
        for m in pat.finditer(clean):
            pos = m.start()
            scope = scope_at[pos] if pos < len(scope_at) else "<unknown>"

            # Le scope direct doit être USER-TRIGGERED ou un descendant d'un
            # tel scope. On considère également <click_handler> comme OK.
            scope_norm = scope or "<top>"
            is_user_triggered = (
                scope_norm in USER_TRIGGERED_FUNCTIONS
                or scope_norm == "<click_handler>"
            )

            snippet = raw[max(0, pos - 5): pos + 70].replace("\n", " ⏎ ")
            entry = {
                "line": line_of(raw, pos),
                "kind": kind,
                "scope": scope_norm,
                "snippet": snippet.strip(),
            }
            if is_user_triggered:
                ok_writes += 1
            else:
                entry["why"] = (
                    f"Storage write hors d'un scope user-triggered "
                    f"(scope = `{scope_norm}` — attendu : persist / hcConsentReset / click handler)"
                )
                findings.append(entry)
    return findings, ok_writes, False


# Heuristique tracking.js : la garde de consent doit être dans les 50
# premières lignes (after IIFE wrapper).
TRACKING_GUARD_PAT = re.compile(
    r"getItem\(\s*['\"]hc-consent['\"]\s*\).*?(?:!==?\s*['\"]granted['\"]|===?\s*['\"]granted['\"])",
    re.S,
)
TRACKING_RETURN_AFTER_GUARD = re.compile(r"\breturn\b", re.M)


def audit_tracking_guard(path: pathlib.Path):
    """Vérifie que tracking.js a bien un test consent + return en tête."""
    if not path.exists():
        return {"file": path.name, "exists": False, "guard_ok": False,
                "reason": "Fichier absent (pas de tracking installé)"}

    raw = path.read_text(encoding="utf-8", errors="replace")
    head = "\n".join(raw.splitlines()[:80])  # 80 premières lignes

    m = TRACKING_GUARD_PAT.search(head)
    if not m:
        return {
            "file": path.name,
            "exists": True,
            "guard_ok": False,
            "reason": "Aucun test `localStorage.getItem('hc-consent')` détecté en tête de fichier (≤ 80 lignes)",
        }

    # Vérifier qu'un `return` suit la garde dans les 15 lignes après le match
    after = head[m.end(): m.end() + 600]
    if not TRACKING_RETURN_AFTER_GUARD.search(after):
        return {
            "file": path.name,
            "exists": True,
            "guard_ok": False,
            "reason": "Test consent trouvé mais aucun `return` dans les 15 lignes suivantes — la garde ne court-circuite pas le tracking",
        }

    return {
        "file": path.name,
        "exists": True,
        "guard_ok": True,
        "reason": "Garde consent + return détectés en tête de fichier ✓",
    }


def main() -> int:
    # 1) audit principal : hc-consent.js
    consent_findings, consent_ok, missing = scan_file_for_writes(CONSENT_JS)
    if missing:
        OUT_MD.write_text(
            f"# 🔒 Audit RGPD strict — état par défaut consent\n\n"
            f"❌ Fichier introuvable : `{CONSENT_JS.relative_to(ROOT)}`\n",
            encoding="utf-8",
        )
        OUT_JSON.write_text(json.dumps({
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "error": f"{CONSENT_JS.relative_to(ROOT)} introuvable",
        }, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"ERREUR : {CONSENT_JS} introuvable")
        return 2

    # 2) audit auxiliaire : tracking.js doit avoir une garde consent
    tracking = audit_tracking_guard(TRACKING_JS)

    # 3) rapport markdown
    lines = []
    lines.append("# 🔒 Audit RGPD strict — état par défaut consent")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append("**Règle vérifiée :** aucun cookie / localStorage / sessionStorage")
    lines.append("ne doit être posé tant que l'utilisateur n'a pas explicitement")
    lines.append("cliqué sur **Accepter** (ou ouvert le banner via `hcConsentReset`).")
    lines.append("")

    # Section 1 — hc-consent.js
    lines.append("## 1️⃣ `assets/hc-consent.js`")
    lines.append("")
    if not consent_findings:
        lines.append(f"✅ **OK** — {consent_ok} écriture(s) de stockage détectée(s),")
        lines.append("toutes dans un scope user-triggered (`persist` / `hcConsentReset` / click handler).")
        lines.append("")
    else:
        lines.append(f"❌ **{len(consent_findings)} alerte(s)** — écriture(s) hors d'un scope user-triggered :")
        lines.append("")
        for f in consent_findings:
            lines.append(f"- L{f['line']} (`{f['kind']}`) — scope=`{f['scope']}`")
            lines.append(f"  - {f['why']}")
            lines.append(f"  - `{f['snippet']}`")
        lines.append("")

    # Section 2 — tracking.js
    lines.append("## 2️⃣ `assets/tracking.js` — garde consent")
    lines.append("")
    if tracking["guard_ok"]:
        lines.append(f"✅ **OK** — {tracking['reason']}")
    else:
        if not tracking.get("exists"):
            lines.append(f"ℹ️ {tracking['reason']}")
        else:
            lines.append(f"❌ **ALERTE** — {tracking['reason']}")
    lines.append("")

    # Bilan
    total_alerts = len(consent_findings) + (0 if tracking["guard_ok"] or not tracking.get("exists") else 1)
    lines.append("---")
    lines.append("")
    if total_alerts == 0:
        lines.append("## 🎯 Bilan : conforme RGPD strict ✓")
    else:
        lines.append(f"## ⚠️ Bilan : {total_alerts} alerte(s) — risque CNIL")
    lines.append("")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    # JSON
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "consent_js": {
            "file": str(CONSENT_JS.relative_to(ROOT)),
            "writes_ok": consent_ok,
            "writes_alerts": len(consent_findings),
            "findings": consent_findings,
        },
        "tracking_js": tracking,
        "total_alerts": total_alerts,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"consent: ok={consent_ok} alerts={len(consent_findings)} | tracking_guard={tracking['guard_ok']}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if total_alerts == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
