// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  Nova AIConfig,
  Nova AIPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "nova-ai/plugin-sdk/core";
export type { Nova AIConfig as NovabotConfig } from "nova-ai/plugin-sdk/core";
export type { RuntimeEnv } from "nova-ai/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "nova-ai/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "nova-ai/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "nova-ai/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "nova-ai/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "nova-ai/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "nova-ai/plugin-sdk/channel-message";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "nova-ai/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "nova-ai/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "nova-ai/plugin-sdk/json-store";
export { createPersistentDedupe } from "nova-ai/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "nova-ai/plugin-sdk/routing";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "nova-ai/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
