// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/nova-ai-runtime-agent.js";
export { resolveCronStyleNow } from "./host/nova-ai-runtime-agent.js";
export { DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/nova-ai-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/nova-ai-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/nova-ai-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/nova-ai-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/nova-ai-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/nova-ai-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/nova-ai-runtime-config.js";
export { resolveStateDir } from "./host/nova-ai-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/nova-ai-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/nova-ai-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/nova-ai-runtime-memory.js";
export { parseAgentSessionKey } from "./host/nova-ai-runtime-agent.js";
export type { Nova AIConfig } from "./host/nova-ai-runtime-config.js";
export type { MemoryCitationsMode } from "./host/nova-ai-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/nova-ai-runtime-memory.js";
export type { Nova AIPluginApi } from "./host/nova-ai-runtime-memory.js";
