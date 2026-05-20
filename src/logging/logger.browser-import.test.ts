import { importFreshModule } from "nova-ai/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredNova AITmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredNova AITmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredNova AITmpDir =
    params?.resolvePreferredNova AITmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredNova AITmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-nova-ai-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-nova-ai-dir.js")>(
      "../infra/tmp-nova-ai-dir.js",
    );
    return {
      ...actual,
      resolvePreferredNova AITmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredNova AITmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-nova-ai-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredNova AITmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredNova AITmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/nova-ai");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/nova-ai/nova-ai.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredNova AITmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/nova-ai/nova-ai.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredNova AITmpDir).not.toHaveBeenCalled();
  });
});
