import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useEndpoints } from "./EndpointContext";

// -------------------------
// Types
// -------------------------
export type GamepadType = "none" | "ps" | "xbox" | "other";
export type ControlTarget = "none" | "arm" | "drive" | string;

export interface GamepadContextState {
  gamepadType: GamepadType;
  buttons: number[];
  pressed: boolean[];
  axes: number[];
  hasControl: ControlTarget;
  setHasControl: (target: ControlTarget) => void;
}

// -------------------------
// Context
// -------------------------
const GamepadContext = createContext<GamepadContextState>({
  gamepadType: "none",
  buttons: [],
  pressed: [],
  axes: [],
  hasControl: "none",
  setHasControl: () => {},
});

// -------------------------
// Provider
// -------------------------
export const GamepadProvider = ({ children }: { children: ReactNode }) => {
  const { selected: endpoints } = useEndpoints();

  const [gamepadType, setGamepadType] = useState<GamepadType>("none");
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);
  const [buttons, setButtons] = useState<number[]>([]);
  const [pressed, setPressed] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [hasControl, setHasControl] = useState<ControlTarget>("none");

  const armSockets = useRef<WebSocket[]>([]);

  const DEADZONE = 0.05;
  const applyDeadzone = (val: number) => (Math.abs(val) < DEADZONE ? 0 : val);

  // -------------------------
  // Gamepad connection detection
  // -------------------------
  useEffect(() => {
    const detectType = (id: string): GamepadType => {
      const lower = id.toLowerCase();
      if (lower.includes("054c") || lower.includes("playstation") || lower.includes("ps")) return "ps";
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

  // -------------------------
  // Poll gamepad & broadcast only when hasControl === "arm"
  // -------------------------
  useEffect(() => {
    let animationFrame: number;
    let prevButtons: number[] = [];
    let prevAxes: number[] = [];

    const update = () => {
      const pads = navigator.getGamepads();
      let gp = gamepadIndex !== null ? pads[gamepadIndex] : null;
      if (!gp) gp = pads.find(p => p !== null) ?? null;

      if (gp) {
        const newButtons = gp.buttons.map(b => b.value);
        const newAxes = gp.axes.map(applyDeadzone);

        setButtons(newButtons);
        setPressed(newButtons.map(v => v > 0.5));
        setAxes(newAxes);

        if (hasControl === "arm") {
          const buttonsChanged =
            prevButtons.length !== newButtons.length ||
            newButtons.some((v, i) => v !== prevButtons[i]);
          const axesChanged =
            prevAxes.length !== newAxes.length ||
            newAxes.some((v, i) => v !== prevAxes[i]);

          if (buttonsChanged || axesChanged) {
            const payload = JSON.stringify({ buttons: newButtons, axes: newAxes });
            armSockets.current.forEach(ws => {
              if (ws.readyState === WebSocket.OPEN) ws.send(payload);
            });
            prevButtons = newButtons;
            prevAxes = newAxes;
          }
        }
      }

      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [gamepadIndex, hasControl]);

  // -------------------------
  // Connect to arm endpoints
  // -------------------------
  useEffect(() => {
    armSockets.current.forEach(ws => ws.close());
    armSockets.current = [];

    endpoints.forEach(ep =>
      ep.ports
        .filter(p => p.service === "arm" && p.status === "online")
        .forEach(p => {
          try {
            const url = `${ep.host}:${p.port}/ws`;
            const ws = new WebSocket(url);
            ws.onopen = () => console.log(`Connected to arm WS: ${url}`);
            ws.onclose = () => console.log(`Disconnected from arm WS: ${url}`);
            ws.onerror = err => console.warn(`Arm WS error: ${url}`, err);
            armSockets.current.push(ws);
          } catch (err) {
            console.warn(`Failed to connect to arm WS: ${ep.host}:${p.port}`, err);
          }
        })
    );

    return () => armSockets.current.forEach(ws => ws.close());
  }, [endpoints]);

  return (
    <GamepadContext.Provider
      value={{ gamepadType, buttons, pressed, axes, hasControl, setHasControl }}
    >
      {children}
    </GamepadContext.Provider>
  );
};

// -------------------------
// Hooks
// -------------------------
export const useGamepad = () => useContext(GamepadContext);

export const useButtonPress = (buttonIndex: number, callback: () => void) => {
  const { pressed } = useGamepad();
  const wasPressedRef = useRef(false);

  useEffect(() => {
    const currentlyPressed = pressed[buttonIndex] ?? false;
    if (currentlyPressed && !wasPressedRef.current) {
      callback();
    }
    wasPressedRef.current = currentlyPressed;
  }, [pressed[buttonIndex]]); // run only when this button changes
};