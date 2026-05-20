#!/usr/bin/env bash
set -euo pipefail

cd /repo

export NOVA_AI_STATE_DIR="/tmp/nova-ai-test"
export NOVA_AI_CONFIG_PATH="${NOVA_AI_STATE_DIR}/nova-ai.json"

echo "==> Build"
if ! pnpm build >/tmp/nova-ai-cleanup-build.log 2>&1; then
  cat /tmp/nova-ai-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${NOVA_AI_STATE_DIR}/credentials"
mkdir -p "${NOVA_AI_STATE_DIR}/agents/main/sessions"
echo '{}' >"${NOVA_AI_CONFIG_PATH}"
echo 'creds' >"${NOVA_AI_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${NOVA_AI_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm nova-ai reset --scope config+creds+sessions --yes --non-interactive >/tmp/nova-ai-cleanup-reset.log 2>&1; then
  cat /tmp/nova-ai-cleanup-reset.log
  exit 1
fi

test ! -f "${NOVA_AI_CONFIG_PATH}"
test ! -d "${NOVA_AI_STATE_DIR}/credentials"
test ! -d "${NOVA_AI_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${NOVA_AI_STATE_DIR}/credentials"
echo '{}' >"${NOVA_AI_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm nova-ai uninstall --state --yes --non-interactive >/tmp/nova-ai-cleanup-uninstall.log 2>&1; then
  cat /tmp/nova-ai-cleanup-uninstall.log
  exit 1
fi

test ! -d "${NOVA_AI_STATE_DIR}"

echo "OK"
