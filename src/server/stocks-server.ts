import { FastMCP } from 'fastmcp';
import yahooFinance from 'yahoo-finance2';
import { setupLogger } from '../logger/logger.js';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const logger = setupLogger(__filename);

// Suppress Yahoo Finance survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

const mcp = new FastMCP({
    name: 'stocks',
    version: '1.0.0',
});

// Add tools
mcp.addTool({
    name: 'fetch_stock_info',
    description: "Get Company's general information",
    parameters: z.object({
        symbol: z.string().describe('Stock ticker symbol'),
    }),
    execute: async (args) => {
        const { symbol } = args as { symbol: string };
        logger.info(`Fetching stock info for ${symbol}`);
        try {
            const quote = await yahooFinance.quote(symbol);
            logger.info(`Stocks Result: ${JSON.stringify(quote, null, 2)}`);
            return JSON.stringify(quote, null, 2);
        } catch (error) {
            logger.error(`Error fetching stock info for ${symbol}: ${error}`);
            throw error;
        }
    },
});

mcp.addTool({
    name: 'fetch_quarterly_financials',
    description: 'Get stock quarterly financials',
    parameters: z.object({
        symbol: z.string().describe('Stock ticker symbol'),
    }),
    execute: async (args) => {
        const { symbol } = args as { symbol: string };
        logger.info(`Fetching stock quarterly financials for ${symbol}`);
        try {
            const financials = await yahooFinance.quoteSummary(symbol, {
                modules: [
                    'incomeStatementHistoryQuarterly',
                    'balanceSheetHistoryQuarterly',
                    'cashflowStatementHistoryQuarterly',
                ],
            });
            logger.info(
                `Stocks Quarterly Result: ${JSON.stringify(
                    financials,
                    null,
                    2
                )}`
            );

            return JSON.stringify(financials, null, 2);
        } catch (error) {
            logger.error(
                `Error fetching quarterly financials for ${symbol}: ${error}`
            );
            throw error;
        }
    },
});

mcp.addTool({
    name: 'fetch_annual_financials',
    description: 'Get stock annual financials',
    parameters: z.object({
        symbol: z.string().describe('Stock ticker symbol'),
    }),
    execute: async (args) => {
        const { symbol } = args as { symbol: string };
        logger.info(`Fetching stock annual financials for ${symbol}`);
        try {
            const financials = await yahooFinance.quoteSummary(symbol, {
                modules: [
                    'incomeStatementHistory',
                    'balanceSheetHistory',
                    'cashflowStatementHistory',
                ],
            });
            logger.info(
                `Stocks Annual Result: ${JSON.stringify(financials, null, 2)}`
            );
            return JSON.stringify(financials, null, 2);
        } catch (error) {
            logger.error(
                `Error fetching annual financials for ${symbol}: ${error}`
            );
            throw error;
        }
    },
});

// Start the server with httpStream transport
logger.info(
    `Starting STOCKS MCP server on 127.0.0.1:3000 with httpStream transport...`
);
await mcp.start({
    transportType: 'httpStream',
    httpStream: {
        port: 3000,
        endpoint: '/sse',
    },
});
