import type { Nova AIConfig } from "../config/types.nova-ai.js";
import { attachPluginApiFacades, type Nova AIPluginApiWithoutFacades } from "./api-facades.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { Nova AIPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: Nova AIPluginApi["registrationMode"];
  config: Nova AIConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      Nova AIPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerHostedMediaResolver"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerReload"
      | "registerNodeHostCommand"
      | "registerNodeInvokePolicy"
      | "registerSecurityAuditCollector"
      | "registerService"
      | "registerGatewayDiscoveryService"
      | "registerCliBackend"
      | "registerTextTransforms"
      | "registerConfigMigration"
      | "registerMigrationProvider"
      | "registerAutoEnableProbe"
      | "registerProvider"
      | "registerModelCatalogProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerImageGenerationProvider"
      | "registerVideoGenerationProvider"
      | "registerMusicGenerationProvider"
      | "registerWebFetchProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerCompactionProvider"
      | "registerAgentHarness"
      | "registerCodexAppServerExtensionFactory"
      | "registerAgentToolResultMiddleware"
      | "registerSessionExtension"
      | "enqueueNextTurnInjection"
      | "registerTrustedToolPolicy"
      | "registerToolMetadata"
      | "registerControlUiDescriptor"
      | "registerRuntimeLifecycle"
      | "registerAgentEventSubscription"
      | "emitAgentEvent"
      | "setRunContext"
      | "getRunContext"
      | "clearRunContext"
      | "registerSessionSchedulerJob"
      | "registerSessionAction"
      | "sendSessionAttachment"
      | "scheduleSessionTurn"
      | "unscheduleSessionTurnsByTag"
      | "registerDetachedTaskRuntime"
      | "registerMemoryCapability"
      | "registerMemoryPromptSection"
      | "registerMemoryPromptSupplement"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: Nova AIPluginApi["registerTool"] = () => {};
const noopRegisterHook: Nova AIPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: Nova AIPluginApi["registerHttpRoute"] = () => {};
const noopRegisterHostedMediaResolver: Nova AIPluginApi["registerHostedMediaResolver"] = () => {};
const noopRegisterChannel: Nova AIPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: Nova AIPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: Nova AIPluginApi["registerCli"] = () => {};
const noopRegisterReload: Nova AIPluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: Nova AIPluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterNodeInvokePolicy: Nova AIPluginApi["registerNodeInvokePolicy"] = () => {};
const noopRegisterSecurityAuditCollector: Nova AIPluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: Nova AIPluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: Nova AIPluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: Nova AIPluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: Nova AIPluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: Nova AIPluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: Nova AIPluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: Nova AIPluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: Nova AIPluginApi["registerProvider"] = () => {};
const noopRegisterModelCatalogProvider: Nova AIPluginApi["registerModelCatalogProvider"] =
  () => {};
const noopRegisterSpeechProvider: Nova AIPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: Nova AIPluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: Nova AIPluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: Nova AIPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: Nova AIPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: Nova AIPluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: Nova AIPluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: Nova AIPluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: Nova AIPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: Nova AIPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: Nova AIPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: Nova AIPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: Nova AIPluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: Nova AIPluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: Nova AIPluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: Nova AIPluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: Nova AIPluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: Nova AIPluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: Nova AIPluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: Nova AIPluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: Nova AIPluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: Nova AIPluginApi["registerControlUiDescriptor"] = () => {};
const noopRegisterRuntimeLifecycle: Nova AIPluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: Nova AIPluginApi["registerAgentEventSubscription"] =
  () => {};
const noopEmitAgentEvent: Nova AIPluginApi["emitAgentEvent"] = () => ({
  emitted: false,
  reason: "not wired",
});
const noopSetRunContext: Nova AIPluginApi["setRunContext"] = () => false;
const noopGetRunContext: Nova AIPluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: Nova AIPluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: Nova AIPluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterSessionAction: Nova AIPluginApi["registerSessionAction"] = () => {};
const noopSendSessionAttachment: Nova AIPluginApi["sendSessionAttachment"] = async () => ({
  ok: false,
  error: "not wired",
});
const noopScheduleSessionTurn: Nova AIPluginApi["scheduleSessionTurn"] = async () => undefined;
const noopUnscheduleSessionTurnsByTag: Nova AIPluginApi["unscheduleSessionTurnsByTag"] =
  async () => ({ removed: 0, failed: 0 });
const noopRegisterDetachedTaskRuntime: Nova AIPluginApi["registerDetachedTaskRuntime"] = () => {};
const noopRegisterMemoryCapability: Nova AIPluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: Nova AIPluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryPromptSupplement: Nova AIPluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: Nova AIPluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: Nova AIPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: Nova AIPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: Nova AIPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: Nova AIPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): Nova AIPluginApi {
  const handlers = params.handlers ?? {};
  const registerCli = handlers.registerCli ?? noopRegisterCli;
  const api: Nova AIPluginApiWithoutFacades = {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerHostedMediaResolver:
      handlers.registerHostedMediaResolver ?? noopRegisterHostedMediaResolver,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli,
    registerNodeCliFeature: (registrar, opts) =>
      registerCli(registrar, {
        ...opts,
        parentPath: ["nodes"],
      }),
    registerReload: handlers.registerReload ?? noopRegisterReload,
    registerNodeHostCommand: handlers.registerNodeHostCommand ?? noopRegisterNodeHostCommand,
    registerNodeInvokePolicy: handlers.registerNodeInvokePolicy ?? noopRegisterNodeInvokePolicy,
    registerSecurityAuditCollector:
      handlers.registerSecurityAuditCollector ?? noopRegisterSecurityAuditCollector,
    registerService: handlers.registerService ?? noopRegisterService,
    registerGatewayDiscoveryService:
      handlers.registerGatewayDiscoveryService ?? noopRegisterGatewayDiscoveryService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerTextTransforms: handlers.registerTextTransforms ?? noopRegisterTextTransforms,
    registerConfigMigration: handlers.registerConfigMigration ?? noopRegisterConfigMigration,
    registerMigrationProvider: handlers.registerMigrationProvider ?? noopRegisterMigrationProvider,
    registerAutoEnableProbe: handlers.registerAutoEnableProbe ?? noopRegisterAutoEnableProbe,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerModelCatalogProvider:
      handlers.registerModelCatalogProvider ?? noopRegisterModelCatalogProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerRealtimeTranscriptionProvider:
      handlers.registerRealtimeTranscriptionProvider ?? noopRegisterRealtimeTranscriptionProvider,
    registerRealtimeVoiceProvider:
      handlers.registerRealtimeVoiceProvider ?? noopRegisterRealtimeVoiceProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerVideoGenerationProvider:
      handlers.registerVideoGenerationProvider ?? noopRegisterVideoGenerationProvider,
    registerMusicGenerationProvider:
      handlers.registerMusicGenerationProvider ?? noopRegisterMusicGenerationProvider,
    registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerCompactionProvider:
      handlers.registerCompactionProvider ?? noopRegisterCompactionProvider,
    registerAgentHarness: handlers.registerAgentHarness ?? noopRegisterAgentHarness,
    registerCodexAppServerExtensionFactory:
      handlers.registerCodexAppServerExtensionFactory ?? noopRegisterCodexAppServerExtensionFactory,
    registerAgentToolResultMiddleware:
      handlers.registerAgentToolResultMiddleware ?? noopRegisterAgentToolResultMiddleware,
    registerSessionExtension: handlers.registerSessionExtension ?? noopRegisterSessionExtension,
    enqueueNextTurnInjection: handlers.enqueueNextTurnInjection ?? noopEnqueueNextTurnInjection,
    registerTrustedToolPolicy: handlers.registerTrustedToolPolicy ?? noopRegisterTrustedToolPolicy,
    registerToolMetadata: handlers.registerToolMetadata ?? noopRegisterToolMetadata,
    registerControlUiDescriptor:
      handlers.registerControlUiDescriptor ?? noopRegisterControlUiDescriptor,
    registerRuntimeLifecycle: handlers.registerRuntimeLifecycle ?? noopRegisterRuntimeLifecycle,
    registerAgentEventSubscription:
      handlers.registerAgentEventSubscription ?? noopRegisterAgentEventSubscription,
    emitAgentEvent: handlers.emitAgentEvent ?? noopEmitAgentEvent,
    setRunContext: handlers.setRunContext ?? noopSetRunContext,
    getRunContext: handlers.getRunContext ?? noopGetRunContext,
    clearRunContext: handlers.clearRunContext ?? noopClearRunContext,
    registerSessionSchedulerJob:
      handlers.registerSessionSchedulerJob ?? noopRegisterSessionSchedulerJob,
    registerSessionAction: handlers.registerSessionAction ?? noopRegisterSessionAction,
    sendSessionAttachment: handlers.sendSessionAttachment ?? noopSendSessionAttachment,
    scheduleSessionTurn: handlers.scheduleSessionTurn ?? noopScheduleSessionTurn,
    unscheduleSessionTurnsByTag:
      handlers.unscheduleSessionTurnsByTag ?? noopUnscheduleSessionTurnsByTag,
    registerDetachedTaskRuntime:
      handlers.registerDetachedTaskRuntime ?? noopRegisterDetachedTaskRuntime,
    registerMemoryCapability: handlers.registerMemoryCapability ?? noopRegisterMemoryCapability,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryPromptSupplement:
      handlers.registerMemoryPromptSupplement ?? noopRegisterMemoryPromptSupplement,
    registerMemoryCorpusSupplement:
      handlers.registerMemoryCorpusSupplement ?? noopRegisterMemoryCorpusSupplement,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
  return attachPluginApiFacades(api);
}
