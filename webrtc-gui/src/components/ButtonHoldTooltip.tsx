import React, { useEffect, useRef, useState } from "react";
import { useGamepad } from "@/contexts/HardwareControl/useGamepad";
import { ButtonTooltip } from "./ButtonTooltip";

interface ButtonHoldTooltipProps {
  buttonIndex: number;
  holdDuration: number; // seconds
  size?: number;
  onComplete: () => void;
  style?: React.CSSProperties;
  disabled?: boolean; // ✅ New prop
}

export const ButtonHoldTooltip: React.FC<ButtonHoldTooltipProps> = ({
  buttonIndex,
  holdDuration,
  size = 64,
  onComplete,
  style,
  disabled = false, // default false
}) => {
  const { pressed } = useGamepad();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const prevPressedRef = useRef<boolean>(true);

  useEffect(() => {
    if (disabled) {
      setProgress(0);
      startTimeRef.current = null;
      prevPressedRef.current = false;
      return;
    }

    const update = (timestamp: number) => {
      const isPressed = pressed[buttonIndex] ?? false;
      const prevPressed = prevPressedRef.current;

      // Rising edge
      if (isPressed && !prevPressed) {
        startTimeRef.current = timestamp;
        setProgress(0);
      }

      // Falling edge
      if (!isPressed && prevPressed) {
        startTimeRef.current = null;
        setProgress(0);
      }

      // Only update progress if timer started
      if (isPressed && startTimeRef.current !== null) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const newProgress = Math.min(elapsed / holdDuration, 1);
        setProgress(newProgress);

        if (newProgress >= 1) {
          onComplete(); // ✅ only fires if not disabled
          startTimeRef.current = null;
          setProgress(0);
        }
      }

      prevPressedRef.current = isPressed;
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pressed[buttonIndex], disabled]); // re-run if disabled changes

  // Circle stroke size
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        opacity: disabled ? 0.6 : 1, // ✅ greyed out when disabled
        pointerEvents: disabled ? "none" : "auto", // ✅ prevent interaction
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}
      >
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="#555"
          strokeWidth={strokeWidth}
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="#0f0"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ButtonTooltip buttonIndex={buttonIndex} size={size * 0.6} />
      </div>
    </div>
  );
};