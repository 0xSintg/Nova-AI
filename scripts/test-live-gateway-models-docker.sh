#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="${NOVA_AI_LIVE_DOCKER_REPO_ROOT:-$SCRIPT_ROOT_DIR}"
ROOT_DIR="$(cd "$ROOT_DIR" && pwd)"
TRUSTED_HARNESS_DIR="${NOVA_AI_LIVE_DOCKER_TRUSTED_HARNESS_DIR:-$SCRIPT_ROOT_DIR}"
if [[ -z "$TRUSTED_HARNESS_DIR" || ! -d "$TRUSTED_HARNESS_DIR" ]]; then
  echo "ERROR: trusted live Docker harness directory not found: ${TRUSTED_HARNESS_DIR:-<empty>}." >&2
  exit 1
fi
TRUSTED_HARNESS_DIR="$(cd "$TRUSTED_HARNESS_DIR" && pwd)"
source "$TRUSTED_HARNESS_DIR/scripts/lib/live-docker-auth.sh"
IMAGE_NAME="${NOVA_AI_IMAGE:-nova-ai:local}"
LIVE_IMAGE_NAME="${NOVA_AI_LIVE_IMAGE:-${IMAGE_NAME}-live}"
CONFIG_DIR="${NOVA_AI_CONFIG_DIR:-$HOME/.nova-ai}"
WORKSPACE_DIR="${NOVA_AI_WORKSPACE_DIR:-$HOME/.nova-ai/workspace}"
PROFILE_FILE="$(nova-ai_live_default_profile_file)"
DOCKER_USER="${NOVA_AI_DOCKER_USER:-node}"
TEMP_DIRS=()
DOCKER_HOME_MOUNT=()
DOCKER_AUTH_PRESTAGED=0
DOCKER_TRUSTED_HARNESS_CONTAINER_DIR="/trusted-harness"
DOCKER_TRUSTED_HARNESS_MOUNT=(-v "$TRUSTED_HARNESS_DIR":"$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR":ro)
cleanup_temp_dirs() {
  if ((${#TEMP_DIRS[@]} > 0)); then
    rm -rf "${TEMP_DIRS[@]}"
  fi
}
trap cleanup_temp_dirs EXIT
if [[ -n "${NOVA_AI_DOCKER_CACHE_HOME_DIR:-}" ]]; then
  CACHE_HOME_DIR="${NOVA_AI_DOCKER_CACHE_HOME_DIR}"
elif nova-ai_live_is_ci; then
  CACHE_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/nova-ai-docker-cache.XXXXXX")"
  TEMP_DIRS+=("$CACHE_HOME_DIR")
else
  CACHE_HOME_DIR="$HOME/.cache/nova-ai/docker-cache"
fi
mkdir -p "$CACHE_HOME_DIR"
if nova-ai_live_is_ci; then
  DOCKER_USER="$(id -u):$(id -g)"
  DOCKER_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/nova-ai-docker-home.XXXXXX")"
  TEMP_DIRS+=("$DOCKER_HOME_DIR")
  DOCKER_HOME_MOUNT=(-v "$DOCKER_HOME_DIR":/home/node)
fi

PROFILE_MOUNT=()
PROFILE_STATUS="none"
if [[ -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
  PROFILE_STATUS="$PROFILE_FILE"
fi

AUTH_DIRS=()
AUTH_FILES=()
if [[ -n "${NOVA_AI_DOCKER_AUTH_DIRS:-}" ]]; then
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(nova-ai_live_collect_auth_dirs)
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(nova-ai_live_collect_auth_files)
elif [[ -n "${NOVA_AI_LIVE_GATEWAY_PROVIDERS:-}" ]]; then
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(nova-ai_live_collect_auth_dirs_from_csv "${NOVA_AI_LIVE_GATEWAY_PROVIDERS:-}")
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(nova-ai_live_collect_auth_files_from_csv "${NOVA_AI_LIVE_GATEWAY_PROVIDERS:-}")
else
  while IFS= read -r auth_dir; do
    [[ -n "$auth_dir" ]] || continue
    AUTH_DIRS+=("$auth_dir")
  done < <(nova-ai_live_collect_auth_dirs)
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(nova-ai_live_collect_auth_files)
fi
AUTH_DIRS_CSV=""
if ((${#AUTH_DIRS[@]} > 0)); then
  AUTH_DIRS_CSV="$(nova-ai_live_join_csv "${AUTH_DIRS[@]}")"
fi
AUTH_FILES_CSV=""
if ((${#AUTH_FILES[@]} > 0)); then
  AUTH_FILES_CSV="$(nova-ai_live_join_csv "${AUTH_FILES[@]}")"
fi

if [[ -n "${DOCKER_HOME_DIR:-}" ]]; then
  nova-ai_live_stage_auth_into_home "$DOCKER_HOME_DIR" "${AUTH_DIRS[@]}" --files "${AUTH_FILES[@]}"
  DOCKER_AUTH_PRESTAGED=1
fi
CONTAINER_NODE_OPTIONS="${NOVA_AI_DOCKER_NODE_OPTIONS:-${NODE_OPTIONS:-}}"
if [[ -z "$(nova-ai_live_trim "$CONTAINER_NODE_OPTIONS")" ]]; then
  CONTAINER_NODE_OPTIONS="--max-old-space-size=4096"
fi
CONTAINER_NODE_OPTIONS="$CONTAINER_NODE_OPTIONS --disable-warning=ExperimentalWarning"

EXTERNAL_AUTH_MOUNTS=()
if ((${#AUTH_DIRS[@]} > 0)); then
  for auth_dir in "${AUTH_DIRS[@]}"; do
    auth_dir="$(nova-ai_live_validate_relative_home_path "$auth_dir")"
    host_path="$HOME/$auth_dir"
    if [[ -d "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth/"$auth_dir":ro)
    fi
  done
fi
if ((${#AUTH_FILES[@]} > 0)); then
  for auth_file in "${AUTH_FILES[@]}"; do
    auth_file="$(nova-ai_live_validate_relative_home_path "$auth_file")"
    host_path="$HOME/$auth_file"
    if [[ -f "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth-files/"$auth_file":ro)
    fi
  done
fi

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && [ -r "$HOME/.profile" ] && source "$HOME/.profile" || true
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export COREPACK_HOME="${COREPACK_HOME:-$XDG_CACHE_HOME/node/corepack}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
mkdir -p "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE" || true
if [ "${NOVA_AI_DOCKER_AUTH_PRESTAGED:-0}" != "1" ]; then
  IFS=',' read -r -a auth_dirs <<<"${NOVA_AI_DOCKER_AUTH_DIRS_RESOLVED:-}"
  IFS=',' read -r -a auth_files <<<"${NOVA_AI_DOCKER_AUTH_FILES_RESOLVED:-}"
  if ((${#auth_dirs[@]} > 0)); then
    for auth_dir in "${auth_dirs[@]}"; do
      [ -n "$auth_dir" ] || continue
      if [ -d "/host-auth/$auth_dir" ]; then
        mkdir -p "$HOME/$auth_dir"
        cp -R "/host-auth/$auth_dir/." "$HOME/$auth_dir"
        chmod -R u+rwX "$HOME/$auth_dir" || true
      fi
    done
  fi
  if ((${#auth_files[@]} > 0)); then
    for auth_file in "${auth_files[@]}"; do
      [ -n "$auth_file" ] || continue
      if [ -f "/host-auth-files/$auth_file" ]; then
        mkdir -p "$(dirname "$HOME/$auth_file")"
        cp "/host-auth-files/$auth_file" "$HOME/$auth_file"
        chmod u+rw "$HOME/$auth_file" || true
      fi
    done
  fi
fi
tmp_dir="$(mktemp -d)"
trusted_scripts_dir="${NOVA_AI_LIVE_DOCKER_SCRIPTS_DIR:-/src/scripts}"
source "$trusted_scripts_dir/lib/live-docker-stage.sh"
nova-ai_live_stage_source_tree "$tmp_dir"
nova-ai_live_stage_node_modules "$tmp_dir"
nova-ai_live_link_runtime_tree "$tmp_dir"
nova-ai_live_stage_state_dir "$tmp_dir/.nova-ai-state"
nova-ai_live_prepare_staged_config
cd "$tmp_dir"
node scripts/test-live.mjs -- src/gateway/gateway-models.profiles.live.test.ts
EOF

NOVA_AI_LIVE_DOCKER_REPO_ROOT="$ROOT_DIR" "$TRUSTED_HARNESS_DIR/scripts/test-live-build-docker.sh"

echo "==> Run gateway live model tests (profile keys)"
echo "==> Target: src/gateway/gateway-models.profiles.live.test.ts"
echo "==> Profile file: $PROFILE_STATUS"
echo "==> External auth dirs: ${AUTH_DIRS_CSV:-none}"
echo "==> External auth files: ${AUTH_FILES_CSV:-none}"
DOCKER_RUN_ARGS=(docker run --rm -t \
  -u "$DOCKER_USER" \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS="$CONTAINER_NODE_OPTIONS" \
  -e NOVA_AI_SKIP_CHANNELS=1 \
  -e NOVA_AI_SUPPRESS_NOTES=1 \
  -e NOVA_AI_DOCKER_AUTH_PRESTAGED="$DOCKER_AUTH_PRESTAGED" \
  -e NOVA_AI_DOCKER_AUTH_DIRS_RESOLVED="$AUTH_DIRS_CSV" \
  -e NOVA_AI_DOCKER_AUTH_FILES_RESOLVED="$AUTH_FILES_CSV" \
  -e NOVA_AI_LIVE_DOCKER_SCRIPTS_DIR="${DOCKER_TRUSTED_HARNESS_CONTAINER_DIR}/scripts" \
  -e NOVA_AI_LIVE_DOCKER_SOURCE_STAGE_MODE="${NOVA_AI_LIVE_DOCKER_SOURCE_STAGE_MODE:-copy}" \
  -e NOVA_AI_LIVE_TEST=1 \
  -e NOVA_AI_LIVE_TEST_QUIET="${NOVA_AI_LIVE_TEST_QUIET:-}" \
  -e NOVA_AI_LIVE_WRAPPER_HEARTBEAT_MS="${NOVA_AI_LIVE_WRAPPER_HEARTBEAT_MS:-}" \
  -e NOVA_AI_LIVE_REQUIRE_PROFILE_KEYS="${NOVA_AI_LIVE_REQUIRE_PROFILE_KEYS:-}" \
  -e NOVA_AI_LIVE_GATEWAY_MODELS="${NOVA_AI_LIVE_GATEWAY_MODELS:-modern}" \
  -e NOVA_AI_LIVE_GATEWAY_PROVIDERS="${NOVA_AI_LIVE_GATEWAY_PROVIDERS:-}" \
  -e NOVA_AI_LIVE_GATEWAY_SMOKE="${NOVA_AI_LIVE_GATEWAY_SMOKE:-1}" \
  -e NOVA_AI_LIVE_GATEWAY_MAX_MODELS="${NOVA_AI_LIVE_GATEWAY_MAX_MODELS:-8}" \
  -e NOVA_AI_LIVE_GATEWAY_HEARTBEAT_MS="${NOVA_AI_LIVE_GATEWAY_HEARTBEAT_MS:-}" \
  -e NOVA_AI_LIVE_GATEWAY_STEP_TIMEOUT_MS="${NOVA_AI_LIVE_GATEWAY_STEP_TIMEOUT_MS:-45000}" \
  -e NOVA_AI_LIVE_GATEWAY_MODEL_TIMEOUT_MS="${NOVA_AI_LIVE_GATEWAY_MODEL_TIMEOUT_MS:-90000}" \
  -e NOVA_AI_VITEST_FS_MODULE_CACHE=0)
nova-ai_live_append_array DOCKER_RUN_ARGS DOCKER_HOME_MOUNT
nova-ai_live_append_array DOCKER_RUN_ARGS DOCKER_TRUSTED_HARNESS_MOUNT
DOCKER_RUN_ARGS+=(\
  -v "$CACHE_HOME_DIR":/home/node/.cache \
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.nova-ai \
  -v "$WORKSPACE_DIR":/home/node/.nova-ai/workspace)
nova-ai_live_append_array DOCKER_RUN_ARGS EXTERNAL_AUTH_MOUNTS
nova-ai_live_append_array DOCKER_RUN_ARGS PROFILE_MOUNT
DOCKER_RUN_ARGS+=(\
  "$LIVE_IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD")
"${DOCKER_RUN_ARGS[@]}"
