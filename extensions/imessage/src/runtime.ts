import type { PluginRuntime } from "nova-ai/plugin-sdk/core";
import { createPluginRuntimeStore } from "nova-ai/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime } = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "imessage",
  errorMessage: "iMessage runtime not initialized",
});
export { setIMessageRuntime };
