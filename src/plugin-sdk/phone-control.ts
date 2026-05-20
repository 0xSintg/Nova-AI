// Narrow plugin-sdk surface for the bundled phone-control plugin.
// Keep this list additive and scoped to the bundled phone-control surface.

export { definePluginEntry } from "./plugin-entry.js";
export type {
  Nova AIPluginApi,
  Nova AIPluginCommandDefinition,
  Nova AIPluginService,
  PluginCommandContext,
} from "../plugins/types.js";
