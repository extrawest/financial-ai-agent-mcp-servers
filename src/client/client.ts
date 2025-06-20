import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { setupLogger } from '../logger/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const logger = setupLogger(__filename);

export interface MCPTool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    call: (args: any) => Promise<any>;
}

export class MCPClientWrapper {
    serverUrl: string;
    client: Client | null = null;
    tools: MCPTool[] = [];
    connected = false;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    async connect(): Promise<void> {
        logger.info(`Connecting to MCP server: ${this.serverUrl}`);

        try {
            // Use SSE transport for FastMCP httpStream
            const transport = new SSEClientTransport(new URL(this.serverUrl));

            this.client = new Client(
                {
                    name: 'mcp-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {},
                }
            );

            await this.client.connect(transport);
            logger.info('MCP session initialized successfully');
            this.connected = true;
        } catch (error) {
            logger.error('Failed to connect to MCP server:', error);
            throw new Error(`Failed to connect to MCP server: ${error}`);
        }
    }

    async loadTools(): Promise<MCPTool[]> {
        logger.info('Loading MCP tools...');
        if (!this.connected || !this.client) {
            throw new Error('Not connected to MCP server');
        }

        try {
            const result = await this.client.listTools();
            const tools = result.tools || [];

            this.tools = tools.map((tool: any) => ({
                name: tool.name,
                description: tool.description || '',
                parameters: tool.inputSchema || {},
                call: async (args: any) => {
                    const response = await this.client!.callTool({
                        name: tool.name,
                        arguments: args,
                    });
                    const content = response.content as Array<{ text: string }>;
                    return content[0]?.text || response;
                },
            }));

            logger.info(`Loaded ${this.tools.length} tools from server`);
            return this.tools;
        } catch (error) {
            logger.error('Failed to load tools:', error);
            throw new Error(`Failed to load tools: ${error}`);
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.connected = false;
        }
    }
}

export async function getMcpClient(
    serverUrl: string
): Promise<[MCPClientWrapper, MCPTool[]]> {
    const client = new MCPClientWrapper(serverUrl);
    await client.connect();
    const tools = await client.loadTools();
    return [client, tools];
}
