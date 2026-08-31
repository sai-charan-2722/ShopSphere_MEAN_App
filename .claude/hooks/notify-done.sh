#!/usr/bin/env bash
# Stop hook — lightweight "turn finished" notification.
# Cross-platform-ish: uses a Windows toast/beep via PowerShell when available (Git Bash),
# otherwise falls back to a terminal bell. Always exits 0 so it never blocks the turn.
set -euo pipefail

msg="ShopSphere: Claude finished a turn ($(date '+%H:%M:%S'))"

if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "[console]::beep(880,180)" >/dev/null 2>&1 || true
elif command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${msg}\" with title \"ShopSphere\"" >/dev/null 2>&1 || true
elif command -v notify-send >/dev/null 2>&1; then
  notify-send "ShopSphere" "${msg}" >/dev/null 2>&1 || true
fi

printf '\a%s\n' "${msg}"
exit 0
