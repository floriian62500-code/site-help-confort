#!/usr/bin/env python3
"""
sync-reviews.py
═══════════════════════════════════════════════════════════════════════
Re-scrape les nouveaux avis Google Business Profile (et FB rating
agrégé) en déclenchant l'Edge Function `sync-reviews` de Supabase, qui
upserte dans la table `public.reviews` (clé unique source+source_id).

Architecture :
  ┌─────────────────────────┐         ┌─────────────────────────┐
  │ scripts/sync-reviews.py │  POST   │ Edge Fn sync-reviews    │
  │ (déclencheur hebdo)     │ ──────► │ + GBP API + app_settings│
  └─────────────────────────┘         └────────────┬────────────┘
                                                   │ upsert
                                                   ▼
                                          public.reviews (Supabase)

Un cron PG (`auto-sync-reviews`) tourne déjà toutes les 6h via pg_cron.
Ce script est un FALLBACK manuel/hebdo (cf. AGENT_TODO P9) :
  - utile quand pg_cron est désactivé / Vault expirée
  - utile pour forcer un rafraîchissement à la demande
  - utile pour planifier un appel local (cron macOS / launchd)

IDEMPOTENT : l'Edge Function utilise upsert ON CONFLICT (source,source_id)
donc rejouer le script ne crée jamais de doublon.

Usage :
  python3 scripts/sync-reviews.py                    # synchro normale
  python3 scripts/sync-reviews.py --dry-run          # affiche la cmd sans appeler
  python3 scripts/sync-reviews.py --quiet            # exit code uniquement (cron)
  python3 scripts/sync-reviews.py --report-only      # affiche les compteurs DB
                                                     # sans relancer la sync

Prérequis (.env à la racine du projet) :
  SUPABASE_URL=https://btcbjwqiivhpwoszomhg.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Settings → API → service_role

Cron hebdo macOS (lundi 8h) :
  crontab -e
  0 8 * * 1  cd /Users/HP/Documents/Claude/Projects/SITE\\ INTERNET \\
             && /usr/bin/python3 scripts/sync-reviews.py --quiet \\
             >> /tmp/hc-sync-reviews.log 2>&1
═══════════════════════════════════════════════════════════════════════
"""
import os
import sys
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path
from urllib import request as urlrequest
from urllib import error as urlerror

# ────────────────────────────────────────────────
# .env loader (sans dépendance)
# ────────────────────────────────────────────────
SITE_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = SITE_ROOT / ".env"
if ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://btcbjwqiivhpwoszomhg.supabase.co").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

FN_URL = f"{SUPABASE_URL}/functions/v1/sync-reviews"
REST_URL = f"{SUPABASE_URL}/rest/v1/reviews"

# ────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────
ap = argparse.ArgumentParser(description="Trigger Supabase sync-reviews Edge Function (fallback du cron 6h).")
ap.add_argument("--dry-run", action="store_true", help="Affiche la commande sans appeler l'API")
ap.add_argument("--quiet", action="store_true", help="Sortie minimale (cron-friendly)")
ap.add_argument("--report-only", action="store_true", help="Affiche le décompte DB sans relancer la sync")
ap.add_argument("--timeout", type=int, default=120, help="Timeout HTTP (sec, défaut 120)")
args = ap.parse_args()


def log(msg, level="info"):
    if args.quiet and level == "info":
        return
    prefix = {"info": "  ", "ok": "✓ ", "warn": "⚠ ", "err": "✗ ", "head": "→ "}.get(level, "")
    print(prefix + msg, flush=True)


def fail(msg, code=1):
    print(f"✗ {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


# ────────────────────────────────────────────────
# DB report (avant/après) — compteurs reviews par source
# ────────────────────────────────────────────────
def db_count(extra_query=""):
    """Retourne le nombre total de reviews (ou filtré)."""
    if not SERVICE_KEY:
        return None
    url = f"{REST_URL}?select=count{extra_query}"
    req = urlrequest.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "count=exact",
        "Range": "0-0",
    })
    try:
        with urlrequest.urlopen(req, timeout=20) as r:
            cr = r.headers.get("content-range", "")
            if "/" in cr:
                return int(cr.split("/")[-1])
    except Exception:
        return None
    return None


def db_report():
    total = db_count()
    google = db_count("&source=eq.google")
    fb = db_count("&source=eq.facebook")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_n = db_count(f"&synced_at=gte.{today}T00:00:00Z")
    return {
        "total": total,
        "google": google,
        "facebook": fb,
        "synced_today": today_n,
    }


# ────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────
def main():
    log(f"sync-reviews.py @ {datetime.now().isoformat(timespec='seconds')}", "head")
    log(f"Endpoint   : {FN_URL}")

    if not SERVICE_KEY:
        fail("SUPABASE_SERVICE_ROLE_KEY manquant — ajouter dans .env (cf. Settings → API → service_role)")

    if args.report_only:
        log("Mode --report-only : pas d'appel API, lecture DB seulement.", "head")
        report = db_report()
        for k, v in report.items():
            log(f"{k:<14}: {v}", "ok" if v is not None else "warn")
        return 0

    if args.dry_run:
        log("Mode --dry-run : commande non exécutée.", "warn")
        log(f'curl -X POST "{FN_URL}" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" -d \'{{}}\'')
        return 0

    before = db_report()
    log(f"DB avant   : total={before['total']} google={before['google']} fb={before['facebook']}")

    # ── Appel Edge Function ────────────────────────
    payload = json.dumps({}).encode("utf-8")
    req = urlrequest.Request(FN_URL, data=payload, method="POST", headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    })
    try:
        with urlrequest.urlopen(req, timeout=args.timeout) as r:
            raw = r.read().decode("utf-8")
            status = r.status
    except urlerror.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        fail(f"HTTP {e.code} sur sync-reviews → {body[:200]}", code=2)
    except urlerror.URLError as e:
        fail(f"Erreur réseau : {e.reason}", code=3)
    except Exception as e:
        fail(f"Erreur inattendue : {e}", code=4)

    try:
        data = json.loads(raw)
    except Exception:
        fail(f"Réponse non-JSON ({status}) : {raw[:200]}", code=5)

    if not data.get("success"):
        fail(f"Edge function a renvoyé une erreur : {data.get('error') or raw[:200]}", code=6)

    res = data.get("results", {})
    gsync = (res.get("google") or {}).get("synced", 0)
    gerr = (res.get("google") or {}).get("errors") or []
    fbagg = (res.get("facebook") or {}).get("aggregate") or {}
    fberr = (res.get("facebook") or {}).get("errors") or []

    after = db_report()
    delta = (after["total"] or 0) - (before["total"] or 0)

    log(f"Google sync: {gsync} upsert(s){' — ' + str(len(gerr)) + ' erreur(s)' if gerr else ''}", "ok" if not gerr else "warn")
    by_loc = (res.get("google") or {}).get("byLocation") or {}
    for agence, info in by_loc.items():
        log(f"   • {agence:<11}: fetched={info.get('fetched',0)} synced={info.get('synced',0)} errors={len(info.get('errors',[]))}")
    if fbagg:
        log(f"Facebook   : rating={fbagg.get('rating')} count={fbagg.get('count')}")
    elif fberr:
        log(f"Facebook   : erreur — {fberr[0][:100]}", "warn")
    log(f"DB après   : total={after['total']} (Δ {delta:+d})", "ok")
    log(f"Synced @   : {data.get('synced_at')}", "info")

    for e in gerr:
        log(e, "err")
    return 0 if not (gerr) else 0  # erreur partielle = OK pour le cron


if __name__ == "__main__":
    sys.exit(main())
