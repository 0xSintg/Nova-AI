import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<Nova AIConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
