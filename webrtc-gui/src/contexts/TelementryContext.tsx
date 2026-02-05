// TelemetryContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useRoverUrl, URLType } from "@/hooks/useRoverUrl";

interface TelemetryContextValue {
  status: "idle" | "connecting" | "connected" | "error";
  messages: any[];
  roverStatus: Record<string, any>;
  send: (msg: string | object) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const MAX_MESSAGES = 150;
const RECONNECT_INTERVAL = 3000;

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

  const [messages, setMessages] = useState<any[]>([]);
  const [roverStatus, setRoverStatus] = useState<Record<string, any>>({});

  const serverUrl = useRoverUrl(URLType.TELEMETRY);

  // -------------------------
  // CLEAN DISCONNECT
  // -------------------------
  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("idle");
  }, []);

  // -------------------------
  // CONNECT
  // -------------------------
  const connect = useCallback(() => {
    if (wsRef.current) return;

    setStatus("connecting");

    let ws: WebSocket;
    try {
      ws = new WebSocket(`${serverUrl}/ws`);
    } catch (err) {
      console.warn("Telemetry WS creation failed:", err);
      setStatus("error");
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (ev) => {
      const data = ev.data;

      if (typeof data !== "string") return;

      // JSON envelope
      if (data.startsWith("JSON ")) {
        try {
          const msg = JSON.parse(data.slice(5));
          const { type, data: payload } = msg;

          setRoverStatus((prev) => ({
            ...prev,
            [type]: payload,
          }));
        } catch (err) {
          console.warn("Bad JSON telemetry:", err);
        }
        return;
      }

      // Console-style messages
      setMessages((prev) => {
        if (data === "CLEARSCREEN") return [];

        const next = [...prev, data];
        if (next.length > MAX_MESSAGES) next.shift();
        return next;
      });
    };

    ws.onerror = (err) => {
      console.warn("Telemetry WS error:", err);
      setStatus("error");
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus("error");
      scheduleReconnect();
    };
  }, [serverUrl]);

  // -------------------------
  // RECONNECT HANDLER
  // -------------------------
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) return;

    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null;
      connect();
    }, RECONNECT_INTERVAL);
  }, [connect]);

  // -------------------------
  // SEND
  // -------------------------
  const send = useCallback((msg: string | object): boolean => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("Telemetry send failed: socket not open");
      return false;
    }

    try {
      const payload =
        typeof msg === "string" ? msg : JSON.stringify(msg);
      ws.send(payload);
      return true;
    } catch (err) {
      console.error("Telemetry send error:", err);
      return false;
    }
  }, []);

  // -------------------------
  // AUTO-CONNECT
  // -------------------------
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <TelemetryContext.Provider
      value={{
        status,
        messages,
        roverStatus,
        send,
        reconnect: connect,
        disconnect,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetryContext = (): TelemetryContextValue => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error(
      "useTelemetryContext must be used inside TelemetryProvider"
    );
  }
  return ctx;
};