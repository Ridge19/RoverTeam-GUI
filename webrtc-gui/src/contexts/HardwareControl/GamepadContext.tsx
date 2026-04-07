import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { GamepadType, ControlTarget, HardwareState } from "./types";
import { ControlSocketAdapter } from "./ControlSocketAdapter";
import { gamepadMappings } from "./mapping";
import { useEndpoints } from "@/contexts/EndpointContext";

// -------------------------
// AVAILABLE HARDWARE TYPES
// -------------------------
const HARDWARE_TYPES: ControlTarget[] = ["arm"];

// -------------------------
// Context Interface
// -------------------------
interface GamepadContextState {
  gamepadType: GamepadType;
  buttons: number[];
  pressed: boolean[];
  axes: number[];
  hasControl: ControlTarget;
  setHasControl: (target: ControlTarget) => void;
  hardwareStates: Record<string, HardwareState>;
  hardwareControlAvailable: (
    name: string
  ) => { ok: boolean; ws?: ControlSocketAdapter; error?: string };
}

// -------------------------
// Context
// -------------------------
export const GamepadContext = createContext<GamepadContextState>({
  gamepadType: "none",
  buttons: [],
  pressed: [],
  axes: [],
  hasControl: "none",
  setHasControl: () => {},
  hardwareStates: {},
  hardwareControlAvailable: () => ({ ok: false }),
});

// -------------------------
// Provider
// -------------------------
export const GamepadProvider = ({ children }: { children: ReactNode }) => {
  const { getEndpointsOfService } = useEndpoints();

  // ---------- Stable endpoint ref ----------
  const endpointsRef = useRef(getEndpointsOfService);
  useEffect(() => {
    endpointsRef.current = getEndpointsOfService;
  }, [getEndpointsOfService]);

  // ---------- State ----------
  const [gamepadType, setGamepadType] = useState<GamepadType>("none");
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);
  const [buttons, setButtons] = useState<number[]>([]);
  const [pressed, setPressed] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [hasControl, setHasControl] = useState<ControlTarget>("none");
  const [hardwareStates, setHardwareStates] = useState<
    Record<string, HardwareState>
  >({});

  // ---------- Socket Registry ----------
  const controlSockets = useRef<Record<string, ControlSocketAdapter>>({});

  // -------------------------
  // Initialize hardware state
  // -------------------------
  useEffect(() => {
    setHardwareStates((prev) => {
      const next = { ...prev };
      HARDWARE_TYPES.forEach((hw) => {
        if (!next[hw]) {
          next[hw] = {
            ws: null,
            hasControl: false,
            outputs: {},
            error: null,
            sendEvent: (name: string) => {
              const socket = controlSockets.current[hw];
              if (socket?.ws?.readyState === WebSocket.OPEN) {
                socket.sendEvent(name);
              } else {
                console.warn(`Cannot send event, WS not open for ${hw}`);
              }
            },
          };
        }
      });
      return next;
    });
  }, []);

  // -------------------------
  // Gamepad Detection
  // -------------------------
  useEffect(() => {
    const detectType = (id: string): GamepadType => {
      const lower = id.toLowerCase();
      if (lower.includes("054c") || lower.includes("playstation"))
        return "ps";
      if (lower.includes("045e") || lower.includes("xbox"))
        return "xbox";
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
      setHasControl("none");
    };

    window.addEventListener("gamepadconnected", connectHandler);
    window.addEventListener("gamepaddisconnected", disconnectHandler);

    return () => {
      window.removeEventListener("gamepadconnected", connectHandler);
      window.removeEventListener("gamepaddisconnected", disconnectHandler);
    };
  }, []);

  // -------------------------
  // Gamepad Poll Loop
  // -------------------------
  useEffect(() => {
    let animationFrame: number;

    const prevButtons: number[] = [];
    const prevAxes: number[] = [];

    let lastSentTime = 0;
    let lastSentPayload: string | null = null;

    const SEND_INTERVAL = 100; // 10Hz

    const update = (now: number) => {
      const pads = navigator.getGamepads();
      const gp =
        gamepadIndex !== null
          ? pads[gamepadIndex]
          : pads.find((p) => p != null) ?? null;

      if (gp) {
        const newButtons = gp.buttons.map((b) => b.value);
        const newAxes = gp.axes.map((v) => (Math.abs(v) < 0.05 ? 0 : v));

        setButtons(newButtons);
        setPressed(newButtons.map((v) => v > 0.5));
        setAxes(newAxes);

        const socket = controlSockets.current[hasControl];

        if (hasControl !== "none" && socket?.ws?.readyState === WebSocket.OPEN) {
          const inputChanged =
            newButtons.some((v, i) => v !== prevButtons[i]) ||
            newAxes.some((v, i) => v !== prevAxes[i]);

          const timeElapsed = now - lastSentTime;

          // ✅ Send if input changed OR interval elapsed
          if (inputChanged || timeElapsed >= SEND_INTERVAL) {
            const mapper = gamepadMappings[hasControl];
            if (mapper) {
              const payloadObj = mapper(newAxes, newButtons);
              const payload = JSON.stringify(payloadObj);

              // Only send if different from last sent payload
              if (payload !== lastSentPayload) {
                // Prevent buffer flooding
                if (socket.ws.bufferedAmount === 0) {
                  socket.sendInput(payloadObj);
                  lastSentPayload = payload;
                  lastSentTime = now;
                }
              }
            }
          }
        }

        // Always update previous state
        prevButtons.splice(0, prevButtons.length, ...newButtons);
        prevAxes.splice(0, prevAxes.length, ...newAxes);
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [gamepadIndex, hasControl]);

  // -------------------------
  // Get or Create Stable Socket
  // -------------------------
  const createSocket = (name: string) => {
    const urls = endpointsRef.current(name);
    if (!urls?.length) return null;

    const adapter = new ControlSocketAdapter(
      urls[0] + "/ws",
      (outputs: any) => {
        setHardwareStates((prev) => ({
          ...prev,
          [name]: {
            ...(prev[name] || {}),
            outputs,
          },
        }));
      }
    );

    adapter.connect();

    adapter.ws!.onclose = () => {
      console.warn("WS closed, forcing control release");

      controlSockets.current[name] = undefined as any;

      setHardwareStates((prev) => ({
        ...prev,
        [name]: {
          ...(prev[name] || {}),
          ws: null,
          hasControl: false,
          error: "Connection closed",
        },
      }));

      setHasControl("none");
    };

    controlSockets.current[name] = adapter;

    setHardwareStates((prev) => ({
      ...prev,
      [name]: {
        ...(prev[name] || {}),
        ws: adapter,
        hasControl: true,
        outputs: {},
        error: null,
        sendEvent: prev[name]?.sendEvent ?? ((eventName: string) => {
          const socket = controlSockets.current[name];
          if (socket?.ws?.readyState === WebSocket.OPEN) {
            socket.sendEvent(eventName);
          } else {
            console.warn(`Cannot send event, WS not open for ${name}`);
          }
        }),
      },
    }));

    return adapter;
  };

  // -------------------------
  // Handle hasControl changes
  // -------------------------
  useEffect(() => {
    if (hasControl === "none") return;

    const existing = controlSockets.current[hasControl];

    if (existing) {
      return; // already connected
    }

    const socket = createSocket(hasControl);

    if (!socket) {
      setHasControl("none");
    }
  }, [hasControl]);

  // -------------------------
  // Cleanup on unmount
  // -------------------------
  useEffect(() => {
    return () => {
      Object.values(controlSockets.current).forEach((s) =>
        s.close()
      );
      controlSockets.current = {};
    };
  }, []);

  // -------------------------
  // Availability Check
  // -------------------------
  const hardwareControlAvailable = useCallback(
    (name: string) => {
      if (gamepadType === "none") {
        return { ok: false, error: "No controller connected" };
      }

      const hw = hardwareStates[name];

      // ✅ If we already have an active WS, that's the source of truth
      if (hw?.ws?.ws?.readyState === WebSocket.OPEN) {
        return { ok: true, ws: hw.ws };
      }

      // Only check endpoints if NOT connected
      const urls = endpointsRef.current(name);
      if (!urls?.length) {
        return { ok: false, error: "No endpoint available" };
      }

      return { ok: true, error: "No WS active" };
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