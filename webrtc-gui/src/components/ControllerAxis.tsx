import React, { useEffect, useState, CSSProperties } from "react";
import { useGamepad, GamepadInput } from "@/hooks/useGamepad";

interface ControllerAxisProps {
  axisLabel: GamepadInput;
  gamepadIndex?: number;
  style?: CSSProperties;
  label?: string;
}

export const ControllerAxis: React.FC<ControllerAxisProps> = ({
  axisLabel,
  gamepadIndex,
  style = {},
  label
}) => {
  const { getInput, getCurrentIndex } = useGamepad();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const updateAxis = () => {
      const idx = gamepadIndex ?? getCurrentIndex();
      if (idx !== null) {
        const value = getInput(axisLabel, idx);
        if (typeof value === "object" && value !== null && "x" in value && "y" in value) {
          setPosition({ x: value.x * 20, y: value.y * 20 });
        } else {
          setPosition({ x: 0, y: 0 });
        }
      } else {
        setPosition({ x: 0, y: 0 });
      }

      animationFrameId = requestAnimationFrame(updateAxis);
    };

    updateAxis();

    return () => cancelAnimationFrame(animationFrameId);
  }, [axisLabel, gamepadIndex, getInput, getCurrentIndex]);

  const outerStyle: CSSProperties = {
    width: 90,
    height: 90,
    borderRadius: "50%",
    border: "2px solid #555",
    backgroundColor: "#222",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  return (
    <div style={outerStyle}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          borderBottom: `#444 solid ${(-position.y + 20) * 0.15}px`,
          borderRight: `#444 solid ${(-position.x + 20) * 0.15}px`,
          borderTop: `#666 solid ${(position.y + 20) * 0.15}px`,
          borderLeft: `#666 solid ${(position.x + 20) * 0.15}px`,
          backgroundColor: "#555",
          position: "absolute",
          transform: `translate(${position.x * 0.5}%, ${position.y * 0.5}%)`,
          transition: "transform 0.05s",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#CCC",
          fontWeight: "bold"
        }}
      >{label ?? ""}</div>
    </div>
  );
};