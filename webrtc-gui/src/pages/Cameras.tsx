import React from "react";
import { useCameraList, Camera } from "@/hooks/useCameraList";
import { useRoverUrl } from "@/hooks/useRoverUrl";
import { CameraFeed } from "@/components/CameraFeed";
import { CAMERA_GRID } from "@/layout/cameraLayout";

const Cameras: React.FC = () => {
  const { cameras, loading, error } = useCameraList();
  const Roverurl = useRoverUrl();

  const columnWidth = `calc((100% - ${CAMERA_GRID.GAP * 2}px) / ${CAMERA_GRID.COLUMNS})`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidth}, ${columnWidth}))`,
        justifyContent: "center",
        gap: CAMERA_GRID.GAP,
        padding: CAMERA_GRID.MARGIN,

        maxHeight: "calc(100% - 110px)",       // don't let it grow beyond parent
        overflowY: "auto",       // allow vertical scroll if content exceeds height
        flexShrink: 0,           // prevent flexbox from shrinking/stretching it
      }}
    >
      {cameras.map((cam) => (
        <div
          key={cam.id}
          style={{
            minWidth: columnWidth,
          }}
        >
          <CameraFeed camera={cam} baseUrl={Roverurl} />
        </div>
      ))}

      {!loading && cameras.length === 0 && !error && (
        <p>No cameras detected on the rover.</p>
      )}

      {loading && (
        <p>Loading cameras...</p>
      )}
    </div>
  );
};

export default Cameras;
