import { describe, expect, it } from "vitest";
import { collectPresentNova AITools } from "./nova-ai-tools.registration.js";
import { createPdfTool } from "./tools/pdf-tool.js";

describe("createNova AITools PDF registration", () => {
  it("includes the pdf tool when the pdf factory returns a tool", () => {
    const pdfTool = createPdfTool({
      agentDir: "/tmp/nova-ai-agent-main",
      config: {
        agents: {
          defaults: {
            pdfModel: { primary: "openai/gpt-5.4-mini" },
          },
        },
      },
    });

    expect(pdfTool?.name).toBe("pdf");
    expect(collectPresentNova AITools([pdfTool]).map((tool) => tool.name)).toEqual(["pdf"]);
  });
});
