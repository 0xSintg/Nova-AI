import { configureFsSafePython } from "@nova-ai/fs-safe/config";

const hasPythonModeOverride =
  process.env.FS_SAFE_PYTHON_MODE != null || process.env.NOVA_AI_FS_SAFE_PYTHON_MODE != null;

if (!hasPythonModeOverride) {
  configureFsSafePython({ mode: "off" });
}
