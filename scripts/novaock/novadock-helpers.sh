#!/usr/bin/env bash
# ClawDock - Docker helpers for Nova AI
# Inspired by Simon Willison's "Running Nova AI in Docker"
# https://til.simonwillison.net/llms/nova-ai-docker
#
# Installation:
#   mkdir -p ~/.novaock && curl -sL https://raw.githubusercontent.com/nova-ai/nova-ai/main/scripts/novaock/novaock-helpers.sh -o ~/.novaock/novaock-helpers.sh
#   echo 'source ~/.novaock/novaock-helpers.sh' >> ~/.zshrc
#
# Usage:
#   novaock-help    # Show all available commands

# =============================================================================
# Colors
# =============================================================================
_CLR_RESET='\033[0m'
_CLR_BOLD='\033[1m'
_CLR_DIM='\033[2m'
_CLR_GREEN='\033[0;32m'
_CLR_YELLOW='\033[1;33m'
_CLR_BLUE='\033[0;34m'
_CLR_MAGENTA='\033[0;35m'
_CLR_CYAN='\033[0;36m'
_CLR_RED='\033[0;31m'

# Styled command output (green + bold)
_clr_cmd() {
  echo -e "${_CLR_GREEN}${_CLR_BOLD}$1${_CLR_RESET}"
}

# Inline command for use in sentences
_cmd() {
  echo "${_CLR_GREEN}${_CLR_BOLD}$1${_CLR_RESET}"
}

# =============================================================================
# Config
# =============================================================================
NOVAOCK_CONFIG="${HOME}/.novaock/config"

# Common paths to check for Nova AI
NOVAOCK_COMMON_PATHS=(
  "${HOME}/nova-ai"
  "${HOME}/workspace/nova-ai"
  "${HOME}/projects/nova-ai"
  "${HOME}/dev/nova-ai"
  "${HOME}/code/nova-ai"
  "${HOME}/src/nova-ai"
)

_novaock_filter_warnings() {
  grep -v "^WARN\|^time="
}

_novaock_trim_quotes() {
  local value="$1"
  value="${value#\"}"
  value="${value%\"}"
  printf "%s" "$value"
}

_novaock_mask_value() {
  local value="$1"
  local length=${#value}
  if (( length == 0 )); then
    printf "%s" "<empty>"
    return 0
  fi
  if (( length == 1 )); then
    printf "%s" "<redacted:1 char>"
    return 0
  fi
  printf "%s" "<redacted:${length} chars>"
}

_novaock_read_config_dir() {
  if [[ ! -f "$NOVAOCK_CONFIG" ]]; then
    return 1
  fi
  local raw
  raw=$(sed -n 's/^NOVAOCK_DIR=//p' "$NOVAOCK_CONFIG" | head -n 1)
  if [[ -z "$raw" ]]; then
    return 1
  fi
  _novaock_trim_quotes "$raw"
}

# Ensure NOVAOCK_DIR is set and valid
_novaock_ensure_dir() {
  # Already set and valid?
  if [[ -n "$NOVAOCK_DIR" && -f "${NOVAOCK_DIR}/docker-compose.yml" ]]; then
    return 0
  fi

  # Try loading from config
  local config_dir
  config_dir=$(_novaock_read_config_dir)
  if [[ -n "$config_dir" && -f "${config_dir}/docker-compose.yml" ]]; then
    NOVAOCK_DIR="$config_dir"
    return 0
  fi

  # Auto-detect from common paths
  local found_path=""
  for path in "${NOVAOCK_COMMON_PATHS[@]}"; do
    if [[ -f "${path}/docker-compose.yml" ]]; then
      found_path="$path"
      break
    fi
  done

  if [[ -n "$found_path" ]]; then
    echo ""
    echo "🦞 Found Nova AI at: $found_path"
    echo -n "   Use this location? [Y/n] "
    read -r response
    if [[ "$response" =~ ^[Nn] ]]; then
      echo ""
      echo "Set NOVAOCK_DIR manually:"
      echo "  export NOVAOCK_DIR=/path/to/nova-ai"
      return 1
    fi
    NOVAOCK_DIR="$found_path"
  else
    echo ""
    echo "❌ Nova AI not found in common locations."
    echo ""
    echo "Clone it first:"
    echo ""
    echo "  git clone https://github.com/nova-ai/nova-ai.git ~/nova-ai"
    echo "  cd ~/nova-ai && ./scripts/docker/setup.sh"
    echo ""
    echo "Or set NOVAOCK_DIR if it's elsewhere:"
    echo ""
    echo "  export NOVAOCK_DIR=/path/to/nova-ai"
    echo ""
    return 1
  fi

  # Save to config
  if [[ ! -d "${HOME}/.novaock" ]]; then
    /bin/mkdir -p "${HOME}/.novaock"
  fi
  echo "NOVAOCK_DIR=\"$NOVAOCK_DIR\"" > "$NOVAOCK_CONFIG"
  echo "✅ Saved to $NOVAOCK_CONFIG"
  echo ""
  return 0
}

# Wrapper to run docker compose commands
_novaock_compose() {
  _novaock_ensure_dir || return 1
  local compose_args=(-f "${NOVAOCK_DIR}/docker-compose.yml")
  if [[ -f "${NOVAOCK_DIR}/docker-compose.extra.yml" ]]; then
    compose_args+=(-f "${NOVAOCK_DIR}/docker-compose.extra.yml")
  fi
  command docker compose "${compose_args[@]}" "$@"
}

_novaock_read_env_token() {
  _novaock_ensure_dir || return 1
  if [[ ! -f "${NOVAOCK_DIR}/.env" ]]; then
    return 1
  fi
  local raw
  raw=$(sed -n 's/^NOVA_AI_GATEWAY_TOKEN=//p' "${NOVAOCK_DIR}/.env" | head -n 1)
  if [[ -z "$raw" ]]; then
    return 1
  fi
  _novaock_trim_quotes "$raw"
}

# Basic Operations
novaock-start() {
  _novaock_compose up -d nova-ai-gateway
}

novaock-stop() {
  _novaock_compose down
}

novaock-restart() {
  _novaock_compose restart nova-ai-gateway
}

novaock-logs() {
  _novaock_compose logs -f nova-ai-gateway
}

novaock-status() {
  _novaock_compose ps
}

# Navigation
novaock-cd() {
  _novaock_ensure_dir || return 1
  cd "${NOVAOCK_DIR}"
}

novaock-config() {
  cd ~/.nova-ai
}

novaock-show-config() {
  _novaock_ensure_dir >/dev/null 2>&1 || true
  local config_dir="${HOME}/.nova-ai"
  echo -e "${_CLR_BOLD}Config directory:${_CLR_RESET} ${_CLR_CYAN}${config_dir}${_CLR_RESET}"
  echo ""

  # Show nova-ai.json
  if [[ -f "${config_dir}/nova-ai.json" ]]; then
    echo -e "${_CLR_BOLD}${config_dir}/nova-ai.json${_CLR_RESET}"
    echo -e "${_CLR_DIM}$(cat "${config_dir}/nova-ai.json")${_CLR_RESET}"
  else
    echo -e "${_CLR_YELLOW}No nova-ai.json found${_CLR_RESET}"
  fi
  echo ""

  # Show .env (mask secret values)
  if [[ -f "${config_dir}/.env" ]]; then
    echo -e "${_CLR_BOLD}${config_dir}/.env${_CLR_RESET}"
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      elif [[ "$line" == *=* ]]; then
        local key="${line%%=*}"
        local val="${line#*=}"
        echo -e "${_CLR_CYAN}${key}${_CLR_RESET}=${_CLR_DIM}$(_novaock_mask_value "$val")${_CLR_RESET}"
      else
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      fi
    done < "${config_dir}/.env"
  else
    echo -e "${_CLR_YELLOW}No .env found${_CLR_RESET}"
  fi
  echo ""

  # Show project .env if available
  if [[ -n "$NOVAOCK_DIR" && -f "${NOVAOCK_DIR}/.env" ]]; then
    echo -e "${_CLR_BOLD}${NOVAOCK_DIR}/.env${_CLR_RESET}"
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      elif [[ "$line" == *=* ]]; then
        local key="${line%%=*}"
        local val="${line#*=}"
        echo -e "${_CLR_CYAN}${key}${_CLR_RESET}=${_CLR_DIM}$(_novaock_mask_value "$val")${_CLR_RESET}"
      else
        echo -e "${_CLR_DIM}${line}${_CLR_RESET}"
      fi
    done < "${NOVAOCK_DIR}/.env"
  fi
  echo ""
}

novaock-workspace() {
  cd ~/.nova-ai/workspace
}

# Container Access
novaock-shell() {
  _novaock_compose exec nova-ai-gateway \
    bash -c 'echo "alias nova-ai=\"./nova-ai.mjs\"" > /tmp/.bashrc_nova-ai && bash --rcfile /tmp/.bashrc_nova-ai'
}

novaock-exec() {
  _novaock_compose exec nova-ai-gateway "$@"
}

novaock-cli() {
  _novaock_compose run --rm nova-ai-cli "$@"
}

# Maintenance
novaock-update() {
  _novaock_ensure_dir || return 1

  echo "🔄 Updating Nova AI..."

  echo ""
  echo "📥 Pulling latest source..."
  git -C "${NOVAOCK_DIR}" pull || { echo "❌ git pull failed"; return 1; }

  echo ""
  echo "🔨 Rebuilding Docker image (this may take a few minutes)..."
  _novaock_compose build nova-ai-gateway || { echo "❌ Build failed"; return 1; }

  echo ""
  echo "♻️  Recreating container with new image..."
  _novaock_compose down 2>&1 | _novaock_filter_warnings
  _novaock_compose up -d nova-ai-gateway 2>&1 | _novaock_filter_warnings

  echo ""
  echo "⏳ Waiting for gateway to start..."
  sleep 5

  echo "✅ Update complete!"
  echo -e "   Verify: $(_cmd novaock-cli status)"
}

novaock-rebuild() {
  _novaock_compose build nova-ai-gateway
}

novaock-clean() {
  _novaock_compose down -v --remove-orphans
}

# Health check
novaock-health() {
  _novaock_ensure_dir || return 1
  local token
  token=$(_novaock_read_env_token)
  if [[ -z "$token" ]]; then
    echo "❌ Error: Could not find gateway token"
    echo "   Check: ${NOVAOCK_DIR}/.env"
    return 1
  fi
  _novaock_compose exec -e "NOVA_AI_GATEWAY_TOKEN=$token" nova-ai-gateway \
    node dist/index.js health
}

# Show gateway token
novaock-token() {
  _novaock_read_env_token
}

# Fix token configuration (run this once after setup)
novaock-fix-token() {
  _novaock_ensure_dir || return 1

  echo "🔧 Configuring gateway token..."
  local token
  token=$(novaock-token)
  if [[ -z "$token" ]]; then
    echo "❌ Error: Could not find gateway token"
    echo "   Check: ${NOVAOCK_DIR}/.env"
    return 1
  fi

  echo "📝 Setting token: ${token:0:20}..."

  _novaock_compose exec -e "TOKEN=$token" nova-ai-gateway \
    bash -c './nova-ai.mjs config set gateway.remote.token "$TOKEN" && ./nova-ai.mjs config set gateway.auth.token "$TOKEN"' 2>&1 | _novaock_filter_warnings

  echo "🔍 Verifying token was saved..."
  local saved_token
  saved_token=$(_novaock_compose exec nova-ai-gateway \
    bash -c "./nova-ai.mjs config get gateway.remote.token 2>/dev/null" 2>&1 | _novaock_filter_warnings | tr -d '\r\n' | head -c 64)

  if [[ "$saved_token" == "$token" ]]; then
    echo "✅ Token saved correctly!"
  else
    echo "⚠️  Token mismatch detected"
    echo "   Expected: ${token:0:20}..."
    echo "   Got: ${saved_token:0:20}..."
  fi

  echo "🔄 Restarting gateway..."
  _novaock_compose restart nova-ai-gateway 2>&1 | _novaock_filter_warnings

  echo "⏳ Waiting for gateway to start..."
  sleep 5

  echo "✅ Configuration complete!"
  echo -e "   Try: $(_cmd novaock-devices)"
}

# Open dashboard in browser
novaock-dashboard() {
  _novaock_ensure_dir || return 1

  echo "🦞 Getting dashboard URL..."
  local output exit_status url
  output=$(_novaock_compose run --rm nova-ai-cli dashboard --no-open 2>&1)
  exit_status=$?
  url=$(printf "%s\n" "$output" | _novaock_filter_warnings | grep -o 'http[s]\?://[^[:space:]]*' | head -n 1)
  if [[ $exit_status -ne 0 ]]; then
    echo "❌ Failed to get dashboard URL"
    echo -e "   Try restarting: $(_cmd novaock-restart)"
    return 1
  fi

  if [[ -n "$url" ]]; then
    echo -e "✅ Opening: ${_CLR_CYAN}${url}${_CLR_RESET}"
    open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo -e "   Please open manually: ${_CLR_CYAN}${url}${_CLR_RESET}"
    echo ""
    echo -e "${_CLR_CYAN}💡 If you see ${_CLR_RED}'pairing required'${_CLR_CYAN} error:${_CLR_RESET}"
    echo -e "   1. Run: $(_cmd novaock-devices)"
    echo "   2. Copy the Request ID from the Pending table"
    echo -e "   3. Run: $(_cmd 'novaock-approve <request-id>')"
  else
    echo "❌ Failed to get dashboard URL"
    echo -e "   Try restarting: $(_cmd novaock-restart)"
  fi
}

# List device pairings
novaock-devices() {
  _novaock_ensure_dir || return 1

  echo "🔍 Checking device pairings..."
  local output exit_status
  output=$(_novaock_compose exec nova-ai-gateway node dist/index.js devices list 2>&1)
  exit_status=$?
  printf "%s\n" "$output" | _novaock_filter_warnings
  if [ $exit_status -ne 0 ]; then
    echo ""
    echo -e "${_CLR_CYAN}💡 If you see token errors above:${_CLR_RESET}"
    echo -e "   1. Verify token is set: $(_cmd novaock-token)"
    echo -e "   2. Try fixing the token automatically: $(_cmd novaock-fix-token)"
    echo "   3. If you still see errors, try manual config inside container:"
    echo -e "      $(_cmd novaock-shell)"
    echo -e "      $(_cmd 'nova-ai config get gateway.remote.token')"
    return 1
  fi

  echo ""
  echo -e "${_CLR_CYAN}💡 To approve a pairing request:${_CLR_RESET}"
  echo -e "   $(_cmd 'novaock-approve <request-id>')"
}

# Approve device pairing request
novaock-approve() {
  _novaock_ensure_dir || return 1

  if [[ -z "$1" ]]; then
    echo -e "❌ Usage: $(_cmd 'novaock-approve <request-id>')"
    echo ""
    echo -e "${_CLR_CYAN}💡 How to approve a device:${_CLR_RESET}"
    echo -e "   1. Run: $(_cmd novaock-devices)"
    echo "   2. Find the Request ID in the Pending table (long UUID)"
    echo -e "   3. Run: $(_cmd 'novaock-approve <that-request-id>')"
    echo ""
    echo "Example:"
    echo -e "   $(_cmd 'novaock-approve 6f9db1bd-a1cc-4d3f-b643-2c195262464e')"
    return 1
  fi

  echo "✅ Approving device: $1"
  _novaock_compose exec nova-ai-gateway \
    node dist/index.js devices approve "$1" 2>&1 | _novaock_filter_warnings

  echo ""
  echo "✅ Device approved! Refresh your browser."
}

# Show all available novaock helper commands
novaock-help() {
  echo -e "\n${_CLR_BOLD}${_CLR_CYAN}🦞 ClawDock - Docker Helpers for Nova AI${_CLR_RESET}\n"

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}⚡ Basic Operations${_CLR_RESET}"
  echo -e "  $(_cmd novaock-start)       ${_CLR_DIM}Start the gateway${_CLR_RESET}"
  echo -e "  $(_cmd novaock-stop)        ${_CLR_DIM}Stop the gateway${_CLR_RESET}"
  echo -e "  $(_cmd novaock-restart)     ${_CLR_DIM}Restart the gateway${_CLR_RESET}"
  echo -e "  $(_cmd novaock-status)      ${_CLR_DIM}Check container status${_CLR_RESET}"
  echo -e "  $(_cmd novaock-logs)        ${_CLR_DIM}View live logs (follows)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🐚 Container Access${_CLR_RESET}"
  echo -e "  $(_cmd novaock-shell)       ${_CLR_DIM}Shell into container (nova-ai alias ready)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-cli)         ${_CLR_DIM}Run CLI commands (e.g., novaock-cli status)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-exec) ${_CLR_CYAN}<cmd>${_CLR_RESET}  ${_CLR_DIM}Execute command in gateway container${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🌐 Web UI & Devices${_CLR_RESET}"
  echo -e "  $(_cmd novaock-dashboard)   ${_CLR_DIM}Open web UI in browser ${_CLR_CYAN}(auto-guides you)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-devices)     ${_CLR_DIM}List device pairings ${_CLR_CYAN}(auto-guides you)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-approve) ${_CLR_CYAN}<id>${_CLR_RESET} ${_CLR_DIM}Approve device pairing ${_CLR_CYAN}(with examples)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}⚙️  Setup & Configuration${_CLR_RESET}"
  echo -e "  $(_cmd novaock-fix-token)   ${_CLR_DIM}Configure gateway token ${_CLR_CYAN}(run once)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🔧 Maintenance${_CLR_RESET}"
  echo -e "  $(_cmd novaock-update)      ${_CLR_DIM}Pull, rebuild, and restart ${_CLR_CYAN}(one-command update)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-rebuild)     ${_CLR_DIM}Rebuild Docker image only${_CLR_RESET}"
  echo -e "  $(_cmd novaock-clean)       ${_CLR_RED}⚠️  Remove containers & volumes (nuclear)${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_MAGENTA}🛠️  Utilities${_CLR_RESET}"
  echo -e "  $(_cmd novaock-health)      ${_CLR_DIM}Run health check${_CLR_RESET}"
  echo -e "  $(_cmd novaock-token)       ${_CLR_DIM}Show gateway auth token${_CLR_RESET}"
  echo -e "  $(_cmd novaock-cd)          ${_CLR_DIM}Jump to nova-ai project directory${_CLR_RESET}"
  echo -e "  $(_cmd novaock-config)      ${_CLR_DIM}Open config directory (~/.nova-ai)${_CLR_RESET}"
  echo -e "  $(_cmd novaock-show-config) ${_CLR_DIM}Print config files with redacted values${_CLR_RESET}"
  echo -e "  $(_cmd novaock-workspace)   ${_CLR_DIM}Open workspace directory${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${_CLR_RESET}"
  echo -e "${_CLR_BOLD}${_CLR_GREEN}🚀 First Time Setup${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  1.${_CLR_RESET} $(_cmd novaock-start)          ${_CLR_DIM}# Start the gateway${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  2.${_CLR_RESET} $(_cmd novaock-fix-token)      ${_CLR_DIM}# Configure token${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  3.${_CLR_RESET} $(_cmd novaock-dashboard)      ${_CLR_DIM}# Open web UI${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  4.${_CLR_RESET} $(_cmd novaock-devices)        ${_CLR_DIM}# If pairing needed${_CLR_RESET}"
  echo -e "${_CLR_CYAN}  5.${_CLR_RESET} $(_cmd novaock-approve) ${_CLR_CYAN}<id>${_CLR_RESET}   ${_CLR_DIM}# Approve pairing${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_GREEN}💬 WhatsApp Setup${_CLR_RESET}"
  echo -e "  $(_cmd novaock-shell)"
  echo -e "    ${_CLR_BLUE}>${_CLR_RESET} $(_cmd 'nova-ai channels login --channel whatsapp')"
  echo -e "    ${_CLR_BLUE}>${_CLR_RESET} $(_cmd 'nova-ai status')"
  echo ""

  echo -e "${_CLR_BOLD}${_CLR_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${_CLR_RESET}"
  echo ""

  echo -e "${_CLR_CYAN}💡 All commands guide you through next steps!${_CLR_RESET}"
  echo -e "${_CLR_BLUE}📚 Docs: ${_CLR_RESET}${_CLR_CYAN}https://docs.nova-ai.com${_CLR_RESET}"
  echo ""
}
