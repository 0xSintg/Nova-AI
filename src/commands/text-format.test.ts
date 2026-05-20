import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("nova-ai", 16)).toBe("nova-ai");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("nova-ai-status-output", 10)).toBe("nova-ai-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
