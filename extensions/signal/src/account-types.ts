import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<Nova AIConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
