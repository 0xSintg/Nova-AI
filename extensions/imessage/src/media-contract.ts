import { mergeInboundPathRoots } from "nova-ai/plugin-sdk/channel-inbound-roots";
import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { resolveIMessageAccount } from "./accounts.js";

export const DEFAULT_IMESSAGE_ATTACHMENT_ROOTS = ["/Users/*/Library/Messages/Attachments"] as const;

export function resolveIMessageAttachmentRoots(params: {
  cfg: Nova AIConfig;
  accountId?: string | null;
}): string[] {
  const account = resolveIMessageAccount(params);
  return mergeInboundPathRoots(
    account.config.attachmentRoots,
    params.cfg.channels?.imessage?.attachmentRoots,
    DEFAULT_IMESSAGE_ATTACHMENT_ROOTS,
  );
}

export function resolveIMessageRemoteAttachmentRoots(params: {
  cfg: Nova AIConfig;
  accountId?: string | null;
}): string[] {
  const account = resolveIMessageAccount(params);
  return mergeInboundPathRoots(
    account.config.remoteAttachmentRoots,
    params.cfg.channels?.imessage?.remoteAttachmentRoots,
    account.config.attachmentRoots,
    params.cfg.channels?.imessage?.attachmentRoots,
    DEFAULT_IMESSAGE_ATTACHMENT_ROOTS,
  );
}
