import type { ReplyToMode } from "../../config/types.base.js";
import type { Nova AIConfig } from "../../config/types.nova-ai.js";
import type { ChannelThreadingAdapter } from "./types.core.js";

type ReplyToModeResolver = NonNullable<ChannelThreadingAdapter["resolveReplyToMode"]>;

export function createStaticReplyToModeResolver(mode: ReplyToMode): ReplyToModeResolver {
  return () => mode;
}

export function createTopLevelChannelReplyToModeResolver(channelId: string): ReplyToModeResolver {
  return ({ cfg }) => {
    const channelConfig = (
      cfg.channels as Record<string, { replyToMode?: ReplyToMode }> | undefined
    )?.[channelId];
    return channelConfig?.replyToMode ?? "off";
  };
}

export function createScopedAccountReplyToModeResolver<TAccount>(params: {
  resolveAccount: (cfg: Nova AIConfig, accountId?: string | null) => TAccount;
  resolveReplyToMode: (
    account: TAccount,
    chatType?: string | null,
  ) => ReplyToMode | null | undefined;
  fallback?: ReplyToMode;
}): ReplyToModeResolver {
  return ({ cfg, accountId, chatType }) =>
    params.resolveReplyToMode(params.resolveAccount(cfg, accountId), chatType) ??
    params.fallback ??
    "off";
}
