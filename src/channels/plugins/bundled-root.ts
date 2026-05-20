import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveNova AIPackageRootSync } from "../../infra/nova-ai-root.js";
import { resolveBundledPluginsDir } from "../../plugins/bundled-dir.js";

const NOVA_AI_PACKAGE_ROOT =
  resolveNova AIPackageRootSync({
    argv1: process.argv[1],
    cwd: process.cwd(),
    moduleUrl: import.meta.url.startsWith("file:") ? import.meta.url : undefined,
  }) ??
  (import.meta.url.startsWith("file:")
    ? path.resolve(fileURLToPath(new URL("../../..", import.meta.url)))
    : process.cwd());

export type BundledChannelRootScope = {
  packageRoot: string;
  cacheKey: string;
  pluginsDir?: string;
};

function derivePackageRootFromExtensionsDir(extensionsDir: string): string {
  const parentDir = path.dirname(extensionsDir);
  const parentBase = path.basename(parentDir);
  if (parentBase === "dist" || parentBase === "dist-runtime") {
    return path.dirname(parentDir);
  }
  return parentDir;
}

export function resolveBundledChannelRootScope(
  env: NodeJS.ProcessEnv = process.env,
): BundledChannelRootScope {
  const bundledPluginsDir = resolveBundledPluginsDir(env);
  if (!bundledPluginsDir) {
    return {
      packageRoot: NOVA_AI_PACKAGE_ROOT,
      cacheKey: NOVA_AI_PACKAGE_ROOT,
    };
  }
  const resolvedPluginsDir = path.resolve(bundledPluginsDir);
  return {
    packageRoot:
      path.basename(resolvedPluginsDir) === "extensions"
        ? derivePackageRootFromExtensionsDir(resolvedPluginsDir)
        : resolvedPluginsDir,
    cacheKey: resolvedPluginsDir,
    pluginsDir: resolvedPluginsDir,
  };
}
