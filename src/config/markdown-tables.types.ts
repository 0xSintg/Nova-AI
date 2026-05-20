import type { MarkdownTableMode } from "./types.base.js";
import type { Nova AIConfig } from "./types.nova-ai.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<Nova AIConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
