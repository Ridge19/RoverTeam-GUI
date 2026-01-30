import React, { useEffect, useRef, useState } from "react";
import { useTelemetryContext } from "@/contexts/TelementryContext";
import StatusChip, { StatusColor } from "@/components/StatusChip";

const TelemetryConsole: React.FC = () => {
  const { status, messages, send } = useTelemetryContext();
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const statusMap: Record<string, StatusColor> = {
    idle: "disabled",
    connecting: "warning",
    connected: "success",
    error: "error",
  };

  const canSend = status === "connected";

  const handleSend = () => {
    if (!input.trim() || !canSend) return;

    send(input.trim());
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 110px)",
        background: "#1e1e1e",
        color: "#eee",
        fontFamily: "monospace",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          gap: 20,
        }}
      >
        <h2>Telemetry Console</h2>
        <StatusChip color={statusMap[status]} label={status} />
      </div>

      {/* Console */}
      <div
        style={{
          flexGrow: 1,
          background: "#111",
          padding: 10,
          borderRadius: 6,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 16,
          lineHeight: "16px"
        }}
      >
        {messages.map((msg, idx) => {
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
        }}
      >
        <input
          ref={inputRef}
          value={input}
          disabled={!canSend}
          placeholder={
            canSend ? "Type command…" : "Not connected"
          }
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