import { useEffect, useRef, useState, useCallback } from "react";

// ----------------------
// 1. Define inputs as strings
// ----------------------
export type GamepadInput =
  | "LEFT_STICK"
  | "RIGHT_STICK"
  | "DIR_UP"
  | "DIR_DOWN"
  | "DIR_LEFT"
  | "DIR_RIGHT"
  | "TRIG_LEFT"
  | "TRIG_RIGHT"
  | "BUMP_LEFT"
  | "BUMP_RIGHT"
  | "TRIANGLE"
  | "TRI"
  | "CIRCLE"
  | "SQUARE"
  | "X"
  | "Y"
  | "A"
  | "B"
  | "L3"
  | "R3"
  | "START"
  | "SELECT";

export type ControllerType = "xbox" | "playstation" | "unknown";

// ----------------------
// 2. Controller mapping
// ----------------------
const gamepadMapping: Record<string, Partial<Record<GamepadInput, number>>> = {
  xbox: {
    LEFT_STICK: 0,
    RIGHT_STICK: 2,
    DIR_UP: 12,
    DIR_DOWN: 13,
    DIR_LEFT: 14,
    DIR_RIGHT: 15,
    TRIG_LEFT: 6,
    TRIG_RIGHT: 7,
    BUMP_LEFT: 4,
    BUMP_RIGHT: 5,
    Y: 3,
    X: 2,
    A: 0,
    B: 1,
    L3: 10,
    R3: 11,
    START: 9,
    SELECT: 8,
  },
  ps: {
    LEFT_STICK: 0,
    RIGHT_STICK: 2,
    DIR_UP: 12,
    DIR_DOWN: 13,
    DIR_LEFT: 14,
    DIR_RIGHT: 15,
    TRIG_LEFT: 6,
    TRIG_RIGHT: 7,
    BUMP_LEFT: 4,
    BUMP_RIGHT: 5,
    TRIANGLE: 3,
    TRI: 3,
    CIRCLE: 1,
    SQUARE: 2,
    X: 0,
    L3: 10,
    R3: 11,
    START: 9,
    SELECT: 8,
  },
};

// ----------------------
// 3. Hook
// ----------------------
export function useGamepad() {
  const [connected, setConnected] = useState<Gamepad[]>([]);
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const listenersRef = useRef<
    Map<GamepadInput, Set<(state: boolean | { x: number; y: number }) => void>>
  >(new Map());

  // ----------------------
  // 4. Poll gamepad input
  // ----------------------
  const pollGamepads = useCallback(() => {
    const gps = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
    setConnected(gps);

    // Ensure current index is valid
    if (currentIndex === null || !gps[currentIndex]) {
      setCurrentIndex(gps.length > 0 ? 0 : null);
    }

    // Fire inputChanged callbacks
    gps.forEach((gp, idx) => {
      const type = gp.id.toLowerCase().includes("playstation") ? "ps" : "xbox";
      const mapping = gamepadMapping[type];

      listenersRef.current.forEach((callbacks, input) => {
        const mappedIndex = mapping[input];
        if (mappedIndex === undefined) return;

        // axis
        if (input === "LEFT_STICK" || input === "RIGHT_STICK") {
          const x = gp.axes[mappedIndex] ?? 0;
          const y = gp.axes[mappedIndex + 1] ?? 0;
          callbacks.forEach((cb) => cb({ x, y }));
        } else {
          // button
          const pressed = gp.buttons[mappedIndex]?.pressed ?? false;
          callbacks.forEach((cb) => cb(pressed));
        }
      });
    });
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(pollGamepads, 50); // 20Hz polling
    return () => clearInterval(interval);
  }, [pollGamepads]);

  // ----------------------
  // 5. Select / Get Current Gamepad
  // ----------------------
  const selectGamepad = useCallback(
    (index: number) => {
      const gps = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
      if (gps[index]) setCurrentIndex(index);
    },
    [setCurrentIndex]
  );

  const getCurrentIndex = useCallback(() => {
    const gps = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
    if (!gps.length) return null;
    if (currentIndex === null || !gps[currentIndex]) return 0;
    return currentIndex;
  }, [currentIndex]);

  // ----------------------
  // 6. getInput
  // ----------------------
  const getInput = useCallback(
    (input: GamepadInput, index?: number) => {
      const gps = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
      const idx = index ?? getCurrentIndex();
      if (idx === null || !gps[idx]) {
        if (input === "LEFT_STICK" || input === "RIGHT_STICK") return { x: 0, y: 0 };
        return false;
      }

      const gp = gps[idx];
      const type = gp.id.toLowerCase().includes("playstation") ? "ps" : "xbox";
      const mapping = gamepadMapping[type];
      const mappedIndex = mapping[input];
      if (mappedIndex === undefined) {
        if (input === "LEFT_STICK" || input === "RIGHT_STICK") return { x: 0, y: 0 };
        return false;
      }

      if (input === "LEFT_STICK" || input === "RIGHT_STICK") {
        return { x: gp.axes[mappedIndex] ?? 0, y: gp.axes[mappedIndex + 1] ?? 0 };
      } else {
        return gp.buttons[mappedIndex]?.pressed ?? false;
      }
    },
    [getCurrentIndex]
  );

  // ----------------------
  // 7. Event listeners
  // ----------------------
  const registerInputChanged = useCallback(
    (input: GamepadInput, cb: (state: boolean | { x: number; y: number }) => void) => {
      if (!listenersRef.current.has(input)) listenersRef.current.set(input, new Set());
      listenersRef.current.get(input)!.add(cb);
    },
    []
  );

  const deregisterInputChanged = useCallback(
    (input: GamepadInput, cb: (state: boolean | { x: number; y: number }) => void) => {
      listenersRef.current.get(input)?.delete(cb);
    },
    []
  );

  // Poll connected gamepads
  useEffect(() => {
    const updateGamepads = () => {
      const pads = Array.from(navigator.getGamepads?.() || []).filter(Boolean) as Gamepad[];
      setGamepads(pads);

      // Auto-select current if disconnected
      if (currentIndex === null || !pads[currentIndex]) {
        setCurrentIndex(pads.length > 0 ? 0 : null);
      }
    };

    window.addEventListener("gamepadconnected", updateGamepads);
    window.addEventListener("gamepaddisconnected", updateGamepads);
    const interval = setInterval(updateGamepads, 1000);

    updateGamepads();
    return () => {
      window.removeEventListener("gamepadconnected", updateGamepads);
      window.removeEventListener("gamepaddisconnected", updateGamepads);
      clearInterval(interval);
    };
  }, [currentIndex]);

  const getControllerType = (index?: number): ControllerType => {
    const idx = index ?? currentIndex;
    if (idx === null) return "unknown";
    const gp = navigator.getGamepads?.()[idx];
    if (!gp) return "unknown";
    const id = gp.id.toLowerCase();
    if (id.includes("xbox")) return "xbox";
    if (id.includes("playstation") || id.includes("dualshock") || id.includes("dual sense")) return "playstation";
    return "unknown";
  };

  return {
    connected,
    currentIndex,
    selectGamepad,
    getCurrentIndex,
    getInput,
    registerInputChanged,
    deregisterInputChanged,
  };
}