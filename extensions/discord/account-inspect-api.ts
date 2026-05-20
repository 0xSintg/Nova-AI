import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: Nova AIConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
