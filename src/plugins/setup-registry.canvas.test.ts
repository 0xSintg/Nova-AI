import path from "node:path";
import { describe, expect, test } from "vitest";
import type { Nova AIConfig } from "../config/types.nova-ai.js";
import { runPluginSetupConfigMigrations } from "./setup-registry.js";

describe("Canvas setup config migration", () => {
  test("rewrites legacy canvasHost into plugin-owned config", () => {
    const result = runPluginSetupConfigMigrations({
      env: {
        ...process.env,
        NOVA_AI_BUNDLED_PLUGINS_DIR: path.resolve("extensions"),
      },
      config: {
        canvasHost: {
          enabled: false,
          root: "~/legacy-canvas",
          liveReload: false,
        },
      } as Nova AIConfig,
    });

    expect(result.changes).toEqual(["migrated canvasHost to plugins.entries.canvas.config.host"]);
    expect(result.config).toEqual({
      plugins: {
        entries: {
          canvas: {
            config: {
              host: {
                enabled: false,
                root: "~/legacy-canvas",
                liveReload: false,
              },
            },
          },
        },
      },
    });
  });
});
