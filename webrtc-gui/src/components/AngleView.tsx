import React, { memo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

interface AngleViewProps {
  angle?: number;
  label?: string;
  size?: number;
  imageUrl?: string; // optional image to display in center
  hasData?: boolean; // whether to show data or just the circle
  simulated?: boolean; // whether this is simulated data (for styling)
}

const AngleView = memo(({
  angle = 0,
  label = "ANGLE",
  size = 200,
  imageUrl,
  hasData = true,
  simulated = false,
}: AngleViewProps) => {
  // Telemetry Access

  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const color = "#00ff88"; // bright green for visibility
  const colorNoData = "#e44141"; // gray when no data
  const colorSimulated = "#ffb700"; // orange for simulated data

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
          stroke={(hasData ? simulated ? colorSimulated : color : colorNoData) + "88"}
          strokeWidth={0.5}
          fill="none"
        />

        {/* center: image or small circle */}
        {imageUrl && hasData ? (
          <><g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
            <image
              href={imageUrl}
              x={-r} // center image
              y={-r}
              width={r*2}
              height={r*2}
              preserveAspectRatio="xMidYMid meet"
              style={{filter: "hue-rotate(-109deg) opacity(0.5)"}}
            />
          </g>
          {simulated && (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              fill={colorSimulated}
              fontSize={16}
              fontWeight="bold"
            >
              SIMULATED
            </text>
          )}</>
        ) : (
          /*text saying NO DATA*/
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colorNoData}
            fontSize={24}
            fontWeight="bold"
          >
            NO DATA
          </text>
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
      {hasData &&
      (<div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 14,
          fontWeight: "bold",
        }}
      >
        {angle.toFixed(1)}°
      </div>)}
    </div>
  );
})

export default AngleView