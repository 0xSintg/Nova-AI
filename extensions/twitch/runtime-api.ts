// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "nova-ai/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nova-ai/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "nova-ai/plugin-sdk/channel-send-result";
export type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "nova-ai/plugin-sdk/runtime";
export type { WizardPrompter } from "nova-ai/plugin-sdk/setup";
