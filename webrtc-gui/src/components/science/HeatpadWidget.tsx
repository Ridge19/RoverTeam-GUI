import React, { useState } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useHeatpadData, useSensorData } from "@/hooks/science/useScienceTelemetry";
import ScienceService from "@/services/ScienceService";

const HeatpadWidget = () => {
  const { getEndpointsOfService } = useEndpoints();
  const heatpadIsOn = useHeatpadData();
  const [loading, setLoading] = useState(false);


  const temperature = useSensorData(4)

  const handleToggle = async () => {
    setLoading(true);
    const nextState = heatpadIsOn ? 0 : 1;

    try {
      await ScienceService.setHeatpad(
        getEndpointsOfService,
        nextState
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
        <h5>Id 4</h5>
      </div>
      <div className={styles.OutputContainer}>
        <div className={styles.TelemetryDisplay}>
          <h1 className={styles.StepperText}>{temperature}</h1>
          <h4 className={styles.Units}> °C</h4>
        </div>
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
