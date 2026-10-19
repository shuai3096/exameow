#!/usr/bin/env bash
# OTA minShell guard: fails the release if the frontend invokes Tauri commands
# that did not exist in the previous release tag's native code, unless
# ota.json's minShell has been raised to >= the version being released.
#
# Usage: bash scripts/check-ota-minshell.sh <version-without-v>
# Requires: git tags fetched (actions/checkout fetch-depth: 0), python3.
set -euo pipefail

VERSION="${1:?usage: bash scripts/check-ota-minshell.sh <version>}"
MIN_SHELL=$(python3 -c "import json;print(json.load(open('ota.json'))['minShell'])")

PREV_TAG="${OTA_CHECK_PREV_TAG:-$(git tag --sort=-v:refname | grep -vx "v${VERSION}" | head -1 || true)}"
if [ -z "$PREV_TAG" ]; then
  echo "check-ota-minshell: no previous tag found, skipping"
  exit 0
fi
echo "check-ota-minshell: releasing v${VERSION}, previous tag ${PREV_TAG}, minShell ${MIN_SHELL}"

# All Tauri commands invoked by the frontend
CMDS=$(grep -rhoE "invoke(<[^>]*>)?\(\s*'[a-z_]+'" frontend/src | grep -oE "'[a-z_]+'" | tr -d "'" | sort -u)

NEW_CMDS=()
for cmd in $CMDS; do
  # Command considered present in the old shell if its name appears in the old
  # tag's native sources (lib.rs generate_handler / command fn / plugin code)
  if ! git grep -qw "$cmd" "$PREV_TAG" -- src-tauri plugins 2>/dev/null; then
    NEW_CMDS+=("$cmd")
  fi
done

if [ ${#NEW_CMDS[@]} -eq 0 ]; then
  echo "check-ota-minshell: OK - no new native commands since ${PREV_TAG}"
  exit 0
fi

echo "check-ota-minshell: frontend invokes native commands NOT present in ${PREV_TAG}:"
printf '  - %s\n' "${NEW_CMDS[@]}"

# New commands first ship in the APK of THIS version, so minShell must be >= VERSION
if [ "$(printf '%s\n%s\n' "$VERSION" "$MIN_SHELL" | sort -V | head -1)" = "$VERSION" ]; then
  echo "check-ota-minshell: OK - minShell ${MIN_SHELL} >= ${VERSION}, old shells will be gated out"
  exit 0
fi

echo "check-ota-minshell: FAIL - ota.json minShell is ${MIN_SHELL}, but these commands require shell >= ${VERSION}."
echo "  Fix: set \"minShell\": \"${VERSION}\" in ota.json, commit, and re-tag."
exit 1
