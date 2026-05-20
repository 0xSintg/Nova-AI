import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: Nova AIConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
