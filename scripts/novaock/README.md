# ClawDock <!-- omit in toc -->

Stop typing `docker-compose` commands. Just type `novaock-start`.

Inspired by Simon Willison's [Running Nova AI in Docker](https://til.simonwillison.net/llms/nova-ai-docker).

- [Quickstart](#quickstart)
- [Available Commands](#available-commands)
  - [Basic Operations](#basic-operations)
  - [Container Access](#container-access)
  - [Web UI \& Devices](#web-ui--devices)
  - [Setup \& Configuration](#setup--configuration)
  - [Maintenance](#maintenance)
  - [Utilities](#utilities)
- [Configuration \& Secrets](#configuration--secrets)
  - [Docker Files](#docker-files)
  - [Config Files](#config-files)
  - [Initial Setup](#initial-setup)
  - [How It Works in Docker](#how-it-works-in-docker)
  - [Env Precedence](#env-precedence)
- [Common Workflows](#common-workflows)
  - [Check Status and Logs](#check-status-and-logs)
  - [Set Up WhatsApp Bot](#set-up-whatsapp-bot)
  - [Troubleshooting Device Pairing](#troubleshooting-device-pairing)
  - [Fix Token Mismatch Issues](#fix-token-mismatch-issues)
  - [Permission Denied](#permission-denied)
- [Requirements](#requirements)
- [Development](#development)

## Quickstart

**Install:**

```bash
mkdir -p ~/.novaock && curl -sL https://raw.githubusercontent.com/nova-ai/nova-ai/main/scripts/novaock/novaock-helpers.sh -o ~/.novaock/novaock-helpers.sh
```

```bash
echo 'source ~/.novaock/novaock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

Canonical docs page: https://docs.nova-ai.com/install/novaock

If you previously installed ClawDock from `scripts/shell-helpers/novaock-helpers.sh`, rerun the install command above. The old raw GitHub path has been removed.

**See what you get:**

```bash
novaock-help
```

On first command, ClawDock auto-detects your Nova AI directory:

- Checks common paths (`~/nova-ai`, `~/workspace/nova-ai`, etc.)
- If found, asks you to confirm
- Saves to `~/.novaock/config`

**First time setup:**

```bash
novaock-start
```

```bash
novaock-fix-token
```

```bash
novaock-dashboard
```

If you see "pairing required":

```bash
novaock-devices
```

And approve the request for the specific device:

```bash
novaock-approve <request-id>
```

## Available Commands

### Basic Operations

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `novaock-start`   | Start the gateway               |
| `novaock-stop`    | Stop the gateway                |
| `novaock-restart` | Restart the gateway             |
| `novaock-status`  | Check container status          |
| `novaock-logs`    | View live logs (follows output) |

### Container Access

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `novaock-shell`          | Interactive shell inside the gateway container |
| `novaock-cli <command>`  | Run Nova AI CLI commands                      |
| `novaock-exec <command>` | Execute arbitrary commands in the container    |

### Web UI & Devices

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `novaock-dashboard`    | Open web UI in browser with authentication |
| `novaock-devices`      | List device pairing requests               |
| `novaock-approve <id>` | Approve a device pairing request           |

### Setup & Configuration

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `novaock-fix-token` | Configure gateway authentication token (run once) |

### Maintenance

| Command            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `novaock-update`  | Pull latest, rebuild image, and restart (one command) |
| `novaock-rebuild` | Rebuild the Docker image only                         |
| `novaock-clean`   | Remove all containers and volumes (destructive!)      |

### Utilities

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `novaock-health`      | Run gateway health check                  |
| `novaock-token`       | Display the gateway authentication token  |
| `novaock-cd`          | Jump to the Nova AI project directory    |
| `novaock-config`      | Open the Nova AI config directory        |
| `novaock-show-config` | Print config files with redacted values   |
| `novaock-workspace`   | Open the workspace directory              |
| `novaock-help`        | Show all available commands with examples |

## Configuration & Secrets

The Docker setup uses three config files on the host. The container never stores secrets — everything is bind-mounted from local files.

### Docker Files

| File                       | Purpose                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `Dockerfile`               | Builds the `nova-ai:local` image (Node 22, pnpm, non-root `node` user)    |
| `docker-compose.yml`       | Defines `nova-ai-gateway` and `nova-ai-cli` services, bind-mounts, ports |
| `scripts/docker/setup.sh`  | First-time setup — builds image, creates `.env` from `.env.example`        |
| `.env.example`             | Template for `<project>/.env` with all supported vars and docs             |
| `docker-compose.extra.yml` | Optional overrides — auto-loaded by ClawDock helpers if present            |

### Config Files

| File                        | Purpose                                          | Examples                                                                                                |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `<project>/.env`            | **Docker infra** — image, ports, gateway token   | `NOVA_AI_GATEWAY_TOKEN`, `NOVA_AI_IMAGE`, `NOVA_AI_GATEWAY_PORT`, `NOVA_AI_AUTH_PROFILE_SECRET_DIR` |
| `~/.nova-ai/.env`          | **Secrets** — API keys and bot tokens            | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`                                             |
| `~/.nova-ai/nova-ai.json` | **Behavior config** — models, channels, policies | Model selection, WhatsApp allowlists, agent settings                                                    |

**Do NOT** put API keys or bot tokens in `nova-ai.json`. Use `~/.nova-ai/.env` for all secrets.

### Initial Setup

`./scripts/docker/setup.sh` handles first-time Docker configuration:

- Builds the `nova-ai:local` image from `Dockerfile`
- Creates `<project>/.env` from `.env.example` with a generated gateway token
- Creates the auth-profile secret key directory
- Sets up `~/.nova-ai` directories if they don't exist

```bash
./scripts/docker/setup.sh
```

After setup, add your API keys:

```bash
vim ~/.nova-ai/.env
```

See `.env.example` for all supported keys.

The `Dockerfile` supports optional build args:

- `NOVA_AI_IMAGE_APT_PACKAGES` — extra apt packages to install (e.g. `ffmpeg`); also accepts legacy `NOVA_AI_DOCKER_APT_PACKAGES`
- `NOVA_AI_IMAGE_PIP_PACKAGES` — extra Python packages to install (e.g. `requests==2.32.5`); pin versions and use only package indexes you trust
- `NOVA_AI_INSTALL_BROWSER=1` — pre-install Chromium for browser automation (adds ~300MB, but skips the 60-90s Playwright install on each container start)

### How It Works in Docker

`docker-compose.yml` bind-mounts both config and workspace from the host:

```yaml
volumes:
  - ${NOVA_AI_CONFIG_DIR}:/home/node/.nova-ai
  - ${NOVA_AI_WORKSPACE_DIR}:/home/node/.nova-ai/workspace
  - ${NOVA_AI_AUTH_PROFILE_SECRET_DIR}:/home/node/.config/nova-ai
```

This means:

- `~/.nova-ai/.env` is available inside the container at `/home/node/.nova-ai/.env` — Nova AI loads it automatically as the global env fallback
- `~/.nova-ai/nova-ai.json` is available at `/home/node/.nova-ai/nova-ai.json` — the gateway watches it and hot-reloads most changes
- `~/.nova-ai-auth-profile-secrets` is available at `/home/node/.config/nova-ai` — Nova AI stores the auth-profile encryption key there
- Downloadable plugin packages and install records live under the mounted Nova AI home
- No need to add API keys to `docker-compose.yml` or configure anything inside the container
- Keys survive `novaock-update`, `novaock-rebuild`, and `novaock-clean` because they live on the host

The project `.env` feeds Docker Compose directly (gateway token, image name, ports). The `~/.nova-ai/.env` feeds the Nova AI process inside the container.

### Example `~/.nova-ai/.env`

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=123456:ABCDEF...
```

### Example `<project>/.env`

```bash
NOVA_AI_CONFIG_DIR=/Users/you/.nova-ai
NOVA_AI_WORKSPACE_DIR=/Users/you/.nova-ai/workspace
NOVA_AI_GATEWAY_PORT=18789
NOVA_AI_BRIDGE_PORT=18790
NOVA_AI_GATEWAY_BIND=lan
NOVA_AI_GATEWAY_TOKEN=<generated-by-docker-setup>
NOVA_AI_AUTH_PROFILE_SECRET_DIR=/Users/you/.nova-ai-auth-profile-secrets
NOVA_AI_IMAGE=nova-ai:local
```

### Env Precedence

Nova AI loads env vars in this order (highest wins, never overrides existing):

1. **Process environment** — `docker-compose.yml` `environment:` block (gateway token, session keys)
2. **`.env` in CWD** — project root `.env` (Docker infra vars)
3. **`~/.nova-ai/.env`** — global secrets (API keys, bot tokens)
4. **`nova-ai.json` `env` block** — inline vars, applied only if still missing
5. **Shell env import** — optional login-shell scrape (`NOVA_AI_LOAD_SHELL_ENV=1`)

## Common Workflows

### Update Nova AI

> **Important:** `nova-ai update` does not work inside Docker.
> The container runs as a non-root user with a source-built image, so `npm i -g` fails with EACCES.
> Use `novaock-update` instead — it pulls, rebuilds, and restarts from the host.

```bash
novaock-update
```

This runs `git pull` → `docker compose build` → `docker compose down/up` in one step.

If you only want to rebuild without pulling:

```bash
novaock-rebuild && novaock-stop && novaock-start
```

### Check Status and Logs

**Restart the gateway:**

```bash
novaock-restart
```

**Check container status:**

```bash
novaock-status
```

**View live logs:**

```bash
novaock-logs
```

### Set Up WhatsApp Bot

**Shell into the container:**

```bash
novaock-shell
```

**Inside the container, login to WhatsApp:**

```bash
nova-ai channels login --channel whatsapp --verbose
```

Scan the QR code with WhatsApp on your phone.

**Verify connection:**

```bash
nova-ai status
```

### Troubleshooting Device Pairing

**Check for pending pairing requests:**

```bash
novaock-devices
```

**Copy the Request ID from the "Pending" table, then approve:**

```bash
novaock-approve <request-id>
```

Then refresh your browser.

### Fix Token Mismatch Issues

If you see "gateway token mismatch" errors:

```bash
novaock-fix-token
```

This will:

1. Read the token from your `.env` file
2. Configure it in the Nova AI config
3. Restart the gateway
4. Verify the configuration

### Permission Denied

**Ensure Docker is running and you have permission:**

```bash
docker ps
```

## Requirements

- Docker and Docker Compose installed
- Bash or Zsh shell
- Nova AI project (run `scripts/docker/setup.sh`)

## Development

**Test with fresh config (mimics first-time install):**

```bash
unset NOVAOCK_DIR && rm -f ~/.novaock/config && source scripts/novaock/novaock-helpers.sh
```

Then run any command to trigger auto-detect:

```bash
novaock-start
```
