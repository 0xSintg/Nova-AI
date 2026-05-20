import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "nova-ai", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[nova-ai] Could not start the CLI.",
      "[nova-ai] Reason: config file is invalid",
      "[nova-ai] Debug: set NOVA_AI_DEBUG=1 to include the stack trace.",
      "[nova-ai] Try: nova-ai doctor",
      "[nova-ai] Help: nova-ai --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { NOVA_AI_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[nova-ai] The CLI command failed.",
      "[nova-ai] Reason: boom",
      "[nova-ai] Stack:",
      "[nova-ai] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
