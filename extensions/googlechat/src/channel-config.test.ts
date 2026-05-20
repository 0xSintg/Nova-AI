import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { describe, expect, it } from "vitest";
import { googlechatPlugin } from "./channel.js";

describe("googlechatPlugin config adapter", () => {
  it("keeps read-only accessors from resolving service account SecretRefs", () => {
    const cfg = {
      secrets: {
        providers: {
          google_chat_service_account: {
            source: "file",
            path: "/tmp/nova-ai-missing-google-chat-service-account",
            mode: "singleValue",
          },
        },
      },
      channels: {
        googlechat: {
          serviceAccount: {
            source: "file",
            provider: "google_chat_service_account",
            id: "value",
          },
          dm: {
            allowFrom: ["users/123"],
          },
          defaultTo: "spaces/AAA",
        },
      },
    } as Nova AIConfig;

    expect(googlechatPlugin.config.resolveAllowFrom?.({ cfg, accountId: "default" })).toEqual([
      "users/123",
    ]);
    expect(googlechatPlugin.config.resolveDefaultTo?.({ cfg, accountId: "default" })).toBe(
      "spaces/AAA",
    );
  });
});
