import type { Nova AIConfig } from "../../config/types.nova-ai.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<Nova AIConfig["session"]>> = {},
): NonNullable<Nova AIConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
