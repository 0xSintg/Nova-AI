import type { Nova AIConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: Nova AIConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
