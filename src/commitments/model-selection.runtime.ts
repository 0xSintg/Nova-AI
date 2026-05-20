import { resolveDefaultModelForAgent } from "../agents/model-selection.js";
import type { Nova AIConfig } from "../config/config.js";

export function resolveCommitmentDefaultModelRef(params: {
  cfg: Nova AIConfig;
  agentId?: string;
}): { provider: string; model: string } {
  return resolveDefaultModelForAgent(params);
}
