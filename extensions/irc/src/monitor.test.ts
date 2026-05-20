import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#nova-ai",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#nova-ai",
      rawTarget: "#nova-ai",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "nova-ai-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "nova-ai-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "nova-ai-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "nova-ai-bot",
      rawTarget: "nova-ai-bot",
    });
  });
});
