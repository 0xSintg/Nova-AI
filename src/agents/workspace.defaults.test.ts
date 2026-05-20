import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses NOVA_AI_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "nova-ai-home");
    vi.stubEnv("NOVA_AI_HOME", home);
    vi.stubEnv("HOME", path.join(path.sep, "home", "other"));

    expect(resolveDefaultAgentWorkspaceDir()).toBe(
      path.join(path.resolve(home), ".nova-ai", "workspace"),
    );
  });

  it("uses NOVA_AI_WORKSPACE_DIR before NOVA_AI_HOME", () => {
    const workspaceDir = path.join(path.sep, "srv", "nova-ai-workspace");
    vi.stubEnv("NOVA_AI_WORKSPACE_DIR", workspaceDir);
    vi.stubEnv("NOVA_AI_HOME", path.join(path.sep, "srv", "nova-ai-home"));

    expect(resolveDefaultAgentWorkspaceDir()).toBe(path.resolve(workspaceDir));
  });
});
