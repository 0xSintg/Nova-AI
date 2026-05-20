import type { ChannelDoctorConfigMutation } from "nova-ai/plugin-sdk/channel-contract";
import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: Nova AIConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
