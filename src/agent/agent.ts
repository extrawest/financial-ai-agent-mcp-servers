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
    model: ChatOpenAI;
    agent: any | null = null;
    tools: MCPTool[] = [];
    clients: MCPClientWrapper[] = [];

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
                            console.log('TOOL EXECUTION START:', tool.name);
                            console.log('Input:', input);

                            // Parse input and structure it correctly
                            let args;
                            try {
                                args = JSON.parse(input);
                            } catch {
                                // For stock-related tools, use 'symbol' as parameter name
                                if (
                                    tool.name.includes('stock') ||
                                    tool.name.includes('financials')
                                ) {
                                    args = { symbol: input };
                                } else {
                                    args = { query: input }; // For news and other tools
                                }
                            }

                            console.log('Processed args:', args);

                            // Wrap args if not properly structured
                            if (typeof args !== 'object') {
                                if (
                                    tool.name.includes('stock') ||
                                    tool.name.includes('financials')
                                ) {
                                    args = { symbol: args };
                                } else {
                                    args = { query: args };
                                }
                            }

                            console.log('Calling tool with args:', args);
                            const result = await tool.call(args);
                            console.log('TOOL EXECUTION RESULT:', result);

                            const finalResult =
                                typeof result === 'string'
                                    ? result
                                    : JSON.stringify(result);
                            console.log('TOOL EXECUTION END:', tool.name);
                            return finalResult;
                        } catch (error) {
                            console.error(
                                'TOOL EXECUTION ERROR:',
                                tool.name,
                                error
                            );
                            logger.error(
                                `Error calling tool ${tool.name}:`,
                                error
                            );
                            return `Error: ${error}`;
                        }
                    },
                })
        );

        console.log(
            'Creating agent with tools:',
            langchainTools.map((t) => t.name)
        );
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

        console.log('STARTING QUERY:', query);

        try {
            console.log('Invoking agent...');
            const response = await this.agent.invoke({
                messages: [{ role: 'human', content: query }],
            });
            console.log('Agent invocation completed');

            console.log('RAW RESPONSE FROM AGENT:');
            console.log(response);

            // Extract the final message from the agent response
            const messages = response.messages || [];
            const lastMessage = messages[messages.length - 1];

            console.log('FINAL MESSAGE:');
            console.log(lastMessage?.content);

            return lastMessage?.content || 'No response generated';
        } catch (error) {
            console.error('ERROR IN AGENT:', error);
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
