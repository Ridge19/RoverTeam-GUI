import React, { useEffect, useState } from "react";
import { GamepadInput, useGamepad } from "@/hooks/useGamepad";

interface InputHintProps {
  type: "text" | "icon";
  content: string; // text label or image source path
  alt?: string; // alt text for images
  inputLabel?: GamepadInput;
}

export const InputHint: React.FC<InputHintProps> = ({
  type,
  content,
  alt = "controller input",
  inputLabel,
}) => {
  const gamepad = useGamepad();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!inputLabel) return;

    // callback fires when input changes
    const callback = (state: boolean | { x: number; y: number }) => {
      if (typeof state === "boolean") setPressed(state);
    };

    gamepad.registerInputChanged(inputLabel, callback);

    // initialize pressed state immediately
    setPressed(!!gamepad.getInput(inputLabel));

    return () => {
      gamepad.deregisterInputChanged(inputLabel, callback);
    };
  }, [gamepad, inputLabel]);

  return (
    <div
      style={{
        fontSize: 12,
        background: "#222",
        border: "2px solid #888",
        padding: 5,
        borderRadius: 10,
        color: "#888",
        fontWeight: "bold",
        margin: 4,
        marginTop: -4,
        transform: pressed ? "scale(0.8)" : "scale(0.9)",
        filter: pressed ? "brightness(50%)" : "brightness(100%)",
        transition: "transform 0.1s, filter 0.1s",
      }}
    >
      {type === "text" ? <span>{content}</span> : <img src={content} alt={alt} />}
    </div>
  );
};
