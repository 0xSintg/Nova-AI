import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["nova-ai/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@nova-ai/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["nova-ai/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@nova-ai/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["nova-ai/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@nova-ai/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["nova-ai/plugin-sdk/speech-core"]).toBe(
      aliasMap["@nova-ai/plugin-sdk/speech-core"],
    );
  });
});
