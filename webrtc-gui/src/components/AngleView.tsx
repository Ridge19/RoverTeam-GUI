import React, { memo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

interface AngleViewProps {
  axis?: "" | "p" | "r" | "y";
  label?: string;
  size?: number;
  imageUrl?: string; // optional image to display in center
}

const AngleView = memo(({
  axis = "",
  label = "ANGLE",
  size = 200,
  imageUrl,
}: AngleViewProps) => {
  // Telemetry Access
  const { roverStatus } = useTelemetryContext();
  const imuData = roverStatus.find((s) => s.data.imu_data)?.data;

  let angle = -1
  if (axis != "" && imuData) { 
    angle = imuData.imu_data.gyro[axis]
  }
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const color = "#00ff88"; // bright green for visibility

  return (
    <div
      style={{
        background: "#222",
        marginLeft: 20,
        marginRight: -20,
        borderRadius: 10,
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <svg width={size} height={size}>
        {/* circle */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color + "88"}
          strokeWidth={0.5}
          fill="none"
        />

        {/* center: image or small circle */}
        {imageUrl ? (
          <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
            <image
              href={imageUrl}
              x={-r} // center image
              y={-r}
              width={r * 2}
              height={r * 2}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        ) : (
          <circle cx={cx} cy={cy} r={2} fill={color} />
        )}
      </svg>

      {/* label */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: 14,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>

      {/* number */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 14,
          fontWeight: "bold",
        }}
      >
        {angle != -1 ? angle.toFixed(1) + "°" : "No Data"}
      </div>
    </div>
  );
})

export default AngleView