import { createHash } from "node:crypto";
import { describe, expect, test, vi } from "vitest";
import { HEARTBEAT_PROMPT } from "../auto-reply/heartbeat.js";
import { buildSessionHistorySnapshot, SessionHistorySseState } from "./session-history-state.js";
import * as sessionUtils from "./session-utils.js";

describe("SessionHistorySseState", () => {
  test("uses the initial raw snapshot for both first history and seq seeding", () => {
    const readSpy = vi.spyOn(sessionUtils, "readSessionMessagesAsync").mockResolvedValue([
      {
        role: "assistant",
        content: [{ type: "text", text: "stale disk message" }],
        __nova-ai: { seq: 1 },
      },
    ]);
    try {
      const state = SessionHistorySseState.fromRawSnapshot({
        target: { sessionId: "sess-main" },
        rawMessages: [
          {
            role: "assistant",
            content: [{ type: "text", text: "fresh snapshot message" }],
            __nova-ai: { seq: 2 },
          },
        ],
      });

      expect(state.snapshot().messages).toHaveLength(1);
      expect(
        (
          state.snapshot().messages[0] as {
            content?: Array<{ text?: string }>;
            __nova-ai?: { seq?: number };
          }
        ).content?.[0]?.text,
      ).toBe("fresh snapshot message");
      expect(
        (
          state.snapshot().messages[0] as {
            __nova-ai?: { seq?: number };
          }
        )["__nova-ai"]?.seq,
      ).toBe(2);

      const appended = state.appendInlineMessage({
        message: {
          role: "assistant",
          content: [{ type: "text", text: "next message" }],
        },
      });

      expect(appended?.messageSeq).toBe(3);
      expect(readSpy).not.toHaveBeenCalled();
    } finally {
      readSpy.mockRestore();
    }
  });

  test("reuses one canonical array for items and messages", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: "first" }],
          __nova-ai: { seq: 1 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "second" }],
          __nova-ai: { seq: 2 },
        },
      ],
      limit: 1,
    });

    expect(snapshot.history.items).toBe(snapshot.history.messages);
    expect(snapshot.history.messages[0]?.["__nova-ai"]?.seq).toBe(2);
    expect(snapshot.rawTranscriptSeq).toBe(2);
  });

  test("uses carried sequence for inline SSE appends", () => {
    const state = SessionHistorySseState.fromRawSnapshot({
      target: { sessionId: "sess-main" },
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: "initial" }],
          __nova-ai: { seq: 2 },
        },
      ],
    });

    const appended = state.appendInlineMessage({
      message: {
        role: "assistant",
        content: [{ type: "text", text: "carried" }],
      },
      messageSeq: 9,
    });

    expect(appended?.messageSeq).toBe(9);
    expect(state.snapshot().messages.at(-1)?.["__nova-ai"]?.seq).toBe(9);
  });

  test("requests refresh when inline TTS supplement merges into an existing assistant message", () => {
    const visibleText = "Here is the answer.";
    const textSha256 = createHash("sha256").update(visibleText).digest("hex");
    const state = SessionHistorySseState.fromRawSnapshot({
      target: { sessionId: "sess-main" },
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: visibleText }],
          __nova-ai: { seq: 2 },
        },
      ],
    });

    const appended = state.appendInlineMessage({
      message: {
        role: "assistant",
        content: [
          { type: "text", text: "Audio reply" },
          {
            type: "attachment",
            attachment: {
              url: "/tmp/tts.mp3",
              kind: "audio",
              label: "tts.mp3",
              mimeType: "audio/mpeg",
            },
          },
        ],
        nova-aiTtsSupplement: { textSha256, spokenText: visibleText },
      },
      messageSeq: 3,
    });

    expect(appended).toEqual({ shouldRefresh: true });
    expect(state.snapshot().messages).toEqual([
      {
        role: "assistant",
        content: [
          { type: "text", text: visibleText },
          {
            type: "attachment",
            attachment: {
              url: "/tmp/tts.mp3",
              kind: "audio",
              label: "tts.mp3",
              mimeType: "audio/mpeg",
            },
          },
        ],
        __nova-ai: { seq: 2 },
      },
    ]);
  });

  test("requests refresh for non-monotonic carried inline sequence", () => {
    const state = SessionHistorySseState.fromRawSnapshot({
      target: { sessionId: "sess-main" },
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: "current" }],
          __nova-ai: { seq: 5 },
        },
      ],
    });

    const appended = state.appendInlineMessage({
      message: {
        role: "assistant",
        content: [{ type: "text", text: "rewound branch" }],
      },
      messageSeq: 3,
    });

    expect(appended).toEqual({ shouldRefresh: true });
    expect(state.snapshot().messages).toHaveLength(1);
    expect(state.snapshot().messages.at(-1)?.["__nova-ai"]?.seq).toBe(5);
  });

  test("marks bounded tail snapshots as having older history", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: "tail" }],
          __nova-ai: { seq: 99 },
        },
      ],
      limit: 1,
      rawTranscriptSeq: 99,
      totalRawMessages: 99,
    });

    expect(snapshot.history.hasMore).toBe(true);
    expect(snapshot.history.nextCursor).toBe("99");
    expect(snapshot.rawTranscriptSeq).toBe(99);
  });

  test("refreshes limited SSE history from bounded async tail reads", async () => {
    const fullReadSpy = vi.spyOn(sessionUtils, "readSessionMessagesAsync").mockResolvedValue([]);
    const tailReadSpy = vi
      .spyOn(sessionUtils, "readRecentSessionMessagesWithStatsAsync")
      .mockResolvedValueOnce({
        messages: [
          {
            role: "assistant",
            content: [{ type: "text", text: "tail two" }],
            __nova-ai: { seq: 8 },
          },
        ],
        totalMessages: 8,
      });
    try {
      const state = SessionHistorySseState.fromRawSnapshot({
        target: { sessionId: "sess-main" },
        rawMessages: [
          {
            role: "assistant",
            content: [{ type: "text", text: "tail one" }],
            __nova-ai: { seq: 7 },
          },
        ],
        rawTranscriptSeq: 7,
        totalRawMessages: 7,
        limit: 1,
      });

      expect(state.snapshot().messages[0]?.["__nova-ai"]?.seq).toBe(7);
      const refreshed = await state.refreshAsync();

      expect(refreshed.hasMore).toBe(true);
      expect(refreshed.nextCursor).toBe("8");
      expect(refreshed.messages[0]?.["__nova-ai"]?.seq).toBe(8);
      expect(tailReadSpy).toHaveBeenCalledTimes(1);
      expect(fullReadSpy).not.toHaveBeenCalled();
    } finally {
      fullReadSpy.mockRestore();
      tailReadSpy.mockRestore();
    }
  });

  test("strips legacy internal envelopes before exposing history", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "<<<BEGIN_NOVA_AI_INTERNAL_CONTEXT>>>",
                "secret runtime context",
                "<<<END_NOVA_AI_INTERNAL_CONTEXT>>>",
                "",
                "visible ask",
              ].join("\n"),
            },
          ],
          __nova-ai: { seq: 1 },
        },
      ],
    });

    expect(snapshot.history.messages).toHaveLength(1);
    expect(
      (
        snapshot.history.messages[0] as {
          content?: Array<{ text?: string }>;
        }
      ).content?.[0]?.text,
    ).toBe("visible ask");
  });

  test("drops internal-only user messages after envelope stripping", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "<<<BEGIN_NOVA_AI_INTERNAL_CONTEXT>>>",
                "subagent completion payload",
                "<<<END_NOVA_AI_INTERNAL_CONTEXT>>>",
              ].join("\n"),
            },
          ],
          __nova-ai: { seq: 1 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "visible answer" }],
          __nova-ai: { seq: 2 },
        },
      ],
    });

    expect(snapshot.history.messages).toEqual([
      {
        role: "assistant",
        content: [{ type: "text", text: "visible answer" }],
        __nova-ai: { seq: 2 },
      },
    ]);
  });

  test("drops hidden runtime-context custom messages from projected history", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "custom",
          customType: "nova-ai.runtime-context",
          content: "secret runtime context",
          display: false,
          __nova-ai: { seq: 1 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "visible answer" }],
          __nova-ai: { seq: 2 },
        },
      ],
    });

    expect(snapshot.history.messages).toEqual([
      {
        role: "assistant",
        content: [{ type: "text", text: "visible answer" }],
        __nova-ai: { seq: 2 },
      },
    ]);
    expect(snapshot.rawTranscriptSeq).toBe(2);
  });

  test("drops subagent announce inter-session user messages from projected history", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "[Inter-session message] sourceSession=agent:main:subagent:child sourceChannel=webchat sourceTool=subagent_announce isUser=false",
                "This content was routed by Nova AI from another session or internal tool.",
                "<<<BEGIN_NOVA_AI_INTERNAL_CONTEXT>>>",
                "subagent completion payload",
                "<<<END_NOVA_AI_INTERNAL_CONTEXT>>>",
              ].join("\n"),
            },
          ],
          provenance: {
            kind: "inter_session",
            sourceSessionKey: "agent:main:subagent:child",
            sourceTool: "subagent_announce",
          },
          __nova-ai: { seq: 1 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "clean child result" }],
          __nova-ai: { seq: 2 },
        },
      ],
    });

    expect(snapshot.history.messages).toEqual([
      {
        role: "assistant",
        content: [{ type: "text", text: "clean child result" }],
        __nova-ai: { seq: 2 },
      },
    ]);
  });

  test("hides heartbeat prompt and ok acknowledgements from visible history", () => {
    const snapshot = buildSessionHistorySnapshot({
      rawMessages: [
        {
          role: "user",
          content: `${HEARTBEAT_PROMPT}\nWhen reading HEARTBEAT.md, use workspace file /tmp/HEARTBEAT.md (exact case). Do not read docs/heartbeat.md.`,
          __nova-ai: { seq: 1 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "HEARTBEAT_OK" }],
          __nova-ai: { seq: 2 },
        },
        {
          role: "user",
          content: HEARTBEAT_PROMPT,
          __nova-ai: { seq: 3 },
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "Disk usage crossed 95 percent." }],
          __nova-ai: { seq: 4 },
        },
      ],
    });

    expect(snapshot.history.messages).toEqual([
      {
        role: "assistant",
        content: [{ type: "text", text: "Disk usage crossed 95 percent." }],
        __nova-ai: { seq: 4 },
      },
    ]);
    expect(snapshot.rawTranscriptSeq).toBe(4);
  });

  test("does not append heartbeat or internal-only SSE messages", () => {
    const state = SessionHistorySseState.fromRawSnapshot({
      target: { sessionId: "sess-main" },
      rawMessages: [
        {
          role: "assistant",
          content: [{ type: "text", text: "already visible" }],
          __nova-ai: { seq: 1 },
        },
      ],
    });

    expect(
      state.appendInlineMessage({
        message: {
          role: "user",
          content: HEARTBEAT_PROMPT,
        },
      }),
    ).toBeNull();
    expect(
      state.appendInlineMessage({
        message: {
          role: "assistant",
          content: [{ type: "text", text: "HEARTBEAT_OK" }],
        },
      }),
    ).toBeNull();
    expect(
      state.appendInlineMessage({
        message: {
          role: "custom",
          customType: "nova-ai.runtime-context",
          content: "secret runtime context",
          display: false,
        },
      }),
    ).toBeNull();
    expect(
      state.appendInlineMessage({
        message: {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "<<<BEGIN_NOVA_AI_INTERNAL_CONTEXT>>>",
                "runtime details",
                "<<<END_NOVA_AI_INTERNAL_CONTEXT>>>",
              ].join("\n"),
            },
          ],
        },
      }),
    ).toBeNull();
    expect(state.snapshot().messages).toHaveLength(1);
  });
});
