
import React, { useState, useRef, } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useDrillData } from "@/hooks/science/useScienceTelemetry"
import ScienceService from "@/services/ScienceService";
import { useHotkeys } from "react-hotkeys-hook"
interface WidgetProps {
  handleSentSteps: Function;
}

const DrillWidget = (handleSentSteps: WidgetProps) => {
  const { getEndpointsOfService } = useEndpoints();

  const [drillSpeed, setDrillSpeed] = useState<number | string>(0);

  const handleDrillSubmit = async (speed: number | string) => {
    const speedNum = Number(speed);
    await ScienceService.setDrillSpeed(
      getEndpointsOfService,
      speedNum,
    );
  };

  const displaySpeed = useDrillData()


  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('d', (event) => {
    if (inputRef.current) {
      event.preventDefault();
      inputRef.current.focus();
    }
  });

  useHotkeys('esc', (event) => {
    if (inputRef.current) {
      event.preventDefault();
      inputRef.current.blur()
    }
  }, { enableOnFormTags: ['input'] })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string, single minus sign, or valid integers
    if (val === "" || val === "-" || /^-?\d*$/.test(val)) {
      setDrillSpeed(val);
    }
  };

  useHotkeys('-', (event) => {
    if (document.activeElement === inputRef.current) {
      event.preventDefault(); // Stop "-" from being typed twice
      setDrillSpeed((prev) => {
        const stringVal = String(prev);
        if (stringVal.startsWith('-')) {
          return stringVal.substring(1); // Remove minus
        } else {
          return (stringVal === '0' || stringVal === '') ? '-' : '-' + stringVal;
        }
      });
    }
  }, { enableOnFormTags: ['input'] });

  return (
    <div className={styles.DrillWidget}>
      <div className={styles.Title}>
        <h3>Drill</h3>
        <h5>Id 0</h5>
      </div>
      <div className={styles.Contents}>
        <div className={styles.OutputContainer}>
          <div className={styles.TelemetryDisplay}>
            <div className={styles.Row}>
              <div className={styles.Column}>
                <h4>Speed</h4>
                <h1 className={styles.StepperText}>{displaySpeed}</h1>
                <h4 className={styles.Units}> PWM</h4>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className={styles.InputContainer}>
          <div className={styles.Inputs}>
            <button onClick={() => handleDrillSubmit(-50)}>-50</button>
            <button onClick={() => handleDrillSubmit(-50)}>50</button>
            <button onClick={() => handleDrillSubmit(-100)}>-100</button>
            <button onClick={() => handleDrillSubmit(100)}>100</button>
            <button onClick={() => handleDrillSubmit(-200)}>-200</button>
            <button onClick={() => handleDrillSubmit(200)}>200</button>
          </div>

          <h4>Manual input</h4>
          <form className={styles.Inputs} onSubmit={(event) => { event.preventDefault(); handleDrillSubmit(drillSpeed) }}>
            <input
              type="text"
              value={drillSpeed}
              onChange={handleInputChange}
              onFocus={(e) => { e.target.select(); }}
              ref={inputRef}
            />
            <button onClick={(event) => { event.preventDefault(); handleDrillSubmit(drillSpeed) }}>Speed</button>
          </form>
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