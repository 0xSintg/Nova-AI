import { describeGoogleProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeGoogleProviderRuntimeContract(() => import("./index.js"));
