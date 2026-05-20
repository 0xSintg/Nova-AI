import type { Nova AIConfig } from "../../config/types.nova-ai.js";
import {
  hasBundledChannelPackageState,
  listBundledChannelIdsForPackageState,
} from "./package-state-probes.js";

export function listBundledChannelIdsWithConfiguredState(): string[] {
  return listBundledChannelIdsForPackageState("configuredState");
}

export function hasBundledChannelConfiguredState(params: {
  channelId: string;
  cfg: Nova AIConfig;
  env?: NodeJS.ProcessEnv;
}): boolean {
  return hasBundledChannelPackageState({
    metadataKey: "configuredState",
    channelId: params.channelId,
    cfg: params.cfg,
    env: params.env,
  });
}
