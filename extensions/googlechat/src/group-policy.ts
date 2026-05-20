import { resolveChannelGroupRequireMention } from "nova-ai/plugin-sdk/channel-policy";
import type { Nova AIConfig } from "nova-ai/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: Nova AIConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
