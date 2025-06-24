# 📈 Model Context Protocol(MCP) Agent App

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)]()
[![Maintainer](https://img.shields.io/static/v1?label=Alex&message=Maintainer&color=red)]()
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A TypeScript-based Ai agent with MCP integration. This project provides a unified interface to access financial market information and relevant news articles through MCP servers with tool calling.
## DEMO

### Terminal

https://github.com/user-attachments/assets/47150b98-0663-43f6-927e-f09abb796fe6


### Cursor

https://github.com/user-attachments/assets/72210b49-dc23-4bef-b7ee-6d289ede59e1



## ✨ Features

-   **📊 Stock Market Data**:
    -   Company Information
    -   Quarterly Financials
    -   Annual Financial Reports
-   **📰 News Integration**:
    -   Real-time News Articles
    -   Query-based News Search
-   **🛠️ Architecture Components**:
    -   Client-Server Architecture
    -   TypeScript Implementation
    -   Modular Design Pattern
    -   LangChain agent

## 🔧 Prerequisites

-   Node.js 16.x or higher
-   TypeScript 4.x or higher
-   API keys for stock services and OpenAi

## 🚀 Quick Start

### 1. Installation

Clone and set up the project:

```bash
git clone https://github.com/extrawest/financial-ai-agent-mcp-servers
cd  financial-ai-agent-mcp-servers

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
STOCK_API_KEY=your_stock_api_key
OPENAI_API_KEY=your_open_ai_key
```

### 3. Build and Run

```bash
# Build the project
npm run build

# Start the server
npm start
```

## 🏗️ Project Structure

```
src/
├── agent/
│   └── agent.ts         # Agent implementation
├── client/
│   └── client.ts        # API client implementation
├── config/
│   └── configs.ts       # Configuration management
├── logger/
│   └── logger.ts        # Logging functionality
├── server/
│   ├── news-server.ts   # News API server
│   └── stocks-server.ts # Stock market API server
├── types/
│   └── newsapi.d.ts     # Type definitions
└── index.ts             # Application entry point
```

## 📦 Core Components

### Stock Server

Handles all stock market related operations:

-   Company information retrieval
-   Financial reports access
-   Market data processing

### News Server

Manages news-related functionality:

-   Article search and retrieval
-   Query processing
-   News data formatting

### Client

Provides a unified interface to interact with both servers:

-   API request handling
-   Response processing
-   Error management

## Start an app

In separate terminal tabs run

```bash
# Start Stocks server
 npm run stocks:built

 # Start News server
 npm npm run news:built

  # Run agent
 npm run agent:built
```

## Add mcp to Cursor IDE

-   Open Cursor IDE, go to Settings -> Cursor Settings
-   Go to Tools & Integrations section
-   Find MCP tools, click New MCP Server
-   Add this to mcp.json file

```json
{
    "mcpServers": {
        "stocks-mcp-server": {
            "url": "http://127.0.0.1:3000/sse"
        },
        "news-mcp-server": {
            "url": "http://127.0.0.1:3001/sse"
        }
    }
}
```

-   Run commands in separte terminal tabs

```bash
# Start Stocks server
 npm run stocks:built

 # Start News server
 npm npm run news:built

```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created by Oleksandr Samoilenko  
[Extrawest.com](https://extrawest.com), 2025
