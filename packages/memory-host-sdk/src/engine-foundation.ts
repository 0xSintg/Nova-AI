// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/nova-ai-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/nova-ai-runtime-agent.js";
export { parseDurationMs } from "./host/nova-ai-runtime-config.js";
export { loadConfig } from "./host/nova-ai-runtime-config.js";
export { resolveStateDir } from "./host/nova-ai-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/nova-ai-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/nova-ai-runtime-config.js";
export { root } from "./host/nova-ai-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/nova-ai-runtime-io.js";
export { detectMime } from "./host/nova-ai-runtime-io.js";
export { resolveGlobalSingleton } from "./host/nova-ai-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/nova-ai-runtime-session.js";
export { splitShellArgs } from "./host/nova-ai-runtime-io.js";
export { runTasksWithConcurrency } from "./host/nova-ai-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/nova-ai-runtime-io.js";
export type { Nova AIConfig } from "./host/nova-ai-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/nova-ai-runtime-config.js";
export type { SecretInput } from "./host/nova-ai-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/nova-ai-runtime-config.js";
export type { MemorySearchConfig } from "./host/nova-ai-runtime-config.js";
