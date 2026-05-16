#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
generate-dashboard.py
---------------------
Génère un dashboard HTML statique à partir des fichiers témoins produits par
health-wrapper.sh (Phase 4). Le HTML est autonome (CSS inline, JS minimal,
aucune dépendance réseau).

Usage :
    HC_LOG_DIR=... HC_DASHBOARD_OUTPUT=... python3 generate-dashboard.py

Sortie par défaut : ~/Documents/HelpConfort/dashboard-automation.html
"""

import json
import os
import datetime as dt
from pathlib import Path

HOME = Path.home()
LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
HEALTH_DIR = LOG_DIR / "health"
OUTPUT = Path(
    os.environ.get(
        "HC_DASHBOARD_OUTPUT",
        HOME / "Documents/HelpConfort/dashboard-automation.html",
    )
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)


def lire_statut_global() -> dict:
    """Charge statut-health.json si présent, sinon dict vide."""
    p = HEALTH_DIR / "statut-health.json"
    if not p.exists():
        return {"scripts": [], "verifie_le": "—", "anomalies": 0, "_aucune_donnee": True}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {"scripts": [], "verifie_le": "(erreur)", "anomalies": 0, "_aucune_donnee": True}


def formater_date(iso: str) -> str:
    if not iso or iso == "—":
        return "—"
    try:
        import re
        s = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", iso)
        d = dt.datetime.fromisoformat(s)
        return d.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return iso


def couleur_statut(statut: str) -> tuple[str, str]:
    """Retourne (couleur, label_humain)."""
    return {
        "ok":              ("#1f9d55", "OK"),
        "absent":          ("#9ca3af", "Témoin absent"),
        "manque-creneau":  ("#dd6b20", "Manqué un créneau"),
        "echec-dernier-run": ("#c53030", "Dernier run en échec"),
        "corrompu":        ("#c53030", "Témoin corrompu"),
        "date-invalide":   ("#dd6b20", "Date illisible"),
    }.get(statut, ("#4a5568", statut))


def formater_duree(secondes) -> str:
    if secondes is None:
        return "—"
    if secondes < 60:
        return f"{secondes} s"
    m, s = divmod(int(secondes), 60)
    if m < 60:
        return f"{m} min {s:02d} s"
    h, m = divmod(m, 60)
    return f"{h} h {m:02d} min"


def lire_log_slack(n: int = 20) -> list[str]:
    p = LOG_DIR / "slack-notifications.log"
    if not p.exists():
        return []
    lignes = p.read_text(encoding="utf-8", errors="ignore").splitlines()
    return lignes[-n:][::-1]  # plus récentes d'abord


# -----------------------------------------------------------------------------
def main() -> None:
    statut = lire_statut_global()
    scripts = statut.get("scripts", [])
    aucune_donnee = statut.get("_aucune_donnee", False)

    # Robustesse : anomalies peut être absent ou mal typé
    try:
        anomalies = int(statut.get("anomalies", 0))
    except (TypeError, ValueError):
        anomalies = 0

    if aucune_donnee:
        bandeau_couleur = "#9ca3af"
        bandeau_msg = "Aucune donnée pour le moment. Le check-health n'a pas encore tourné — il s'exécute à h+35 chaque heure."
    elif anomalies == 0:
        bandeau_couleur = "#1f9d55"
        bandeau_msg = "Toutes les automatisations sont saines."
    else:
        bandeau_couleur = (
            "#c53030"
            if any(s.get("criticite") == "high" and s.get("statut") != "ok" for s in scripts)
            else "#dd6b20"
        )
        pluriel = "s" if anomalies > 1 else ""
        bandeau_msg = f"{anomalies} anomalie{pluriel} détectée{pluriel}."

    lignes_scripts = ""
    for s in scripts:
        couleur, label = couleur_statut(s.get("statut", "?"))
        derniere = formater_date(s.get("derniere_execution", ""))
        duree = formater_duree(s.get("duree_secondes"))
        exit_code = s.get("exit_code", "—")
        crit = s.get("criticite", "?")
        crit_couleur = {"high": "#c53030", "medium": "#dd6b20", "low": "#4a5568"}.get(crit, "#4a5568")

        lignes_scripts += f"""
        <tr>
          <td><strong>{s.get('nom', '?')}</strong></td>
          <td><span style="background:{crit_couleur};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">{crit}</span></td>
          <td><span style="background:{couleur};color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;">{label}</span></td>
          <td>{derniere}</td>
          <td style="text-align:right;">{duree}</td>
          <td style="text-align:right;">{exit_code}</td>
        </tr>"""

    lignes_alertes = ""
    for ligne in lire_log_slack(15):
        ligne_html = ligne.replace("<", "&lt;").replace(">", "&gt;")
        couleur_ligne = "#9ca3af"
        if "[error]" in ligne or "[ERROR]" in ligne:
            couleur_ligne = "#c53030"
        elif "[warn]" in ligne or "[WARN]" in ligne:
            couleur_ligne = "#dd6b20"
        elif "[ok]" in ligne or "[OK]" in ligne:
            couleur_ligne = "#1f9d55"
        lignes_alertes += f'<div style="font-family:Menlo,monospace;font-size:11px;color:{couleur_ligne};padding:4px 0;border-bottom:1px solid #f1f5f9;">{ligne_html}</div>'

    if not lignes_alertes:
        lignes_alertes = '<div style="color:#9ca3af;font-style:italic;">Aucune notification enregistrée.</div>'

    genere_le = dt.datetime.now().strftime("%d/%m/%Y à %H:%M")
    verifie_le = formater_date(statut.get("verifie_le", ""))

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Help Confort — Dashboard automatisation</title>
<meta http-equiv="refresh" content="300">
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         background:#f7fafc; color:#1a202c; margin:0; padding:24px; }}
  h1 {{ font-size:24px; margin:0 0 6px; }}
  .sub {{ color:#718096; font-size:13px; margin-bottom:16px; }}
  .bandeau {{ background:{bandeau_couleur}; color:#fff; padding:14px 20px;
              border-radius:8px; margin-bottom:24px; font-weight:600; }}
  .card {{ background:#fff; border-radius:8px; padding:20px;
           box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom:24px; }}
  .card h2 {{ font-size:16px; margin:0 0 12px; color:#2d3748;
              border-bottom:1px solid #e2e8f0; padding-bottom:8px; }}
  table {{ width:100%; border-collapse:collapse; font-size:13px; }}
  th, td {{ padding:10px 8px; text-align:left; border-bottom:1px solid #edf2f7; }}
  th {{ font-weight:600; color:#4a5568; font-size:11px;
        text-transform:uppercase; letter-spacing:0.5px; }}
  tr:last-child td {{ border-bottom:none; }}
  .footer {{ text-align:center; color:#a0aec0; font-size:11px; margin-top:32px; }}
</style>
</head>
<body>

<h1>Help Confort — Automatisations</h1>
<div class="sub">Vérification automatique : {verifie_le} — Refresh page toutes les 5 minutes</div>

<div class="bandeau">{bandeau_msg}</div>

<div class="card">
  <h2>État des 8 scripts</h2>
  <table>
    <thead>
      <tr>
        <th>Script</th>
        <th>Criticité</th>
        <th>Statut</th>
        <th>Dernière exécution</th>
        <th style="text-align:right;">Durée</th>
        <th style="text-align:right;">Exit</th>
      </tr>
    </thead>
    <tbody>{lignes_scripts}
    </tbody>
  </table>
</div>

<div class="card">
  <h2>Dernières notifications Slack (15)</h2>
  {lignes_alertes}
</div>

<div class="footer">Dashboard généré le {genere_le} — source : {HEALTH_DIR}</div>

</body>
</html>"""

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Dashboard généré : {OUTPUT}")


if __name__ == "__main__":
    main()
