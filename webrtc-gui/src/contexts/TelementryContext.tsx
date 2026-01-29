// TelemetryContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useRoverUrl, URLType } from "@/hooks/useRoverUrl";

interface TelemetryContextValue {
  status: "idle" | "connecting" | "connected" | "error";
  messages: any[];
  reconnect: () => void;
  disconnect: () => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const MAX_MESSAGES = 150

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [messages, setMessages] = useState<any[]>([]);
  const serverUrl = useRoverUrl(URLType.TELEMETRY);
  const reconnectInterval = 3000; // default

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    dcRef.current = null;
    setStatus("idle");
  }, []);

  const connect = useCallback(async () => {
    if (pcRef.current) return; // already connecting/connected
    setStatus("connecting");

    const pc = new RTCPeerConnection({ iceServers: [] });
    pcRef.current = pc;

    // Create a data channel for telemetry
    const dc = pc.createDataChannel("telemetry");
    dcRef.current = dc;

    dc.onopen = () => setStatus("connected");
    dc.onmessage = (ev) => {

    const newMessage = ev.data

    setMessages(prev => {
        if(newMessage === "CLEARSCREEN") return [];
        const newMessages = [...prev, newMessage];
        if (newMessages.length > MAX_MESSAGES) newMessages.shift(); // remove oldest
        return newMessages;
    });

    };

    pc.onconnectionstatechange = () => {
      if (!pcRef.current) return;

      switch (pc.connectionState) {
        case "connected":
          setStatus("connected");
          break;
        case "failed":
        case "disconnected":
        case "closed":
          setStatus("error");
          disconnect();

          // reconnect after interval
          if (!reconnectTimer.current) {
            reconnectTimer.current = setTimeout(() => {
              reconnectTimer.current = null;
              connect();
            }, reconnectInterval);
          }
          break;
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      let resp;
      try {
        resp = await fetch(`${serverUrl}/offer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
        });
      } catch (err) {
        console.warn("Telemetry server unreachable, will retry:", err);
        setStatus("error");
        disconnect();
        reconnectTimer.current = setTimeout(() => connect(), reconnectInterval);
        return;
      }

      const answerData = await resp.json();
      await pc.setRemoteDescription(answerData);
    } catch (err) {
      console.error("Telemetry RTC connection failed:", err);
      setStatus("error");
      disconnect();
      reconnectTimer.current = setTimeout(() => connect(), reconnectInterval);
    }
  }, [serverUrl, disconnect]);

  // Auto-connect once, persists across page navigation
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <TelemetryContext.Provider value={{ status, messages, reconnect: connect, disconnect }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetryContext = (): TelemetryContextValue => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetryContext must be used inside TelemetryProvider");
  return ctx;
};
