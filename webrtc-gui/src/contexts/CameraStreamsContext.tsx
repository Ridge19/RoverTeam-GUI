import { createContext, useContext } from "react";
import { Camera } from "@/hooks/useCameraList";

export type ConnectionStatus = "idle" | "connecting" | "live" | "failed";

export interface CameraStreamsContextValue {
  getStream(id: string): MediaStream | null;
  getStatus(id: string): ConnectionStatus;
  getError(id: string): string | null;

  start(camera: Camera): void;
  stop(id: string): void;
}

export const CameraStreamsContext =
  createContext<CameraStreamsContextValue | null>(null);

export function useCameraStreams() {
  const ctx = useContext(CameraStreamsContext);
  if (!ctx) throw new Error("useCameraStreams must be used inside provider");
  return ctx;
}
