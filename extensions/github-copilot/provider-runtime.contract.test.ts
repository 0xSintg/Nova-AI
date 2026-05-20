import { describeGithubCopilotProviderRuntimeContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderRuntimeContract(() => import("./index.js"));
