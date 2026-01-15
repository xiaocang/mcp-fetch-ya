import { HttpsProxyAgent } from "https-proxy-agent";
import { htmlToMarkdown } from "./markdown.js";
import { isAllowedByRobots } from "./robots.js";

const DEFAULT_USER_AGENT = "mcp-fetch-ya/1.0";

export interface FetchOptions {
  userAgent?: string;
  proxyUrl?: string;
  ignoreRobotsTxt?: boolean;
}

export interface FetchResult {
  content: string;
  contentType: string;
  url: string;
}

/**
 * Fetch a URL and optionally convert HTML to markdown
 */
export async function fetchUrl(
  url: string,
  raw: boolean,
  options: FetchOptions
): Promise<FetchResult> {
  const userAgent = options.userAgent || DEFAULT_USER_AGENT;

  // Check robots.txt unless disabled
  if (!options.ignoreRobotsTxt) {
    const robotsCheck = await isAllowedByRobots(url, userAgent);
    if (!robotsCheck.allowed) {
      throw new Error(robotsCheck.reason || "Blocked by robots.txt");
    }
  }

  // Prepare fetch options
  const fetchOptions: RequestInit & { agent?: HttpsProxyAgent<string> } = {
    headers: {
      "User-Agent": userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  };

  // Add proxy if configured
  if (options.proxyUrl) {
    fetchOptions.agent = new HttpsProxyAgent(options.proxyUrl);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  // Convert to markdown unless raw mode or non-HTML content
  let content: string;
  if (raw || !contentType.includes("text/html")) {
    content = text;
  } else {
    content = htmlToMarkdown(text, url);
  }

  return {
    content,
    contentType,
    url: response.url,
  };
}
