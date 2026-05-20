import { pluginRegistrationContractCases } from "nova-ai/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "nova-ai/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  ...pluginRegistrationContractCases.google,
  speechProviderIds: ["google"],
  videoGenerationProviderIds: ["google"],
  webSearchProviderIds: ["gemini"],
  requireDescribeImages: true,
  requireGenerateImage: true,
  requireGenerateVideo: true,
});
