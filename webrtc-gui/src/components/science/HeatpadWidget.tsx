import React, { useState, useRef } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useHeatpadData, useSensorData } from "@/hooks/science/useScienceTelemetry";
import ScienceService from "@/services/ScienceService";
import { useHotkeys } from 'react-hotkeys-hook'

const ID_MAP: Record<number, string> = {
  4: "Heating Rods",
  5: "Condenser",
};

interface TemperatureProps {
  motorId: number
}

const HeatpadWidget = ({ motorId }: TemperatureProps) => {
  const { getEndpointsOfService } = useEndpoints();
  const heatpadIsOn = useHeatpadData();
  const [loading, setLoading] = useState(false);

  const temperature = useSensorData(motorId)

  const toggleRef = useRef<HTMLButtonElement>(null);

  useHotkeys('h', () => {
    if (toggleRef.current && motorId == 4) {
      toggleRef.current.click();
    }
  });
  useHotkeys('c', () => {
    if (toggleRef.current && motorId == 5) {
      toggleRef.current.click();
    }
  });


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
        <h3>{ID_MAP[motorId]}</h3>
        <h5>Id 4</h5>
      </div>
      <div className={styles.HeatpadContainer}>
        <div className={styles.OutputContainer}>
          <div className={styles.TelemetryDisplay}>
            <div className={styles.HeaterTelemetry}>
              <h1 className={styles.StepperText}>{temperature}</h1>
              <h4 className={styles.Units}> °C</h4>
            </div>
          </div>
        </div>
        <div className={styles.Inputs} style={{ gridTemplateColumns: "1fr" }}>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={heatpadIsOn ? styles.active : styles.inactive}
            style={{ width: "100%" }}
            ref={toggleRef}
          >
            {loading ? "SENDING..." : heatpadIsOn ? "TURN OFF" : "TURN ON"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeatpadWidget;
