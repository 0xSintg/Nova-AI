---
summary: "CLI reference for `nova-ai browser` (lifecycle, profiles, tabs, actions, state, and debugging)"
read_when:
  - You use `nova-ai browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "Browser"
---

# `nova-ai browser`

Manage Nova AI's browser control surface and run browser actions (lifecycle, profiles, tabs, snapshots, screenshots, navigation, input, state emulation, and debugging).

Related:

- Browser tool + API: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout (ms).
- `--expect-final`: wait for a final Gateway response.
- `--browser-profile <name>`: choose a browser profile (default from config).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
nova-ai browser profiles
nova-ai browser --browser-profile nova-ai start
nova-ai browser --browser-profile nova-ai open https://example.com
nova-ai browser --browser-profile nova-ai snapshot
```

Agents can run the same readiness check with `browser({ action: "doctor" })`.

## Quick troubleshooting

If `start` fails with `not reachable after start`, troubleshoot CDP readiness first. If `start` and `tabs` succeed but `open` or `navigate` fails, the browser control plane is healthy and the failure is usually navigation SSRF policy.

Minimal sequence:

```bash
nova-ai browser --browser-profile nova-ai doctor
nova-ai browser --browser-profile nova-ai start
nova-ai browser --browser-profile nova-ai tabs
nova-ai browser --browser-profile nova-ai open https://example.com
```

Detailed guidance: [Browser troubleshooting](/tools/browser#cdp-startup-failure-vs-navigation-ssrf-block)

## Lifecycle

```bash
nova-ai browser status
nova-ai browser doctor
nova-ai browser doctor --deep
nova-ai browser start
nova-ai browser start --headless
nova-ai browser stop
nova-ai browser --browser-profile nova-ai reset-profile
```

Notes:

- `doctor --deep` adds a live snapshot probe. It is useful when basic CDP
  readiness is green but you want proof that the current tab can be inspected.
- For `attachOnly` and remote CDP profiles, `nova-ai browser stop` closes the
  active control session and clears temporary emulation overrides even when
  Nova AI did not launch the browser process itself.
- For local managed profiles, `nova-ai browser stop` stops the spawned browser
  process.
- `nova-ai browser start --headless` applies only to that start request and
  only when Nova AI launches a local managed browser. It does not rewrite
  `browser.headless` or profile config, and it is a no-op for an already-running
  browser.
- On Linux hosts without `DISPLAY` or `WAYLAND_DISPLAY`, local managed profiles
  run headless automatically unless `NOVA_AI_BROWSER_HEADLESS=0`,
  `browser.headless=false`, or `browser.profiles.<name>.headless=false`
  explicitly requests a visible browser.

## If the command is missing

If `nova-ai browser` is an unknown command, check `plugins.allow` in
`~/.nova-ai/nova-ai.json`.

When `plugins.allow` is present, list the bundled browser plugin explicitly
unless the config already has a root `browser` block:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

An explicit root `browser` block, for example `browser.enabled=true` or
`browser.profiles.<name>`, also activates the bundled browser plugin under a
restrictive plugin allowlist.

Related: [Browser tool](/tools/browser#missing-browser-command-or-tool)

## Profiles

Profiles are named browser routing configs. In practice:

- `nova-ai`: launches or attaches to a dedicated Nova AI-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
nova-ai browser profiles
nova-ai browser create-profile --name work --color "#FF5A36"
nova-ai browser create-profile --name chrome-live --driver existing-session
nova-ai browser create-profile --name remote --cdp-url https://browser-host.example.com
nova-ai browser delete-profile --name work
```

Use a specific profile:

```bash
nova-ai browser --browser-profile work tabs
```

## Tabs

```bash
nova-ai browser tabs
nova-ai browser tab new --label docs
nova-ai browser tab label t1 docs
nova-ai browser tab select 2
nova-ai browser tab close 2
nova-ai browser open https://docs.nova-ai.com --label docs
nova-ai browser focus docs
nova-ai browser close t1
```

`tabs` returns `suggestedTargetId` first, then the stable `tabId` such as `t1`,
the optional label, and the raw `targetId`. Agents should pass
`suggestedTargetId` back into `focus`, `close`, snapshots, and actions. You can
assign a label with `open --label`, `tab new --label`, or `tab label`; labels,
tab ids, raw target ids, and unique target-id prefixes are all accepted.
When Chromium replaces the underlying raw target during a navigation or form
submit, Nova AI keeps the stable `tabId`/label attached to the replacement tab
when it can prove the match. Raw target ids remain volatile; prefer
`suggestedTargetId`.

## Snapshot / screenshot / actions

Snapshot:

```bash
nova-ai browser snapshot
nova-ai browser snapshot --urls
```

Screenshot:

```bash
nova-ai browser screenshot
nova-ai browser screenshot --full-page
nova-ai browser screenshot --ref e12
nova-ai browser screenshot --labels
```

Notes:

- `--full-page` is for page captures only; it cannot be combined with `--ref`
  or `--element`.
- `existing-session` / `user` profiles support page screenshots and `--ref`
  screenshots from snapshot output, but not CSS `--element` screenshots.
- `--labels` overlays current snapshot refs on the screenshot.
- `snapshot --urls` appends discovered link destinations to AI snapshots so
  agents can choose direct navigation targets instead of guessing from link
  text alone.

Navigate/click/type (ref-based UI automation):

```bash
nova-ai browser navigate https://example.com
nova-ai browser click <ref>
nova-ai browser click-coords 120 340
nova-ai browser type <ref> "hello"
nova-ai browser press Enter
nova-ai browser hover <ref>
nova-ai browser scrollintoview <ref>
nova-ai browser drag <startRef> <endRef>
nova-ai browser select <ref> OptionA OptionB
nova-ai browser fill --fields '[{"ref":"1","value":"Ada"}]'
nova-ai browser wait --text "Done"
nova-ai browser evaluate --fn '(el) => el.textContent' --ref <ref>
nova-ai browser evaluate --timeout-ms 30000 --fn 'async () => { await window.ready; return true; }'
```

Use `evaluate --timeout-ms <ms>` when the page-side function may need longer
than the default evaluate timeout.

Action responses return the current raw `targetId` after action-triggered page
replacement when Nova AI can prove the replacement tab. Scripts should still
store and pass `suggestedTargetId`/labels for long-lived workflows.

File + dialog helpers:

```bash
nova-ai browser upload /tmp/nova-ai/uploads/file.pdf --ref <ref>
nova-ai browser waitfordownload
nova-ai browser download <ref> report.pdf
nova-ai browser dialog --accept
nova-ai browser dialog --dismiss --dialog-id d1
```

Managed Chrome profiles save ordinary click-triggered downloads into the Nova AI
downloads directory (`/tmp/nova-ai/downloads` by default, or the configured temp
root). Use `waitfordownload` or `download` when the agent needs to wait for a
specific file and return its path; those explicit waiters own the next download.
When an action opens a modal dialog, the action response returns
`blockedByDialog` with `browserState.dialogs.pending`; pass `--dialog-id` to
answer it directly. Dialogs handled outside Nova AI appear under
`browserState.dialogs.recent`.

## State and storage

Viewport + emulation:

```bash
nova-ai browser resize 1280 720
nova-ai browser set viewport 1280 720
nova-ai browser set offline on
nova-ai browser set media dark
nova-ai browser set timezone Europe/London
nova-ai browser set locale en-GB
nova-ai browser set geo 51.5074 -0.1278 --accuracy 25
nova-ai browser set device "iPhone 14"
nova-ai browser set headers '{"x-test":"1"}'
nova-ai browser set credentials myuser mypass
```

Cookies + storage:

```bash
nova-ai browser cookies
nova-ai browser cookies set session abc123 --url https://example.com
nova-ai browser cookies clear
nova-ai browser storage local get
nova-ai browser storage local set token abc123
nova-ai browser storage session clear
```

## Debugging

```bash
nova-ai browser console --level error
nova-ai browser pdf
nova-ai browser responsebody "**/api"
nova-ai browser highlight <ref>
nova-ai browser errors --clear
nova-ai browser requests --filter api
nova-ai browser trace start
nova-ai browser trace stop --out trace.zip
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
nova-ai browser --browser-profile user tabs
nova-ai browser create-profile --name chrome-live --driver existing-session
nova-ai browser create-profile --name brave-live --driver existing-session --user-data-dir "~/Library/Application Support/BraveSoftware/Brave-Browser"
nova-ai browser --browser-profile chrome-live tabs
```

This path is host-only. For Docker, headless servers, Browserless, or other remote setups, use a CDP profile instead.

Current existing-session limits:

- snapshot-driven actions use refs, not CSS selectors
- `browser.actionTimeoutMs` defaults supported `act` requests to 60000 ms when
  callers omit `timeoutMs`; per-call `timeoutMs` still wins.
- `click` is left-click only
- `type` does not support `slowly=true`
- `press` does not support `delayMs`
- `hover`, `scrollintoview`, `drag`, `select`, `fill`, and `evaluate` reject
  per-call timeout overrides
- `select` supports one value only
- `wait --load networkidle` is not supported
- file uploads require `--ref` / `--input-ref`, do not support CSS
  `--element`, and currently support one file at a time
- dialog hooks do not support `--timeout`
- screenshots support page captures and `--ref`, but not CSS `--element`
- `responsebody`, download interception, PDF export, and batch actions still
  require a managed browser or raw CDP profile

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway will proxy browser actions to that node (no separate browser control server required).

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)

## Related

- [CLI reference](/cli)
- [Browser](/tools/browser)
