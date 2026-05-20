import type { Nova AIConfig } from "../../config/types.nova-ai.js";

export function makeModelFallbackCfg(overrides: Partial<Nova AIConfig> = {}): Nova AIConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as Nova AIConfig;
}
