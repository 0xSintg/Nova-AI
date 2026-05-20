import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isHelpOrVersionInvocation,
  isRootHelpInvocation,
  isRootVersionInvocation,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "nova-ai", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "nova-ai", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "nova-ai", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "nova-ai", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "nova-ai", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "nova-ai", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "nova-ai", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "nova-ai", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "nova-ai", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root help command",
      argv: ["node", "nova-ai", "help"],
      expected: true,
    },
    {
      name: "root help command with target",
      argv: ["node", "nova-ai", "help", "matrix"],
      expected: true,
    },
    {
      name: "nested help command",
      argv: ["node", "nova-ai", "matrix", "encryption", "help"],
      expected: true,
    },
    {
      name: "known subcommand root help command",
      argv: ["node", "nova-ai", "config", "help"],
      expected: true,
    },
    {
      name: "known leaf command positional help",
      argv: ["node", "nova-ai", "docs", "help"],
      expected: false,
    },
    {
      name: "known subcommand leaf positional help",
      argv: ["node", "nova-ai", "config", "set", "some.path", "help"],
      expected: false,
    },
    {
      name: "unknown plugin command help",
      argv: ["node", "nova-ai", "external-plugin", "tools", "help"],
      expected: true,
    },
    {
      name: "help flag",
      argv: ["node", "nova-ai", "matrix", "encryption", "--help"],
      expected: true,
    },
    {
      name: "help as option value",
      argv: ["node", "nova-ai", "agent", "--message", "help"],
      expected: false,
    },
    {
      name: "help after terminator",
      argv: ["node", "nova-ai", "nodes", "invoke", "--", "help"],
      expected: false,
    },
    {
      name: "help flag after terminator",
      argv: ["node", "nova-ai", "nodes", "invoke", "--", "--help"],
      expected: false,
    },
    {
      name: "version flag after terminator",
      argv: ["node", "nova-ai", "nodes", "invoke", "--", "--version"],
      expected: false,
    },
  ])("detects help/version invocations: $name", ({ argv, expected }) => {
    expect(isHelpOrVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "nova-ai", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "nova-ai", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "nova-ai", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "nova-ai", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "nova-ai", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "nova-ai", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "nova-ai", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "nova-ai", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "nova-ai", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "nova-ai", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "nova-ai", "nodes", "invoke", "--", "device.status", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "nova-ai", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "nova-ai", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "nova-ai", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "nova-ai", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "nova-ai", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        [
          "node",
          "nova-ai",
          "--profile",
          "work",
          "--container",
          "demo",
          "--no-color",
          "config",
          "validate",
        ],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "nova-ai", "config", "get", "--log-level", "debug", "update.channel", "--json"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "nova-ai", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "nova-ai", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "nova-ai", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "nova-ai"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "nova-ai", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "nova-ai", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "nova-ai", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "nova-ai", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "nova-ai", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "nova-ai", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "nova-ai", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "nova-ai", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "nova-ai", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "nova-ai", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "nova-ai", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "nova-ai", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "nova-ai", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "nova-ai", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "nova-ai", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it.each([
    {
      name: "keeps plain node argv",
      rawArgs: ["node", "nova-ai", "status"],
      expected: ["node", "nova-ai", "status"],
    },
    {
      name: "keeps version-suffixed node binary",
      rawArgs: ["node-22", "nova-ai", "status"],
      expected: ["node-22", "nova-ai", "status"],
    },
    {
      name: "keeps windows versioned node exe",
      rawArgs: ["node-22.2.0.exe", "nova-ai", "status"],
      expected: ["node-22.2.0.exe", "nova-ai", "status"],
    },
    {
      name: "keeps dotted node binary",
      rawArgs: ["node-22.2", "nova-ai", "status"],
      expected: ["node-22.2", "nova-ai", "status"],
    },
    {
      name: "keeps dotted node exe",
      rawArgs: ["node-22.2.exe", "nova-ai", "status"],
      expected: ["node-22.2.exe", "nova-ai", "status"],
    },
    {
      name: "keeps absolute versioned node path",
      rawArgs: ["/usr/bin/node-22.2.0", "nova-ai", "status"],
      expected: ["/usr/bin/node-22.2.0", "nova-ai", "status"],
    },
    {
      name: "keeps node24 shorthand",
      rawArgs: ["node24", "nova-ai", "status"],
      expected: ["node24", "nova-ai", "status"],
    },
    {
      name: "keeps absolute node24 shorthand",
      rawArgs: ["/usr/bin/node24", "nova-ai", "status"],
      expected: ["/usr/bin/node24", "nova-ai", "status"],
    },
    {
      name: "keeps windows node24 exe",
      rawArgs: ["node24.exe", "nova-ai", "status"],
      expected: ["node24.exe", "nova-ai", "status"],
    },
    {
      name: "keeps nodejs binary",
      rawArgs: ["nodejs", "nova-ai", "status"],
      expected: ["nodejs", "nova-ai", "status"],
    },
    {
      name: "prefixes fallback when first arg is not a node launcher",
      rawArgs: ["node-dev", "nova-ai", "status"],
      expected: ["node", "nova-ai", "node-dev", "nova-ai", "status"],
    },
    {
      name: "prefixes fallback when raw args start at program name",
      rawArgs: ["nova-ai", "status"],
      expected: ["node", "nova-ai", "status"],
    },
    {
      name: "keeps bun execution argv",
      rawArgs: ["bun", "src/entry.ts", "status"],
      expected: ["bun", "src/entry.ts", "status"],
    },
  ] as const)("builds parse argv from raw args: $name", ({ rawArgs, expected }) => {
    const parsed = buildParseArgv({
      programName: "nova-ai",
      rawArgs: [...rawArgs],
    });
    expect(parsed).toEqual([...expected]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "nova-ai",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "nova-ai", "status"]);
  });

  it.each([
    { argv: ["node", "nova-ai", "status"], expected: false },
    { argv: ["node", "nova-ai", "health"], expected: false },
    { argv: ["node", "nova-ai", "sessions"], expected: false },
    { argv: ["node", "nova-ai", "config", "get", "update"], expected: false },
    { argv: ["node", "nova-ai", "config", "unset", "update"], expected: false },
    { argv: ["node", "nova-ai", "models", "list"], expected: false },
    { argv: ["node", "nova-ai", "models", "status"], expected: false },
    { argv: ["node", "nova-ai", "update", "status", "--json"], expected: false },
    { argv: ["node", "nova-ai", "agent", "--message", "hi"], expected: false },
    { argv: ["node", "nova-ai", "agents", "list"], expected: true },
    { argv: ["node", "nova-ai", "message", "send"], expected: true },
  ] as const)("decides when to migrate state: $argv", ({ argv, expected }) => {
    expect(shouldMigrateState([...argv])).toBe(expected);
  });

  it.each([
    { path: ["status"], expected: false },
    { path: ["update", "status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["models", "status"], expected: false },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
