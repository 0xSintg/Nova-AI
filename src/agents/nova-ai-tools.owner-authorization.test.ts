import { describe, expect, it } from "vitest";
import {
  isNova AIOwnerOnlyCoreToolName,
  NOVA_AI_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createNova AITools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(NOVA_AI_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isNova AIOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isNova AIOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isNova AIOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isNova AIOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
