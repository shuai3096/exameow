#!/usr/bin/env bash
set -euo pipefail

SDK="$HOME/Library/Android/sdk"
AVD_NAME="${1:-test}"

echo "=== Starting Android Emulator (AVD: $AVD_NAME) ==="

# 1. Start emulator in background
echo "[1/3] Launching emulator..."
"$SDK/emulator/emulator" -avd "$AVD_NAME" -no-snapshot-load &
EMULATOR_PID=$!

# 2. Wait for boot
echo "[2/3] Waiting for device to boot..."
"$SDK/platform-tools/adb" wait-for-device
while true; do
  BOOT=$("$SDK/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
  if [ "$BOOT" = "1" ]; then
    break
  fi
  sleep 2
done
echo "Device booted."

# 3. Install latest APK if available
APK=$(ls -t test/Exameow-*-arm64.apk 2>/dev/null | head -1)
if [ -n "$APK" ]; then
  echo "[3/3] Installing $APK..."
  "$SDK/platform-tools/adb" install -r "$APK"
  echo "Done. Exameow is ready."
else
  echo "[3/3] No APK found in test/, skip install."
fi
