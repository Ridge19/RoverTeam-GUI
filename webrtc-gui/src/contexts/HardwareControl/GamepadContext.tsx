import React, { createContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { GamepadType, ControlTarget, HardwareState } from "./types";
import { ControlSocketAdapter } from "./ControlSocketAdapter";
import { gamepadMappings } from "./mapping";
import { useEndpoints } from "@/contexts/EndpointContext";

// AVAILABLE HARDWARE TYPES:
const HARDWARE_TYPES: ControlTarget[] = [
  "arm",
  //"drive",
  //"excavator",
  //"science",
  //"ptzcam"
];

interface GamepadContextState {
  gamepadType: GamepadType;
  buttons: number[];
  pressed: boolean[];
  axes: number[];
  hasControl: ControlTarget;
  setHasControl: (target: ControlTarget) => void;
  hardwareStates: Record<string, HardwareState>;
  hardwareControlAvailable: (name: string) => { ok: boolean; ws?: ControlSocketAdapter; error?: string };
}

export const GamepadContext = createContext<GamepadContextState>({
  gamepadType: "none",
  buttons: [],
  pressed: [],
  axes: [],
  hasControl: "none",
  setHasControl: () => {},
  hardwareStates: {},
  hardwareControlAvailable: () => ({ ok: false, error: "Not implemented" }),
});

export const GamepadProvider = ({ children }: { children: ReactNode }) => {
  const { getEndpointsOfService } = useEndpoints();

  const [gamepadType, setGamepadType] = useState<GamepadType>("none");
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);
  const [buttons, setButtons] = useState<number[]>([]);
  const [pressed, setPressed] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [hasControl, setHasControl] = useState<ControlTarget>("none");
  const [hardwareStates, setHardwareStates] = useState<Record<string, HardwareState>>({});

  const controlSockets = useRef<Record<string, ControlSocketAdapter>>({});

  // -------------------------
  // Detect gamepad type
  // -------------------------
  useEffect(() => {
    setHardwareStates(prev => {
      const next: Record<string, HardwareState> = { ...prev };
      HARDWARE_TYPES.forEach(hw => {
        if (!next[hw]) {
          next[hw] = { ws: null, hasControl: false, outputs: {}, error: null };
        }
      });
      return next;
    });

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

      setHasControl(prev => {
        if (prev !== "none") {
          // mark hardware as not controlled
          setHardwareStates(hwPrev => ({
            ...hwPrev,
            [prev]: { ...(hwPrev[prev] || {}), hasControl: false },
          }));
          return "none";
        }
        return prev;
      });
    };

    window.addEventListener("gamepadconnected", connectHandler);
    window.addEventListener("gamepaddisconnected", disconnectHandler);
    return () => {
      window.removeEventListener("gamepadconnected", connectHandler);
      window.removeEventListener("gamepaddisconnected", disconnectHandler);
    };
  }, []);

  // -------------------------
  // Poll gamepad and send input to active hardware
  // -------------------------
  useEffect(() => {
    const prevButtons = { current: [] as number[] };
    const prevAxes = { current: [] as number[] };
    let animationFrame: number;
  
    const update = () => {
      const pads = navigator.getGamepads();
      const gp = gamepadIndex !== null ? pads[gamepadIndex] : pads.find(p => p != null) ?? null;
  
      if (gp) {
        const newButtons = gp.buttons.map(b => b.value);
        const newAxes = gp.axes.map(v => (Math.abs(v) < 0.05 ? 0 : v));
  
        setButtons(newButtons);
        setPressed(newButtons.map(v => v > 0.5));
        setAxes(newAxes);
  
        const socket = controlSockets.current[hasControl];
  
        if (hasControl !== "none" && socket && socket.ws && socket?.ws.readyState === WebSocket.OPEN) {
          const buttonsChanged =
            prevButtons.current.length !== newButtons.length || newButtons.some((v, i) => v !== prevButtons.current[i]);
          const axesChanged =
            prevAxes.current.length !== newAxes.length || newAxes.some((v, i) => v !== prevAxes.current[i]);
  
          if (buttonsChanged || axesChanged) {
            const mapper = gamepadMappings[hasControl];
            if (mapper) {
              const payload = mapper(newAxes, newButtons);
              socket.sendInput(payload);
            }
            prevButtons.current = newButtons;
            prevAxes.current = newAxes;
          }
        }
      }
  
      animationFrame = requestAnimationFrame(update);
    };
  
    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [gamepadIndex, hasControl]);

  // -------------------------
  // Connect to hardware / ControlSocket
  // -------------------------
  const connectHardware = useCallback(
    (name: string) => {
      if (controlSockets.current[name]) return controlSockets.current[name];

      const urls = getEndpointsOfService(name);
      if (!urls.length) return null;

      const adapter = new ControlSocketAdapter(urls[0] + "/ws", (outputs: any) => {
        setHardwareStates(prev => ({
          ...prev,
          [name]: {
            ...(prev[name] || { ws: adapter, hasControl: false, outputs: {}, error: null }),
            outputs,
          },
        }));
      });

      controlSockets.current[name] = adapter;
      setHardwareStates(prev => ({
        ...prev,
        [name]: { ws: adapter, hasControl: false, outputs: {}, error: null },
      }));

      return adapter;
    },
    [getEndpointsOfService]
  );

  // -------------------------
  // Update hasControl
  // -------------------------
  useEffect(() => {
    if (hasControl === "none") return;

    const socket = connectHardware(hasControl);
    if (!socket) {
      setHardwareStates(prev => ({
        ...prev,
        [hasControl]: { ws: null, hasControl: false, outputs: {}, error: "No endpoint" },
      }));
      setHasControl("none");
      return;
    }

    setHardwareStates(prev => ({
      ...prev,
      [hasControl]: { ...(prev[hasControl] || {}), hasControl: true, error: null },
    }));
  }, [hasControl, connectHardware]);

  // -------------------------
  // hardwareControlAvailable
  // -------------------------
  const hardwareControlAvailable = useCallback(
    (name: string): { ok: boolean; error?: string } => {
      const hw = hardwareStates[name];
  
      if (!hw) {
        return { ok: false, error: "No such hardware tracked" };
      }

      //Check if gamepad is connected
      if (gamepadType === "none") {
        return { ok: false, error: "No gamepad connected" };
      }
  
      // If tracked, we consider it available
      if (!hw.ws) {
        return { ok: true, error: "WS not yet connected" };
      }
  
      if (hw.ws.ws !== null && hw.ws.ws.readyState !== WebSocket.OPEN) {
        return { ok: true, error: "WS not open" };
      }
  
      return { ok: true };
    },
    [hardwareStates, gamepadType]
  );

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
        hardwareControlAvailable,
      }}
    >
      {children}
    </GamepadContext.Provider>
  );
};