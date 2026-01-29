import React, { useEffect, useRef } from "react";
import { useTelemetryContext } from "@/contexts/TelementryContext";
import StatusChip, { StatusColor } from "@/components/StatusChip";

const TelemetryConsole: React.FC = () => {
  const { status, messages } = useTelemetryContext();
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const statusMap:Record<string, StatusColor> = {
    "idle": "disabled",
    "connecting": "warning",
    "connected": "success",
    "error": "error"
  }

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

      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        marginBottom: 20,
        gap: 20
      }}>
        <h2>Telemetry Console</h2>
        <StatusChip color={statusMap[status]} label={status}/>
      </div>

      <div
        style={{
          flexGrow: 1,
          background: "#111",
          padding: 10,
          borderRadius: 6,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 14,
        }}
      >
        {messages.map((msg, idx) => {
            // msg.msg is a string like "INFO hello world"
            const [levelRaw, ...rest] = msg.split(" ");
            const level = levelRaw.toUpperCase(); // normalize
            const text = rest.join(" ");

            return (
                <div
                key={idx}
                style={{
                    color:
                    level === "ERROR"
                        ? "#ff5555"
                        : level === "WARNING"
                        ? "#ffcc66"
                        : level === "DEBUG"
                        ? "#999"
                        : level === "CRITICAL"
                        ? "#ff5555"
                        : "#eee",
                }}
                >
                {text}
                </div>
            );
        })}

        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default TelemetryConsole;
