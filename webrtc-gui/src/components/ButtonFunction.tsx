import React from "react";
import { useGamepad, useButtonPress } from "@/contexts/HardwareControl/useGamepad";

const ROOT = "inputprompts"

// Icon images per gamepad type
const ICONS: Record<string, Record<string, string>> = {
  ps: {
    12: "/ps/playstation_dpad_vertical.png",
    14: "/ps/playstation_dpad_horizontal.png",
  },
  xbox: {
    12: "/xbox/xbox_dpad_vertical.png",
    14: "/xbox/xbox_dpad_horizontal.png",
  },
  other: {},
};

interface ButtonTooltipProps {
  buttonIndex: number;
  size?: number; // in pixels
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const ButtonFunction: React.FC<ButtonTooltipProps> = ({
  buttonIndex,
  size = 48,
  style,
  disabled = false
}) => {
  const { gamepadType, buttons } = useGamepad();

  if (gamepadType === "none") return null;

  const pressed = disabled?1:(Math.abs(buttons[buttonIndex] - buttons[buttonIndex+1]) ?? 0);
  const icon = `${ROOT}/${ICONS[gamepadType]?.[buttonIndex]}`;

  if (!icon) return null;

  return (
    <img
      src={icon}
      alt={`button-${buttonIndex}`}
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