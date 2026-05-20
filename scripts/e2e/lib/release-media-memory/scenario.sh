#!/usr/bin/env bash
set -euo pipefail
trap "" PIPE
export TERM=xterm-256color
export NO_COLOR=1

source scripts/lib/nova-ai-e2e-instance.sh

nova-ai_e2e_eval_test_state_from_b64 "${NOVA_AI_TEST_STATE_SCRIPT_B64:?missing NOVA_AI_TEST_STATE_SCRIPT_B64}"
nova-ai_e2e_install_trash_shim

export NPM_CONFIG_PREFIX="$HOME/.npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export OPENAI_API_KEY="sk-nova-ai-release-media-memory"
export NOVA_AI_QA_ALLOW_LOCAL_IMAGE_PROVIDER=1

PORT="18789"
MOCK_PORT="44200"
SUCCESS_MARKER="NOVA_AI_E2E_OK_MEDIA_MEMORY"
MEMORY_MARKER="release-media-memory-saffron-$(date +%s)"
MOCK_REQUEST_LOG="/tmp/nova-ai-release-media-memory-openai.jsonl"
export SUCCESS_MARKER MOCK_REQUEST_LOG

mock_pid=""
gateway_pid=""
cleanup() {
  nova-ai_e2e_terminate_gateways "${gateway_pid:-}"
  nova-ai_e2e_stop_process "${mock_pid:-}"
}
trap cleanup EXIT

dump_debug_logs() {
  local status="$1"
  echo "release media memory failed with exit code $status" >&2
  nova-ai_e2e_dump_logs \
    /tmp/nova-ai-release-media-memory-install.log \
    /tmp/nova-ai-release-media-memory-onboard.log \
    /tmp/nova-ai-release-media-memory-env.log \
    /tmp/nova-ai-release-media-memory-config.json \
    /tmp/nova-ai-release-media-memory-package-files.log \
    /tmp/nova-ai-release-media-memory-plugins.json \
    /tmp/nova-ai-release-media-memory-plugins.stderr.log \
    /tmp/nova-ai-release-media-memory-openai.log \
    "$MOCK_REQUEST_LOG" \
    /tmp/nova-ai-release-media-memory-describe.json \
    /tmp/nova-ai-release-media-memory-describe.stderr.log \
    /tmp/nova-ai-release-media-memory-generate.json \
    /tmp/nova-ai-release-media-memory-generate.stderr.log \
    /tmp/nova-ai-release-media-memory-index.log \
    /tmp/nova-ai-release-media-memory-search-before.json \
    /tmp/nova-ai-release-media-memory-search-before.stderr.log \
    /tmp/nova-ai-release-media-memory-search-after.json \
    /tmp/nova-ai-release-media-memory-search-after.stderr.log \
    /tmp/nova-ai-release-media-memory-gateway-1.log \
    /tmp/nova-ai-release-media-memory-gateway-2.log
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

start_gateway() {
  local log_path="$1"
  gateway_pid="$(nova-ai_e2e_start_gateway "$entry" "$PORT" "$log_path")"
  nova-ai_e2e_wait_gateway_ready "$gateway_pid" "$log_path"
}

stop_gateway() {
  nova-ai_e2e_terminate_gateways "${gateway_pid:-}"
  gateway_pid=""
}

nova-ai_e2e_install_package /tmp/nova-ai-release-media-memory-install.log
command -v nova-ai >/dev/null
package_root="$(nova-ai_e2e_package_root)"
entry="$(nova-ai_e2e_package_entrypoint "$package_root")"
{
  printf 'nova-ai=%s\n' "$(command -v nova-ai)"
  printf 'package_root=%s\n' "$package_root"
  printf 'entry=%s\n' "$entry"
  printf 'HOME=%s\n' "$HOME"
  printf 'NOVA_AI_HOME=%s\n' "$NOVA_AI_HOME"
  printf 'NOVA_AI_STATE_DIR=%s\n' "$NOVA_AI_STATE_DIR"
  printf 'NOVA_AI_CONFIG_PATH=%s\n' "$NOVA_AI_CONFIG_PATH"
} >/tmp/nova-ai-release-media-memory-env.log
find "$package_root/dist/extensions/memory-core" -maxdepth 2 -type f -printf '%P\n' \
  | sort >/tmp/nova-ai-release-media-memory-package-files.log

mock_pid="$(nova-ai_e2e_start_mock_openai "$MOCK_PORT" /tmp/nova-ai-release-media-memory-openai.log)"
nova-ai_e2e_wait_mock_openai "$MOCK_PORT"

nova-ai onboard \
  --non-interactive \
  --accept-risk \
  --flow quickstart \
  --mode local \
  --auth-choice skip \
  --gateway-port "$PORT" \
  --gateway-bind loopback \
  --skip-daemon \
  --skip-ui \
  --skip-channels \
  --skip-skills \
  --skip-health >/tmp/nova-ai-release-media-memory-onboard.log 2>&1
cp "$NOVA_AI_CONFIG_PATH" /tmp/nova-ai-release-media-memory-config.json
nova-ai plugins list --json >/tmp/nova-ai-release-media-memory-plugins.json \
  2>/tmp/nova-ai-release-media-memory-plugins.stderr.log || true
node scripts/e2e/lib/release-scenarios/assertions.mjs configure-mock-openai "$MOCK_PORT"

mkdir -p "$NOVA_AI_STATE_DIR/workspace/memory" /tmp/nova-ai-release-media-memory
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+yf7kAAAAASUVORK5CYII=' | base64 -d > /tmp/nova-ai-release-media-memory/input.png

nova-ai infer image describe \
  --file /tmp/nova-ai-release-media-memory/input.png \
  --model openai/gpt-5.5 \
  --prompt "Describe this image and return marker $SUCCESS_MARKER" \
  --json >/tmp/nova-ai-release-media-memory-describe.json 2>/tmp/nova-ai-release-media-memory-describe.stderr.log
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-image-describe /tmp/nova-ai-release-media-memory-describe.json "$MOCK_REQUEST_LOG"

nova-ai infer image generate \
  --model openai/gpt-image-1 \
  --prompt "Generate a tiny test image for $SUCCESS_MARKER" \
  --output /tmp/nova-ai-release-media-memory/generated.png \
  --json >/tmp/nova-ai-release-media-memory-generate.json 2>/tmp/nova-ai-release-media-memory-generate.stderr.log
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-image-generate /tmp/nova-ai-release-media-memory-generate.json "$MOCK_REQUEST_LOG"

cat >"$NOVA_AI_STATE_DIR/workspace/MEMORY.md" <<EOF
# Long-term memory

- The release media memory marker is $MEMORY_MARKER.
EOF

nova-ai memory index --force >/tmp/nova-ai-release-media-memory-index.log 2>&1 || true
nova-ai memory search "$MEMORY_MARKER" --json >/tmp/nova-ai-release-media-memory-search-before.json 2>/tmp/nova-ai-release-media-memory-search-before.stderr.log
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-memory-search /tmp/nova-ai-release-media-memory-search-before.json "$MEMORY_MARKER"

start_gateway /tmp/nova-ai-release-media-memory-gateway-1.log
stop_gateway
start_gateway /tmp/nova-ai-release-media-memory-gateway-2.log
nova-ai memory search "$MEMORY_MARKER" --json >/tmp/nova-ai-release-media-memory-search-after.json 2>/tmp/nova-ai-release-media-memory-search-after.stderr.log
node scripts/e2e/lib/release-scenarios/assertions.mjs assert-memory-search /tmp/nova-ai-release-media-memory-search-after.json "$MEMORY_MARKER"
stop_gateway

echo "Release media memory scenario passed."
