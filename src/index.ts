/**
 * Swiss Transport MCP — wraps Transport Open Data API (free, no auth)
 *
 * Tools:
 * - search_stations: Search for Swiss public transport stations by name or coordinates
 * - get_connections: Get connections between two locations
 * - get_stationboard: Get the departure board for a station
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://transport.opendata.ch/v1';

type RawCoordinate = {
  type: string;
  x: number | null;
  y: number | null;
};

type RawStation = {
  id: string | null;
  name: string | null;
  score: number | null;
  coordinate: RawCoordinate;
  distance: number | null;
};

type RawLocationsResponse = {
  stations: RawStation[];
};

type RawStop = {
  station: RawStation;
  arrival: string | null;
  departure: string | null;
  delay: number | null;
  platform: string | null;
};

type RawSection = {
  journey: {
    name: string;
    category: string;
    number: string;
    operator: string;
    to: string;
  } | null;
  walk: { duration: number } | null;
  departure: RawStop;
  arrival: RawStop;
};

type RawConnection = {
  from: RawStop;
  to: RawStop;
  duration: string;
  transfers: number;
  sections: RawSection[];
};

type RawConnectionsResponse = {
  connections: RawConnection[];
  from: RawStation;
  to: RawStation;
};

type RawStationboardEntry = {
  stop: RawStop;
  name: string;
  category: string;
  number: string;
  operator: string;
  to: string;
};

type RawStationboardResponse = {
  station: RawStation;
  stationboard: RawStationboardEntry[];
};

function formatStation(station: RawStation) {
  return {
    id: station.id,
    name: station.name,
    coordinate: station.coordinate
      ? { x: station.coordinate.x, y: station.coordinate.y }
      : null,
  };
}

function formatStop(stop: RawStop) {
  return {
    station: formatStation(stop.station),
    arrival: stop.arrival,
    departure: stop.departure,
    delay: stop.delay,
    platform: stop.platform,
  };
}

const tools: McpToolExport['tools'] = [
  {
    name: 'search_stations',
    description:
      'Search for Swiss public transport stations (train, bus, tram) by name query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Station name to search for (e.g., "Zurich HB", "Bern", "Geneva").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_connections',
    description:
      'Get public transport connections between two Swiss locations. Returns up to the requested number of next departures.',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Departure station name or ID.',
        },
        to: {
          type: 'string',
          description: 'Arrival station name or ID.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of connections to return. Defaults to 4.',
        },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'get_stationboard',
    description:
      'Get the live departure board for a Swiss public transport station.',
    inputSchema: {
      type: 'object',
      properties: {
        station: {
          type: 'string',
          description: 'Station name or ID to get the departure board for.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of departures to return. Defaults to 10.',
        },
      },
      required: ['station'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_stations':
      return searchStations(args.query as string);
    case 'get_connections':
      return getConnections(
        args.from as string,
        args.to as string,
        (args.limit as number | undefined) ?? 4,
      );
    case 'get_stationboard':
      return getStationboard(
        args.station as string,
        (args.limit as number | undefined) ?? 10,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function searchStations(query: string) {
  const params = new URLSearchParams({ query });
  const res = await fetch(`${BASE_URL}/locations?${params.toString()}`);
  if (!res.ok) throw new Error(`Swiss Transport API error: ${res.status}`);

  const data = (await res.json()) as RawLocationsResponse;

  return {
    count: data.stations.length,
    stations: data.stations.map(formatStation),
  };
}

async function getConnections(from: string, to: string, limit: number) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const res = await fetch(`${BASE_URL}/connections?${params.toString()}`);
  if (!res.ok) throw new Error(`Swiss Transport API error: ${res.status}`);

  const data = (await res.json()) as RawConnectionsResponse;

  return {
    from: formatStation(data.from),
    to: formatStation(data.to),
    count: data.connections.length,
    connections: data.connections.map((conn) => ({
      duration: conn.duration,
      transfers: conn.transfers,
      departure: formatStop(conn.from),
      arrival: formatStop(conn.to),
      sections: conn.sections.map((section) => ({
        departure: formatStop(section.departure),
        arrival: formatStop(section.arrival),
        journey: section.journey
          ? {
              name: section.journey.name,
              category: section.journey.category,
              number: section.journey.number,
              operator: section.journey.operator,
              to: section.journey.to,
            }
          : null,
        walk: section.walk ?? null,
      })),
    })),
  };
}

async function getStationboard(station: string, limit: number) {
  const params = new URLSearchParams({ station, limit: String(limit) });
  const res = await fetch(`${BASE_URL}/stationboard?${params.toString()}`);
  if (!res.ok) throw new Error(`Swiss Transport API error: ${res.status}`);

  const data = (await res.json()) as RawStationboardResponse;

  return {
    station: formatStation(data.station),
    count: data.stationboard.length,
    departures: data.stationboard.map((entry) => ({
      name: entry.name,
      category: entry.category,
      number: entry.number,
      operator: entry.operator,
      to: entry.to,
      departure: entry.stop.departure,
      delay: entry.stop.delay,
      platform: entry.stop.platform,
    })),
  };
}

export default { tools, callTool } satisfies McpToolExport;
