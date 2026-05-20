/**
 * Standalone MCP server for selected built-in Nova AI tools.
 *
 * Run via: node --import tsx src/mcp/nova-ai-tools-serve.ts
 * Or: bun src/mcp/nova-ai-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveNova AIToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

function createNova AIToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveNova AIToolsForMcp();
  return createToolsMcpServer({ name: "nova-ai-tools", tools });
}

async function serveNova AIToolsMcp(): Promise<void> {
  const server = createNova AIToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveNova AIToolsMcp().catch((err) => {
    process.stderr.write(`nova-ai-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
