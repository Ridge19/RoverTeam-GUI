import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";

// -------------------------
// Types
// -------------------------
export type GamepadType = "none" | "ps" | "xbox" | "other";

export interface GamepadContextState {
  gamepadType: GamepadType;
  buttons: number[]; // raw float 0-1
  pressed: boolean[]; // bool >0.5
  axes: number[];
}

// -------------------------
// Context
// -------------------------
const GamepadContext = createContext<GamepadContextState>({
  gamepadType: "none",
  buttons: [],
  pressed: [],
  axes: [],
});

// -------------------------
// Provider
// -------------------------
export const GamepadProvider = ({ children }: { children: ReactNode }) => {
  const [gamepadType, setGamepadType] = useState<GamepadType>("none");
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);
  const [buttons, setButtons] = useState<number[]>([]);
  const [pressed, setPressed] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);

  // Detect gamepad connection
  useEffect(() => {
    const detectType = (id: string): GamepadType => {
      const lower = id.toLowerCase();

      // Vendor ID check (Sony = 054c)
      if (lower.includes("054c")) return "ps";

      // Fallback string heuristics
      if (lower.includes("playstation") || lower.includes("ps")) return "ps";
      if (lower.includes("xbox")) return "xbox";

      return "other";
    };

    const connectHandler = (e: GamepadEvent) => {
      setGamepadIndex(e.gamepad.index);
      setGamepadType(detectType(e.gamepad.id));
    };


    const disconnectHandler = () => {
      setGamepadType("none");
      setGamepadIndex(null);
      setButtons([]);
      setPressed([]);
      setAxes([]);
    };

    window.addEventListener("gamepadconnected", connectHandler);
    window.addEventListener("gamepaddisconnected", disconnectHandler);

    return () => {
      window.removeEventListener("gamepadconnected", connectHandler);
      window.removeEventListener("gamepaddisconnected", disconnectHandler);
    };
  }, []);

  // Poll gamepad state every frame
  useEffect(() => {
    let animationFrame: number;

    const update = () => {
      const pads = navigator.getGamepads();

      // Prefer stored index, but fallback safely
      let gp =
        gamepadIndex !== null ? pads[gamepadIndex] : null;

      if (!gp) {
        gp = pads.find(p => p !== null) ?? null;
      }

      if (gp) {
        setButtons(gp.buttons.map(b => b.value));
        setPressed(gp.buttons.map(b => b.value > 0.5));
        setAxes(gp.axes.slice());
      }

      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <GamepadContext.Provider value={{ gamepadType, buttons, pressed, axes }}>
      {children}
    </GamepadContext.Provider>
  );
};

// -------------------------
// Hooks
// -------------------------
export const useGamepad = () => useContext(GamepadContext);

// Return value and pressed bool
export const useButton = (buttonIndex: number) => {
  const { buttons, pressed } = useGamepad();
  return {
    value: buttons[buttonIndex] ?? 0,
    pressed: pressed[buttonIndex] ?? false,
  };
};

export const useAxis = (axisIndex: number) => {
  const { axes } = useGamepad();
  return axes[axisIndex] ?? 0;
};

// Call callback once per press
export const useButtonPress = (buttonIndex: number, callback: () => void) => {
  const { pressed } = useGamepad();
  const wasPressedRef = React.useRef(false);

  useEffect(() => {
    const currentlyPressed = pressed[buttonIndex] ?? false;
    if (currentlyPressed && !wasPressedRef.current) {
      callback();
    }
    wasPressedRef.current = currentlyPressed;
  }, [pressed[buttonIndex]]); // only run when this button changes
};