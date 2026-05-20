---
summary: "ClawDock shell helpers for Docker-based Nova AI installs"
read_when:
  - You run Nova AI with Docker often and want shorter day-to-day commands
  - You want a helper layer for dashboard, logs, token setup, and pairing flows
title: "ClawDock"
---

ClawDock is a small shell-helper layer for Docker-based Nova AI installs.

It gives you short commands like `novaock-start`, `novaock-dashboard`, and `novaock-fix-token` instead of longer `docker compose ...` invocations.

If you have not set up Docker yet, start with [Docker](/install/docker).

## Install

Use the canonical helper path:

```bash
mkdir -p ~/.novaock && curl -sL https://raw.githubusercontent.com/nova-ai/nova-ai/main/scripts/novaock/novaock-helpers.sh -o ~/.novaock/novaock-helpers.sh
echo 'source ~/.novaock/novaock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

If you previously installed ClawDock from `scripts/shell-helpers/novaock-helpers.sh`, reinstall from the new `scripts/novaock/novaock-helpers.sh` path. The old raw GitHub path was removed.

## What you get

### Basic operations

| Command            | Description            |
| ------------------ | ---------------------- |
| `novaock-start`   | Start the gateway      |
| `novaock-stop`    | Stop the gateway       |
| `novaock-restart` | Restart the gateway    |
| `novaock-status`  | Check container status |
| `novaock-logs`    | Follow gateway logs    |

### Container access

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `novaock-shell`          | Open a shell inside the gateway container     |
| `novaock-cli <command>`  | Run Nova AI CLI commands in Docker           |
| `novaock-exec <command>` | Execute an arbitrary command in the container |

### Web UI and pairing

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `novaock-dashboard`    | Open the Control UI URL      |
| `novaock-devices`      | List pending device pairings |
| `novaock-approve <id>` | Approve a pairing request    |

### Setup and maintenance

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `novaock-fix-token` | Configure the gateway token inside the container |
| `novaock-update`    | Pull, rebuild, and restart                       |
| `novaock-rebuild`   | Rebuild the Docker image only                    |
| `novaock-clean`     | Remove containers and volumes                    |

### Utilities

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `novaock-health`      | Run a gateway health check              |
| `novaock-token`       | Print the gateway token                 |
| `novaock-cd`          | Jump to the Nova AI project directory  |
| `novaock-config`      | Open `~/.nova-ai`                      |
| `novaock-show-config` | Print config files with redacted values |
| `novaock-workspace`   | Open the workspace directory            |

## First-time flow

```bash
novaock-start
novaock-fix-token
novaock-dashboard
```

If the browser says pairing is required:

```bash
novaock-devices
novaock-approve <request-id>
```

## Config and secrets

ClawDock works with the same Docker config split described in [Docker](/install/docker):

- `<project>/.env` for Docker-specific values like image name, ports, and the gateway token
- `~/.nova-ai/.env` for env-backed provider keys and bot tokens
- `~/.nova-ai/agents/<agentId>/agent/auth-profiles.json` for stored provider OAuth/API-key auth
- `~/.nova-ai/nova-ai.json` for behavior config

Use `novaock-show-config` when you want to inspect the `.env` files and `nova-ai.json` quickly. It redacts `.env` values in its printed output.

## Related

<CardGroup cols={2}>
  <Card title="Docker" href="/install/docker" icon="docker">
    Canonical Docker install for Nova AI.
  </Card>
  <Card title="Docker VM runtime" href="/install/docker-vm-runtime" icon="cube">
    Docker-managed VM runtime for hardened isolation.
  </Card>
  <Card title="Updating" href="/install/updating" icon="arrow-up-right-from-square">
    Updating the Nova AI package and managed services.
  </Card>
</CardGroup>
