#!/usr/bin/env bash
# Installs an Nova AI package candidate in Docker, performs Telegram
# onboarding/doctor recovery, then runs the Telegram QA live harness.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "nova-ai-npm-telegram-live-e2e" NOVA_AI_NPM_TELEGRAM_LIVE_E2E_IMAGE)"
DOCKER_TARGET="${NOVA_AI_NPM_TELEGRAM_DOCKER_TARGET:-build}"
PACKAGE_SPEC="${NOVA_AI_NPM_TELEGRAM_PACKAGE_SPEC:-nova-ai@beta}"
PACKAGE_TGZ="${NOVA_AI_NPM_TELEGRAM_PACKAGE_TGZ:-${NOVA_AI_CURRENT_PACKAGE_TGZ:-}}"
PACKAGE_LABEL="${NOVA_AI_NPM_TELEGRAM_PACKAGE_LABEL:-}"
OUTPUT_DIR="${NOVA_AI_NPM_TELEGRAM_OUTPUT_DIR:-.artifacts/qa-e2e/npm-telegram-live}"

resolve_credential_source() {
  if [ -n "${NOVA_AI_NPM_TELEGRAM_CREDENTIAL_SOURCE:-}" ]; then
    printf "%s" "$NOVA_AI_NPM_TELEGRAM_CREDENTIAL_SOURCE"
    return 0
  fi
  if [ -n "${NOVA_AI_QA_CREDENTIAL_SOURCE:-}" ]; then
    printf "%s" "$NOVA_AI_QA_CREDENTIAL_SOURCE"
    return 0
  fi
  if [ -n "${CI:-}" ] && [ -n "${NOVA_AI_QA_CONVEX_SITE_URL:-}" ]; then
    if [ -n "${NOVA_AI_QA_CONVEX_SECRET_CI:-}" ] || [ -n "${NOVA_AI_QA_CONVEX_SECRET_MAINTAINER:-}" ]; then
      printf "convex"
    fi
  fi
}

resolve_credential_role() {
  if [ -n "${NOVA_AI_NPM_TELEGRAM_CREDENTIAL_ROLE:-}" ]; then
    printf "%s" "$NOVA_AI_NPM_TELEGRAM_CREDENTIAL_ROLE"
    return 0
  fi
  if [ -n "${NOVA_AI_QA_CREDENTIAL_ROLE:-}" ]; then
    printf "%s" "$NOVA_AI_QA_CREDENTIAL_ROLE"
  fi
}

validate_nova-ai_package_spec() {
  local spec="$1"
  if [[ "$spec" =~ ^nova-ai@(alpha|beta|latest|[0-9]{4}\.[1-9][0-9]*\.[1-9][0-9]*(-[1-9][0-9]*|-(alpha|beta)\.[1-9][0-9]*)?)$ ]]; then
    return 0
  fi
  echo "NOVA_AI_NPM_TELEGRAM_PACKAGE_SPEC must be nova-ai@alpha, nova-ai@beta, nova-ai@latest, or an exact Nova AI release version; got: $spec" >&2
  exit 1
}

resolve_package_tgz() {
  local candidate="$1"
  if [ -z "$candidate" ]; then
    return 0
  fi
  if [ ! -f "$candidate" ]; then
    echo "NOVA_AI_NPM_TELEGRAM_PACKAGE_TGZ must point to an existing .tgz file; got: $candidate" >&2
    exit 1
  fi
  case "$candidate" in
    *.tgz) ;;
    *)
      echo "NOVA_AI_NPM_TELEGRAM_PACKAGE_TGZ must point to a .tgz file; got: $candidate" >&2
      exit 1
      ;;
  esac
  local dir
  local base
  dir="$(cd "$(dirname "$candidate")" && pwd)"
  base="$(basename "$candidate")"
  printf "%s/%s" "$dir" "$base"
}

package_mount_args=()
package_install_source="$PACKAGE_SPEC"
resolved_package_tgz="$(resolve_package_tgz "$PACKAGE_TGZ")"
if [ -n "$resolved_package_tgz" ]; then
  package_install_source="/package-under-test/$(basename "$resolved_package_tgz")"
  package_mount_args=(-v "$resolved_package_tgz:$package_install_source:ro")
else
  validate_nova-ai_package_spec "$PACKAGE_SPEC"
fi
if [ -z "$PACKAGE_LABEL" ]; then
  if [ -n "$resolved_package_tgz" ]; then
    PACKAGE_LABEL="$(basename "$resolved_package_tgz")"
  else
    PACKAGE_LABEL="$PACKAGE_SPEC"
  fi
fi

credential_source="$(resolve_credential_source)"
credential_role="$(resolve_credential_role)"
if [ -z "$credential_role" ] && [ -n "${CI:-}" ] && [ "$credential_source" = "convex" ]; then
  credential_role="ci"
fi

validate_credential_preflight() {
  if [ "${NOVA_AI_NPM_TELEGRAM_SKIP_CREDENTIAL_PREFLIGHT:-0}" = "1" ]; then
    return 0
  fi
  if [ "$credential_source" = "convex" ]; then
    if [ -z "${NOVA_AI_QA_CONVEX_SITE_URL:-}" ]; then
      echo "Missing required env for Convex credential mode: NOVA_AI_QA_CONVEX_SITE_URL" >&2
      exit 1
    fi
    if [ "$credential_role" = "ci" ]; then
      if [ -z "${NOVA_AI_QA_CONVEX_SECRET_CI:-}" ]; then
        echo "Missing required env for Convex ci credential mode: NOVA_AI_QA_CONVEX_SECRET_CI" >&2
        exit 1
      fi
      return 0
    fi
    if [ "$credential_role" = "maintainer" ]; then
      if [ -z "${NOVA_AI_QA_CONVEX_SECRET_MAINTAINER:-}" ]; then
        echo "Missing required env for Convex maintainer credential mode: NOVA_AI_QA_CONVEX_SECRET_MAINTAINER" >&2
        exit 1
      fi
      return 0
    fi
    if [ -z "${NOVA_AI_QA_CONVEX_SECRET_CI:-}" ] && [ -z "${NOVA_AI_QA_CONVEX_SECRET_MAINTAINER:-}" ]; then
      echo "Missing required env for Convex credential mode: NOVA_AI_QA_CONVEX_SECRET_CI or NOVA_AI_QA_CONVEX_SECRET_MAINTAINER" >&2
      exit 1
    fi
    return 0
  fi

  local missing=()
  for key in \
    NOVA_AI_QA_TELEGRAM_GROUP_ID \
    NOVA_AI_QA_TELEGRAM_DRIVER_BOT_TOKEN \
    NOVA_AI_QA_TELEGRAM_SUT_BOT_TOKEN; do
    if [ -z "${!key:-}" ]; then
      missing+=("$key")
    fi
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    {
      echo "Missing required Telegram QA credential env before Docker work: ${missing[*]}"
      echo "Use one of:"
      echo "  direct Telegram env: NOVA_AI_QA_TELEGRAM_GROUP_ID, NOVA_AI_QA_TELEGRAM_DRIVER_BOT_TOKEN, NOVA_AI_QA_TELEGRAM_SUT_BOT_TOKEN"
      echo "  Convex env: NOVA_AI_NPM_TELEGRAM_CREDENTIAL_SOURCE=convex plus NOVA_AI_QA_CONVEX_SITE_URL and a role secret"
    } >&2
    exit 1
  fi
}

validate_credential_preflight

docker_e2e_build_or_reuse "$IMAGE_NAME" npm-telegram-live "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "$DOCKER_TARGET"

mkdir -p "$ROOT_DIR/.artifacts/qa-e2e"
run_log="$(mktemp "${TMPDIR:-/tmp}/nova-ai-npm-telegram-live.XXXXXX")"
npm_prefix_host="$(mktemp -d "$ROOT_DIR/.artifacts/qa-e2e/npm-telegram-live-prefix.XXXXXX")"
trap 'rm -f "$run_log"; rm -rf "$npm_prefix_host"' EXIT

docker_env=(
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  -e NOVA_AI_NPM_TELEGRAM_PACKAGE_SPEC="$PACKAGE_SPEC"
  -e NOVA_AI_NPM_TELEGRAM_PACKAGE_LABEL="$PACKAGE_LABEL"
  -e NOVA_AI_NPM_TELEGRAM_OUTPUT_DIR="$OUTPUT_DIR"
  -e NOVA_AI_NPM_TELEGRAM_FAST="${NOVA_AI_NPM_TELEGRAM_FAST:-1}"
)

forward_env_if_set() {
  local key="$1"
  if [ -n "${!key:-}" ]; then
    docker_env+=(-e "$key")
  fi
}

if [ -n "$credential_source" ]; then
  docker_env+=(-e NOVA_AI_QA_CREDENTIAL_SOURCE="$credential_source")
fi
if [ -n "$credential_role" ]; then
  docker_env+=(-e NOVA_AI_QA_CREDENTIAL_ROLE="$credential_role")
fi

for key in \
  OPENAI_API_KEY \
  ANTHROPIC_API_KEY \
  GEMINI_API_KEY \
  GOOGLE_API_KEY \
  NOVA_AI_LIVE_OPENAI_KEY \
  NOVA_AI_LIVE_ANTHROPIC_KEY \
  NOVA_AI_LIVE_GEMINI_KEY \
  NOVA_AI_QA_TELEGRAM_GROUP_ID \
  NOVA_AI_QA_TELEGRAM_DRIVER_BOT_TOKEN \
  NOVA_AI_QA_TELEGRAM_SUT_BOT_TOKEN \
  NOVA_AI_QA_CONVEX_SITE_URL \
  NOVA_AI_QA_CONVEX_SECRET_CI \
  NOVA_AI_QA_CONVEX_SECRET_MAINTAINER \
  NOVA_AI_QA_CREDENTIAL_LEASE_TTL_MS \
  NOVA_AI_QA_CREDENTIAL_HEARTBEAT_INTERVAL_MS \
  NOVA_AI_QA_CREDENTIAL_ACQUIRE_TIMEOUT_MS \
  NOVA_AI_QA_CREDENTIAL_HTTP_TIMEOUT_MS \
  NOVA_AI_QA_CONVEX_ENDPOINT_PREFIX \
  NOVA_AI_QA_CREDENTIAL_OWNER_ID \
  NOVA_AI_QA_ALLOW_INSECURE_HTTP \
  NOVA_AI_QA_REDACT_PUBLIC_METADATA \
  NOVA_AI_QA_TELEGRAM_CAPTURE_CONTENT \
  NOVA_AI_QA_TELEGRAM_CANARY_TIMEOUT_MS \
  NOVA_AI_QA_TELEGRAM_SCENARIO_TIMEOUT_MS \
  NOVA_AI_QA_SUITE_PROGRESS \
  NOVA_AI_NPM_TELEGRAM_PROVIDER_MODE \
  NOVA_AI_NPM_TELEGRAM_MODEL \
  NOVA_AI_NPM_TELEGRAM_ALT_MODEL \
  NOVA_AI_NPM_TELEGRAM_SCENARIOS \
  NOVA_AI_NPM_TELEGRAM_SKIP_HOTPATH \
  NOVA_AI_NPM_TELEGRAM_SUT_ACCOUNT \
  NOVA_AI_NPM_TELEGRAM_ALLOW_FAILURES; do
  forward_env_if_set "$key"
done

run_logged() {
  if ! "$@" >"$run_log" 2>&1; then
    cat "$run_log"
    exit 1
  fi
  cat "$run_log"
  >"$run_log"
}

echo "Running package Telegram live Docker E2E ($PACKAGE_LABEL)..."
run_logged docker run --rm \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e NOVA_AI_NPM_TELEGRAM_INSTALL_SOURCE="$package_install_source" \
  -e NOVA_AI_NPM_TELEGRAM_PACKAGE_LABEL="$PACKAGE_LABEL" \
  ${package_mount_args[@]+"${package_mount_args[@]}"} \
  -v "$npm_prefix_host:/npm-global" \
  -i "$IMAGE_NAME" bash -s <<'EOF'
set -euo pipefail

export HOME="$(mktemp -d "/tmp/nova-ai-npm-telegram-install.XXXXXX")"
export NPM_CONFIG_PREFIX="/npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"

install_source="${NOVA_AI_NPM_TELEGRAM_INSTALL_SOURCE:?missing NOVA_AI_NPM_TELEGRAM_INSTALL_SOURCE}"
package_label="${NOVA_AI_NPM_TELEGRAM_PACKAGE_LABEL:-$install_source}"
echo "Installing ${package_label} from ${install_source}..."
npm install -g "$install_source" --no-fund --no-audit

command -v nova-ai
nova-ai --version
EOF

# Mount only QA harness source; the SUT itself, including bundled plugin runtime,
# is the installed package candidate.
run_logged docker_e2e_run_with_harness \
  "${docker_env[@]}" \
  -v "$ROOT_DIR/.artifacts:/app/.artifacts" \
  -v "$ROOT_DIR/extensions/qa-lab:/app/extensions/qa-lab:ro" \
  -v "$npm_prefix_host:/npm-global" \
  -i "$IMAGE_NAME" bash -s <<'EOF'
set -euo pipefail

export HOME="$(mktemp -d "/tmp/nova-ai-npm-telegram-runtime.XXXXXX")"
export NPM_CONFIG_PREFIX="/npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export NOVA_AI_NPM_TELEGRAM_REPO_ROOT="/app"

dump_hotpath_logs() {
  local status="$1"
  echo "installed-package onboarding recovery hot path failed with exit code $status" >&2
  for file in \
    /tmp/nova-ai-npm-telegram-onboard.json \
    /tmp/nova-ai-npm-telegram-channel-add.log \
    /tmp/nova-ai-npm-telegram-doctor-fix.log \
    /tmp/nova-ai-npm-telegram-doctor-check.log; do
    if [ -f "$file" ]; then
      echo "--- $file ---" >&2
      sed -n '1,220p' "$file" >&2 || true
    fi
  done
}
trap 'status=$?; dump_hotpath_logs "$status"; exit "$status"' ERR

command -v nova-ai
nova-ai --version
mkdir -p /app/node_modules
nova-ai_package_dir="/npm-global/lib/node_modules/nova-ai"
# The mounted QA harness imports nova-ai/plugin-sdk and package dependencies;
# point those imports at the installed package without copying source plugins into the test image.
rm -rf /app/node_modules/nova-ai
ln -sfnT "$nova-ai_package_dir" /app/node_modules/nova-ai
rm -rf /app/dist
ln -sfnT "$nova-ai_package_dir/dist" /app/dist
cp "$nova-ai_package_dir/package.json" /app/package.json
node scripts/e2e/lib/npm-telegram-live/prepare-package.mjs \
  /app/package.json \
  /app/node_modules/nova-ai/package.json
for deps_dir in "$nova-ai_package_dir/node_modules" /npm-global/lib/node_modules; do
  [ -d "$deps_dir" ] || continue
  for dependency_dir in "$deps_dir"/*; do
    [ -e "$dependency_dir" ] || continue
    dependency_name="$(basename "$dependency_dir")"
    case "$dependency_name" in
      .bin | nova-ai)
        continue
        ;;
      @*)
        [ -d "$dependency_dir" ] || continue
        mkdir -p "/app/node_modules/$dependency_name"
        for scoped_dependency_dir in "$dependency_dir"/*; do
          [ -e "$scoped_dependency_dir" ] || continue
          scoped_dependency_name="$(basename "$scoped_dependency_dir")"
          rm -rf "/app/node_modules/$dependency_name/$scoped_dependency_name"
          ln -sfnT "$scoped_dependency_dir" "/app/node_modules/$dependency_name/$scoped_dependency_name"
        done
        ;;
      *)
        rm -rf "/app/node_modules/$dependency_name"
        ln -sfnT "$dependency_dir" "/app/node_modules/$dependency_name"
        ;;
    esac
  done
done

link_installed_package_dependency() {
  local name="$1"
  local source="/npm-global/lib/node_modules/nova-ai/node_modules/$name"
  local target="/app/node_modules/$name"
  if [ ! -e "$source" ]; then
    echo "Installed package dependency is missing: $name" >&2
    return 1
  fi
  mkdir -p "$(dirname "$target")"
  ln -sfn "$source" "$target"
}

# QA Lab is intentionally mounted as harness source, so its package-local
# runtime imports must resolve from the installed package dependency tree.
for dependency in \
  @modelcontextprotocol/sdk \
  yaml \
  zod; do
  link_installed_package_dependency "$dependency"
done

if [ "${NOVA_AI_NPM_TELEGRAM_SKIP_HOTPATH:-0}" != "1" ]; then
  echo "Running installed-package onboarding recovery hot path..."
  OPENAI_API_KEY="${OPENAI_API_KEY:-sk-nova-ai-npm-telegram-hotpath}" nova-ai onboard --non-interactive --accept-risk \
    --mode local \
    --auth-choice openai-api-key \
    --secret-input-mode ref \
    --gateway-port 18789 \
    --gateway-bind loopback \
    --skip-daemon \
    --skip-ui \
    --skip-skills \
    --skip-health \
    --json >/tmp/nova-ai-npm-telegram-onboard.json </dev/null

  nova-ai channels add --channel telegram --token "123456:nova-ai-npm-telegram-hotpath" >/tmp/nova-ai-npm-telegram-channel-add.log 2>&1 </dev/null
  nova-ai doctor --fix --non-interactive >/tmp/nova-ai-npm-telegram-doctor-fix.log 2>&1 </dev/null
  nova-ai doctor --non-interactive >/tmp/nova-ai-npm-telegram-doctor-check.log 2>&1 </dev/null
fi

export NOVA_AI_NPM_TELEGRAM_SUT_COMMAND="$(command -v nova-ai)"
trap - ERR
tsx scripts/e2e/npm-telegram-live-runner.ts
EOF

echo "package Telegram live Docker E2E passed ($PACKAGE_LABEL)"
