import { normalizeNova AIProviderIndex } from "./normalize.js";
import { NOVA_AI_PROVIDER_INDEX } from "./nova-ai-provider-index.js";
import type { Nova AIProviderIndex } from "./types.js";

export function loadNova AIProviderIndex(
  source: unknown = NOVA_AI_PROVIDER_INDEX,
): Nova AIProviderIndex {
  return normalizeNova AIProviderIndex(source) ?? { version: 1, providers: {} };
}
