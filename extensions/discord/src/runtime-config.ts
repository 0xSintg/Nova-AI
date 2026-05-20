import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "nova-ai/plugin-sdk/runtime-config-snapshot";
import type { Nova AIConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: Nova AIConfig): Nova AIConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
