// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "nova-ai/plugin-sdk/account-id";
export type { AllowlistMatch } from "nova-ai/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "nova-ai/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "nova-ai/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nova-ai/plugin-sdk/channel-core";
export { logTypingFailure } from "nova-ai/plugin-sdk/channel-logging";
export { createChannelPairingController } from "nova-ai/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "nova-ai/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "nova-ai/plugin-sdk/channel-message";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "nova-ai/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "nova-ai/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  Nova AIConfig,
} from "nova-ai/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "nova-ai/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "nova-ai/plugin-sdk/runtime-group-policy";
export { withFileLock } from "nova-ai/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "nova-ai/plugin-sdk/channel-lifecycle";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "nova-ai/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "nova-ai/plugin-sdk/inbound-reply-dispatch";
export { loadOutboundMediaFromUrl } from "nova-ai/plugin-sdk/outbound-media";
export { buildMediaPayload } from "nova-ai/plugin-sdk/reply-payload";
export type { ReplyPayload } from "nova-ai/plugin-sdk/reply-payload";
export type { PluginRuntime } from "nova-ai/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "nova-ai/plugin-sdk/runtime";
export type { SsrFPolicy } from "nova-ai/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "nova-ai/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "nova-ai/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "nova-ai/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
