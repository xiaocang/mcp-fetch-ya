import { createRequire } from "module";

const require = createRequire(import.meta.url);

interface Robot {
  isAllowed(url: string, ua?: string): boolean | undefined;
  isDisallowed(url: string, ua?: string): boolean | undefined;
}

const robotsParser: (url: string, content: string) => Robot =
  require("robots-parser");

/**
 * Check if a URL is allowed by robots.txt
 */
export async function isAllowedByRobots(
  url: string,
  userAgent: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;

    const response = await fetch(robotsUrl, {
      headers: {
        "User-Agent": userAgent,
      },
    });

    if (response.status === 404) {
      // No robots.txt means everything is allowed
      return { allowed: true };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        allowed: false,
        reason: `Access to robots.txt denied (HTTP ${response.status})`,
      };
    }

    if (!response.ok) {
      // If we can't fetch robots.txt, assume allowed
      return { allowed: true };
    }

    const robotsTxt = await response.text();
    const robots = robotsParser(robotsUrl, robotsTxt);

    if (robots.isAllowed(url, userAgent)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `URL is disallowed by robots.txt for user-agent "${userAgent}"`,
    };
  } catch (error) {
    // If there's any error checking robots.txt, allow the request
    return { allowed: true };
  }
}
