import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          NOVA_AI_STATE_DIR: "/tmp/nova-ai-state",
          NOVA_AI_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "nova-ai-gateway",
        windowsTaskName: "Nova AI Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/nova-ai/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/nova-ai-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          NOVA_AI_STATE_DIR: "/tmp/nova-ai-state",
        },
        systemdServiceName: "nova-ai-gateway",
        windowsTaskName: "Nova AI Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u nova-ai-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/nova-ai-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          NOVA_AI_STATE_DIR: "/tmp/nova-ai-state",
        },
        systemdServiceName: "nova-ai-gateway",
        windowsTaskName: "Nova AI Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "Nova AI Gateway" /V /FO LIST',
      "Restart attempts: /tmp/nova-ai-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "nova-ai gateway install",
        startCommand: "nova-ai gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.nova-ai.gateway.plist",
        systemdServiceName: "nova-ai-gateway",
        windowsTaskName: "Nova AI Gateway",
      }),
    ).toEqual([
      "nova-ai gateway install",
      "nova-ai gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.nova-ai.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "nova-ai gateway install",
        startCommand: "nova-ai gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.nova-ai.gateway.plist",
        systemdServiceName: "nova-ai-gateway",
        windowsTaskName: "Nova AI Gateway",
      }),
    ).toEqual([
      "nova-ai gateway install",
      "nova-ai gateway",
      "systemctl --user start nova-ai-gateway.service",
    ]);
  });
});
