import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraStreamsContext, ConnectionStatus } from "@/contexts/CameraStreamsContext";
import { useEndpoints } from "@/contexts/EndpointContext";

/* ------------------- TYPES ------------------- */
interface CameraStreamState {
  pc: RTCPeerConnection | null;
  stream: MediaStream | null;
  status: ConnectionStatus;
  error: string | null;
  retryTimer?: NodeJS.Timeout;
  lastAttempt?: number;
}

/* ------------------- PROVIDER ------------------- */
export function CameraStreamsProvider({ children }: { children: React.ReactNode }) {
  const { getEndpointsOfService, onEvent } = useEndpoints();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const streamsRef = useRef<Record<string, CameraStreamState>>({});
  const [, forceRender] = useState(0);

  const refresh = () => forceRender(v => v + 1);

  /* ------------------- HELPERS ------------------- */
  const keyOf = (camera: Camera) => `${camera.endpoint}:${camera.id}`;

  const fetchCameras = useCallback(async (endpointId: string, port: number) => {
    const url = `${endpointId}:${port}/cameras`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return (data.cameras || []).map((c: any) => ({
        id: c.id.toString(),
        label: c.label,
        endpoint: `${endpointId}:${port}`,
        port,
      }));
    } catch {
      return [];
    }
  }, []);

  /* ------------------- START CAMERA ------------------- */
  const start = useCallback(async (camera: Camera) => {
    const key = keyOf(camera);
    const now = Date.now();

    const state = streamsRef.current[key];
    if (state?.pc) return; // already started
    if (state?.lastAttempt && now - state.lastAttempt < 2000) return; // rate limit

    streamsRef.current[key] = { pc: null, stream: null, status: "connecting", error: null, lastAttempt: now };
    refresh();

    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      streamsRef.current[key].pc = pc;

      pc.addTransceiver("video", { direction: "recvonly" });

      pc.ontrack = e => {
        const s = streamsRef.current[key];
        if (!s) return;
        s.stream = e.streams[0];
        s.status = "live";
        refresh();
      };

      pc.oniceconnectionstatechange = () => {
        const s = streamsRef.current[key];
        if (!s) return;
        if (["failed", "disconnected"].includes(pc.iceConnectionState)) {
          if (!s.retryTimer) {
            s.status = "connecting";
            refresh();
            s.pc?.close();
            delete streamsRef.current[key];
            console.log(`[cameras] ICE failed for ${camera.label}, retrying in 2s`);
            s.retryTimer = setTimeout(() => start(camera), 2000);
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch(`${camera.endpoint}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type, camera_id: camera.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const answer = await res.json();
      await pc.setRemoteDescription(answer);

    } catch (err) {
      const s = streamsRef.current[key] ?? (streamsRef.current[key] = { pc: null, stream: null, status: "failed", error: null });
      s.status = "failed";
      s.error = err instanceof Error ? err.message : "Connection failed";
      refresh();
    }
  }, []);

  /* ------------------- STOP CAMERA ------------------- */
  const stop = useCallback((camera: Camera) => {
    const key = keyOf(camera);
    const s = streamsRef.current[key];
    if (!s) return;
    s.pc?.close();
    if (s.retryTimer) clearTimeout(s.retryTimer);
    delete streamsRef.current[key];
    refresh();
  }, []);

  const getStream = useCallback((camera: Camera) => streamsRef.current[keyOf(camera)]?.stream ?? null, []);
  const getStatus = useCallback((camera: Camera) => streamsRef.current[keyOf(camera)]?.status ?? "idle", []);
  const getError = useCallback((camera: Camera) => streamsRef.current[keyOf(camera)]?.error ?? null, []);

  /* ------------------- MANAGE CAMERAS BASED ON ENDPOINTS ------------------- */
  const trackedKeys = useRef<Set<string>>(new Set());

  const updateCameraList = useCallback(async () => {
    setLoading(true);

    const endpoints = getEndpointsOfService("cameras"); // array of "http://host:port"
    const currentEndpoints = new Set(endpoints);

    const newCameras: Camera[] = [];
    const removedCameras: Camera[] = [];

    // 1️⃣ Remove cameras whose endpoint no longer exists
    cameras.forEach(c => {
      if (!currentEndpoints.has(c.endpoint)) {
        removedCameras.push(c);
        const key = keyOf(c);
        trackedKeys.current.delete(key);
        stop(c);
      }
    });

    // 2️⃣ Fetch cameras for all endpoints
    await Promise.all(
      endpoints.map(async ep => {
        const port = parseInt(ep.split(":").pop()!, 10);
        const host = ep.replace(`:${port}`, "");
        const cams = await fetchCameras(host, port) as Camera[];

        cams.forEach(cam => {
          const key = keyOf(cam);

          // Only add if not already tracked AND not already in newCameras
          const alreadyInState = cameras.some(c => keyOf(c) === key) || newCameras.some(c => keyOf(c) === key);
          if (!trackedKeys.current.has(key) && !alreadyInState) {
            trackedKeys.current.add(key);   // mark immediately
            newCameras.push(cam);           // safe to add to state
            start(cam);                     // async, always-connected
          }
        });
      })
    );

    // 3️⃣ Update state: remove old, add new
    if (newCameras.length > 0 || removedCameras.length > 0) {
      setCameras(prev => [
        ...prev.filter(c => !removedCameras.some(rc => keyOf(rc) === keyOf(c))),
        ...newCameras
      ]);
    }

    setLoading(false);
  }, [cameras, fetchCameras, getEndpointsOfService, start, stop]);

  /* ------------------- WATCH ENDPOINTS ------------------- */
  useEffect(() => {
    updateCameraList(); // initial
    return onEvent(() => updateCameraList());
  }, [onEvent, updateCameraList]);

  /* ------------------- PROVIDER VALUE ------------------- */
  return (
    <CameraStreamsContext.Provider value={{
      cameras,
      loading,
      fetchCameras,
      start,
      stop,
      getStream,
      getStatus,
      getError,
    }}>
      {children}
    </CameraStreamsContext.Provider>
  );
}