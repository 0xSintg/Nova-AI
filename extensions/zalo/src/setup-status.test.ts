import { createPluginSetupWizardStatus } from "nova-ai/plugin-sdk/plugin-test-runtime";
import { describe, expect, it } from "vitest";
import type { Nova AIConfig } from "../runtime-api.js";
import { zaloSetupWizard } from "./setup-surface.js";

const zaloGetStatus = createPluginSetupWizardStatus({
  id: "zalo",
  meta: {
    label: "Zalo",
  },
  setupWizard: zaloSetupWizard,
} as never);

describe("zalo setup wizard status", () => {
  it("treats SecretRef botToken as configured", async () => {
    const status = await zaloGetStatus({
      cfg: {
        channels: {
          zalo: {
            botToken: {
              source: "env",
              provider: "default",
              id: "ZALO_BOT_TOKEN",
            },
          },
        },
      } as Nova AIConfig,
      accountOverrides: {},
    });

    expect(status.configured).toBe(true);
  });
});
