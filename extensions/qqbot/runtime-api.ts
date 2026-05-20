export type { ChannelPlugin, Nova AIPluginApi, PluginRuntime } from "nova-ai/plugin-sdk/core";
export type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
export type {
  Nova AIPluginService,
  Nova AIPluginServiceContext,
  PluginLogger,
} from "nova-ai/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/bridge/runtime.js";
