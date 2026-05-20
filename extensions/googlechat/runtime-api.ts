// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "nova-ai/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "nova-ai/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "nova-ai/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "nova-ai/plugin-sdk/channel-contract";
export { missingTargetError } from "nova-ai/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "nova-ai/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "nova-ai/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "nova-ai/plugin-sdk/channel-message";
export { PAIRING_APPROVED_MESSAGE } from "nova-ai/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";
export type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "nova-ai/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nova-ai/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nova-ai/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "nova-ai/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "nova-ai/plugin-sdk/outbound-media";
export type { PluginRuntime } from "nova-ai/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "nova-ai/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "nova-ai/plugin-sdk/config-contracts";
export { extractToolSend } from "nova-ai/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "nova-ai/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "nova-ai/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "nova-ai/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "nova-ai/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "nova-ai/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
