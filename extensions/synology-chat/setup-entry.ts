import { defineBundledChannelSetupEntry } from "nova-ai/plugin-sdk/channel-entry-contract";

export default defineBundledChannelSetupEntry({
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./api.js",
    exportName: "synologyChatPlugin",
  },
});
