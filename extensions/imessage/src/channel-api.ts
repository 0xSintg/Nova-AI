import { formatTrimmedAllowFromEntries } from "nova-ai/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "nova-ai/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "nova-ai/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "nova-ai/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "nova-ai/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "nova-ai/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
