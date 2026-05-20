import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
} from "../config/runtime-snapshot.js";
import type { Nova AIConfig } from "../config/types.nova-ai.js";

export function resolvePluginActivationSourceConfig(params: {
  config?: Nova AIConfig;
  activationSourceConfig?: Nova AIConfig;
}): Nova AIConfig {
  if (params.activationSourceConfig !== undefined) {
    return params.activationSourceConfig;
  }
  const sourceSnapshot = getRuntimeConfigSourceSnapshot();
  if (sourceSnapshot && params.config === getRuntimeConfigSnapshot()) {
    return sourceSnapshot;
  }
  return params.config ?? {};
}
