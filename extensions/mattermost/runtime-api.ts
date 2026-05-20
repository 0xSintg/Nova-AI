// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  Nova AIConfig,
  Nova AIPluginApi,
  PluginRuntime,
} from "nova-ai/plugin-sdk/core";
export type { RuntimeEnv } from "nova-ai/plugin-sdk/runtime";
export type { ReplyPayload } from "nova-ai/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "nova-ai/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "nova-ai/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "nova-ai/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "nova-ai/plugin-sdk/channel-status";
export { createAccountStatusSink } from "nova-ai/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "nova-ai/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "nova-ai/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "nova-ai/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nova-ai/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nova-ai/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "nova-ai/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "nova-ai/plugin-sdk/channel-inbound";
export { logInboundDrop } from "nova-ai/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "nova-ai/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "nova-ai/plugin-sdk/channel-message";
export { logTypingFailure } from "nova-ai/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "nova-ai/plugin-sdk/outbound-media";
export { rawDataToString } from "nova-ai/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "nova-ai/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "nova-ai/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "nova-ai/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "nova-ai/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "nova-ai/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "nova-ai/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "nova-ai/plugin-sdk/media-runtime";
export { normalizeProviderId } from "nova-ai/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
