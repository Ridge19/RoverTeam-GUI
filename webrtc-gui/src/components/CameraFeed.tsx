import { useEffect, useRef, useState, useCallback } from "react";
import { Camera } from "@/hooks/useCameraList"; // Adjust import path as needed

interface CameraFeedProps {
  camera: Camera;
  baseUrl: string;
}

type ConnectionStatus = "idle" | "connecting" | "live" | "failed";

export function CameraFeed({ camera, baseUrl }: CameraFeedProps) {
  // STRICT TYPING: Ref is strictly an HTMLVideoElement or null.
  const videoRef = useRef<HTMLVideoElement>(null);
  // We keep the PC in a ref so it doesn't trigger re-renders, but persists.
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startStream = useCallback(async () => {
    if (pcRef.current) return; // Prevent double connections

    setStatus("connecting");
    setErrorMessage(null);

    try {
      // LAN CONFIG: No ICE servers needed.
      // This defaults to Host Candidates (Local IP), which is perfect for LAN.
      const pc = new RTCPeerConnection({ iceServers: [] });
      pcRef.current = pc; // Store immediately for cleanup logic

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected"
        ) {
          setStatus("failed");
          setErrorMessage("ICE Connection Failed");
          pc.close();
          pcRef.current = null;
        }
      };

      pc.addTransceiver("video", { direction: "recvonly" });

      pc.ontrack = (event) => {
        // STANDARD NULL CHECK: The video element might not be mounted yet
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current
            .play()
            .catch((e) => console.warn("Autoplay blocked", e));
          setStatus("live");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Use the baseUrl passed in (ensures we don't rely on stale state)
      const res = await fetch(`${baseUrl}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
          camera_id: camera.id,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const answer = await res.json();
      // Guard for user leaving page while fetching
      if (pc.signalingState === "closed") return;

      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error(err);
      setStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Connection failed");
      // Cleanup on failure
      pcRef.current?.close();
      pcRef.current = null;
    }
  }, [baseUrl, camera.id]);

  useEffect(() => {
    startStream();

    // Runs automatically when this specific camera is removed
    return () => {
      if (pcRef.current) {
        console.log(`Cleaning up camera ${camera.id}`);
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [startStream, camera.id]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span>{camera.label}</span>
        <StatusBadge status={status} />
      </div>

      <div style={styles.videoWrapper}>
        {/* Loading Overlay */}
        {status === "connecting" && (
          <div style={styles.overlay}>
            <div className="spinner">Connecting...</div>
          </div>
        )}

        {/* Error Overlay with Retry Button */}
        {status === "failed" && (
          <div style={styles.overlay}>
            <p style={{ color: "#f55", marginBottom: 10 }}>OFFLINE</p>
            <button onClick={() => startStream()} style={styles.retryBtn}>
              Retry
            </button>
            <p style={{ fontSize: 10, marginTop: 5 }}>{errorMessage}</p>
          </div>
        )}

        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
      </div>
    </div>
  );
}

// Simple Sub-component for the little status dot
function StatusBadge({ status }: { status: ConnectionStatus }) {
  let color = "#888"; // idle
  let text = "WAITING";

  if (status === "connecting") {
    color = "#ff4";
    text = "CONNECTING";
  }
  if (status === "live") {
    color = "#4f4";
    text = "LIVE";
  }
  if (status === "failed") {
    color = "#f44";
    text = "ERROR";
  }

  return (
    <span style={{ color, fontSize: "0.8rem", fontWeight: "bold" }}>
      ● {text}
    </span>
  );
}

// Inline styles for modularity (You can move this to CSS modules)
const styles = {
  card: {
    background: "#222",
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  videoWrapper: {
    position: "relative" as const,
    paddingTop: "75%",
    background: "#000",
    borderRadius: 4,
  },
  video: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  retryBtn: {
    background: "#444",
    color: "#fff",
    border: "1px solid #666",
    padding: "5px 15px",
    cursor: "pointer",
    borderRadius: 4,
  },
};
