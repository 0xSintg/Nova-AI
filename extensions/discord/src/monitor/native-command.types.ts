import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import type { CommandArgValues } from "nova-ai/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<Nova AIConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
