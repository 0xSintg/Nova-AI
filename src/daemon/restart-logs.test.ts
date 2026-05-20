import { describe, expect, it } from "vitest";
import {
  GATEWAY_RESTART_LOG_FILENAME,
  renderCmdRestartLogSetup,
  renderPosixRestartLogSetup,
  resolveGatewayLogPaths,
  resolveGatewayRestartLogPath,
  resolveGatewaySupervisorLogPaths,
} from "./restart-logs.js";

describe("restart log conventions", () => {
  it("resolves profile-aware gateway logs and restart attempts together", () => {
    const env = {
      HOME: "/Users/test",
      NOVA_AI_PROFILE: "work",
    };

    expect(resolveGatewayLogPaths(env)).toEqual({
      logDir: "/Users/test/.nova-ai-work/logs",
      stdoutPath: "/Users/test/.nova-ai-work/logs/gateway.log",
      stderrPath: "/Users/test/.nova-ai-work/logs/gateway.err.log",
    });
    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/Users/test/.nova-ai-work/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("honors NOVA_AI_STATE_DIR for restart attempts", () => {
    const env = {
      HOME: "/Users/test",
      NOVA_AI_STATE_DIR: "/tmp/nova-ai-state",
    };

    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/tmp/nova-ai-state/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("keeps macOS LaunchAgent stdout outside the state directory", () => {
    const env = {
      HOME: "/Users/test",
      NOVA_AI_STATE_DIR: "/Volumes/External/nova-ai",
    };

    expect(resolveGatewaySupervisorLogPaths(env, { platform: "darwin" })).toEqual({
      logDir: "/Users/test/Library/Logs/nova-ai",
      stdoutPath: "/Users/test/Library/Logs/nova-ai/gateway.log",
      stderrPath: "/Users/test/Library/Logs/nova-ai/gateway.err.log",
    });
    expect(resolveGatewayRestartLogPath(env)).toBe(
      `/Volumes/External/nova-ai/logs/${GATEWAY_RESTART_LOG_FILENAME}`,
    );
  });

  it("keeps macOS LaunchAgent logs profile-aware in the shared user log directory", () => {
    const env = {
      HOME: "/Users/test",
      NOVA_AI_PROFILE: "work",
    };

    expect(resolveGatewaySupervisorLogPaths(env, { platform: "darwin" })).toEqual({
      logDir: "/Users/test/Library/Logs/nova-ai",
      stdoutPath: "/Users/test/Library/Logs/nova-ai/gateway-work.log",
      stderrPath: "/Users/test/Library/Logs/nova-ai/gateway-work.err.log",
    });
  });

  it("renders best-effort POSIX log setup with escaped paths", () => {
    const setup = renderPosixRestartLogSetup({
      HOME: "/Users/test's",
    });

    expect(setup).toContain(
      "if mkdir -p '/Users/test'\\''s/.nova-ai/logs' 2>/dev/null && : >>'/Users/test'\\''s/.nova-ai/logs/gateway-restart.log' 2>/dev/null; then",
    );
    expect(setup).toContain("exec >>'/Users/test'\\''s/.nova-ai/logs/gateway-restart.log' 2>&1");
  });

  it("renders CMD log setup with quoted paths", () => {
    const setup = renderCmdRestartLogSetup({
      USERPROFILE: "C:\\Users\\Test User",
    });

    expect(setup.quotedLogPath).toBe('"C:\\Users\\Test User/.nova-ai/logs/gateway-restart.log"');
    expect(setup.lines).toContain(
      'if not exist "C:\\Users\\Test User/.nova-ai/logs" mkdir "C:\\Users\\Test User/.nova-ai/logs" >nul 2>&1',
    );
  });
});
