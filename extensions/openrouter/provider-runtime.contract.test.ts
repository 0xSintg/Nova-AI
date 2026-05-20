import { describeOpenRouterProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
