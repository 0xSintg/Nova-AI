import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Nova AIConfig } from "../config/types.nova-ai.js";
import { CORE_HEALTH_CHECKS } from "./doctor-core-checks.js";
import type { HealthRepairContext } from "./health-checks.js";

const browserMocks = vi.hoisted(() => ({
  detectLegacyNovaBrowserProfileResidue: vi.fn(),
  maybeArchiveLegacyNovaBrowserProfileResidue: vi.fn(),
}));

vi.mock("../commands/doctor-browser.js", () => ({
  detectLegacyNovaBrowserProfileResidue: browserMocks.detectLegacyNovaBrowserProfileResidue,
  maybeArchiveLegacyNovaBrowserProfileResidue:
    browserMocks.maybeArchiveLegacyNovaBrowserProfileResidue,
}));

const residue = {
  legacyProfileDir: "/tmp/nova-ai-home/browser/nova",
  legacyUserDataDir: "/tmp/nova-ai-home/browser/nova/user-data",
  canonicalUserDataDir: "/tmp/nova-ai-home/browser/nova-ai/user-data",
};

function runtime() {
  return { log() {}, error() {}, exit() {} };
}

function requireBrowserResidueCheck() {
  const check = CORE_HEALTH_CHECKS.find(
    (entry) => entry.id === "core/doctor/browser-nova-profile-residue",
  );
  if (!check) {
    throw new Error("expected browser nova profile residue health check");
  }
  return check;
}

describe("browser nova profile residue health check", () => {
  beforeEach(() => {
    browserMocks.detectLegacyNovaBrowserProfileResidue.mockReset();
    browserMocks.maybeArchiveLegacyNovaBrowserProfileResidue.mockReset();
  });

  it("reports legacy nova profile residue through doctor lint", async () => {
    browserMocks.detectLegacyNovaBrowserProfileResidue.mockResolvedValueOnce(residue);
    const cfg: Nova AIConfig = { browser: { profiles: { nova-ai: { color: "#FF4500" } } } };
    const check = requireBrowserResidueCheck();

    const findings = await check.detect({
      mode: "lint",
      runtime: runtime(),
      cfg,
      configPath: "/tmp/nova-ai-home/nova-ai.json",
    });

    expect(browserMocks.detectLegacyNovaBrowserProfileResidue).toHaveBeenCalledWith(cfg, {
      configDir: "/tmp/nova-ai-home",
    });
    expect(findings).toEqual([
      expect.objectContaining({
        checkId: "core/doctor/browser-nova-profile-residue",
        severity: "warning",
        path: residue.legacyProfileDir,
        ocPath: "oc://state/browser/nova",
      }),
    ]);
  });

  it("archives legacy nova profile residue through structured repair", async () => {
    browserMocks.detectLegacyNovaBrowserProfileResidue.mockResolvedValue(residue);
    browserMocks.maybeArchiveLegacyNovaBrowserProfileResidue.mockResolvedValueOnce({
      changes: ["Archived legacy nova managed browser profile residue."],
      warnings: [],
    });
    const cfg: Nova AIConfig = { browser: { profiles: { nova-ai: { color: "#FF4500" } } } };
    const check = requireBrowserResidueCheck();
    const ctx: HealthRepairContext = {
      mode: "fix",
      runtime: runtime(),
      cfg,
      configPath: "/tmp/nova-ai-home/nova-ai.json",
    };

    const result = await check.repair?.(ctx, []);

    expect(browserMocks.maybeArchiveLegacyNovaBrowserProfileResidue).toHaveBeenCalledWith(cfg, {
      configDir: "/tmp/nova-ai-home",
    });
    expect(result).toMatchObject({
      changes: ["Archived legacy nova managed browser profile residue."],
      effects: [
        {
          kind: "state",
          action: "archive-legacy-browser-profile-residue",
          target: residue.legacyProfileDir,
          dryRunSafe: false,
        },
      ],
    });
  });

  it("supports dry-run repair without archiving the profile", async () => {
    browserMocks.detectLegacyNovaBrowserProfileResidue.mockResolvedValue(residue);
    const check = requireBrowserResidueCheck();

    const result = await check.repair?.(
      {
        mode: "fix",
        runtime: runtime(),
        cfg: {},
        configPath: "/tmp/nova-ai-home/nova-ai.json",
        dryRun: true,
      },
      [],
    );

    expect(browserMocks.maybeArchiveLegacyNovaBrowserProfileResidue).not.toHaveBeenCalled();
    expect(result?.changes.join("\n")).toContain("Would archive legacy nova");
    expect(result?.effects).toEqual([
      expect.objectContaining({
        action: "would-archive-legacy-browser-profile-residue",
        target: residue.legacyProfileDir,
      }),
    ]);
  });
});
