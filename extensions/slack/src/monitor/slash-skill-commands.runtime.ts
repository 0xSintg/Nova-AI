import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "nova-ai/plugin-sdk/command-auth-native";

type ListSkillCommandsForAgents =
  typeof import("nova-ai/plugin-sdk/command-auth-native").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
