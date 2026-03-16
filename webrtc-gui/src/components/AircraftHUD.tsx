import React, { memo, useRef, useEffect, useState } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

interface AircraftHUDProps {
  verticalFOV?: number; // degrees of vertical field of view
}

export const AircraftHUD: React.FC<AircraftHUDProps> = memo(({
  verticalFOV = 60,
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { roverStatus } = useTelemetryContext();
  const imuData = roverStatus.find((s) => s.data.imu_data)?.data;

  if (!imuData) return;

  const pitch: number = -imuData.imu_data.gyro.p; // degrees, positive = nose up
  const roll: number = -imuData.imu_data.gyro.r; // degrees, positive = right wing down

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const { width, height } = size;
  const cx = width / 2;
  const cy = height / 2;

  const crosshairRadius = 8;
  const crosshairLineLength = 20;

  const color = "#00ff88"; // bright green for visibility

  // vertical offset in pixels based on pitch and verticalFOV
  const pitchOffset = (pitch / verticalFOV) * height;

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {width > 0 && height > 0 && (
        <svg width={width} height={height} style={{ display: "block" }}>
          {/* horizon line with black border */}
          <g
            transform={`translate(${cx}, ${cy - pitchOffset}) rotate(${roll})`}
          >
            {/* green line on top */}
            <line
              x1={-width * 2}
              y1={0}
              x2={width * 2}
              y2={0}
              stroke={color}
              strokeWidth={2}
            />
          </g>

          {/* center crosshair */}
          <g>
            {/* center circle */}
            <circle
              cx={cx}
              cy={cy}
              r={crosshairRadius}
              stroke={color}
              strokeWidth={2}
              fill="none"
            />
            <circle
              cx={cx}
              cy={cy}
              r={crosshairRadius * 0.2}
              fill={color}
              strokeWidth={2}
            />
            {/* left horizontal line */}
            <line
              x1={cx - crosshairRadius - crosshairLineLength}
              y1={cy}
              x2={cx - crosshairRadius}
              y2={cy}
              stroke={color}
              strokeWidth={2}
            />
            {/* right horizontal line */}
            <line
              x1={cx + crosshairRadius}
              y1={cy}
              x2={cx + crosshairRadius + crosshairLineLength}
              y2={cy}
              stroke={color}
              strokeWidth={2}
            />
          </g>
        </svg>
      )}
    </div>
  );
});