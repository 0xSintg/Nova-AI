import {
  applyAgentDefaultModelPrimary,
  type Nova AIConfig,
} from "nova-ai/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: Nova AIConfig): Nova AIConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: Nova AIConfig): Nova AIConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
