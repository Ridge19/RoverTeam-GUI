import React, { useState } from "react";
import { useCameraList } from "@/hooks/useCameraList";
import { useRoverUrl } from "@/hooks/useRoverUrl";
import { CameraFeed } from "@/components/CameraFeed";
import { CAMERA_GRID } from "@/layout/cameraLayout";
import { ControllerVisual } from "@/components/ControllerVisual";

const ArmControl: React.FC = () => {
  const { cameras, loading, error } = useCameraList();
  const Roverurl = useRoverUrl();

  const columnWidth = `400px`;

  // Hard-coded actuator degrees for demo (replace with real state later)
  const [actuators] = useState([
    { name: "J1", degree: 0 },
    { name: "J2", degree: 0 },
    { name: "J3", degree: 0 },
    { name: "J4", degree: 0 },
    { name: "J5", degree: 0 },
    { name: "J6", degree: 0 },
  ]);

  // Single camera (index 0)
  const cameraToShow = cameras.length > 0 ? cameras[0] : null;

  return (
    <div style={{
        padding: 20,
        maxHeight: "calc(100% - 110px)",       // don't let it grow beyond parent
        overflowY: "auto",       // allow vertical scroll if content exceeds height
        flexShrink: 0,           // prevent flexbox from shrinking/stretching it
    }}>
      {/* Camera view */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
          gap: 20
        }}
    >
        <div style={{ width: columnWidth, display: "flex", flexDirection: "column", gap: 20 }}>
            {cameraToShow && <CameraFeed camera={cameraToShow}/>}
        </div>

{/* Actuator list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: 200,
        }}
      >
        {actuators.map((act) => (
          <div
            key={act.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: "#222",
              borderRadius: 6,
              color: "#eee",
            }}
          >
            <span>{act.name}</span>
            <span>{act.degree}°</span>
          </div>
        ))}

        <ControllerVisual/>
      </div>
    </div>

      </div>

      
  );
};

export default ArmControl;