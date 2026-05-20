import type { Nova AIConfig } from "../../config/types.nova-ai.js";
import type { GetReplyOptions } from "../get-reply-options.types.js";
import type { ReplyPayload } from "../reply-payload.js";
import type { MsgContext } from "../templating.js";

export type GetReplyFromConfig = (
  ctx: MsgContext,
  opts?: GetReplyOptions,
  configOverride?: Nova AIConfig,
) => Promise<ReplyPayload | ReplyPayload[] | undefined>;
