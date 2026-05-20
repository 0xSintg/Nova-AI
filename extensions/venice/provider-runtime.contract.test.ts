import { describeVeniceProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
