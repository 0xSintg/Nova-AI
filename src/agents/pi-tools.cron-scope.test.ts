import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string, ownerOnly = false) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      ownerOnly,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createNova AIToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./nova-ai-tools.js", () => ({
  createNova AITools: (options: unknown) => {
    mocks.createNova AIToolsOptions(options);
    return [mocks.stubTool("cron", true)];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createNova AICodingTools } from "./pi-tools.js";

function firstNova AIToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createNova AIToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createNova AICodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createNova AIToolsOptions.mockClear();
  });

  it("scopes the cron owner-only runtime grant to self-removal", () => {
    const tools = createNova AICodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: false,
      ownerOnlyToolAllowlist: ["cron"],
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstNova AIToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope ordinary owner cron sessions", () => {
    createNova AICodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: true,
    });

    expect(firstNova AIToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
