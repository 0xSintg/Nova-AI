---
summary: "Export Nova AI diagnostics to any OpenTelemetry collector via the diagnostics-otel plugin (OTLP/HTTP)"
title: "OpenTelemetry export"
read_when:
  - You want to send Nova AI model usage, message flow, or session metrics to an OpenTelemetry collector
  - You are wiring traces, metrics, or logs into Grafana, Datadog, Honeycomb, New Relic, Tempo, or another OTLP backend
  - You need the exact metric names, span names, or attribute shapes to build dashboards or alerts
---

Nova AI exports diagnostics through the official `diagnostics-otel` plugin
using **OTLP/HTTP (protobuf)**. Any collector or backend that accepts OTLP/HTTP
works without code changes. For local file logs and how to read them, see
[Logging](/logging).

## How it fits together

- **Diagnostics events** are structured, in-process records emitted by the
  Gateway and bundled plugins for model runs, message flow, sessions, queues,
  and exec.
- **`diagnostics-otel` plugin** subscribes to those events and exports them as
  OpenTelemetry **metrics**, **traces**, and **logs** over OTLP/HTTP.
- **Provider calls** receive a W3C `traceparent` header from Nova AI's
  trusted model-call span context when the provider transport accepts custom
  headers. Plugin-emitted trace context is not propagated.
- Exporters only attach when both the diagnostics surface and the plugin are
  enabled, so the in-process cost stays near zero by default.

## Quick start

For packaged installs, install the plugin first:

```bash
nova-ai plugins install clawhub:@nova-ai/diagnostics-otel
```

```json5
{
  plugins: {
    allow: ["diagnostics-otel"],
    entries: {
      "diagnostics-otel": { enabled: true },
    },
  },
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      protocol: "http/protobuf",
      serviceName: "nova-ai-gateway",
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2,
      flushIntervalMs: 60000,
    },
  },
}
```

You can also enable the plugin from the CLI:

```bash
nova-ai plugins enable diagnostics-otel
```

<Note>
`protocol` currently supports `http/protobuf` only. `grpc` is ignored.
</Note>

## Signals exported

| Signal      | What goes in it                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Metrics** | Counters and histograms for token usage, cost, run duration, message flow, Talk events, queue lanes, session state/recovery, exec, and memory pressure. |
| **Traces**  | Spans for model usage, model calls, harness lifecycle, tool execution, exec, webhook/message processing, context assembly, and tool loops.              |
| **Logs**    | Structured `logging.file` records exported over OTLP when `diagnostics.otel.logs` is enabled.                                                           |

Toggle `traces`, `metrics`, and `logs` independently. All three default to on
when `diagnostics.otel.enabled` is true.

## Configuration reference

```json5
{
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      tracesEndpoint: "http://otel-collector:4318/v1/traces",
      metricsEndpoint: "http://otel-collector:4318/v1/metrics",
      logsEndpoint: "http://otel-collector:4318/v1/logs",
      protocol: "http/protobuf", // grpc is ignored
      serviceName: "nova-ai-gateway",
      headers: { "x-collector-token": "..." },
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2, // root-span sampler, 0.0..1.0
      flushIntervalMs: 60000, // metric export interval (min 1000ms)
      captureContent: {
        enabled: false,
        inputMessages: false,
        outputMessages: false,
        toolInputs: false,
        toolOutputs: false,
        systemPrompt: false,
      },
    },
  },
}
```

### Environment variables

| Variable                                                                                                          | Purpose                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                                                     | Override `diagnostics.otel.endpoint`. If the value already contains `/v1/traces`, `/v1/metrics`, or `/v1/logs`, it is used as-is.                                                                                                          |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` / `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` / `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | Signal-specific endpoint overrides used when the matching `diagnostics.otel.*Endpoint` config key is unset. Signal-specific config wins over signal-specific env, which wins over the shared endpoint.                                     |
| `OTEL_SERVICE_NAME`                                                                                               | Override `diagnostics.otel.serviceName`.                                                                                                                                                                                                   |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                                                     | Override the wire protocol (only `http/protobuf` is honored today).                                                                                                                                                                        |
| `OTEL_SEMCONV_STABILITY_OPT_IN`                                                                                   | Set to `gen_ai_latest_experimental` to emit the latest experimental GenAI span attribute (`gen_ai.provider.name`) instead of the legacy `gen_ai.system`. GenAI metrics always use bounded, low-cardinality semantic attributes regardless. |
| `NOVA_AI_OTEL_PRELOADED`                                                                                         | Set to `1` when another preload or host process already registered the global OpenTelemetry SDK. The plugin then skips its own NodeSDK lifecycle but still wires diagnostic listeners and honors `traces`/`metrics`/`logs`.                |

## Privacy and content capture

Raw model/tool content is **not** exported by default. Spans carry bounded
identifiers (channel, provider, model, error category, hash-only request ids)
and never include prompt text, response text, tool inputs, tool outputs, or
session keys.
Talk metrics export only bounded event metadata such as mode, transport,
provider, and event type. They do not include transcripts, audio payloads,
session ids, turn ids, call ids, room ids, or handoff tokens.

Outbound model requests may include a W3C `traceparent` header. That header is
generated only from Nova AI-owned diagnostic trace context for the active model
call. Existing caller-supplied `traceparent` headers are replaced, so plugins or
custom provider options cannot spoof cross-service trace ancestry.

Set `diagnostics.otel.captureContent.*` to `true` only when your collector and
retention policy are approved for prompt, response, tool, or system-prompt
text. Each subkey is opt-in independently:

- `inputMessages` - user prompt content.
- `outputMessages` - model response content.
- `toolInputs` - tool argument payloads.
- `toolOutputs` - tool result payloads.
- `systemPrompt` - assembled system/developer prompt.

When any subkey is enabled, model and tool spans get bounded, redacted
`nova-ai.content.*` attributes for that class only.

## Sampling and flushing

- **Traces:** `diagnostics.otel.sampleRate` (root-span only, `0.0` drops all,
  `1.0` keeps all).
- **Metrics:** `diagnostics.otel.flushIntervalMs` (minimum `1000`).
- **Logs:** OTLP logs respect `logging.level` (file log level). They use the
  diagnostic log-record redaction path, not console formatting. High-volume
  installs should prefer OTLP collector sampling/filtering over local sampling.
- **File-log correlation:** JSONL file logs include top-level `traceId`,
  `spanId`, `parentSpanId`, and `traceFlags` when the log call carries a valid
  diagnostic trace context, which lets log processors join local log lines with
  exported spans.
- **Request correlation:** Gateway HTTP requests and WebSocket frames create an
  internal request trace scope. Logs and diagnostic events inside that scope
  inherit the request trace by default, while agent run and model-call spans are
  created as children so provider `traceparent` headers stay on the same trace.

## Exported metrics

### Model usage

- `nova-ai.tokens` (counter, attrs: `nova-ai.token`, `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`, `nova-ai.agent`)
- `nova-ai.cost.usd` (counter, attrs: `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`)
- `nova-ai.run.duration_ms` (histogram, attrs: `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`)
- `nova-ai.context.tokens` (histogram, attrs: `nova-ai.context`, `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`)
- `gen_ai.client.token.usage` (histogram, GenAI semantic-conventions metric, attrs: `gen_ai.token.type` = `input`/`output`, `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`)
- `gen_ai.client.operation.duration` (histogram, seconds, GenAI semantic-conventions metric, attrs: `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`, optional `error.type`)
- `nova-ai.model_call.duration_ms` (histogram, attrs: `nova-ai.provider`, `nova-ai.model`, `nova-ai.api`, `nova-ai.transport`, plus `nova-ai.errorCategory` and `nova-ai.failureKind` on classified errors)
- `nova-ai.model_call.request_bytes` (histogram, UTF-8 byte size of the final model request payload; no raw payload content)
- `nova-ai.model_call.response_bytes` (histogram, UTF-8 byte size of streamed model response events; no raw response content)
- `nova-ai.model_call.time_to_first_byte_ms` (histogram, elapsed time before the first streamed response event)

### Message flow

- `nova-ai.webhook.received` (counter, attrs: `nova-ai.channel`, `nova-ai.webhook`)
- `nova-ai.webhook.error` (counter, attrs: `nova-ai.channel`, `nova-ai.webhook`)
- `nova-ai.webhook.duration_ms` (histogram, attrs: `nova-ai.channel`, `nova-ai.webhook`)
- `nova-ai.message.queued` (counter, attrs: `nova-ai.channel`, `nova-ai.source`)
- `nova-ai.message.processed` (counter, attrs: `nova-ai.channel`, `nova-ai.outcome`)
- `nova-ai.message.duration_ms` (histogram, attrs: `nova-ai.channel`, `nova-ai.outcome`)
- `nova-ai.message.delivery.started` (counter, attrs: `nova-ai.channel`, `nova-ai.delivery.kind`)
- `nova-ai.message.delivery.duration_ms` (histogram, attrs: `nova-ai.channel`, `nova-ai.delivery.kind`, `nova-ai.outcome`, `nova-ai.errorCategory`)

### Talk

- `nova-ai.talk.event` (counter, attrs: `nova-ai.talk.event_type`, `nova-ai.talk.mode`, `nova-ai.talk.transport`, `nova-ai.talk.brain`, `nova-ai.talk.provider`)
- `nova-ai.talk.event.duration_ms` (histogram, attrs: same as `nova-ai.talk.event`; emitted when a Talk event reports duration)
- `nova-ai.talk.audio.bytes` (histogram, attrs: same as `nova-ai.talk.event`; emitted for Talk audio frame events that report byte length)

### Queues and sessions

- `nova-ai.queue.lane.enqueue` (counter, attrs: `nova-ai.lane`)
- `nova-ai.queue.lane.dequeue` (counter, attrs: `nova-ai.lane`)
- `nova-ai.queue.depth` (histogram, attrs: `nova-ai.lane` or `nova-ai.channel=heartbeat`)
- `nova-ai.queue.wait_ms` (histogram, attrs: `nova-ai.lane`)
- `nova-ai.session.state` (counter, attrs: `nova-ai.state`, `nova-ai.reason`)
- `nova-ai.session.stuck` (counter, attrs: `nova-ai.state`; emitted only for stale session bookkeeping with no active work)
- `nova-ai.session.stuck_age_ms` (histogram, attrs: `nova-ai.state`; emitted only for stale session bookkeeping with no active work)
- `nova-ai.session.recovery.requested` (counter, attrs: `nova-ai.state`, `nova-ai.action`, `nova-ai.active_work_kind`, `nova-ai.reason`)
- `nova-ai.session.recovery.completed` (counter, attrs: `nova-ai.state`, `nova-ai.action`, `nova-ai.status`, `nova-ai.active_work_kind`, `nova-ai.reason`)
- `nova-ai.session.recovery.age_ms` (histogram, attrs: same as the matching recovery counter)
- `nova-ai.run.attempt` (counter, attrs: `nova-ai.attempt`)

### Session liveness telemetry

`diagnostics.stuckSessionWarnMs` is the no-progress age threshold for session
liveness diagnostics. A `processing` session does not age toward this threshold
while Nova AI observes reply, tool, status, block, or ACP runtime progress.
Typing keepalives are not counted as progress, so a silent model or harness can
still be detected.

Nova AI classifies sessions by the work it can still observe:

- `session.long_running`: active embedded work, model calls, or tool calls are
  still making progress.
- `session.stalled`: active work exists, but the active run has not reported
  recent progress. Stalled embedded runs stay observe-only at first, then
  abort-drain after `diagnostics.stuckSessionAbortMs` with no progress so queued
  turns behind the lane can resume. When unset, the abort threshold defaults to
  the safer extended window of at least 5 minutes and 3x
  `diagnostics.stuckSessionWarnMs`.
- `session.stuck`: stale session bookkeeping with no active work. This releases
  the affected session lane immediately.

Recovery emits structured `session.recovery.requested` and
`session.recovery.completed` events. Diagnostic session state is marked idle
only after a mutating recovery outcome (`aborted` or `released`) and only if the
same processing generation is still current.

Only `session.stuck` emits the `nova-ai.session.stuck` counter, the
`nova-ai.session.stuck_age_ms` histogram, and the `nova-ai.session.stuck`
span. Repeated `session.stuck` diagnostics back off while the session remains
unchanged, so dashboards should alert on sustained increases rather than every
heartbeat tick. For the config knob and defaults, see
[Configuration reference](/gateway/configuration-reference#diagnostics).

### Harness lifecycle

- `nova-ai.harness.duration_ms` (histogram, attrs: `nova-ai.harness.id`, `nova-ai.harness.plugin`, `nova-ai.outcome`, `nova-ai.harness.phase` on errors)

### Exec

- `nova-ai.exec.duration_ms` (histogram, attrs: `nova-ai.exec.target`, `nova-ai.exec.mode`, `nova-ai.outcome`, `nova-ai.failureKind`)

### Diagnostics internals (memory and tool loop)

- `nova-ai.memory.heap_used_bytes` (histogram, attrs: `nova-ai.memory.kind`)
- `nova-ai.memory.rss_bytes` (histogram)
- `nova-ai.memory.pressure` (counter, attrs: `nova-ai.memory.level`)
- `nova-ai.tool.loop.iterations` (counter, attrs: `nova-ai.toolName`, `nova-ai.outcome`)
- `nova-ai.tool.loop.duration_ms` (histogram, attrs: `nova-ai.toolName`, `nova-ai.outcome`)

## Exported spans

- `nova-ai.model.usage`
  - `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`
  - `nova-ai.tokens.*` (input/output/cache_read/cache_write/total)
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `gen_ai.usage.*`
- `nova-ai.run`
  - `nova-ai.outcome`, `nova-ai.channel`, `nova-ai.provider`, `nova-ai.model`, `nova-ai.errorCategory`
- `nova-ai.model.call`
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `nova-ai.provider`, `nova-ai.model`, `nova-ai.api`, `nova-ai.transport`
  - `nova-ai.errorCategory` and optional `nova-ai.failureKind` on errors
  - `nova-ai.model_call.request_bytes`, `nova-ai.model_call.response_bytes`, `nova-ai.model_call.time_to_first_byte_ms`
  - `nova-ai.provider.request_id_hash` (bounded SHA-based hash of the upstream provider request id; raw ids are not exported)
- `nova-ai.harness.run`
  - `nova-ai.harness.id`, `nova-ai.harness.plugin`, `nova-ai.outcome`, `nova-ai.provider`, `nova-ai.model`, `nova-ai.channel`
  - On completion: `nova-ai.harness.result_classification`, `nova-ai.harness.yield_detected`, `nova-ai.harness.items.started`, `nova-ai.harness.items.completed`, `nova-ai.harness.items.active`
  - On error: `nova-ai.harness.phase`, `nova-ai.errorCategory`, optional `nova-ai.harness.cleanup_failed`
- `nova-ai.tool.execution`
  - `gen_ai.tool.name`, `nova-ai.toolName`, `nova-ai.errorCategory`, `nova-ai.tool.params.*`
- `nova-ai.exec`
  - `nova-ai.exec.target`, `nova-ai.exec.mode`, `nova-ai.outcome`, `nova-ai.failureKind`, `nova-ai.exec.command_length`, `nova-ai.exec.exit_code`, `nova-ai.exec.timed_out`
- `nova-ai.webhook.processed`
  - `nova-ai.channel`, `nova-ai.webhook`
- `nova-ai.webhook.error`
  - `nova-ai.channel`, `nova-ai.webhook`, `nova-ai.error`
- `nova-ai.message.processed`
  - `nova-ai.channel`, `nova-ai.outcome`, `nova-ai.reason`
- `nova-ai.message.delivery`
  - `nova-ai.channel`, `nova-ai.delivery.kind`, `nova-ai.outcome`, `nova-ai.errorCategory`, `nova-ai.delivery.result_count`
- `nova-ai.session.stuck`
  - `nova-ai.state`, `nova-ai.ageMs`, `nova-ai.queueDepth`
- `nova-ai.context.assembled`
  - `nova-ai.prompt.size`, `nova-ai.history.size`, `nova-ai.context.tokens`, `nova-ai.errorCategory` (no prompt, history, response, or session-key content)
- `nova-ai.tool.loop`
  - `nova-ai.toolName`, `nova-ai.outcome`, `nova-ai.iterations`, `nova-ai.errorCategory` (no loop messages, params, or tool output)
- `nova-ai.memory.pressure`
  - `nova-ai.memory.level`, `nova-ai.memory.heap_used_bytes`, `nova-ai.memory.rss_bytes`

When content capture is explicitly enabled, model and tool spans can also
include bounded, redacted `nova-ai.content.*` attributes for the specific
content classes you opted into.

## Diagnostic event catalog

The events below back the metrics and spans above. Plugins can also subscribe
to them directly without OTLP export.

**Model usage**

- `model.usage` - tokens, cost, duration, context, provider/model/channel,
  session ids. `usage` is provider/turn accounting for cost and telemetry;
  `context.used` is the current prompt/context snapshot and can be lower than
  provider `usage.total` when cached input or tool-loop calls are involved.

**Message flow**

- `webhook.received` / `webhook.processed` / `webhook.error`
- `message.queued` / `message.processed`
- `message.delivery.started` / `message.delivery.completed` / `message.delivery.error`

**Queue and session**

- `queue.lane.enqueue` / `queue.lane.dequeue`
- `session.state` / `session.long_running` / `session.stalled` / `session.stuck`
- `run.attempt` / `run.progress`
- `diagnostic.heartbeat` (aggregate counters: webhooks/queue/session)

**Harness lifecycle**

- `harness.run.started` / `harness.run.completed` / `harness.run.error` -
  per-run lifecycle for the agent harness. Includes `harnessId`, optional
  `pluginId`, provider/model/channel, and run id. Completion adds
  `durationMs`, `outcome`, optional `resultClassification`, `yieldDetected`,
  and `itemLifecycle` counts. Errors add `phase`
  (`prepare`/`start`/`send`/`resolve`/`cleanup`), `errorCategory`, and
  optional `cleanupFailed`.

**Exec**

- `exec.process.completed` - terminal outcome, duration, target, mode, exit
  code, and failure kind. Command text and working directories are not
  included.

## Without an exporter

You can keep diagnostics events available to plugins or custom sinks without
running `diagnostics-otel`:

```json5
{
  diagnostics: { enabled: true },
}
```

For targeted debug output without raising `logging.level`, use diagnostics
flags. Flags are case-insensitive and support wildcards (e.g. `telegram.*` or
`*`):

```json5
{
  diagnostics: { flags: ["telegram.http"] },
}
```

Or as a one-off env override:

```bash
NOVA_AI_DIAGNOSTICS=telegram.http,telegram.payload nova-ai gateway
```

Flag output goes to the standard log file (`logging.file`) and is still
redacted by `logging.redactSensitive`. Full guide:
[Diagnostics flags](/diagnostics/flags).

## Disable

```json5
{
  diagnostics: { otel: { enabled: false } },
}
```

You can also leave `diagnostics-otel` out of `plugins.allow`, or run
`nova-ai plugins disable diagnostics-otel`.

## Related

- [Logging](/logging) - file logs, console output, CLI tailing, and the Control UI Logs tab
- [Gateway logging internals](/gateway/logging) - WS log styles, subsystem prefixes, and console capture
- [Diagnostics flags](/diagnostics/flags) - targeted debug-log flags
- [Diagnostics export](/gateway/diagnostics) - operator support-bundle tool (separate from OTEL export)
- [Configuration reference](/gateway/configuration-reference#diagnostics) - full `diagnostics.*` field reference
