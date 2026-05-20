#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUN_BIN="${BUN_BIN:-bun}"
HOST_BUILD="${NOVA_AI_BUN_GLOBAL_SMOKE_HOST_BUILD:-1}"
DIST_IMAGE="${NOVA_AI_BUN_GLOBAL_SMOKE_DIST_IMAGE:-}"
PACKAGE_TGZ="${NOVA_AI_BUN_GLOBAL_SMOKE_PACKAGE_TGZ:-}"
COMMAND_TIMEOUT_MS="${NOVA_AI_BUN_GLOBAL_SMOKE_TIMEOUT_MS:-180000}"
SMOKE_DIR=""
PACK_DIR=""

cleanup() {
  if [ -n "${SMOKE_DIR:-}" ]; then
    rm -rf "$SMOKE_DIR"
  fi
  if [ -n "${PACK_DIR:-}" ]; then
    rm -rf "$PACK_DIR"
  fi
}

trap cleanup EXIT

run_with_timeout() {
  local timeout_ms="$1"
  shift
  node scripts/e2e/lib/bun-global-install/assertions.mjs run-with-timeout "$timeout_ms" "$@"
}

restore_dist_from_image() {
  local image="$1"
  local container_id

  echo "==> Reuse dist/ from Docker image: $image"
  container_id="$(docker create "$image")"
  rm -rf "$ROOT_DIR/dist"
  if ! docker cp "${container_id}:/app/dist" "$ROOT_DIR/dist"; then
    docker rm -f "$container_id" >/dev/null 2>&1 || true
    return 1
  fi
  docker rm -f "$container_id" >/dev/null
}

resolve_package_tgz() {
  if [ -n "$PACKAGE_TGZ" ]; then
    if [ ! -f "$PACKAGE_TGZ" ]; then
      echo "NOVA_AI_BUN_GLOBAL_SMOKE_PACKAGE_TGZ does not exist: $PACKAGE_TGZ" >&2
      exit 1
    fi
    PACKAGE_TGZ="$(cd "$(dirname "$PACKAGE_TGZ")" && pwd)/$(basename "$PACKAGE_TGZ")"
    return 0
  fi

  if [ -n "$DIST_IMAGE" ]; then
    restore_dist_from_image "$DIST_IMAGE"
  elif [ "$HOST_BUILD" != "0" ]; then
    echo "==> Build host package artifacts"
    pnpm build
  else
    echo "==> Skipping host build (NOVA_AI_BUN_GLOBAL_SMOKE_HOST_BUILD=0)"
  fi

  if [ ! -d "$ROOT_DIR/dist" ]; then
    echo "dist/ is missing; run pnpm build or set NOVA_AI_BUN_GLOBAL_SMOKE_DIST_IMAGE" >&2
    exit 1
  fi

  echo "==> Write package inventory"
  node --import tsx scripts/write-package-dist-inventory.ts

  local pack_json_file
  PACK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/nova-ai-bun-pack.XXXXXX")"
  pack_json_file="$PACK_DIR/pack.json"

  echo "==> Pack Nova AI tarball"
  npm pack --ignore-scripts --json --pack-destination "$PACK_DIR" >"$pack_json_file"
  PACKAGE_TGZ="$(
    node -e '
const raw = require("node:fs").readFileSync(process.argv[1], "utf8") || "[]";
const parsed = JSON.parse(raw);
const last = Array.isArray(parsed) ? parsed.at(-1) : null;
if (!last || typeof last.filename !== "string" || last.filename.length === 0) {
  process.exit(1);
}
process.stdout.write(require("node:path").resolve(process.argv[2], last.filename));
' "$pack_json_file" "$PACK_DIR"
  )"
  if [ -z "$PACKAGE_TGZ" ] || [ ! -f "$PACKAGE_TGZ" ]; then
    echo "missing packed Nova AI tarball" >&2
    exit 1
  fi
}

main() {
  cd "$ROOT_DIR"

  if ! command -v "$BUN_BIN" >/dev/null 2>&1; then
    echo "Bun is required for bun global install smoke; set BUN_BIN or install bun." >&2
    exit 1
  fi

  resolve_package_tgz

  local bun_path
  local nova-ai_bin
  bun_path="$(command -v "$BUN_BIN")"
  SMOKE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/nova-ai-bun-global.XXXXXX")"

  export HOME="$SMOKE_DIR/home"
  export BUN_INSTALL="$HOME/.bun"
  export XDG_CACHE_HOME="$SMOKE_DIR/cache"
  export NOVA_AI_NO_ONBOARD=1
  export NOVA_AI_DISABLE_UPDATE_CHECK=1
  export NO_COLOR=1
  mkdir -p "$HOME" "$BUN_INSTALL/bin" "$XDG_CACHE_HOME"
  export PATH="$BUN_INSTALL/bin:$(dirname "$(command -v node)"):$PATH"

  echo "==> Bun version"
  "$bun_path" --version

  echo "==> Bun global install packed Nova AI"
  "$bun_path" install -g "$PACKAGE_TGZ" --no-progress

  nova-ai_bin="$BUN_INSTALL/bin/nova-ai"
  if [ ! -x "$nova-ai_bin" ]; then
    nova-ai_bin="$(command -v nova-ai || true)"
  fi
  if [ -z "$nova-ai_bin" ] || [ ! -x "$nova-ai_bin" ]; then
    echo "Bun global install did not create an executable nova-ai binary" >&2
    exit 1
  fi

  echo "==> Nova AI version through Bun global install"
  run_with_timeout "$COMMAND_TIMEOUT_MS" "$nova-ai_bin" --version

  echo "==> Nova AI image providers through Bun global install"
  local providers_json
  providers_json="$(run_with_timeout "$COMMAND_TIMEOUT_MS" "$nova-ai_bin" infer image providers --json)"
  NOVA_AI_IMAGE_PROVIDERS_JSON="$providers_json" node scripts/e2e/lib/bun-global-install/assertions.mjs assert-image-providers
}

main "$@"
