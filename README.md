# mcp-swisstransport

MCP server for Swiss public transport schedules and connections via [transport.opendata.ch](https://transport.opendata.ch/). Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `search_stations` | Search for Swiss public transport stations by name |
| `get_connections` | Get connections between two locations |
| `get_stationboard` | Get the live departure board for a station |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "swisstransport_get_connections",
      "arguments": { "from": "Zurich HB", "to": "Bern" }
    },
    "id": 1
  }'
```

## License

MIT
