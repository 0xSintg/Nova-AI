import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "nova-ai",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "nova-ai", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "nova-ai",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nova-ai",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "nova-ai", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "nova-ai", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "nova-ai", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nova-ai", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "nova-ai", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nova-ai", "status", "--deep"]);
  });

  it("preserves Matrix QA --profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "nova-ai",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nova-ai",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
  });

  it("preserves Matrix QA --profile after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "nova-ai",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "nova-ai", "--no-color", "qa", "matrix", "--profile=fast"]);
  });

  it("still parses root --profile before Matrix QA", () => {
    const res = parseCliProfileArgs([
      "node",
      "nova-ai",
      "--profile",
      "work",
      "qa",
      "matrix",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nova-ai", "qa", "matrix", "--fail-fast"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "nova-ai", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "nova-ai", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "nova-ai", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "nova-ai", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "nova-ai", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "nova-ai", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".nova-ai-dev");
    expect(env.NOVA_AI_PROFILE).toBe("dev");
    expect(env.NOVA_AI_STATE_DIR).toBe(expectedStateDir);
    expect(env.NOVA_AI_CONFIG_PATH).toBe(path.join(expectedStateDir, "nova-ai.json"));
    expect(env.NOVA_AI_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      NOVA_AI_STATE_DIR: "/custom",
      NOVA_AI_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.NOVA_AI_STATE_DIR).toBe("/custom");
    expect(env.NOVA_AI_GATEWAY_PORT).toBe("19099");
    expect(env.NOVA_AI_CONFIG_PATH).toBe(path.join("/custom", "nova-ai.json"));
  });

  it("uses NOVA_AI_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      NOVA_AI_HOME: "/srv/nova-ai-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/nova-ai-home");
    expect(env.NOVA_AI_STATE_DIR).toBe(path.join(resolvedHome, ".nova-ai-work"));
    expect(env.NOVA_AI_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".nova-ai-work", "nova-ai.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "nova-ai doctor --fix",
      env: {},
      expected: "nova-ai doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "nova-ai doctor --fix",
      env: { NOVA_AI_PROFILE: "default" },
      expected: "nova-ai doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "nova-ai doctor --fix",
      env: { NOVA_AI_PROFILE: "Default" },
      expected: "nova-ai doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "nova-ai doctor --fix",
      env: { NOVA_AI_PROFILE: "bad profile" },
      expected: "nova-ai doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "nova-ai --profile work doctor --fix",
      env: { NOVA_AI_PROFILE: "work" },
      expected: "nova-ai --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "nova-ai --dev doctor",
      env: { NOVA_AI_PROFILE: "dev" },
      expected: "nova-ai --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("nova-ai doctor --fix", { NOVA_AI_PROFILE: "work" })).toBe(
      "nova-ai --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("nova-ai doctor --fix", { NOVA_AI_PROFILE: "  jbnova-ai  " })).toBe(
      "nova-ai --profile jbnova-ai doctor --fix",
    );
  });

  it("handles command with no args after nova-ai", () => {
    expect(formatCliCommand("nova-ai", { NOVA_AI_PROFILE: "test" })).toBe(
      "nova-ai --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm nova-ai doctor", { NOVA_AI_PROFILE: "work" })).toBe(
      "pnpm nova-ai --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("nova-ai gateway status --deep", { NOVA_AI_CONTAINER_HINT: "demo" }),
    ).toBe("nova-ai --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("nova-ai gateway status --deep", {
        NOVA_AI_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("nova-ai gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("nova-ai doctor", {
        NOVA_AI_CONTAINER_HINT: "demo",
        NOVA_AI_PROFILE: "work",
      }),
    ).toBe("nova-ai --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("nova-ai update", { NOVA_AI_CONTAINER_HINT: "demo" })).toBe(
      "nova-ai update",
    );
    expect(
      formatCliCommand("pnpm nova-ai update --channel beta", { NOVA_AI_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm nova-ai update --channel beta");
  });
});
