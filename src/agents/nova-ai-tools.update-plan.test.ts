import { afterEach, describe, expect, it } from "vitest";
import type { Nova AIConfig } from "../config/config.js";
import { setEmbeddedMode } from "../infra/embedded-mode.js";
import { createNova AITools } from "./nova-ai-tools.js";
import { isUpdatePlanToolEnabledForNova AITools } from "./nova-ai-tools.registration.js";
import { isToolWrappedWithBeforeToolCallHook } from "./pi-tools.before-tool-call.js";
import { createUpdatePlanTool } from "./tools/update-plan-tool.js";

type UpdatePlanGatingParams = Parameters<typeof isUpdatePlanToolEnabledForNova AITools>[0];

function expectUpdatePlanEnabled(params: UpdatePlanGatingParams, expected: boolean): void {
  expect(isUpdatePlanToolEnabledForNova AITools(params)).toBe(expected);
}

function toolNames(tools: ReturnType<typeof createNova AITools>): string[] {
  return tools.map((tool) => tool.name);
}

function expectToolNamed(
  tools: ReturnType<typeof createNova AITools>,
  name: string,
): ReturnType<typeof createNova AITools>[number] {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Expected tool ${name} to be registered`);
  }
  return tool;
}

function openAiGpt5Params(
  config: Nova AIConfig,
  overrides: Partial<UpdatePlanGatingParams> = {},
): UpdatePlanGatingParams {
  const params: UpdatePlanGatingParams = {
    config,
    agentSessionKey: "agent:main:main",
    modelProvider: "openai",
    modelId: "gpt-5.4",
    ...overrides,
  };
  if ("agentId" in overrides && !("agentSessionKey" in overrides)) {
    delete params.agentSessionKey;
  }
  return params;
}

describe("nova-ai-tools update_plan gating", () => {
  afterEach(() => {
    setEmbeddedMode(false);
  });

  it("keeps update_plan disabled by default", () => {
    expectUpdatePlanEnabled({ config: {} as Nova AIConfig }, false);
  });

  it("does not expose update_plan from default tool construction", () => {
    const defaultTools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });
    const emptyAllowlistTools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: [],
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });

    expect(toolNames(defaultTools)).not.toContain("update_plan");
    expect(toolNames(emptyAllowlistTools)).not.toContain("update_plan");
  });

  it("wraps constructed tools with before-tool-call hooks by default", () => {
    const tools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
    });
    const unwrappedTools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      wrapBeforeToolCallHook: false,
    });

    expect(isToolWrappedWithBeforeToolCallHook(expectToolNamed(tools, "sessions_list"))).toBe(true);
    expect(
      isToolWrappedWithBeforeToolCallHook(expectToolNamed(unwrappedTools, "sessions_list")),
    ).toBe(false);
  });

  it("keeps message tool in embedded message-tool-only completions", () => {
    setEmbeddedMode(true);
    const tools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      sourceReplyDeliveryMode: "message_tool_only",
    });

    expect(toolNames(tools)).toContain("message");
  });

  it("keeps explicitly allowed message tool in embedded completions", () => {
    setEmbeddedMode(true);
    const fromRuntimeAllowlist = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: ["message"],
    });
    const fromGlobalAlsoAllow = createNova AITools({
      config: { tools: { profile: "minimal", alsoAllow: ["message"] } } as Nova AIConfig,
      disablePluginTools: true,
    });
    const denied = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: ["message"],
      pluginToolDenylist: ["message"],
    });

    expect(toolNames(fromRuntimeAllowlist)).toContain("message");
    expect(toolNames(fromGlobalAlsoAllow)).toContain("message");
    expect(toolNames(denied)).not.toContain("message");
  });

  it("keeps subagent spawn available for trusted embedded gateway-bound runs", () => {
    setEmbeddedMode(true);
    const defaultTools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
    });
    const gatewayBoundTools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      allowGatewaySubagentBinding: true,
    });

    expect(toolNames(defaultTools)).not.toContain("sessions_spawn");
    expect(toolNames(defaultTools)).not.toContain("sessions_send");
    expect(toolNames(gatewayBoundTools)).toContain("sessions_spawn");
    expect(toolNames(gatewayBoundTools)).not.toContain("sessions_send");
  });

  it("registers update_plan when explicitly enabled", () => {
    const config = {
      tools: {
        experimental: {
          planTool: true,
        },
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled({ config }, true);
    expect(createUpdatePlanTool().displaySummary).toBe("Track short work plan.");
  });

  it("registers update_plan when the runtime allowlist explicitly requests it", () => {
    const tools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: ["update_plan"],
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });

    expect(toolNames(tools)).toContain("update_plan");
  });

  it("registers update_plan when a config allowlist group includes it", () => {
    const tools = createNova AITools({
      config: { tools: { allow: ["group:agents"] } } as Nova AIConfig,
      disablePluginTools: true,
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });

    expect(toolNames(tools)).toContain("update_plan");
  });

  it("registers update_plan when a runtime allowlist group includes it", () => {
    const tools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: ["group:agents"],
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });

    expect(toolNames(tools)).toContain("update_plan");
  });

  it("respects deny policy while constructing update_plan for grouped allowlists", () => {
    const tools = createNova AITools({
      config: {} as Nova AIConfig,
      disablePluginTools: true,
      pluginToolAllowlist: ["group:agents"],
      pluginToolDenylist: ["update_plan"],
      modelProvider: "anthropic",
      modelId: "claude-sonnet-4-6",
    });

    expect(toolNames(tools)).not.toContain("update_plan");
  });

  it("auto-enables update_plan for unconfigured GPT-5 openai runs", () => {
    // Criterion 1 of the GPT-5.4 parity gate ("no stalls after planning") is
    // universal, not opt-in. Unspecified executionContract on a supported
    // provider/model auto-activates strict-agentic so unconfigured installs
    // get the same behavior as explicit opt-in. Explicit "default" still
    // opts out (see "respects explicit default contract opt-out" below).
    const cfg = {
      agents: {
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg), true);
    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { modelProvider: "openai-codex" }), true);
  });

  it("respects explicit default contract opt-out on GPT-5 runs", () => {
    // Users who explicitly set executionContract: "default" are saying they
    // want the old pre-parity-program behavior. Honor that opt-out.
    const cfg = {
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "default",
          },
        },
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg), false);
  });

  it("does not auto-enable update_plan for non-openai providers even when unconfigured", () => {
    const cfg = {
      agents: {
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(
      openAiGpt5Params(cfg, { modelProvider: "anthropic", modelId: "claude-sonnet-4-6" }),
      false,
    );
    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { modelId: "gpt-4.1" }), false);
  });

  it("auto-enables update_plan for strict-agentic GPT-5 agents", () => {
    const cfg = {
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "strict-agentic",
          },
        },
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg), true);
  });

  it("does not auto-enable update_plan for unsupported providers or models", () => {
    const cfg = {
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "strict-agentic",
          },
        },
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(
      openAiGpt5Params(cfg, { modelProvider: "anthropic", modelId: "claude-sonnet-4-6" }),
      false,
    );
    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { modelId: "gpt-4.1" }), false);
  });

  it("lets explicit planTool false override strict-agentic auto-enable", () => {
    const cfg = {
      tools: {
        experimental: {
          planTool: false,
        },
      },
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "strict-agentic",
          },
        },
        list: [{ id: "main" }],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg), false);
  });

  it("resolves strict-agentic gating from explicit agentId when no session key is available", () => {
    const cfg = {
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "default",
          },
        },
        list: [
          { id: "main" },
          {
            id: "research",
            embeddedPi: {
              executionContract: "strict-agentic",
            },
          },
        ],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { agentId: "research" }), true);
  });

  it("applies per-agent overrides without leaking the contract to other agents", () => {
    const cfg = {
      agents: {
        defaults: {
          embeddedPi: {
            executionContract: "strict-agentic",
          },
        },
        list: [
          {
            id: "main",
            embeddedPi: {
              executionContract: "default",
            },
          },
          {
            id: "research",
          },
        ],
      },
    } as Nova AIConfig;

    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { agentId: "main" }), false);
    expectUpdatePlanEnabled(openAiGpt5Params(cfg, { agentId: "research" }), true);
  });
});
