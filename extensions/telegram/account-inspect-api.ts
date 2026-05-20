import type { Nova AIConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: Nova AIConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
