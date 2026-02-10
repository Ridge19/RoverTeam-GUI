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

  // Auto-scroll toggle
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

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

  const statusMap: Record<string, StatusColor> = {
    idle: "disabled",
    connecting: "warning",
    connected: "success",
    error: "error",
  };

  const currentMessages = currentEndpoint
    ? messages.find((m) => m.endpoint === currentEndpoint)?.data ?? []
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
              onClick={() => setCurrentEndpoint(m.endpoint)}
              style={{
                padding: "6px 12px",
                borderRadius: 16,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                border:
                  currentEndpoint === m.endpoint
                    ? "2px solid transparent"
                    : "2px solid #eee",
                background:
                  currentEndpoint === m.endpoint ? "#eee" : "#111",
                color: currentEndpoint === m.endpoint ? "#111" : "#eee",
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
      </div>
    </div>
  );
};

export default TelemetryConsole;