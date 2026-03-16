import React, { useState } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useHeatpadData } from "@/hooks/science/useScienceTelemetry";
import ScienceService from "@/services/ScienceService";

const HeatpadWidget = () => {
  const { getEndpointsOfService } = useEndpoints();
  const heatpadIsOn = useHeatpadData();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const nextState = heatpadIsOn ? 0 : 1;

    try {
      await ScienceService.setHeatpad(
        window.location.href,
        getEndpointsOfService,
        nextState,
      );
    } catch (error) {
      console.error("Failed to toggle heatpad:", error);
      alert("Command failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.HeatpadWidget}>
      <div className={styles.Title}>
        <h3>Heatpad</h3>
      </div>

      <hr />

      <div className={styles.Inputs} style={{ gridTemplateColumns: "1fr" }}>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={heatpadIsOn ? styles.active : styles.inactive}
          style={{ width: "100%" }}
        >
          {loading ? "SENDING..." : heatpadIsOn ? "TURN OFF" : "TURN ON"}
        </button>
      </div>
    </div>
  );
};

export default HeatpadWidget;
