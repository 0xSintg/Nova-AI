// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "nova-ai/plugin-sdk/plugin-entry";
export type { Nova AIPluginApi } from "nova-ai/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "nova-ai/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "nova-ai/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "nova-ai/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "nova-ai/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "nova-ai/plugin-sdk/tts-runtime";
export { sleep } from "nova-ai/plugin-sdk/runtime-env";
