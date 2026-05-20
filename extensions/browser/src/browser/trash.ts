import os from "node:os";
import { movePathToTrash as movePathToTrashWithAllowedRoots } from "nova-ai/plugin-sdk/browser-config";
import { resolvePreferredNova AITmpDir } from "nova-ai/plugin-sdk/temp-path";

export async function movePathToTrash(targetPath: string): Promise<string> {
  return await movePathToTrashWithAllowedRoots(targetPath, {
    allowedRoots: [os.homedir(), resolvePreferredNova AITmpDir()],
  });
}
