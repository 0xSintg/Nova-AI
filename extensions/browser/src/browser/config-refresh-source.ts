import {
  getRuntimeConfig,
  getRuntimeConfigSourceSnapshot,
  type Nova AIConfig,
} from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): Nova AIConfig {
  return getRuntimeConfigSourceSnapshot() ?? getRuntimeConfig();
}
