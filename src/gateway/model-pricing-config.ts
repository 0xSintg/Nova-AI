import type { Nova AIConfig } from "../config/types.nova-ai.js";

export function isGatewayModelPricingEnabled(config: Nova AIConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
