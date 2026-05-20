type McpLoopbackRuntime = {
  port: number;
  ownerToken: string;
  nonOwnerToken: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

export function resolveMcpLoopbackBearerToken(
  runtime: McpLoopbackRuntime,
  senderIsOwner: boolean,
): string {
  return senderIsOwner ? runtime.ownerToken : runtime.nonOwnerToken;
}

export function clearActiveMcpLoopbackRuntimeByOwnerToken(ownerToken: string): void {
  if (activeRuntime?.ownerToken === ownerToken) {
    activeRuntime = undefined;
  }
}

export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      nova-ai: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${NOVA_AI_MCP_TOKEN}",
          "x-session-key": "${NOVA_AI_MCP_SESSION_KEY}",
          "x-nova-ai-agent-id": "${NOVA_AI_MCP_AGENT_ID}",
          "x-nova-ai-account-id": "${NOVA_AI_MCP_ACCOUNT_ID}",
          "x-nova-ai-message-channel": "${NOVA_AI_MCP_MESSAGE_CHANNEL}",
          "x-nova-ai-inbound-event-kind": "${NOVA_AI_MCP_INBOUND_EVENT_KIND}",
        },
      },
    },
  };
}
