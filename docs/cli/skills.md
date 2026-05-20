---
summary: "CLI reference for `nova-ai skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from ClawHub
  - You want to debug missing binaries/env/config for skills
title: "Skills"
---

# `nova-ai skills`

Inspect local skills and install/update skills from ClawHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- ClawHub installs: [ClawHub](/clawhub/cli)

## Commands

```bash
nova-ai skills search "calendar"
nova-ai skills search --limit 20 --json
nova-ai skills install <slug>
nova-ai skills install <slug> --version <version>
nova-ai skills install <slug> --force
nova-ai skills install <slug> --agent <id>
nova-ai skills install <slug> --global
nova-ai skills update <slug>
nova-ai skills update <slug> --global
nova-ai skills update --all
nova-ai skills update --all --agent <id>
nova-ai skills update --all --global
nova-ai skills list
nova-ai skills list --eligible
nova-ai skills list --json
nova-ai skills list --verbose
nova-ai skills list --agent <id>
nova-ai skills info <name>
nova-ai skills info <name> --json
nova-ai skills info <name> --agent <id>
nova-ai skills check
nova-ai skills check --agent <id>
nova-ai skills check --json
```

`search`/`install`/`update` use ClawHub directly. By default, `install` and
`update` target the active workspace `skills/` directory; with `--global`, they
target the shared managed skills directory. `list`/`info`/`check` still inspect
the local skills visible to the current workspace and config. Workspace-backed
commands resolve the target workspace from `--agent <id>`, then the current
working directory when it is inside a configured agent workspace, then the
default agent.

This CLI `install` command downloads skill folders from ClawHub. Gateway-backed
skill dependency installs triggered from onboarding or Skills settings use the
separate `skills.install` request path instead.

Notes:

- `search [query...]` accepts an optional query; omit it to browse the default
  ClawHub search feed.
- `search --limit <n>` caps returned results.
- `install --force` overwrites an existing workspace skill folder for the same
  slug.
- `--global` targets the shared managed skills directory and cannot be combined
  with `--agent <id>`.
- `--agent <id>` targets one configured agent workspace and overrides current
  working directory inference.
- `update <slug>` updates a single tracked skill. Add `--global` to target the
  shared managed skills directory instead of the workspace.
- `update --all` updates tracked ClawHub installs in the selected workspace, or
  in the shared managed skills directory when combined with `--global`.
- `check --agent <id>` checks the selected agent's workspace and reports which
  ready skills are actually visible to that agent's prompt or command surface.
- `list` is the default action when no subcommand is provided.
- `list`, `info`, and `check` write their rendered output to stdout. With
  `--json`, that means the machine-readable payload stays on stdout for pipes
  and scripts.

## Related

- [CLI reference](/cli)
- [Skills](/tools/skills)
