import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): Nova AIConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as Nova AIConfig;
}

export function makeQqbotDefaultAccountConfig(): Nova AIConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as Nova AIConfig;
}
