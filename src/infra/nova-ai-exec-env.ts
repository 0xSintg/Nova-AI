export const NOVA_AI_CLI_ENV_VAR = "NOVA_AI_CLI";
export const NOVA_AI_CLI_ENV_VALUE = "1";

export function markNova AIExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [NOVA_AI_CLI_ENV_VAR]: NOVA_AI_CLI_ENV_VALUE,
  };
}

export function ensureNova AIExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[NOVA_AI_CLI_ENV_VAR] = NOVA_AI_CLI_ENV_VALUE;
  return env;
}
