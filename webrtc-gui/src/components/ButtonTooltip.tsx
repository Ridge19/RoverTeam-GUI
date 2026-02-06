import React from "react";
import { useGamepad, useButtonPress } from "@/contexts/GamepadContext";

const ROOT = "inputprompts"

// Icon images per gamepad type
const ICONS: Record<string, Record<string, string>> = {
  ps: {
    0: "/ps/playstation_button_color_cross.png",
    1: "/ps/playstation_button_color_circle.png",
    2: "/ps/playstation_button_color_square.png",
    3: "/ps/playstation_button_color_triangle.png",
    4: "/ps/playstation_trigger_l1.png",
    5: "/ps/playstation_trigger_r1.png",
    6: "/ps/playstation_trigger_l2.png",
    7: "/ps/playstation_trigger_r2.png",
    8: "/ps/playstation4_button_share.png",
    9: "/ps/playstation4_button_options.png",
    10: "/ps/playstation_stick_top_l.png",
    11: "/ps/playstation_stick_top_r.png",
    12: "/ps/playstation_dpad_up.png",
    13: "/ps/playstation_dpad_down.png",
    14: "/ps/playstation_dpad_left.png",
    15: "/ps/playstation_dpad_right.png",
    16: "/ps/playstation_.png",
    17: "/ps/playstation4_touchpad_press.png",
  },
  xbox: {
    0: "/xbox/xbox_button_color_a.png",
    1: "/xbox/xbox_button_color_b.png",
    2: "/xbox/xbox_button_color_x.png",
    3: "/xbox/xbox_button_color_y.png",
    4: "/xbox/xbox_lb.png",
    5: "/xbox/xbox_rb.png",
    6: "/xbox/xbox_lt.png",
    7: "/xbox/xbox_rt.png",
    8: "/xbox/xbox_button_view.png",
    9: "/xbox/xbox_button_menu.png",
    10: "/xbox/xbox_stick_top_l.png",
    11: "/xbox/xbox_stick_top_r.png",
    12: "/xbox/xbox_dpad_up.png",
    13: "/xbox/xbox_dpad_down.png",
    14: "/xbox/xbox_dpad_left.png",
    15: "/xbox/xbox_dpad_right.png",
    16: "/xbox/xbox_guide.png",
  },
  other: {},
};

interface ButtonTooltipProps {
  buttonIndex: number;
  size?: number; // in pixels
  style?: React.CSSProperties;
}

export const ButtonTooltip: React.FC<ButtonTooltipProps> = ({
  buttonIndex,
  size = 48,
  style
}) => {
  const { gamepadType, buttons } = useGamepad();

  if (gamepadType === "none") return null;

  const pressed = (buttons[buttonIndex] ?? 0);
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