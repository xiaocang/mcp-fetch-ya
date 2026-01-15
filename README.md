# mcp-fetch-ya

A Model Context Protocol (MCP) server for fetching web content and converting HTML to markdown.

## Features

- **HTML to Markdown** - Automatically extracts main content using Readability and converts to clean markdown
- **robots.txt Compliance** - Respects robots.txt by default (configurable)
- **Custom User-Agent** - Configurable User-Agent string
- **Proxy Support** - Optional HTTP/HTTPS proxy configuration

## Installation

```bash
npm install -g mcp-fetch-ya@latest
```

Or use directly with npx:

```bash
npx mcp-fetch-ya@latest
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["mcp-fetch-ya@latest"]
    }
  }
}
```

### With options

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "mcp-fetch-ya@latest",
        "--ignore-robots-txt",
        "--user-agent", "MyBot/1.0"
      ]
    }
  }
}
```

### With proxy

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "mcp-fetch-ya@latest",
        "--proxy-url", "http://proxy.example.com:8080"
      ]
    }
  }
}
```

## Tool: fetch

Fetches a URL and returns the content. HTML pages are converted to markdown for easier reading.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | The URL to fetch |
| `raw` | boolean | No | false | Return raw content without markdown conversion |

### CLI Options

| Option | Description |
|--------|-------------|
| `--user-agent <agent>` | Custom User-Agent string |
| `--proxy-url <url>` | Proxy URL for requests |
| `--ignore-robots-txt` | Ignore robots.txt restrictions |

## License

MIT
