import { AgentRunner } from './agent/agent.js';
import { setupLogger } from './logger/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const logger = setupLogger(__filename);

interface ServerConfig {
    url: string;
}

async function runAgentWithMultipleServers(): Promise<void> {
    logger.info('Starting agent runner...');

    const agentRunner = new AgentRunner('gpt-4');

    try {
        // Configure the MCP servers
        const serverConfigs: ServerConfig[] = [
            {
                url: 'http://127.0.0.1:3000/sse', // Stocks server
            },
            {
                url: 'http://127.0.0.1:3001/sse', // News server
            },
        ];

        // Setup agent with multiple MCP servers
        await agentRunner.setupWithMultipleMcpServers(serverConfigs);

        // Run the query
        const query =
            'Summarize AAPL financials and analyze sentiment of recent news about the company';
        const response = await agentRunner.runQuery(query);

        logger.info('AGENT RESPONSE');
        logger.info('Full response:', JSON.stringify(response, null, 2));
        logger.info('Response content:', response);
    } catch (error) {
        logger.error(`Error running agent: ${error}`);
    } finally {
        await agentRunner.cleanup();
    }

    logger.info('Agent runner completed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runAgentWithMultipleServers().catch((error) => {
        logger.error(`Unhandled error: ${error}`);
        process.exit(1);
    });
}
