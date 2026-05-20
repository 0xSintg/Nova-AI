export const NOVA_AI_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const NOVA_AI_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  NOVA_AI_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isNova AIOwnerOnlyCoreToolName(toolName: string): boolean {
  return NOVA_AI_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
