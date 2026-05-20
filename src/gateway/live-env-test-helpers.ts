const COMMON_LIVE_ENV_NAMES = [
  "NOVA_AI_AGENT_RUNTIME",
  "NOVA_AI_CONFIG_PATH",
  "NOVA_AI_GATEWAY_TOKEN",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "NOVA_AI_SKIP_BROWSER_CONTROL_SERVER",
  "NOVA_AI_SKIP_CANVAS_HOST",
  "NOVA_AI_SKIP_CHANNELS",
  "NOVA_AI_SKIP_CRON",
  "NOVA_AI_SKIP_GMAIL_WATCHER",
  "NOVA_AI_STATE_DIR",
] as const;

export type LiveEnvSnapshot = Record<string, string | undefined>;

export function snapshotLiveEnv(extraNames: readonly string[] = []): LiveEnvSnapshot {
  const snapshot: LiveEnvSnapshot = {};
  for (const name of [...COMMON_LIVE_ENV_NAMES, ...extraNames]) {
    snapshot[name] = process.env[name];
  }
  return snapshot;
}

export function restoreLiveEnv(snapshot: LiveEnvSnapshot): void {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
}
