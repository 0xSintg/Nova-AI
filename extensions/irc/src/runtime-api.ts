// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "nova-ai/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nova-ai/plugin-sdk/channel-core";
export type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
export type { PluginRuntime } from "nova-ai/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "nova-ai/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "nova-ai/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "nova-ai/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "nova-ai/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "nova-ai/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "nova-ai/plugin-sdk/channel-status";
export { createChannelPairingController } from "nova-ai/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "nova-ai/plugin-sdk/channel-lifecycle";
export { resolveControlCommandGate } from "nova-ai/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "nova-ai/plugin-sdk/channel-message";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "nova-ai/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nova-ai/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nova-ai/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "nova-ai/plugin-sdk/channel-inbound";
