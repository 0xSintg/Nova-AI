import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginDiscoveryResult } from "./discovery.js";

const discoverNova AIPluginsMock = vi.fn();

vi.mock("./discovery.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./discovery.js")>();
  return {
    ...actual,
    discoverNova AIPlugins: (...args: unknown[]) => discoverNova AIPluginsMock(...args),
  };
});

const { loadPluginManifestRegistry } = await import("./manifest-registry.js");
const { resolveInstalledPluginIndexRegistry } =
  await import("./installed-plugin-index-registry.js");

const emptyDiscovery: PluginDiscoveryResult = { candidates: [], diagnostics: [] };

describe("discovery threading", () => {
  beforeEach(() => {
    discoverNova AIPluginsMock.mockReset();
    discoverNova AIPluginsMock.mockReturnValue(emptyDiscovery);
  });

  describe("loadPluginManifestRegistry", () => {
    it("skips internal discoverNova AIPlugins when discovery is supplied", () => {
      loadPluginManifestRegistry({ discovery: emptyDiscovery });
      expect(discoverNova AIPluginsMock).not.toHaveBeenCalled();
    });

    it("calls discoverNova AIPlugins when neither discovery nor candidates supplied", () => {
      loadPluginManifestRegistry({});
      expect(discoverNova AIPluginsMock).toHaveBeenCalledTimes(1);
    });

    it("prefers explicit candidates over discovery when both are supplied", () => {
      loadPluginManifestRegistry({ candidates: [], diagnostics: [], discovery: emptyDiscovery });
      expect(discoverNova AIPluginsMock).not.toHaveBeenCalled();
    });
  });

  describe("resolveInstalledPluginIndexRegistry", () => {
    it("skips internal discoverNova AIPlugins when discovery is supplied", () => {
      resolveInstalledPluginIndexRegistry({ discovery: emptyDiscovery, installRecords: {} });
      expect(discoverNova AIPluginsMock).not.toHaveBeenCalled();
    });

    it("calls discoverNova AIPlugins when neither discovery nor candidates supplied", () => {
      resolveInstalledPluginIndexRegistry({ installRecords: {} });
      expect(discoverNova AIPluginsMock).toHaveBeenCalledTimes(1);
    });

    it("prefers explicit candidates over discovery when both are supplied", () => {
      resolveInstalledPluginIndexRegistry({
        candidates: [],
        discovery: emptyDiscovery,
        installRecords: {},
      });
      expect(discoverNova AIPluginsMock).not.toHaveBeenCalled();
    });
  });
});
