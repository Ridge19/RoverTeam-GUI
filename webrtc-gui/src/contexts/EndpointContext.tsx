import React, { createContext, useContext, useEffect, useRef, useState } from "react";

/* ================= CONFIG ================= */

export type PortStatus = "online" | "offline" | "loading";

export interface PortConfig {
  port: number;
}

export interface EndpointConfig {
  name: string;
  host: string;
  priority: number;
  ports: PortConfig[];
}

export const ENDPOINTS: EndpointConfig[] = [
  {
    name: "Rover",
    host: "http://rover.local",
    priority: 1,
    ports: [
      { port: 3001 },
      { port: 3002 },
    ],
  },
  {
    name: "Localhost",
    host: "http://localhost",
    priority: 2,
    ports: [
      { port: 3001 },
      { port: 3002 },
      { port: 3003 },
      { port: 3004 },
    ],
  },
];

const TIMEOUT_MS = 1000;
const POLL_INTERVAL = 10_000;

/* ================= TYPES ================= */

export interface PortState extends PortConfig {
  status: PortStatus;
  service?: string;
}

export interface EndpointState {
  name: string;
  host: string;
  priority: number;
  ports: PortState[];
}

export type EndpointEvent =
  | { type: "auto-connected"; endpoint: EndpointState }
  | { type: "endpoint-available"; endpoint: EndpointState };

interface EndpointContextType {
  endpoints: EndpointState[];
  selected: EndpointState[];
  onEvent: (handler: (e: EndpointEvent) => void) => () => void;
}

const EndpointContext = createContext<EndpointContextType | null>(null);

export const useEndpoints = () => {
  const ctx = useContext(EndpointContext);
  if (!ctx) throw new Error("useEndpoints must be used in provider");
  return ctx;
};

/* ================= UTILS ================= */

async function ping(url: string): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url + "/ping", { signal: ctrl.signal });
    if (res.status === 200) {
      return res.text();
    } else {
      return "offline";
    }
  } catch {
    return "offline";
  } finally {
    clearTimeout(id);
  }
}

/* ================= PROVIDER ================= */

export function EndpointProvider({ children }: { children: React.ReactNode }) {
  const [endpoints, setEndpoints] = useState<EndpointState[]>([]);
  const [selected, setSelected] = useState<EndpointState[]>([]);

  const handlers = useRef<((e: EndpointEvent) => void)[]>([]);

  const emit = (e: EndpointEvent) => handlers.current.forEach(h => h(e));

  const onEvent = (handler: (e: EndpointEvent) => void) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter(h => h !== handler);
    };
  };

  async function scan() {
    const sorted = [...ENDPOINTS].sort((a, b) => a.priority - b.priority);

    const results: EndpointState[] = [];

    for (const ep of sorted) {
      const ports: PortState[] = await Promise.all(
        ep.ports.map(async p => {
          const service = await ping(`${ep.host}:${p.port}`);
          return {
            ...p,
            status: service !== "offline" ? "online" : "offline",
            service: service !== "offline" ? service : undefined,
          };
        })
      );

      results.push({
        name: ep.name,
        host: ep.host,
        priority: ep.priority,
        ports,
      });
    }

    setEndpoints(prev => {
      results.forEach(r => {
        const old = prev.find(p => p.host === r.host);
        if (!old && r.ports.some(p => p.status === "online")) {
          emit({ type: "endpoint-available", endpoint: r });
          emit({ type: "auto-connected", endpoint: r });
        }
      });
      return results;
    });

    // Automatically select all online endpoints
    const available = results.filter(e => e.ports.some(p => p.status === "online"));
    setSelected(available);
  }

  useEffect(() => {
    scan();
    const id = setInterval(scan, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <EndpointContext.Provider
      value={{ endpoints, selected, onEvent }}
    >
      {children}
    </EndpointContext.Provider>
  );
}