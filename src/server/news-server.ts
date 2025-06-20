import { FastMCP } from 'fastmcp';
import NewsAPI from 'newsapi';
import { configs } from '../config/configs.js';
import { setupLogger } from '../logger/logger.js';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const logger = setupLogger(__filename);

if (!configs.newsApiKey) {
    throw new Error('News API key is required');
}

const newsapi = new NewsAPI(configs.newsApiKey);

const mcp = new FastMCP({
    name: 'news',
    version: '1.0.0',
});

mcp.addTool({
    name: 'fetch_news',
    description: 'Get news articles related to the query',
    parameters: z.object({
        query: z.string().describe('User query'),
    }),
    execute: async (args) => {
        const { query } = args as { query: string };
        try {
            const result = await newsapi.v2.everything({
                q: query,
                language: 'en',
                sortBy: 'relevancy',
            });
            logger.info(`News Result: ${JSON.stringify(result, null, 2)}`);
            return JSON.stringify(result, null, 2);
        } catch (error) {
            logger.error(`Error fetching news for query "${query}": ${error}`);
            throw error;
        }
    },
});

// Start the server with httpStream transport
logger.info(
    `Starting NEWS MCP server on 127.0.0.1:3001 with httpStream transport...`
);
await mcp.start({
    transportType: 'httpStream',
    httpStream: {
        port: 3001,
        endpoint: '/sse',
    },
});
