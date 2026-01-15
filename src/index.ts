#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from "commander";
import { z } from "zod";
import { fetchUrl, FetchOptions } from "./fetch.js";

const program = new Command();

program
  .name("mcp-fetch-ya")
  .description("MCP server for fetching web content")
  .option("--user-agent <agent>", "Custom User-Agent string")
  .option("--proxy-url <url>", "Proxy URL for requests")
  .option("--ignore-robots-txt", "Ignore robots.txt restrictions")
  .parse(process.argv);

const opts = program.opts<{
  userAgent?: string;
  proxyUrl?: string;
  ignoreRobotsTxt?: boolean;
}>();

const fetchOptions: FetchOptions = {
  userAgent: opts.userAgent,
  proxyUrl: opts.proxyUrl,
  ignoreRobotsTxt: opts.ignoreRobotsTxt,
};

const server = new McpServer({
  name: "mcp-fetch-ya",
  version: "0.1.0",
});

server.registerTool(
  "fetch",
  {
    title: "Fetch URL",
    description:
      "Fetches a URL and returns the content. HTML pages are converted to markdown for easier reading.",
    inputSchema: {
      url: z.string().url().describe("The URL to fetch"),
      raw: z
        .boolean()
        .optional()
        .default(false)
        .describe("Return raw content without markdown conversion"),
    },
  },
  async ({ url, raw }) => {
    try {
      const result = await fetchUrl(url, raw ?? false, fetchOptions);
      return {
        content: [
          {
            type: "text" as const,
            text: result.content,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching URL: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
