import React from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

const SystemVitals: React.FC = () => {
  const { roverStatus } = useTelemetryContext();

  if (!roverStatus || roverStatus.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#eee",
          fontFamily: "sans-serif",
          background: "#121212",
          fontSize: 18,
        }}
      >
        No vitals available
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: 220,
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    marginBottom: 10,
    color: "#aaa",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    color: "#fff",
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "sans-serif",
        background: "#121212",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>System Vitals</h2>

      {roverStatus.map((r) => {
        const vitals = r.data.vitals;
        if (!vitals) return null;

        const cpu = vitals.cpu;
        const memory = vitals.memory;

        return (
          <div
            key={r.endpoint}
            style={{
              marginBottom: 40,
              borderBottom: "1px solid #333",
              paddingBottom: 20,
            }}
          >
            <h3 style={{ marginBottom: 15 }}>{r.endpoint}</h3>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {/* CPU Card */}
              <div style={cardStyle}>
                <div style={titleStyle}>CPU Usage</div>
                <div style={valueStyle}>{cpu.usage_percent.toFixed(1)}%</div>
                <div style={{ marginTop: 10, color: "#ccc", fontSize: 14 }}>
                  {cpu.cores_logical} logical / {cpu.cores_physical} physical cores
                </div>
                <div style={{ color: "#ccc", fontSize: 14 }}>
                  Frequency: {cpu.freq_mhz.toFixed(0)} MHz
                </div>
              </div>

              {/* Memory Card */}
              <div style={cardStyle}>
                <div style={titleStyle}>Memory</div>
                <div style={valueStyle}>{memory.percent.toFixed(1)}%</div>
                <div style={{ marginTop: 10, color: "#ccc", fontSize: 14 }}>
                  Used: {memory.used_mb.toLocaleString()} MB
                </div>
                <div style={{ color: "#ccc", fontSize: 14 }}>
                  Available: {memory.available_mb.toLocaleString()} MB
                </div>
                <div style={{ color: "#ccc", fontSize: 14 }}>
                  Total: {memory.total_mb.toLocaleString()} MB
                </div>
              </div>

              {/* Timestamp Card */}
              <div style={cardStyle}>
                <div style={titleStyle}>Last Update</div>
                <div style={valueStyle}>
                  {new Date(vitals.timestamp * 1000).toLocaleTimeString()}
                </div>
                <div style={{ color: "#ccc", fontSize: 14 }}>
                  {new Date(vitals.timestamp * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SystemVitals;