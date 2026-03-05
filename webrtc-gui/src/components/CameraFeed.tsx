import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, useCameraStreams, ConnectionStatus } from "@/contexts/CameraStreamsContext";
import StatusChip, { StatusColor } from "./StatusChip";
import { CameraIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";

interface CameraFeedProps {
  camera: Camera;
}

export const CameraFeed: React.FC<React.PropsWithChildren<CameraFeedProps>> = ({ camera, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { getStream, getStatus, getError, start } = useCameraStreams();

  const [fps, setFps] = useState<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const rafActiveRef = useRef(false);
  const [showSaved, setShowSaved] = useState(false);

  const stream = getStream(camera);
  const status = getStatus(camera);
  const errorMessage = getError(camera);

  // Attach stream to video element
  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {});

    startFpsCounter();

    return () => {
      rafActiveRef.current = false;
      setFps(null);
    };
  }, [stream]);

  // Ensure camera is always started
  useEffect(() => {
    start(camera);
  }, [camera, start]);

  // --- FPS counter ---
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
        const calculated = frameCountRef.current / (elapsed / 1000);
        setFps(calculated >= 1 ? Math.round(calculated) : null);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      if (rafActiveRef.current) {
        video.requestVideoFrameCallback(onFrame);
      }
    };

    video.requestVideoFrameCallback(onFrame);
  }, []);

  // --- Screenshot ---
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = dataUrl;
    link.download = `camera-${camera.id}-${ts}.png`;
    link.click();
  }, [camera]);

  // --- Fullscreen ---
  const goFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, []);

  const isPlaceholder = !camera;

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {camera.label}
        </span>
        <StatusBadge status={status} fps={fps} />
      </div>

      {/* Video */}
      <div style={styles.videoWrapper}>
        {status === "connecting" && (
          <div style={styles.overlay}>
            <div className="spinner">Connecting…</div>
          </div>
        )}

        {status === "failed" && (
          <div style={styles.overlay}>
            <p style={{ color: "#f55", marginBottom: 10 }}>OFFLINE</p>
            <button onClick={() => start(camera)} style={styles.retryBtn}>
              Retry
            </button>
            <p style={{ fontSize: 10, marginTop: 5 }}>{errorMessage}</p>
          </div>
        )}

        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />

        <div style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
        }}>{children}</div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={{ marginLeft: 10, marginRight: "auto", lineHeight: 2 }}>{fps ?? "--"} FPS</div>

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

      {showSaved && <div style={styles.savedOverlay}>Saved!</div>}
    </div>
  );
};

/* ---------- Status Badge ---------- */

function StatusBadge({ status, fps }: { status: ConnectionStatus; fps: number | null }) {
  const map = {
    idle: { color: "disabled" as StatusColor, text: "Buffering", dot: false },
    connecting: { color: "warning" as StatusColor, text: "Connecting", dot: false },
    live: { color: "error" as StatusColor, text: "LIVE", dot: true },
    failed: { color: "disabled" as StatusColor, text: "Error", dot: false },
  };
  const item = fps === null && status === "live" ? map.idle : map[status];
  return <StatusChip color={item.color} label={item.text} noDot={!item.dot} />;
}

/* ---------- Styles ---------- */

const styles = {
  card: { background: "#222", padding: 10, borderRadius: 8, overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  videoWrapper: { position: "relative" as const, paddingTop: "75%", background: "#000", borderRadius: 8, overflow: "hidden" },
  video: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" as const },
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
  retryBtn: { background: "#444", color: "#fff", border: "1px solid #666", padding: "5px 15px", cursor: "pointer", borderRadius: 4 },
  footer: { paddingTop: 10, display: "flex", justifyContent: "flex-end" },
  actionBtn: { color: "#fff", padding: "8px 12px", fontSize: "0.85rem", fontWeight: "bold", transition: "background 0.2s" },
  savedOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    color: "#0f0",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    zIndex: 20,
  },
};