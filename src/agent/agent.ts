import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MCPClientWrapper, MCPTool, getMcpClient } from '../client/client.js';
import { configs } from '../config/configs.js';
import { setupLogger } from '../logger/logger.js';
import { DynamicTool } from '@langchain/core/tools';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const logger = setupLogger(__filename);

interface ServerConfig {
    url: string;
}

export class AgentRunner {
    private model: ChatOpenAI;
    private agent: any | null = null;
    private tools: MCPTool[] = [];
    private clients: MCPClientWrapper[] = [];

    constructor(modelName: string = 'gpt-4') {
        this.model = new ChatOpenAI({
            modelName: modelName,
            openAIApiKey: configs.openaiApiKey,
        });
    }

    async setupWithMultipleMcpServers(
        serverConfigs: ServerConfig[]
    ): Promise<void> {
        for (const config of serverConfigs) {
            try {
                logger.info(`Connecting to server: ${config.url}`);
                const [client, tools] = await getMcpClient(config.url);
                this.tools = [...this.tools, ...tools];
                this.clients.push(client);
                logger.info(
                    `Successfully connected to ${config.url}, loaded ${tools.length} tools`
                );
            } catch (error) {
                logger.error(`Error connecting to ${config.url}: ${error}`);
                throw error;
            }
        }

        if (this.tools.length === 0) {
            throw new Error(
                'No tools were loaded from any server, agent cannot be created'
            );
        }

        // Convert MCP tools to LangChain tools
        const langchainTools = this.tools.map(
            (tool) =>
                new DynamicTool({
                    name: tool.name,
                    description: tool.description,
                    func: async (input: string) => {
                        try {
                            const args = JSON.parse(input);
                            const result = await tool.call(args);
                            return typeof result === 'string'
                                ? result
                                : JSON.stringify(result);
                        } catch (error) {
                            logger.error(
                                `Error calling tool ${tool.name}:`,
                                error
                            );
                            return `Error: ${error}`;
                        }
                    },
                })
        );

        // Create the agent
        this.agent = createReactAgent({
            llm: this.model,
            tools: langchainTools,
        });

        logger.info(`Agent created with ${langchainTools.length} tools`);
    }

    async runQuery(query: string): Promise<string> {
        if (!this.agent || this.tools.length === 0) {
            throw new Error(
                'Agent not initialized. Call setupWithMultipleMcpServers() first.'
            );
        }

        logger.info(`Running query: ${query}`);

        try {
            const response = await this.agent.invoke({
                messages: [{ role: 'human', content: query }],
            });

            // Extract the final message from the agent response
            const messages = response.messages || [];
            const lastMessage = messages[messages.length - 1];

            return lastMessage?.content || 'No response generated';
        } catch (error) {
            logger.error('Error processing query:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        logger.info(`Closing ${this.clients.length} MCP client connections`);
        for (const client of this.clients) {
            await client.disconnect();
        }
        this.clients = [];
        this.tools = [];
        this.agent = null;
    }
}
