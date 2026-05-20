import { transcribeFirstAudio as transcribeFirstAudioImpl } from "nova-ai/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("nova-ai/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
