import { describeOpenAIProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeOpenAIProviderRuntimeContract(() => import("./index.js"));
