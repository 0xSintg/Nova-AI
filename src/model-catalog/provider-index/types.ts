import type { ModelCatalogProvider } from "../types.js";

export type Nova AIProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type Nova AIProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: Nova AIProviderIndexPluginInstall;
};

export type Nova AIProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation" | "music-generation")[];
};

export type Nova AIProviderIndexProvider = {
  id: string;
  name: string;
  plugin: Nova AIProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly Nova AIProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type Nova AIProviderIndex = {
  version: number;
  providers: Readonly<Record<string, Nova AIProviderIndexProvider>>;
};
