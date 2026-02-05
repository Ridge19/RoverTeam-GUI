import React, { useEffect, useState, CSSProperties } from "react";
import { useGamepad } from "@/contexts/GamepadContext";

interface AxisTooltipProps {
  xAxisIndex: number;       // index of horizontal axis
  yAxisIndex: number;       // index of vertical axis
  size?: number;            // outer circle size
  style?: CSSProperties;    // optional custom styles
}

export const AxisTooltip: React.FC<AxisTooltipProps> = ({
  xAxisIndex,
  yAxisIndex,
  size = 90,
  style = {},
}) => {
  const { axes } = useGamepad();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrame: number;

    const update = () => {
      const xValue = axes[xAxisIndex] ?? 0; // -1 to 1
      const yValue = axes[yAxisIndex] ?? 0; // -1 to 1

      // Scale to pixels for visual movement
      setPosition({ x: xValue * 20, y: yValue * 20 });

      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [xAxisIndex, yAxisIndex, axes]);

  const outerStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "2px solid #444",
    backgroundColor: "#444",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  const innerStyle: CSSProperties = {
    width: size - 10,
    height: size - 10,
    borderRadius: "50%",
    borderBottom: `#1A1A1A solid ${(-position.y + 20) * 0.15}px`,
    borderLeft: `#1A1A1A solid ${(-position.x + 20) * 0.15}px`,
    borderTop: `#555 solid ${(position.y + 20) * 0.15}px`,
    borderRight: `#555 solid ${(position.x + 20) * 0.15}px`,
    backgroundColor: "#222",
    position: "absolute",
    transform: `translate(${position.x * 0.5}%, ${position.y * 0.5}%)`,
    transition: "transform 0.05s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  };

  return (
    <div style={outerStyle}>
      <div style={innerStyle}></div>
    </div>
  );
};