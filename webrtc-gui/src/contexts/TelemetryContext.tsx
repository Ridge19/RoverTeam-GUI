// TelemetryContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useEndpoints } from "@/contexts/EndpointContext";

interface EndpointMessages {
  endpoint: string;
  data: any[];
}

interface EndpointStatus {
  endpoint: string;
  data: Record<string, any>;
}

interface TelemetryContextValue {
  getStatus: (endpoint: string | undefined | null) => "idle" | "connecting" | "connected" | "error";
  messages: EndpointMessages[];
  roverStatus: EndpointStatus[];
  currentEndpoint: string | null;
  setCurrentEndpoint: (endpoint: string) => void;
  send: (endpoint: string, msg: string | object) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const MAX_MESSAGES = 150;
const RECONNECT_INTERVAL = 3000;
const MAX_RETRIES = 5;

// -------------------------
// Helper to sanitize host for file name
// -------------------------
function getLogFileName(endpoint: string) {
  try {
    const url = new URL(endpoint);
    const host = url.hostname;
    return `telemetry-${host.replace(/\./g, "-")}`;
  } catch {
    // fallback for raw IP / malformed URL
    return `telemetry-${endpoint.replace(/[:\/.]/g, "-")}`;
  }
}

// -------------------------
// Helper to log via API
// -------------------------
async function logToApi(endpoint: string, msg: string) {
  const file = getLogFileName(endpoint);
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, log: msg }),
    });
  } catch (err) {
    console.warn("Failed to log to API:", err);
  }
}

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getEndpointsOfService, onEvent } = useEndpoints();

  const wsMap = useRef<Map<string, WebSocket>>(new Map());
  const reconnectTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const retryCount = useRef<Map<string, number>>(new Map());

  const [endpointStatus, setEndpointStatus] = useState<Record<string, "idle" | "connecting" | "connected" | "error">>({});
  const [messages, setMessages] = useState<EndpointMessages[]>([]);
  const [roverStatus, setRoverStatus] = useState<EndpointStatus[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [hiddenEndpoints, setHiddenEndpoints] = useState<Set<string>>(new Set());

  // -------------------------
  // HELPERS
  // -------------------------
  const ensureBuckets = useCallback((endpoint: string) => {
    setMessages(prev =>
      prev.some(e => e.endpoint === endpoint) ? prev : [...prev, { endpoint, data: [] }]
    );
    setRoverStatus(prev =>
      prev.some(e => e.endpoint === endpoint) ? prev : [...prev, { endpoint, data: {} }]
    );
    setEndpointStatus(prev => ({ ...prev, [endpoint]: prev[endpoint] || "idle" }));
  }, []);

  const updateMessages = useCallback((endpoint: string, updater: (arr: any[]) => any[]) => {
    setMessages(prev =>
      prev.map(e => (e.endpoint === endpoint ? { ...e, data: updater(e.data) } : e))
    );
  }, []);

  const updateRoverStatus = useCallback((endpoint: string, type: string, payload: any) => {
    setRoverStatus(prev =>
      prev.map(e =>
        e.endpoint === endpoint ? { ...e, data: { ...e.data, [type]: payload } } : e
      )
    );
  }, []);

  // -------------------------
  // DISCONNECT
  // -------------------------
  const disconnect = useCallback(() => {
    reconnectTimers.current.forEach(clearTimeout);
    reconnectTimers.current.clear();
    wsMap.current.forEach(ws => ws.close());
    wsMap.current.clear();
    retryCount.current.clear();
    setMessages([]);
    setRoverStatus([]);
    setCurrentEndpoint(null);
    setEndpointStatus({});
    setHiddenEndpoints(new Set());
  }, []);

  // -------------------------
  // CONNECT & RECONNECT
  // -------------------------
  const scheduleReconnect = useCallback((endpoint: string) => {
    if (reconnectTimers.current.has(endpoint)) return;

    const t = setTimeout(() => {
      reconnectTimers.current.delete(endpoint);
      connectEndpoint(endpoint);
    }, RECONNECT_INTERVAL);

    reconnectTimers.current.set(endpoint, t);
  }, []);

  const connectEndpoint = useCallback((endpoint: string) => {
    ensureBuckets(endpoint);

    const existingWS = wsMap.current.get(endpoint);
    if (existingWS) {
      if (existingWS.readyState === WebSocket.OPEN) {
        setEndpointStatus(prev => ({ ...prev, [endpoint]: "connected" }));
        return;
      }
      if (existingWS.readyState === WebSocket.CONNECTING) return;
    }

    setEndpointStatus(prev => ({ ...prev, [endpoint]: "connecting" }));

    let ws: WebSocket;
    try {
      ws = new WebSocket(`${endpoint}/ws`);
    } catch (err) {
      console.warn("Telemetry WS create failed:", endpoint, err);
      setEndpointStatus(prev => ({ ...prev, [endpoint]: "error" }));
      scheduleReconnect(endpoint);
      return;
    }

    wsMap.current.set(endpoint, ws);

    ws.onopen = () => {
      setEndpointStatus(prev => ({ ...prev, [endpoint]: "connected" }));
      retryCount.current.set(endpoint, 0);
      setHiddenEndpoints(prev => {
        const copy = new Set(prev);
        copy.delete(endpoint);
        return copy;
      });
      logToApi(endpoint, "WebSocket connected");
    };

    ws.onmessage = ev => {
      const data = ev.data;
      if (typeof data !== "string") return;

      // log all messages
      logToApi(endpoint, `[RECV] ${data}`);

      if (data.startsWith("JSON ")) {
        try {
          const msg = JSON.parse(data.slice(5));
          const { type, data: payload } = msg;
          updateRoverStatus(endpoint, type, payload);
        } catch (err) {
          console.warn("Bad JSON telemetry:", endpoint, err);
        }
        return;
      }

      updateMessages(endpoint, prev => {
        if (data === "CLEARSCREEN") return [];
        const next = [...prev, data];
        if (next.length > MAX_MESSAGES) next.shift();
        return next;
      });
    };

    ws.onerror = err => {
      console.warn("Telemetry WS error:", endpoint, err);
      setEndpointStatus(prev => ({ ...prev, [endpoint]: "error" }));
      logToApi(endpoint, `[ERROR] ${err}`);
    };

    ws.onclose = () => {
      wsMap.current.delete(endpoint);
      setEndpointStatus(prev => ({ ...prev, [endpoint]: "error" }));

      const prevRetry = retryCount.current.get(endpoint) ?? 0;
      retryCount.current.set(endpoint, prevRetry + 1);

      // Hide tab if exceeded retries
      if (prevRetry + 1 >= MAX_RETRIES) {
        setHiddenEndpoints(prev => new Set(prev).add(endpoint));
      }

      logToApi(endpoint, "WebSocket closed");

      scheduleReconnect(endpoint);
    };
  }, [ensureBuckets, scheduleReconnect, updateMessages, updateRoverStatus]);

  // -------------------------
  // SCAN & CONNECT ALL ENDPOINTS
  // -------------------------
  const scanTelemetryEndpoints = useCallback(() => {
    const endpoints = getEndpointsOfService("telemetry");
    endpoints.forEach(connectEndpoint);
  }, [getEndpointsOfService, connectEndpoint]);

  useEffect(() => {
    scanTelemetryEndpoints();
    const unsubscribe = onEvent((e: any) => {
      if (e.type === "endpoint-available") scanTelemetryEndpoints();
    });
    return () => unsubscribe?.();
  }, [onEvent, scanTelemetryEndpoints]);

  // -------------------------
  // AUTO MANAGE CURRENT TAB
  // -------------------------
  useEffect(() => {
    const visibleEndpoints = messages
      .map(m => m.endpoint)
      .filter(ep => !hiddenEndpoints.has(ep));
    if (!visibleEndpoints.length) return setCurrentEndpoint(null);
    if (currentEndpoint && visibleEndpoints.includes(currentEndpoint)) return;
    setCurrentEndpoint(visibleEndpoints[0]);
  }, [messages, currentEndpoint, hiddenEndpoints]);

  // -------------------------
  // SEND
  // -------------------------
  const send = useCallback((endpoint: string, msg: string | object) => {
    const ws = wsMap.current.get(endpoint);
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    try {
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
      ws.send(payload);
      logToApi(endpoint, `[SEND] ${payload}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  // -------------------------
  // GET STATUS
  // -------------------------
  const getStatus = useCallback(
    (endpoint?: string | null) => {
      if (!endpoint) return "idle";
      return endpointStatus[endpoint] ?? "idle";
    },
    [endpointStatus]
  );

  return (
    <TelemetryContext.Provider
      value={{
        getStatus,
        messages: messages.filter(m => !hiddenEndpoints.has(m.endpoint)),
        roverStatus,
        currentEndpoint,
        setCurrentEndpoint,
        send,
        reconnect: scanTelemetryEndpoints,
        disconnect,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetryContext = (): TelemetryContextValue => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetryContext must be used inside TelemetryProvider");
  return ctx;
};