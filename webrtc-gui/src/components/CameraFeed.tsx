import { useEffect, useRef, useState, useCallback } from "react";
import { Camera } from "@/hooks/useCameraList"; // Adjust import path as needed
import { useRoverWatchdog } from "@/hooks/useRoverWatchdog";
import StatusChip, {StatusColor} from "./StatusChip";
import { ArrowsPointingOutIcon, CameraIcon } from "@heroicons/react/24/solid";

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
  const [showSaved, setShowSaved] = useState(false); // currently unused

  // For FPS calculation and Frozen detection
  const [fps, setFps] = useState<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const rafActiveRef = useRef(false);

  // FPS and Frozen detection logic
  const startFpsCounter = useCallback(() => {
    const video = videoRef.current;
    if (!video || rafActiveRef.current) return;

    rafActiveRef.current = true;
    frameCountRef.current = 0;
    lastFpsTimeRef.current = performance.now();

    const onFrame = (now: number) => {
      frameCountRef.current++;

      const elapsed = now - lastFpsTimeRef.current;
      if (elapsed >= 1000) {
        const calculatedFps = frameCountRef.current / (elapsed / 1000);

        setFps(calculatedFps >= 1 ? Math.round(calculatedFps) : null);

        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      if (rafActiveRef.current) {
        video.requestVideoFrameCallback(onFrame);
      }
    };

    video.requestVideoFrameCallback(onFrame);
  }, []);

  useEffect(() => {
    return () => {
      rafActiveRef.current = false;
      setFps(null);
    };
  }, []);



  // Photo
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (video == null || video.videoWidth === 0 || video.videoHeight === 0)
      return null;

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageType = "image/png";
    const imageData = canvas.toDataURL(imageType);

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = imageData;
    link.download = `rover-${camera.label}-${timestamp}.png`;
    link.click();

    console.log(`Captured frame from ${camera.label}`);
  }, [camera.label]);

  const goFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (video == null) return;
    video.requestFullscreen();
  }, [baseUrl, camera.id]);

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
          setFps(null);
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
          startFpsCounter();
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

  // Reconnect on rover reconnect
  useRoverWatchdog(() => {
    console.warn("recovering camera stream")
    startStream();
  })

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{
          minWidth: 0,
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>{camera.label}</span>
        <StatusBadge status={status} fps={fps} />
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
      <div style={styles.footer}>
        <div style={{marginLeft: 10, marginRight: "auto", lineHeight: 2}}>{fps ?? "--"} FPS</div>
        <button
          onClick={captureFrame}
          disabled={status !== "live"}
          style={{
            ...styles.actionBtn,
            opacity: status === "live" ? 1 : 0.5,
            cursor: status === "live" ? "pointer" : "not-allowed",
          }}
        >
          <CameraIcon style={{ width: 24, height: 24 }} />
        </button>
        <button
          onClick={goFullscreen}
          disabled={status !== "live"}
          style={{
            ...styles.actionBtn,
            opacity: status === "live" ? 1 : 0.5,
            cursor: status === "live" ? "pointer" : "not-allowed",
          }}
        >
          <ArrowsPointingOutIcon style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  );
}

// Simple Sub-component for the little status dot
function StatusBadge({ status, fps }: { status: ConnectionStatus, fps: number | null }) {
 
  const map = {
    "idle": { color: "disabled" as StatusColor, text: "Buffering", dot: false },
    "connecting": { color: "warning" as StatusColor, text: "Connecting", dot: false },
    "live": { color: "error" as StatusColor, text: "LIVE", dot: true },
    "failed": { color: "disabled" as StatusColor, text: "Error", dot: false },
  };

  const item = (fps === null && status === "live") ? map["idle"] : map[status];

  return (
    <StatusChip color={item.color} label={item.text} noDot={!item.dot} />
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8
  },
  videoWrapper: {
    position: "relative" as const,
    paddingTop: "75%",
    background: "#000",
    borderRadius: 8,
    overflow: "hidden",
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
  footer: {
    paddingTop: 10,
    display: "flex",
    justifyContent: "flex-end", // Aligns button to right
    gap: 0,
  },
  actionBtn: {
    color: "#fff",
    padding: "8px 12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
};
