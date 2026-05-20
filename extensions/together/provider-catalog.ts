import { buildManifestModelProviderConfig } from "nova-ai/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "nova-ai/plugin-sdk/provider-model-shared";
import manifest from "./nova-ai.plugin.json" with { type: "json" };

export function buildTogetherProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "together",
    catalog: manifest.modelCatalog.providers.together,
  });
}
