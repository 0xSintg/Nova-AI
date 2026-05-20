import path from "node:path";

export function setTempStateDir(workspaceDir: string): string {
  const stateDir = path.join(workspaceDir, "state");
  process.env.NOVA_AI_STATE_DIR = stateDir;
  return stateDir;
}
