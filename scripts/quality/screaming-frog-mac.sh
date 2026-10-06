#!/bin/sh
set -eu

APP="/Applications/Screaming Frog SEO Spider.app/Contents/MacOS/ScreamingFrogSEOSpiderLauncher"
OUT="${1:-$HOME/Desktop/help-confort-screaming-frog}"

if [ ! -x "$APP" ]; then
  echo "Screaming Frog n'est pas installe dans /Applications."
  echo "Installe-le, ouvre-le une premiere fois, puis relance ce script."
  exit 2
fi

mkdir -p "$OUT"

"$APP" --crawl "https://depan59-62.fr/" --headless --save-crawl --output-folder "$OUT" --export-tabs "Internal:All,Response Codes:Client Error (4xx)"

echo "Rapports disponibles dans: $OUT"