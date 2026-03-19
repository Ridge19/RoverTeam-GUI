import React from "react";
import { useGamepad, useButtonPress } from "@/contexts/HardwareControl/useGamepad";

const ROOT = "inputprompts"

// Icon images per gamepad type
const ICONS: Record<string, Record<string, string>> = {
  ps: {
    0: "/ps/playstation_stick_l_horizontal.png",
    1: "/ps/playstation_stick_l_vertical.png",
    2: "/ps/playstation_stick_r_horizontal.png",
    3: "/ps/playstation_stick_r_vertical.png",
  },
  xbox: {
    0: "/xbox/xbox_stick_l_horizontal.png",
    1: "/xbox/xbox_stick_l_vertical.png",
    2: "/xbox/xbox_stick_r_horizontal.png",
    3: "/xbox/xbox_stick_r_vertical.png",
  },
  other: {},
};

interface ButtonTooltipProps {
  axisIndex: number;
  size?: number; // in pixels
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const AxisFunction: React.FC<ButtonTooltipProps> = ({
  axisIndex,
  size = 48,
  style,
  disabled = false
}) => {
  const { gamepadType, axes } = useGamepad();

  if (gamepadType === "none") return null;

  const pressed = disabled?1:(Math.abs(axes[axisIndex]) ?? 0);
  const icon = `${ROOT}/${ICONS[gamepadType]?.[axisIndex]}`;

  if (!icon) return null;

  return (
    <img
      src={icon}
      alt={`button-${axisIndex}`}
      style={{
        width: size,
        height: size,
        transform: `scale(${1.0 - (pressed/10)})`,
        filter: `brightness(${1.0 - (pressed/2)})`,
        transition: "all 0.01s linear",
        ...style
      }}
    />
  );
};