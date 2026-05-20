import { describeZAIProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeZAIProviderRuntimeContract(() => import("./index.js"));
