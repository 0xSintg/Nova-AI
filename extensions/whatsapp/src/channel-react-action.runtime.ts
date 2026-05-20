import { readStringOrNumberParam, readStringParam } from "nova-ai/plugin-sdk/channel-actions";
import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";

export { resolveReactionMessageId } from "nova-ai/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { resolveAuthorizedWhatsAppOutboundTarget } from "./action-runtime-target-auth.js";
export { resolveWhatsAppAccount, resolveWhatsAppMediaMaxBytes } from "./accounts.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { sendMessageWhatsApp } from "./send.js";
export { readStringOrNumberParam, readStringParam, type Nova AIConfig };
