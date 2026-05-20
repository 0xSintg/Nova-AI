import fs from "node:fs";
import path from "node:path";
import type { Nova AIConfig } from "../config/types.nova-ai.js";
import { loadBundledPluginPublicSurfaceModuleSync } from "../plugin-sdk/facade-loader.js";
import { note } from "../terminal/note.js";
import { resolveConfigDir } from "../utils.js";

type BrowserDoctorDeps = {
  platform?: NodeJS.Platform;
  noteFn?: typeof note;
  env?: NodeJS.ProcessEnv;
  getUid?: () => number;
  resolveManagedExecutable?: (
    resolved: unknown,
    platform: NodeJS.Platform,
  ) => { path: string } | null;
  resolveChromeExecutable?: (platform: NodeJS.Platform) => { path: string } | null;
  readVersion?: (executablePath: string) => string | null;
  configDir?: string;
  pathExists?: (targetPath: string) => boolean;
};

export type BrowserDoctorRepairDeps = {
  env?: NodeJS.ProcessEnv;
  configDir?: string;
  pathExists?: (targetPath: string) => boolean;
  movePathToTrash?: (targetPath: string) => Promise<string>;
};

export type LegacyNovaBrowserProfileResidue = {
  legacyProfileDir: string;
  legacyUserDataDir: string;
  canonicalUserDataDir: string;
};

type BrowserDoctorSurface = {
  noteChromeMcpBrowserReadiness: (cfg: Nova AIConfig, deps?: BrowserDoctorDeps) => Promise<void>;
  detectLegacyNovaBrowserProfileResidue?: (
    cfg: Nova AIConfig,
    deps?: BrowserDoctorRepairDeps,
  ) => LegacyNovaBrowserProfileResidue | null;
  maybeArchiveLegacyNovaBrowserProfileResidue?: (
    cfg: Nova AIConfig,
    deps?: BrowserDoctorRepairDeps,
  ) => Promise<{ changes: string[]; warnings: string[] }>;
};

function loadBrowserDoctorSurface(): BrowserDoctorSurface {
  return loadBundledPluginPublicSurfaceModuleSync<BrowserDoctorSurface>({
    dirName: "browser",
    artifactBasename: "browser-doctor.js",
  });
}

function mayHaveLegacyNovaBrowserProfileResidue(deps?: BrowserDoctorRepairDeps): boolean {
  const configDir = deps?.configDir ?? resolveConfigDir(deps?.env ?? process.env);
  const legacyProfileDir = path.join(configDir, "browser", "nova");
  const legacyUserDataDir = path.join(legacyProfileDir, "user-data");
  const pathExists = deps?.pathExists ?? fs.existsSync;
  try {
    return pathExists(legacyProfileDir) || pathExists(legacyUserDataDir);
  } catch {
    return true;
  }
}

export async function noteChromeMcpBrowserReadiness(cfg: Nova AIConfig, deps?: BrowserDoctorDeps) {
  try {
    await loadBrowserDoctorSurface().noteChromeMcpBrowserReadiness(cfg, deps);
  } catch (error) {
    const noteFn = deps?.noteFn ?? note;
    const message = error instanceof Error ? error.message : String(error);
    noteFn(`- Browser health check is unavailable: ${message}`, "Browser");
  }
}

export async function detectLegacyNovaBrowserProfileResidue(
  cfg: Nova AIConfig,
  deps?: BrowserDoctorRepairDeps,
): Promise<LegacyNovaBrowserProfileResidue | null> {
  if (!mayHaveLegacyNovaBrowserProfileResidue(deps)) {
    return null;
  }
  const detect = loadBrowserDoctorSurface().detectLegacyNovaBrowserProfileResidue;
  if (!detect) {
    return null;
  }
  return detect(cfg, deps);
}

export async function maybeArchiveLegacyNovaBrowserProfileResidue(
  cfg: Nova AIConfig,
  deps?: BrowserDoctorRepairDeps,
): Promise<{ changes: string[]; warnings: string[] }> {
  if (!mayHaveLegacyNovaBrowserProfileResidue(deps)) {
    return { changes: [], warnings: [] };
  }
  try {
    const repair = loadBrowserDoctorSurface().maybeArchiveLegacyNovaBrowserProfileResidue;
    if (!repair) {
      return { changes: [], warnings: [] };
    }
    return await repair(cfg, deps);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      changes: [],
      warnings: [`Browser profile cleanup is unavailable: ${message}`],
    };
  }
}
