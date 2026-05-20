import { describeAnthropicProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeAnthropicProviderRuntimeContract(() => import("./index.js"));
