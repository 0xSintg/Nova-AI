import { describeModelStudioProviderDiscoveryContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeModelStudioProviderDiscoveryContract(() => import("./index.js"));
