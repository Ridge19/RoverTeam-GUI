import React, { createContext, useContext } from "react";

/* ------------------- TYPES ------------------- */

export type ConnectionStatus = "idle" | "connecting" | "live" | "failed";

export interface Camera {
  id: string;          // from /cameras
  label: string;       // from /cameras
  endpoint: string;    // full endpoint URL including port, e.g. http://rover.local:3001
  port: number;
}

export interface CameraStreamsContextType {
  cameras: Camera[];
  loading: boolean;
  fetchCameras: (endpointId: string, port: number) => Promise<Camera[]>;
  start: (camera: Camera) => void;
  stop: (camera: Camera) => void;
  getStream: (camera: Camera) => MediaStream | null;
  getStatus: (camera: Camera) => ConnectionStatus;
  getError: (camera: Camera) => string | null;
}

export const CameraStreamsContext = createContext<CameraStreamsContextType | null>(null);

export const useCameraStreams = () => {
  const ctx = useContext(CameraStreamsContext);
  if (!ctx) throw new Error("useCameraStreams must be used within CameraStreamsProvider");
  return ctx;
};