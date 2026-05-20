---
summary: "Uninstall Nova AI completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Nova AI from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `nova-ai` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
nova-ai uninstall
```

Non-interactive (automation / npx):

```bash
nova-ai uninstall --all --yes --non-interactive
npx -y nova-ai uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
nova-ai gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
nova-ai gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${NOVA_AI_STATE_DIR:-$HOME/.nova-ai}"
```

If you set `NOVA_AI_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.nova-ai/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g nova-ai
pnpm remove -g nova-ai
bun remove -g nova-ai
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Nova AI.app
```

Notes:

- If you used profiles (`--profile` / `NOVA_AI_PROFILE`), repeat step 3 for each state dir (defaults are `~/.nova-ai-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `nova-ai` is missing.

### macOS (launchd)

Default label is `ai.nova-ai.gateway` (or `ai.nova-ai.<profile>`; legacy `com.nova-ai.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.nova-ai.gateway
rm -f ~/Library/LaunchAgents/ai.nova-ai.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.nova-ai.<profile>`. Remove any legacy `com.nova-ai.*` plists if present.

### Linux (systemd user unit)

Default unit name is `nova-ai-gateway.service` (or `nova-ai-gateway-<profile>.service`):

```bash
systemctl --user disable --now nova-ai-gateway.service
rm -f ~/.config/systemd/user/nova-ai-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Nova AI Gateway` (or `Nova AI Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Nova AI Gateway"
Remove-Item -Force "$env:USERPROFILE\.nova-ai\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.nova-ai-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://nova-ai.com/install.sh` or `install.ps1`, the CLI was installed with `npm install -g nova-ai@latest`.
Remove it with `npm rm -g nova-ai` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `nova-ai ...` / `bun run nova-ai ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
