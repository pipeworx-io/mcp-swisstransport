# mcp-swisstransport

Swiss Transport MCP — wraps Transport Open Data API (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_stations` | Search for Swiss public transport stations (train, bus, tram) by name query. |
| `get_connections` | Get public transport connections between two Swiss locations. Returns up to the requested number of next departures. |
| `get_stationboard` | Get the live departure board for a Swiss public transport station. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "swisstransport": {
      "url": "https://gateway.pipeworx.io/swisstransport/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Swisstransport data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
