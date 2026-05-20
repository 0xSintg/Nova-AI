import { definePluginEntry, type Nova AIPluginApi } from "./runtime-api.js";

export default definePluginEntry({
  id: "open-prose",
  name: "OpenProse",
  description: "Plugin-shipped prose skills bundle",
  register(_api: Nova AIPluginApi) {
    // OpenProse is delivered via plugin-shipped skills.
  },
});
