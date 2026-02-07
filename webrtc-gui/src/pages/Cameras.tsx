import React, { useEffect, useState } from "react";
import { CAMERA_GRID } from "@/layout/cameraLayout";
import { useCameraStreams, Camera } from "@/contexts/CameraStreamsContext";
import { CameraFeed } from "@/components/CameraFeed";

export const Cameras: React.FC = () => {
  const { cameras, loading, fetchCameras } = useCameraStreams();
  const [refreshing, setRefreshing] = useState(false);

  // Pre-fetch /cameras for all endpoints to ensure IDs are loaded
  useEffect(() => {
    let cancelled = false;

    const loadCameras = async () => {
      for (const cam of cameras) {
        await fetchCameras(cam.endpoint.replace(`:${cam.port}`, ""), cam.port);
      }
    };

    loadCameras();

    return () => {
      cancelled = true;
    };
  }, [cameras, fetchCameras]);

  const columnWidth = `calc((100% - ${CAMERA_GRID.GAP * 2}px) / ${CAMERA_GRID.COLUMNS})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
      {/* Cameras Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidth}, ${columnWidth}))`,
          justifyContent: "center",
          gap: CAMERA_GRID.GAP,
          padding: CAMERA_GRID.MARGIN,
          maxHeight: "calc(100% - 110px)",
          overflowY: "visible",
          flexShrink: 0,
        }}
      >
        {cameras.map((cam: Camera) => (
          <div key={`${cam.endpoint}:${cam.id}`} style={{ minWidth: columnWidth }}>
            <CameraFeed camera={cam} />
          </div>
        ))}

      </div>

      {(loading && cameras.length === 0) && <div style={styles.savedOverlay}><img src="Loading_Dots.gif" style={{width: "30%"}}/></div>}
      {(!loading && cameras.length === 0) && <div style={styles.savedOverlay}>No available cameras</div>}
    </div>
  );
};

const styles = {savedOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    color: "#fff",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    zIndex: 20,
}}

export default Cameras;