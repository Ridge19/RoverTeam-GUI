
import React, { useState, useEffect, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useDrillData } from "@/hooks/science/useScienceTelemetry"
import ScienceService from "@/services/ScienceService";

interface WidgetProps {
  handleSentSteps: Function;
}

const DrillWidget = (handleSentSteps: WidgetProps) => {
  const { getEndpointsOfService } = useEndpoints();

  const [drillSpeed, setDrillSpeed] = useState<number>(0);

  const handleDrillSubmit = async (speed: number) => {
    await ScienceService.setDrillSpeed(
      '192.168.40.2',
      getEndpointsOfService,
      speed,
    );
  };

  const displaySpeed = useDrillData()

  return (
    <div className={styles.DrillWidget}>
      <div className={styles.Title}>
        <h3>Drill</h3>
        <h5>Id 0</h5>
      </div>
      <div className={styles.Contents}>
        <div className={styles.InputContainer}>
          <div className={styles.OutputContainer}>
            <div className={styles.TelemetryDisplay}>
              <h1 className={styles.StepperText}>{displaySpeed}</h1>
              <h4 className={styles.Units}> PWM</h4>
            </div>
          </div>
          <div className={styles.Inputs}>
            <button onClick={() => handleDrillSubmit(-50)}>-50</button>
            <button onClick={() => handleDrillSubmit(-50)}>50</button>
            <button onClick={() => handleDrillSubmit(-100)}>-100</button>
            <button onClick={() => handleDrillSubmit(100)}>100</button>
            <button onClick={() => handleDrillSubmit(-200)}>-200</button>
            <button onClick={() => handleDrillSubmit(200)}>200</button>
          </div>
          <hr />
          <h4>Manual input</h4>
          <div className={styles.Inputs}>
            <input
              type="number"
              value={drillSpeed}
              onChange={(e) => setDrillSpeed(Number(e.target.value))}
            />
            <button onClick={() => handleDrillSubmit(drillSpeed)}>Speed</button>
          </div>
        </div>
        {/* <div className={styles.VerticalRule}></div>
        <div className={styles.OutputContainer}>
          <div className={styles.TelemetryDisplay}>
            <h1 className={styles.StepperText}>{displaySpeed}</h1>
            <h4 className={styles.Units}> PWM</h4>
          </div>
        </div> */}
      </div>
    </div >
  );
}

export default DrillWidget