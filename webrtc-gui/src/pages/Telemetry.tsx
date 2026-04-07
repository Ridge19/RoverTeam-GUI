import React, { useEffect, useRef, useState } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import StatusChip, { StatusColor } from "@/components/StatusChip";

const HEADER_HEIGHT = 110;
const INPUT_HEIGHT = 50;

const TelemetryConsole: React.FC = () => {
  const { messages, currentEndpoint, setCurrentEndpoint, send, getStatus } =
    useTelemetryContext();

  const [input, setInput] = useState("");
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [fade, setFade] = useState(false);
  const [deferredEndpoint, setDeferredEndpoint] = useState<string | null>(currentEndpoint);

  // Auto-scroll toggle
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  const prevEndpointRef = useRef<string | null>(currentEndpoint);
  useEffect(() => {
    if (prevEndpointRef.current !== null && prevEndpointRef.current !== currentEndpoint) {
      // Trigger fade
      setFade(true);

      const timeout = setTimeout(() => {
        setFade(false);
      }, 150); // duration of fade out, you can adjust

      return () => clearTimeout(timeout);
    }
    prevEndpointRef.current = currentEndpoint;
  }, [currentEndpoint]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (autoScroll) consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentEndpoint, autoScroll]);

  // Disable auto-scroll if user scrolls manually
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;

    const onScroll = () => {
      const isAtBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 20;
      setAutoScroll(isAtBottom);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleSend = () => {
    if (!input.trim() || !currentEndpoint) return;
    const success = send(currentEndpoint, input.trim());
    if (success) {
      setInput("");
      setAutoScroll(true); // re-enable auto-scroll on send
    }
  };

  const handleTabClick = (endpoint: string) => {
    if (endpoint === currentEndpoint) return;

    // Start fade out
    setFade(true);

    // After fade duration, switch tab and fade in
    setTimeout(() => {
      setDeferredEndpoint(endpoint);
      setFade(false);
      setCurrentEndpoint(endpoint);
    }, 150); // match your CSS transition duration
  };

  const statusMap: Record<string, StatusColor> = {
    idle: "disabled",
    connecting: "warning",
    connected: "success",
    error: "error",
  };

  const currentMessages = deferredEndpoint
    ? messages.find((m) => m.endpoint === deferredEndpoint)?.data ?? []
    : [];

  const canSend =
    currentEndpoint && getStatus(currentEndpoint) === "connected";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        background: "#1e1e1e",
        color: "#eee",
        fontFamily: "monospace",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {messages.length === 0 ? <div style={styles.savedOverlay}>No available telemetry services</div> : <>
      {/* Tabs + Auto-Scroll Checkbox */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: -2,
          flexWrap: "wrap",
        }}
      >
        {messages.map((m) => {
          const epStatus = getStatus(m.endpoint);
          return (
            <button
              key={m.endpoint}
              onClick={() => handleTabClick(m.endpoint)}
              style={{
                padding: "6px 12px",
                borderRadius: 16,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                border:
                  deferredEndpoint === m.endpoint
                    ? "2px solid transparent"
                    : "2px solid #eee",
                background:
                  deferredEndpoint === m.endpoint ? "#eee" : "#111",
                color: deferredEndpoint === m.endpoint ? "#111" : "#eee",
                cursor: "pointer",
                fontFamily: "monospace",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    epStatus === "connected"
                      ? "#26cb4fff"
                      : epStatus === "connecting"
                      ? "#ffcc66"
                      : epStatus === "error"
                      ? "#ff5555"
                      : "#555",
                }}
              />
              {m.endpoint}
            </button>
          );
        })}

        {/* Auto-Scroll Checkbox */}
        <label
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
      </div>

      {/* Console */}
      <div
        ref={consoleRef}
        style={{
          flexGrow: 1,
          height: `calc(100% - ${INPUT_HEIGHT}px)`,
          background: "#111",
          padding: 10,
          borderRadius: 6,
          borderBottomLeftRadius: 16,
          borderTopLeftRadius: 0,
          border: "#eee 2px solid",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 16,
          lineHeight: "16px",
          transition: "opacity 0.15s ease-in-out",
          opacity: fade ? 0 : 1, // fade to black then back
        }}
      >
        <style>
          {`
            /* Chrome, Edge, Safari */
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background-color: #888;
              border-radius: 14px;
              border: none;
            }
            div::-webkit-scrollbar-button {
              display: none;
            }
          `}
        </style>

        {currentMessages.map((msg, idx) => {
          const [levelRaw, ...rest] = msg.split(" ");
          const level = levelRaw.toUpperCase();
          const text = rest.join(" ");

          return (
            <div
              key={idx}
              style={{
                color:
                  level === "ERROR" || level === "CRITICAL"
                    ? "#ff5555"
                    : level === "WARNING"
                    ? "#ffcc66"
                    : level === "DEBUG"
                    ? "#999"
                    : level === "SUCCESS"
                    ? "#26cb4fff"
                    : "#eee",
              }}
            >
              {text}
            </div>
          );
        })}
        <div ref={consoleEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 12,
          height: INPUT_HEIGHT - 12,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          disabled={!canSend}
          placeholder={canSend ? "Type command…" : "Not connected"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          style={{
            flexGrow: 1,
            background: "#000",
            color: "#eee",
            border: "1px solid #333",
            borderRadius: 4,
            padding: "8px 10px",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            background: canSend ? "#333" : "#222",
            color: "#eee",
            border: "1px solid #444",
            borderRadius: 4,
            padding: "8px 14px",
            cursor: canSend ? "pointer" : "not-allowed",
            fontFamily: "monospace",
          }}
        >
          Send
        </button>
      </div></>}
    </div>
  );
};

const styles = {savedOverlay: {
  position: "absolute" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  color: "#fff",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  zIndex: 20,
  pointerEvents: "none" as const
}}

export default TelemetryConsole;