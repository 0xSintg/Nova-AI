import type { Nova AIConfig } from "../config/types.nova-ai.js";
import { getBundledChannelAccountInspector } from "./plugins/bundled.js";
import { getLoadedChannelPlugin } from "./plugins/registry.js";
import type { ChannelId } from "./plugins/types.public.js";

export type ReadOnlyInspectedAccount = Record<string, unknown>;

export async function inspectReadOnlyChannelAccount(params: {
  channelId: ChannelId;
  cfg: Nova AIConfig;
  accountId?: string | null;
}): Promise<ReadOnlyInspectedAccount | null> {
  const inspectAccount =
    getLoadedChannelPlugin(params.channelId)?.config.inspectAccount ??
    getBundledChannelAccountInspector(params.channelId);
  if (!inspectAccount) {
    return null;
  }
  return (await Promise.resolve(
    inspectAccount(params.cfg, params.accountId),
  )) as ReadOnlyInspectedAccount | null;
}
