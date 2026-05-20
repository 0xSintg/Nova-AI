import {
  expectNova AILiveTranscriptMarker,
  normalizeTranscriptForMatch,
  NOVA_AI_LIVE_TRANSCRIPT_MARKER_RE,
} from "nova-ai/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common Nova AI live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Open-Claw integration OK")).toBe("nova-aiintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      NOVA_AI_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      NOVA_AI_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectNova AILiveTranscriptMarker("OpenClar integration OK");
  });
});
