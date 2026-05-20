import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { windowsUpdateScript } from "../../scripts/e2e/parallels/npm-update-scripts.ts";

const SCRIPT_PATH = "scripts/e2e/parallels/npm-update-smoke.ts";
const GUEST_TRANSPORTS_PATH = "scripts/e2e/parallels/guest-transports.ts";
const UPDATE_SCRIPTS_PATH = "scripts/e2e/parallels/npm-update-scripts.ts";
const TEST_AUTH = {
  authChoice: "openai",
  authKeyFlag: "--openai-api-key",
  apiKeyEnv: "OPENAI_API_KEY",
  apiKeyValue: "test-key",
  modelId: "gpt-5.4",
};

describe("parallels npm update smoke", () => {
  it("does not leave guard/server children attached to the wrapper", () => {
    const script = readFileSync(SCRIPT_PATH, "utf8");

    expect(script).toContain("spawnLogged");
    expect(script).toContain('child.on("close"');
    expect(script).toContain("await this.server?.stop()");
  });

  it("has a one-command beta validation mode with fresh target coverage", () => {
    const script = readFileSync(SCRIPT_PATH, "utf8");

    expect(script).toContain("--beta-validation [target]");
    expect(script).toContain("resolveNova AIRegistryVersion");
    expect(script).toContain("this.options.updateTarget = version");
    expect(script).toContain("this.options.freshTargetSpec = `nova-ai@${version}`");
    expect(script).toContain("runFreshTargetInstalls");
    expect(script).toContain("freshTargetStatus");
  });

  it("prints actionable progress, rerun hints, and markdown summaries", () => {
    const script = readFileSync(SCRIPT_PATH, "utf8");

    expect(script).toContain("stale=");
    expect(script).toContain("bytes=");
    expect(script).toContain("rerunCommand");
    expect(script).toContain("writeSummaryMarkdown");
    expect(script).toContain("Parallels NPM Update Smoke");
  });

  it("runs Windows updates through a detached done-file runner", () => {
    const script = readFileSync(SCRIPT_PATH, "utf8");
    const transports = readFileSync(GUEST_TRANSPORTS_PATH, "utf8");

    expect(script).toContain("runWindowsBackgroundPowerShell");
    expect(transports).toContain("runWindowsBackgroundPowerShell");
    expect(transports).toContain("__NOVA_AI_BACKGROUND_EXIT__");
    expect(transports).toContain("__NOVA_AI_BACKGROUND_DONE__");
    expect(transports).toContain("${options.label} timed out");
  });

  it("keeps macOS sudo fallback update scripts readable by the desktop user", () => {
    const script = readFileSync(SCRIPT_PATH, "utf8");

    expect(script).toContain('macosExecArgs.indexOf("-u")');
    expect(script).toContain('"/usr/sbin/chown", sudoUser, scriptPath');
  });

  it("scrubs future plugin entries before invoking old same-guest updaters", () => {
    const script = readFileSync(UPDATE_SCRIPTS_PATH, "utf8");

    expect(script).toContain("Remove-FuturePluginEntries");
    expect(script).toContain("scrub_future_plugin_entries");
    expect(script).toContain("delete plugins.entries.feishu");
    expect(script).toContain("delete plugins.entries.whatsapp");
    expect(script).toContain("Remove-FuturePluginEntries\nStop-Nova AIGatewayProcesses");
    expect(script).toContain("scrub_future_plugin_entries\nstop_nova-ai_gateway_processes");
    expect(script).toContain("Invoke-WithScopedEnv @{ NOVA_AI_DISABLE_BUNDLED_PLUGINS = '1'");
    expect(script).toContain(
      "NOVA_AI_DISABLE_BUNDLED_PLUGINS=1 /opt/homebrew/bin/nova-ai update --tag",
    );
    expect(script).toContain("NOVA_AI_DISABLE_BUNDLED_PLUGINS=1 nova-ai update --tag");
    expect(script).toContain(
      "NOVA_AI_DISABLE_BUNDLED_PLUGINS=1 /opt/homebrew/bin/nova-ai gateway stop",
    );
    expect(script).toContain(
      "NOVA_AI_DISABLE_BUNDLED_PLUGINS=1 NOVA_AI_ALLOW_ROOT=1 nova-ai gateway stop",
    );
  });

  it("reenables bundled plugins before Windows post-update verification", () => {
    const script = windowsUpdateScript({
      auth: TEST_AUTH,
      expectedNeedle: "2026.5.3-beta.2",
      updateTarget: "2026.5.3-beta.2",
    });

    const updateIndex = script.indexOf("Invoke-Nova AI update --tag");
    const scopedIndex = script.indexOf("Invoke-WithScopedEnv @{ NOVA_AI_DISABLE_BUNDLED_PLUGINS");
    const versionIndex = script.indexOf("Invoke-Nova AI --version", scopedIndex);
    const restartIndex = script.indexOf("Invoke-Nova AI gateway restart");
    const agentIndex = script.indexOf("Invoke-Nova AI agent --local");

    expect(updateIndex).toBeGreaterThanOrEqual(0);
    expect(scopedIndex).toBeGreaterThanOrEqual(0);
    expect(updateIndex).toBeGreaterThan(scopedIndex);
    expect(versionIndex).toBeGreaterThan(updateIndex);
    expect(restartIndex).toBeGreaterThan(updateIndex);
    expect(agentIndex).toBeGreaterThan(updateIndex);
    expect(script).not.toContain("$env:NOVA_AI_DISABLE_BUNDLED_PLUGINS = '1'");
  });

  it("generates a .NET-safe Windows stale import regex in the update-failure guard", () => {
    const script = windowsUpdateScript({
      auth: TEST_AUTH,
      expectedNeedle: "2026.4.30",
      updateTarget: "latest",
    });
    const staleImportLine = script.match(/\$stalePostSwapImport = [^\n]+/)?.[0];
    const staleImportMatch = script.match(/\$updateText -match '(node_modules[^']+)'/);
    const staleImportPattern = staleImportMatch?.[1];

    if (!staleImportLine) {
      throw new Error("missing generated Windows stale import guard");
    }
    if (!staleImportPattern) {
      throw new Error("missing generated Windows stale import regex");
    }
    expect(staleImportLine).toContain("$updateText -match 'ERR_MODULE_NOT_FOUND'");
    expect(staleImportLine).toContain(`$updateText -match '${staleImportPattern}'`);
    expect(staleImportPattern).toBe(
      String.raw`node_modules\\nova-ai\\dist\\[^\\]+-[A-Za-z0-9_-]+\.js`,
    );
    expect(staleImportPattern).not.toContain("node_modules\\nova-ai\\dist\\");
    expect(staleImportPattern.match(/\\\\/g)).toHaveLength(4);
    const representativeUpdateFailure = String.raw`Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\runner\AppData\Roaming\npm\node_modules\nova-ai\dist\main-a1_B2.js' imported from C:\Users\runner\AppData\Roaming\npm\node_modules\nova-ai\dist\cli.js`;
    const generatedRegex = new RegExp(staleImportPattern);
    expect(generatedRegex.test(representativeUpdateFailure)).toBe(true);
    expect(generatedRegex.test(String.raw`node_modules\nova-ai\dist\main.js`)).toBe(false);
  });
});
