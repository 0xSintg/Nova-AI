import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempDir } from "./test-helpers/temp-dir.js";
import {
  ensureDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "nova-ai-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.nova-ai when legacy dir is missing", async () => {
    await withTempDir({ prefix: "nova-ai-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".nova-ai");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands NOVA_AI_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/nova-ai-home",
      NOVA_AI_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/nova-ai-home", "state"));
  });

  it("falls back to the config file directory when only NOVA_AI_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/nova-ai-home",
      NOVA_AI_CONFIG_PATH: "~/profiles/dev/nova-ai.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/nova-ai-home", "profiles", "dev"));
  });
});

describe("resolveHomeDir", () => {
  it("prefers NOVA_AI_HOME over HOME", () => {
    vi.stubEnv("NOVA_AI_HOME", "/srv/nova-ai-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/nova-ai-home"));
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomePath", () => {
  it("uses $NOVA_AI_HOME prefix when NOVA_AI_HOME is set", () => {
    vi.stubEnv("NOVA_AI_HOME", "/srv/nova-ai-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(shortenHomePath(`${path.resolve("/srv/nova-ai-home")}/.nova-ai/nova-ai.json`)).toBe(
        "$NOVA_AI_HOME/.nova-ai/nova-ai.json",
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomeInString", () => {
  it("uses $NOVA_AI_HOME replacement when NOVA_AI_HOME is set", () => {
    vi.stubEnv("NOVA_AI_HOME", "/srv/nova-ai-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(
        shortenHomeInString(
          `config: ${path.resolve("/srv/nova-ai-home")}/.nova-ai/nova-ai.json`,
        ),
      ).toBe("config: $NOVA_AI_HOME/.nova-ai/nova-ai.json");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/nova-ai", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "nova-ai"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers NOVA_AI_HOME for tilde expansion", () => {
    vi.stubEnv("NOVA_AI_HOME", "/srv/nova-ai-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveUserPath("~/nova-ai")).toBe(path.resolve("/srv/nova-ai-home", "nova-ai"));
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/nova-ai-home",
      NOVA_AI_HOME: "/srv/nova-ai-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/nova-ai", env)).toBe(path.resolve("/srv/nova-ai-home", "nova-ai"));
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
