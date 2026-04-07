import { useContext } from "react";
import { GamepadContext } from "./GamepadContext";
import React from "react";

export const useGamepad = () => useContext(GamepadContext);

export const useButtonPress = (buttonIndex: number, callback: () => void) => {
  const { pressed } = useGamepad();
  const wasPressedRef = React.useRef(false);

  React.useEffect(() => {
    const currentlyPressed = pressed[buttonIndex] ?? false;
    if (currentlyPressed && !wasPressedRef.current) callback();
    wasPressedRef.current = currentlyPressed;
  }, [pressed[buttonIndex]]);
};