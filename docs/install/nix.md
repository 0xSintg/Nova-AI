---
summary: "Install Nova AI declaratively with Nix"
read_when:
  - You want reproducible, rollback-able installs
  - You're already using Nix/NixOS/Home Manager
  - You want everything pinned and managed declaratively
title: "Nix"
---

Install Nova AI declaratively with **[nix-nova-ai](https://github.com/nova-ai/nix-nova-ai)** - the first-party, batteries-included Home Manager module.

<Info>
The [nix-nova-ai](https://github.com/nova-ai/nix-nova-ai) repo is the source of truth for Nix installation. This page is a quick overview.
</Info>

## What you get

- Gateway + macOS app + tools (whisper, spotify, cameras) -- all pinned
- Launchd service that survives reboots
- Plugin system with declarative config
- Instant rollback: `home-manager switch --rollback`

## Quick start

<Steps>
  <Step title="Install Determinate Nix">
    If Nix is not already installed, follow the [Determinate Nix installer](https://github.com/DeterminateSystems/nix-installer) instructions.
  </Step>
  <Step title="Create a local flake">
    Use the agent-first template from the nix-nova-ai repo:
    ```bash
    mkdir -p ~/code/nova-ai-local
    # Copy templates/agent-first/flake.nix from the nix-nova-ai repo
    ```
  </Step>
  <Step title="Configure secrets">
    Set up your messaging bot token and model provider API key. Plain files at `~/.secrets/` work fine.
  </Step>
  <Step title="Fill in template placeholders and switch">
    ```bash
    home-manager switch
    ```
  </Step>
  <Step title="Verify">
    Confirm the launchd service is running and your bot responds to messages.
  </Step>
</Steps>

See the [nix-nova-ai README](https://github.com/nova-ai/nix-nova-ai) for full module options and examples.

## Nix-mode runtime behavior

When `NOVA_AI_NIX_MODE=1` is set (automatic with nix-nova-ai), Nova AI enters a deterministic mode for Nix-managed installs. Other Nix packages can set the same mode; nix-nova-ai is the first-party reference.

You can also set it manually:

```bash
export NOVA_AI_NIX_MODE=1
```

On macOS, the GUI app does not automatically inherit shell environment variables. Enable Nix mode via defaults instead:

```bash
defaults write ai.nova-ai.mac nova-ai.nixMode -bool true
```

### What changes in Nix mode

- Auto-install and self-mutation flows are disabled
- `nova-ai.json` is treated as immutable. Startup-derived defaults stay runtime-only, and config writers such as setup, onboarding, mutating `nova-ai update`, plugin install/update/uninstall/enable, `doctor --fix`, `doctor --generate-gateway-token`, and `nova-ai config set` refuse to edit the file.
- Agents should edit the Nix source instead. For nix-nova-ai, use the agent-first [Quick Start](https://github.com/nova-ai/nix-nova-ai#quick-start) and set config under `programs.nova-ai.config` or `instances.<name>.config`.
- Missing dependencies surface Nix-specific remediation messages
- UI surfaces a read-only Nix mode banner

### Config and state paths

Nova AI reads JSON5 config from `NOVA_AI_CONFIG_PATH` and stores mutable data in `NOVA_AI_STATE_DIR`. When running under Nix, set these explicitly to Nix-managed locations so runtime state and config stay out of the immutable store.

| Variable               | Default                                 |
| ---------------------- | --------------------------------------- |
| `NOVA_AI_HOME`        | `HOME` / `USERPROFILE` / `os.homedir()` |
| `NOVA_AI_STATE_DIR`   | `~/.nova-ai`                           |
| `NOVA_AI_CONFIG_PATH` | `$NOVA_AI_STATE_DIR/nova-ai.json`     |

### Service PATH discovery

The launchd/systemd gateway service auto-discovers Nix-profile binaries so
plugins and tools that shell out to `nix`-installed executables work without
manual PATH setup:

- When `NIX_PROFILES` is set, every entry is added to the service PATH in
  right-to-left precedence (matches Nix shell precedence - rightmost wins).
- When `NIX_PROFILES` is unset, `~/.nix-profile/bin` is added as a fallback.

This applies to both macOS launchd and Linux systemd service environments.

## Related

<CardGroup cols={2}>
  <Card title="nix-nova-ai" href="https://github.com/nova-ai/nix-nova-ai" icon="arrow-up-right-from-square">
    Source-of-truth Home Manager module and full setup guide.
  </Card>
  <Card title="Setup wizard" href="/start/wizard" icon="wand-magic-sparkles">
    Non-Nix CLI setup walkthrough.
  </Card>
  <Card title="Docker" href="/install/docker" icon="docker">
    Containerized setup as a non-Nix alternative.
  </Card>
  <Card title="Updating" href="/install/updating" icon="arrow-up-right-from-square">
    Updating Home Manager-managed installs alongside the package.
  </Card>
</CardGroup>
