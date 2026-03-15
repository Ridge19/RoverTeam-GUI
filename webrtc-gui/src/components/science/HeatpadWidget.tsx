import React, { useState, useEffect, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

const HeatpadWidget = () => {
    const { getEndpointsOfService } = useEndpoints();
    const { roverStatus } = useTelemetryContext();

    const [isOn, setIsOn] = useState<boolean>(false);

    const scienceData = roverStatus.find((s) => s.data.science_data)?.data
    ?.science_data;

     useEffect(() => {
       if (scienceData?.heatpad_status !== undefined) {
         setIsOn(!!scienceData.heatpad_status);
       }
     }, [scienceData]);

    const handleToggle = async () => {
      const nextState = isOn ? 0 : 1;
      try {
        await ScienceService.toggleHeatpad(
          window.location.href,
          getEndpointsOfService,
          nextState,
        );
        // Only update local state if the request succeeds
        setIsOn(!isOn);
      } catch (error) {
        console.error("Failed to toggle heatpad:", error);
      }
    };

    return (
      <div style={{ background: "#222", padding: 15, borderRadius: 8 }}>
        <h3>Heatpad Control</h3>
        <button
          onClick={handleToggle}
          style={{
            background: isOn ? "#4caf50" : "#f44336",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isOn ? "Heatpad is ON" : "Heatpad is OFF"}
        </button>
      </div>
    );
    };

export default HeatpadWidget;
