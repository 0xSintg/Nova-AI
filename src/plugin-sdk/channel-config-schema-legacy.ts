/**
 * @deprecated Compatibility surface for bundled channel schemas.
 *
 * Nova AI-maintained bundled plugins should import
 * nova-ai/plugin-sdk/bundled-channel-config-schema. Third-party plugins should
 * define plugin-local schemas and import primitives from
 * nova-ai/plugin-sdk/channel-config-schema instead of depending on bundled
 * channel schemas.
 */
export * from "./bundled-channel-config-schema.js";
