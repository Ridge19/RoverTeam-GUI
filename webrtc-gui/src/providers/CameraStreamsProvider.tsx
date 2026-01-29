import { useCallback, useRef, useState } from "react";
import { Camera } from "@/hooks/useCameraList";
import {
  CameraStreamsContext,
  ConnectionStatus,
} from "@/contexts/CameraStreamsContext";

interface CameraStreamState {
  pc: RTCPeerConnection | null;
  stream: MediaStream | null;
  status: ConnectionStatus;
  error: string | null;
}

export function CameraStreamsProvider({
  baseUrl,
  children,
}: {
  baseUrl: string;
  children: React.ReactNode;
}) {
  const streamsRef = useRef<Record<string, CameraStreamState>>({});
  const [, forceRender] = useState(0);

  const refresh = () => forceRender((v) => v + 1);

  const start = useCallback(
    async (camera: Camera) => {
      const id = camera.id;
      if (streamsRef.current[id]?.pc) return;

      streamsRef.current[id] = {
        pc: null,
        stream: null,
        status: "connecting",
        error: null,
      };
      refresh();

      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        streamsRef.current[id].pc = pc;

        pc.addTransceiver("video", { direction: "recvonly" });

        pc.ontrack = (e) => {
          streamsRef.current[id].stream = e.streams[0];
          streamsRef.current[id].status = "live";
          refresh();
        };

        pc.oniceconnectionstatechange = () => {
          if (["failed", "disconnected"].includes(pc.iceConnectionState)) {
            streamsRef.current[id].status = "failed";
            streamsRef.current[id].error = "ICE connection failed";
            stop(id);
            refresh();
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const res = await fetch(`${baseUrl}/offer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sdp: offer.sdp,
            type: offer.type,
            camera_id: id,
          }),
        });

        if (!res.ok) throw new Error(await res.text());
        const answer = await res.json();
        await pc.setRemoteDescription(answer);
      } catch (err) {
        streamsRef.current[id].status = "failed";
        streamsRef.current[id].error =
          err instanceof Error ? err.message : "Connection failed";
        stop(id);
        refresh();
      }
    },
    [baseUrl]
  );

  const stop = useCallback((id: string) => {
    streamsRef.current[id]?.pc?.close();
    delete streamsRef.current[id];
    refresh();
  }, []);

  return (
    <CameraStreamsContext.Provider
      value={{
        getStream: (id) => streamsRef.current[id]?.stream ?? null,
        getStatus: (id) => streamsRef.current[id]?.status ?? "idle",
        getError: (id) => streamsRef.current[id]?.error ?? null,
        start,
        stop,
      }}
    >
      {children}
    </CameraStreamsContext.Provider>
  );
}