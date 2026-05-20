import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "nova-ai", "wat"],
    });

    expect(output).toBe(
      'Nova AI does not know the command "wat".\nTry: nova-ai --help\nPlugin command? nova-ai plugins list\nDocs: https://docs.nova-ai.com/cli\n',
    );
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "nova-ai", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'Nova AI does not recognize option "--wat".\nTry: nova-ai channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "nova-ai", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: nova-ai plugins install --help\n',
    );
  });
});
