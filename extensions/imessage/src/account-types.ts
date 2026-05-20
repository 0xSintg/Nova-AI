import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<Nova AIConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
