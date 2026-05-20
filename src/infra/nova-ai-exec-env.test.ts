import { describe, expect, it } from "vitest";
import {
  ensureNova AIExecMarkerOnProcess,
  markNova AIExecEnv,
  NOVA_AI_CLI_ENV_VALUE,
  NOVA_AI_CLI_ENV_VAR,
} from "./nova-ai-exec-env.js";

describe("markNova AIExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", NOVA_AI_CLI: "0" };
    const marked = markNova AIExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      NOVA_AI_CLI: NOVA_AI_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.NOVA_AI_CLI).toBe("0");
  });
});

describe("ensureNova AIExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [NOVA_AI_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureNova AIExecMarkerOnProcess(env)).toBe(env);
    expect(env[NOVA_AI_CLI_ENV_VAR]).toBe(NOVA_AI_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[NOVA_AI_CLI_ENV_VAR];
    delete process.env[NOVA_AI_CLI_ENV_VAR];

    try {
      expect(ensureNova AIExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[NOVA_AI_CLI_ENV_VAR]).toBe(NOVA_AI_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[NOVA_AI_CLI_ENV_VAR];
      } else {
        process.env[NOVA_AI_CLI_ENV_VAR] = previous;
      }
    }
  });
});
