import { ControlSocketAdapter } from "./ControlSocketAdapter";

export type GamepadType = "none" | "ps" | "xbox" | "other";
export type ControlTarget = "none" | string;

export interface InputPayload {
  [key: string]: number | boolean | string;
}

export interface OutputPayload {
  [key: string]: number | boolean | string;
}

export interface HardwareState {
  ws: ControlSocketAdapter | null;
  hasControl: boolean;
  outputs: OutputPayload;
  error: string | null;
}

export interface GamepadInputMapping {
  [key: string]: number; // key = control name (e.g., "J1_angle_deg"), value = number (angle or velocity)
}