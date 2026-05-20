import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Nova AIConfig } from "../config/config.js";
import {
  detectLegacyNovaBrowserProfileResidue,
  maybeArchiveLegacyNovaBrowserProfileResidue,
  noteChromeMcpBrowserReadiness,
} from "./doctor-browser.js";

const loadBundledPluginPublicSurfaceModuleSync = vi.hoisted(() => vi.fn());

vi.mock("../plugin-sdk/facade-loader.js", () => ({
  loadBundledPluginPublicSurfaceModuleSync,
}));

function requireFirstNoteCall(noteFn: ReturnType<typeof vi.fn>): unknown[] {
  const call = noteFn.mock.calls[0];
  if (!call) {
    throw new Error("expected browser doctor note");
  }
  return call;
}

describe("doctor browser facade", () => {
  beforeEach(() => {
    loadBundledPluginPublicSurfaceModuleSync.mockReset();
  });

  it("delegates browser readiness checks to the browser facade surface", async () => {
    const delegate = vi.fn().mockResolvedValue(undefined);
    loadBundledPluginPublicSurfaceModuleSync.mockReturnValue({
      noteChromeMcpBrowserReadiness: delegate,
    });

    const cfg: Nova AIConfig = {
      browser: {
        defaultProfile: "user",
      },
    };
    const noteFn = vi.fn();

    await noteChromeMcpBrowserReadiness(cfg, { noteFn });

    expect(loadBundledPluginPublicSurfaceModuleSync).toHaveBeenCalledWith({
      dirName: "browser",
      artifactBasename: "browser-doctor.js",
    });
    expect(delegate).toHaveBeenCalledWith(cfg, { noteFn });
    expect(noteFn).not.toHaveBeenCalled();
  });

  it("delegates legacy nova browser profile detection to the browser facade surface", async () => {
    const residue = {
      legacyProfileDir: "/tmp/nova-ai-home/browser/nova",
      legacyUserDataDir: "/tmp/nova-ai-home/browser/nova/user-data",
      canonicalUserDataDir: "/tmp/nova-ai-home/browser/nova-ai/user-data",
    };
    const detect = vi.fn().mockReturnValue(residue);
    loadBundledPluginPublicSurfaceModuleSync.mockReturnValue({
      noteChromeMcpBrowserReadiness: vi.fn(),
      detectLegacyNovaBrowserProfileResidue: detect,
    });
    const cfg: Nova AIConfig = {
      browser: {
        profiles: {
          nova-ai: { color: "#FF4500" },
        },
      },
    };
    const deps = {
      configDir: "/tmp/nova-ai-home",
      pathExists: (targetPath: string) => targetPath === "/tmp/nova-ai-home/browser/nova",
    };

    await expect(detectLegacyNovaBrowserProfileResidue(cfg, deps)).resolves.toEqual(residue);
    expect(loadBundledPluginPublicSurfaceModuleSync).toHaveBeenCalledWith({
      dirName: "browser",
      artifactBasename: "browser-doctor.js",
    });
    expect(detect).toHaveBeenCalledWith(cfg, deps);
  });

  it("delegates legacy nova browser profile cleanup to the browser facade surface", async () => {
    const cleanup = vi.fn().mockResolvedValue({ changes: ["archived"], warnings: [] });
    loadBundledPluginPublicSurfaceModuleSync.mockReturnValue({
      noteChromeMcpBrowserReadiness: vi.fn(),
      maybeArchiveLegacyNovaBrowserProfileResidue: cleanup,
    });

    const cfg: Nova AIConfig = {
      browser: {
        profiles: {
          nova-ai: { color: "#FF4500" },
        },
      },
    };
    const deps = {
      configDir: "/tmp/nova-ai-home",
      pathExists: (targetPath: string) => targetPath === "/tmp/nova-ai-home/browser/nova",
    };

    await expect(maybeArchiveLegacyNovaBrowserProfileResidue(cfg, deps)).resolves.toEqual({
      changes: ["archived"],
      warnings: [],
    });
    expect(loadBundledPluginPublicSurfaceModuleSync).toHaveBeenCalledWith({
      dirName: "browser",
      artifactBasename: "browser-doctor.js",
    });
    expect(cleanup).toHaveBeenCalledWith(cfg, deps);
  });

  it("warns when browser profile cleanup surface is unavailable", async () => {
    loadBundledPluginPublicSurfaceModuleSync.mockImplementation(() => {
      throw new Error("missing browser doctor facade");
    });

    await expect(
      maybeArchiveLegacyNovaBrowserProfileResidue(
        {},
        {
          configDir: "/tmp/nova-ai-home",
          pathExists: (targetPath: string) => targetPath === "/tmp/nova-ai-home/browser/nova",
        },
      ),
    ).resolves.toEqual({
      changes: [],
      warnings: ["Browser profile cleanup is unavailable: missing browser doctor facade"],
    });
  });

  it("skips loading the browser residue detection surface when legacy residue is absent", async () => {
    await expect(
      detectLegacyNovaBrowserProfileResidue(
        {},
        {
          configDir: "/tmp/nova-ai-home",
          pathExists: () => false,
        },
      ),
    ).resolves.toBeNull();
    expect(loadBundledPluginPublicSurfaceModuleSync).not.toHaveBeenCalled();
  });

  it("skips loading the browser cleanup surface when legacy residue is absent", async () => {
    await expect(
      maybeArchiveLegacyNovaBrowserProfileResidue(
        {},
        {
          configDir: "/tmp/nova-ai-home",
          pathExists: () => false,
        },
      ),
    ).resolves.toEqual({ changes: [], warnings: [] });
    expect(loadBundledPluginPublicSurfaceModuleSync).not.toHaveBeenCalled();
  });

  it("warns and no-ops when the browser doctor surface is unavailable", async () => {
    loadBundledPluginPublicSurfaceModuleSync.mockImplementation(() => {
      throw new Error("missing browser doctor facade");
    });

    const noteFn = vi.fn();

    await expect(noteChromeMcpBrowserReadiness({}, { noteFn })).resolves.toBeUndefined();
    expect(noteFn).toHaveBeenCalledTimes(1);
    expect(requireFirstNoteCall(noteFn)).toEqual([
      "- Browser health check is unavailable: missing browser doctor facade",
      "Browser",
    ]);
  });
});
