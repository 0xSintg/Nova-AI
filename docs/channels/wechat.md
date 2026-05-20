---
summary: "WeChat channel setup through the external nova-ai-weixin plugin"
read_when:
  - You want to connect Nova AI to WeChat or Weixin
  - You are installing or troubleshooting the nova-ai-weixin channel plugin
  - You need to understand how external channel plugins run beside the Gateway
title: "WeChat"
---

Nova AI connects to WeChat through Tencent's external
`@tencent-weixin/nova-ai-weixin` channel plugin.

Status: external plugin. Direct chats and media are supported. Group chats are not
advertised by the current plugin capability metadata.

## Naming

- **WeChat** is the user-facing name in these docs.
- **Weixin** is the name used by Tencent's package and by the plugin id.
- `nova-ai-weixin` is the Nova AI channel id.
- `@tencent-weixin/nova-ai-weixin` is the npm package.

Use `nova-ai-weixin` in CLI commands and config paths.

## How it works

The WeChat code does not live in the Nova AI core repo. Nova AI provides the
generic channel plugin contract, and the external plugin provides the
WeChat-specific runtime:

1. `nova-ai plugins install` installs `@tencent-weixin/nova-ai-weixin`.
2. The Gateway discovers the plugin manifest and loads the plugin entrypoint.
3. The plugin registers channel id `nova-ai-weixin`.
4. `nova-ai channels login --channel nova-ai-weixin` starts QR login.
5. The plugin stores account credentials under the Nova AI state directory.
6. When the Gateway starts, the plugin starts its Weixin monitor for each
   configured account.
7. Inbound WeChat messages are normalized through the channel contract, routed to
   the selected Nova AI agent, and sent back through the plugin outbound path.

That separation matters: Nova AI core should stay channel-agnostic. WeChat login,
Tencent iLink API calls, media upload/download, context tokens, and account
monitoring are owned by the external plugin.

## Install

Quick install:

```bash
npx -y @tencent-weixin/nova-ai-weixin-cli install
```

Manual install:

```bash
nova-ai plugins install "@tencent-weixin/nova-ai-weixin"
nova-ai config set plugins.entries.nova-ai-weixin.enabled true
```

Restart the Gateway after install:

```bash
nova-ai gateway restart
```

## Login

Run QR login on the same machine that runs the Gateway:

```bash
nova-ai channels login --channel nova-ai-weixin
```

Scan the QR code with WeChat on your phone and confirm the login. The plugin saves
the account token locally after a successful scan.

To add another WeChat account, run the same login command again. For multiple
accounts, isolate direct-message sessions by account, channel, and sender:

```bash
nova-ai config set session.dmScope per-account-channel-peer
```

## Access control

Direct messages use the normal Nova AI pairing and allowlist model for channel
plugins.

Approve new senders:

```bash
nova-ai pairing list nova-ai-weixin
nova-ai pairing approve nova-ai-weixin <CODE>
```

For the full access-control model, see [Pairing](/channels/pairing).

## Compatibility

The plugin checks the host Nova AI version at startup.

| Plugin line | Nova AI version        | npm tag  |
| ----------- | ----------------------- | -------- |
| `2.x`       | `>=2026.3.22`           | `latest` |
| `1.x`       | `>=2026.1.0 <2026.3.22` | `legacy` |

If the plugin reports that your Nova AI version is too old, either update
Nova AI or install the legacy plugin line:

```bash
nova-ai plugins install @tencent-weixin/nova-ai-weixin@legacy
```

## Sidecar process

The WeChat plugin can run helper work beside the Gateway while it monitors the
Tencent iLink API. In issue #68451, that helper path exposed a bug in Nova AI's
generic stale-Gateway cleanup: a child process could try to clean up the parent
Gateway process, causing restart loops under process managers such as systemd.

Current Nova AI startup cleanup excludes the current process and its ancestors,
so a channel helper must not kill the Gateway that launched it. This fix is
generic; it is not a WeChat-specific path in core.

## Troubleshooting

Check install and status:

```bash
nova-ai plugins list
nova-ai channels status --probe
nova-ai --version
```

If the channel shows as installed but does not connect, confirm that the plugin is
enabled and restart:

```bash
nova-ai config set plugins.entries.nova-ai-weixin.enabled true
nova-ai gateway restart
```

If the Gateway restarts repeatedly after enabling WeChat, update both Nova AI and
the plugin:

```bash
npm view @tencent-weixin/nova-ai-weixin version
nova-ai plugins install "@tencent-weixin/nova-ai-weixin" --force
nova-ai gateway restart
```

If startup reports that the installed plugin package `requires compiled runtime
output for TypeScript entry`, the npm package was published without the compiled
JavaScript runtime files Nova AI needs. Update/reinstall after the plugin
publisher ships a fixed package, or temporarily disable/uninstall the plugin.

Temporary disable:

```bash
nova-ai config set plugins.entries.nova-ai-weixin.enabled false
nova-ai gateway restart
```

## Related docs

- Channel overview: [Chat Channels](/channels)
- Pairing: [Pairing](/channels/pairing)
- Channel routing: [Channel Routing](/channels/channel-routing)
- Plugin architecture: [Plugin Architecture](/plugins/architecture)
- Channel plugin SDK: [Channel Plugin SDK](/plugins/sdk-channel-plugins)
- External package: [@tencent-weixin/nova-ai-weixin](https://www.npmjs.com/package/@tencent-weixin/nova-ai-weixin)
