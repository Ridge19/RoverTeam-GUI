import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { useEndpoints } from "./EndpointContext";

// -------------------------
// Types
// -------------------------
export type GamepadType = "none" | "ps" | "xbox" | "other";
export type ControlTarget = "none" | string;

export interface HardwareState {
  hasControl: boolean;
  error: string | null;
  ws?: WebSocket;
}

export interface GamepadContextState {
  gamepadType: GamepadType;
  buttons: number[];
  pressed: boolean[];
  axes: number[];
  hasControl: ControlTarget;
  setHasControl: (target: ControlTarget) => void;
  hardwareStates: Record<string, HardwareState>;
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
  hardwareStates: {},
});

// -------------------------
// Provider
// -------------------------
export const GamepadProvider = ({ children }: { children: ReactNode }) => {
  const { getEndpointsOfService, onEvent } = useEndpoints();

  const [gamepadType, setGamepadType] = useState<GamepadType>("none");
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);
  const [buttons, setButtons] = useState<number[]>([]);
  const [pressed, setPressed] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [hasControl, setHasControl] = useState<ControlTarget>("none");
  const [hardwareStates, setHardwareStates] = useState<Record<string, HardwareState>>({});

  const DEADZONE = 0.05;
  const applyDeadzone = (val: number) => (Math.abs(val) < DEADZONE ? 0 : val);

  const reconnectTimers = useRef<Record<string, NodeJS.Timeout | null>>({});

  // -------------------------
  // Gamepad connection detection
  // -------------------------
  useEffect(() => {
    const detectType = (id: string): GamepadType => {
      const lower = id.toLowerCase();
      if (lower.includes("054c") || lower.includes("playstation") || lower.includes("ps")) return "ps";
      if (lower.includes("045e") || lower.includes("xbox")) return "xbox";
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
  // Poll gamepad & send to controlled hardware
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

        if (hasControl !== "none") {
          const buttonsChanged =
            prevButtons.length !== newButtons.length || newButtons.some((v, i) => v !== prevButtons[i]);
          const axesChanged = prevAxes.length !== newAxes.length || newAxes.some((v, i) => v !== prevAxes[i]);

          if ((buttonsChanged || axesChanged) && hardwareStates[hasControl]?.ws?.readyState === WebSocket.OPEN) {
            hardwareStates[hasControl].ws!.send(JSON.stringify({ buttons: newButtons, axes: newAxes }));
            prevButtons = newButtons;
            prevAxes = newAxes;
          }
        }
      }

      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [gamepadIndex, hasControl, hardwareStates]);

  // -------------------------
  // Check if hardware can be controlled
  // -------------------------
  const hardwareControlAvailable = useCallback(
    (hardware: string): { ok: boolean; error?: string; ws?: WebSocket } => {
      if (gamepadType === "none") return { ok: false, error: "No controller connected" };

      const urls = getEndpointsOfService(hardware); // returns array of "host:port"
      if (!urls.length) return { ok: false, error: `No ${hardware} endpoint available` };
      if (urls.length > 1) return { ok: false, error: `Multiple ${hardware} endpoints available` };

      const ws = new WebSocket(`${urls[0]}/ws`);
      ws.onopen = () => console.log(`Connected to ${hardware} WS: ${urls[0]}`);
      ws.onclose = () => console.log(`Disconnected from ${hardware} WS: ${urls[0]}`);
      ws.onerror = err => console.warn(`${hardware} WS error: ${urls[0]}`, err);

      return { ok: true, ws };
    },
    [gamepadType, getEndpointsOfService]
  );

  // -------------------------
  // Manage control connections safely
  // -------------------------
  const updateHardwareControl = useCallback(
    (target: ControlTarget) => {
      // Close any existing WS
      setHardwareStates(prev => {
        Object.values(prev).forEach(hw => hw.ws?.close());
        return {}; // reset
      });

      if (target === "none") return;

      const check = hardwareControlAvailable(target);
      if (!check.ok) {
        setHardwareStates({ [target]: { hasControl: false, error: check.error ?? "Unknown error" } });
        setHasControl("none");
        return;
      }

      setHardwareStates({ [target]: { hasControl: true, error: null, ws: check.ws } });
    },
    [hardwareControlAvailable]
  );

  // -------------------------
  // Only trigger when hasControl changes
  // -------------------------
  useEffect(() => {
    updateHardwareControl(hasControl);
  }, [hasControl, updateHardwareControl]);

  // -------------------------
  // Listen to endpoint scan-complete events
  // -------------------------
  useEffect(() => {
    const unsubscribe = onEvent(e => {
      if (e.type === "scan-complete" && hasControl !== "none") {
        updateHardwareControl(hasControl);
      }
    });
    return () => unsubscribe?.();
  }, [onEvent, hasControl, updateHardwareControl]);

  return (
    <GamepadContext.Provider
      value={{
        gamepadType,
        buttons,
        pressed,
        axes,
        hasControl,
        setHasControl,
        hardwareStates,
      }}
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
  }, [pressed[buttonIndex]]);
};