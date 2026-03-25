import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, useCameraStreams, ConnectionStatus } from "@/contexts/CameraStreamsContext";
import StatusChip, { StatusColor } from "./StatusChip";
import { CameraIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { useEndpoints } from "@/contexts/EndpointContext"

interface CameraFeedProps {
  camera: Camera;
  showOverlay?: boolean;
  setShowOverlay?: (val: boolean) => void;
}

export const CameraFeed: React.FC<React.PropsWithChildren<CameraFeedProps>> = ({
  camera,
  children,
  showOverlay,
  setShowOverlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { getStream, getStatus, getError, start } = useCameraStreams();

  const [fps, setFps] = useState<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const rafActiveRef = useRef(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const stream = getStream(camera);
  const status = getStatus(camera);
  const errorMessage = getError(camera);

  const videoStyle = {
    ...styles.video,
    transform: isFlipped ? "scaleY(-1)" : "scaleX(1)",
  };

  // Attach stream to video element
  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => { });

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

  const { getEndpointsOfService } = useEndpoints();

  // --- Screenshot ---
  const captureFrame = useCallback(async () => {
    if (status !== "live") return;

    let bgUrl = "";
    let svgUrl = "";

    const downloadFile = (url: string, suffix: string) => {
      const link = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `camera-${camera.id}-${ts}_${suffix}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    try {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);

      // 1. Fetch High-Quality raw frame from Python Backend
      const response = await fetch(`${getEndpointsOfService('cameras')}/capture-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_id: camera.id })
      });

      if (!response.ok) throw new Error("Backend capture failed");

      const rawBlob = await response.blob();
      bgUrl = URL.createObjectURL(rawBlob);

      // --- DOWNLOAD 1: THE RAW IMAGE ---
      // We download the raw blob directly for maximum speed and quality
      downloadFile(bgUrl, "raw");

      // 2. Prepare for the Overlay Image
      const bgImg = new Image();
      bgImg.src = bgUrl;
      await new Promise((resolve) => { bgImg.onload = resolve; });

      const canvas = document.createElement("canvas");
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the raw background onto the canvas
      ctx.drawImage(bgImg, 0, 0);

      // 3. Capture the SVG Overlay
      const svgElement = videoRef.current?.parentElement?.querySelector("svg");
      if (svgElement) {
        const svgClone = svgElement.cloneNode(true) as SVGElement;
        svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        svgUrl = URL.createObjectURL(svgBlob);

        const svgImg = new Image();
        svgImg.src = svgUrl;

        await new Promise((resolve) => { svgImg.onload = resolve; });

        // Draw SVG over the background (scaled to match hardware res)
        ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);

        // --- DOWNLOAD 2: THE OVERLAY IMAGE ---
        const overlayDataUrl = canvas.toDataURL("image/png");
        downloadFile(overlayDataUrl, "overlay");
      }

    } catch (error) {
      console.error("Capture Error:", error);
      alert("Failed to capture images.");
    } finally {
      // Cleanup memory
      if (bgUrl) URL.revokeObjectURL(bgUrl);
      if (svgUrl) URL.revokeObjectURL(svgUrl);
    }
  }, [camera.id, status, getEndpointsOfService]);

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

        <video ref={videoRef} autoPlay playsInline muted style={videoStyle} />

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

        {setShowOverlay &&
          <button onClick={() => { setShowOverlay(!showOverlay) }}>
            {showOverlay ?
              <img src="icons/visibility.svg" />
              :
              <img src="icons/visibility_off.svg" />
            }
          </button>
        }

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={styles.actionBtn}
          title="Flip Camera"
        >
          <div style={{ transform: "rotate(90deg)" }}>⇄</div>
        </button>

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
  card: { background: "#222", padding: 10, borderRadius: 8, overflow: "hidden", width: "100%" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  videoWrapper: { position: "relative" as const, paddingTop: "75%", background: "#000", borderRadius: 8, overflow: "hidden" },
  video: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectxt: "cover" as const },
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
  actionBtn: { color: "#fff", padding: "8px 12px", fontSize: "0.85rem", fontWeight: "bold", transition: "background 0.2s", margin: "0px 4px" },
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