import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

/**
 * Check if content appears to be HTML
 */
function isHtml(content: string): boolean {
  return /<\s*html[\s>]/i.test(content) || /<\s*body[\s>]/i.test(content);
}

/**
 * Convert HTML content to markdown using Readability and Turndown
 */
export function htmlToMarkdown(html: string, url: string): string {
  if (!isHtml(html)) {
    return html;
  }

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    // Fallback: convert entire body if readability fails
    const body = dom.window.document.body;
    if (body) {
      return turndown.turndown(body.innerHTML);
    }
    return html;
  }

  let markdown = "";

  if (article.title) {
    markdown += `# ${article.title}\n\n`;
  }

  if (article.content) {
    markdown += turndown.turndown(article.content);
  }

  return markdown;
}
