import { normalizeAgentId } from "../routing/session-key.js";
import type { Nova AIConfig } from "./types.nova-ai.js";

export function resolveExecCommandHighlighting(params: {
  config?: Nova AIConfig | null;
  agentId?: string | null;
}): boolean {
  const config = params.config ?? {};
  const globalValue = config.tools?.exec?.commandHighlighting;
  const agentId = params.agentId ? normalizeAgentId(params.agentId) : null;
  const agentValue = agentId
    ? config.agents?.list?.find((entry) => normalizeAgentId(entry.id) === agentId)?.tools?.exec
        ?.commandHighlighting
    : undefined;
  return agentValue ?? globalValue ?? false;
}
