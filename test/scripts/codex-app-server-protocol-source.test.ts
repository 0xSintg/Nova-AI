import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCodexAppServerProtocolSource } from "../../scripts/lib/codex-app-server-protocol-source.js";
import { createScriptTestHarness } from "./test-helpers.js";

const { createTempDir } = createScriptTestHarness();
const originalNova AICodexRepo = process.env.NOVA_AI_CODEX_REPO;

afterEach(() => {
  if (originalNova AICodexRepo === undefined) {
    delete process.env.NOVA_AI_CODEX_REPO;
  } else {
    process.env.NOVA_AI_CODEX_REPO = originalNova AICodexRepo;
  }
});

describe("codex app-server protocol source resolver", () => {
  it("uses NOVA_AI_CODEX_REPO when provided", async () => {
    const root = createTempDir("nova-ai-protocol-source-root-");
    const codexRepo = createTempDir("nova-ai-protocol-source-codex-");
    createProtocolSchema(codexRepo);
    process.env.NOVA_AI_CODEX_REPO = codexRepo;

    await expect(resolveCodexAppServerProtocolSource(root)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });

  it("finds the primary checkout sibling from a git worktree", async () => {
    const parentDir = createTempDir("nova-ai-protocol-source-parent-");
    const primaryNova AI = path.join(parentDir, "nova-ai");
    const codexRepo = path.join(parentDir, "codex");
    const worktreeRoot = createTempDir("nova-ai-protocol-source-worktree-");
    fs.mkdirSync(path.join(primaryNova AI, ".git", "worktrees", "codex-harness"), {
      recursive: true,
    });
    fs.mkdirSync(worktreeRoot, { recursive: true });
    fs.writeFileSync(
      path.join(worktreeRoot, ".git"),
      `gitdir: ${path.join(primaryNova AI, ".git", "worktrees", "codex-harness")}\n`,
    );
    createProtocolSchema(codexRepo);
    delete process.env.NOVA_AI_CODEX_REPO;

    await expect(resolveCodexAppServerProtocolSource(worktreeRoot)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });
});

function createProtocolSchema(codexRepo: string): void {
  fs.mkdirSync(path.join(codexRepo, "codex-rs/app-server-protocol/schema/typescript"), {
    recursive: true,
  });
}
