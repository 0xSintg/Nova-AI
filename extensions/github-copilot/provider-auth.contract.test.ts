import { describeGithubCopilotProviderAuthContract } from "nova-ai/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderAuthContract(() => import("./index.js"));
