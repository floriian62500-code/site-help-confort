#!/bin/bash
# Installation du LaunchAgent auto-push HELP Confort
set -e

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SCRIPT="$REPO/.autopush/autopush.sh"
LOG="$REPO/.autopush/autopush.log"
LABEL="com.helpconfort.autopush"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

mkdir -p "$HOME/Library/LaunchAgents"

# (a) Écrire le plist
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>60</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>$REPO</string>
    <key>StandardOutPath</key>
    <string>$LOG</string>
    <key>StandardErrorPath</key>
    <string>$LOG</string>
</dict>
</plist>
PLIST

# (b) Charger via launchctl (unload d'abord pour idempotence)
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

# (c) Premier run immédiat pour pousser le commit en attente
bash "$SCRIPT"

# (d) Confirmation et fermeture
echo "Auto-push installé et activé"
sleep 2
osascript -e 'tell application "Terminal" to close (every window whose name contains "Install-AutoPush")' 2>/dev/null &
exit 0
