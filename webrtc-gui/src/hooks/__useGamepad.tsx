import React, { createContext, useContext, useState } from "react"

export type GamepadInput = 
  "L1" |
  "L2" |
  "L3" |
  "R1" |
  "R2" |
  "R3" |
  "JOY_LX" |
  "JOY_LY" |
  "JOY_RX" |
  "JOY_RY" |
  "DPAD_L" |
  "DPAD_R" |
  "DPAD_U" |
  "DPAD_D" |
  "FACE_L" |
  "FACE_R" |
  "FACE_U" |
  "FACE_D" ;

export type GamepadState = {
  axes: number[]
  buttons: number[]
}

type GamepadContextValue = {
  gamepad: GamepadState | null
  setGamepad: React.Dispatch<React.SetStateAction<GamepadState | null>>
}

const GamepadContext = createContext<GamepadContextValue | null>(null)

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const [gamepad, setGamepad] = useState<GamepadState | null>(null)

  return (
    <GamepadContext.Provider value={{ gamepad, setGamepad }}>
      {children}
    </GamepadContext.Provider>
  )
}

export function useGamepad() {
  const ctx = useContext(GamepadContext)
  if (!ctx) {
    throw new Error("useGamepad must be used within GamepadProvider")
  }
  return ctx
}