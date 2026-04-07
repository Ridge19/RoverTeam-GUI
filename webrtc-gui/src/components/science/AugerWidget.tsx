import React, { useState, useEffect, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useStepperData } from "@/hooks/science/useScienceTelemetry";
import ScienceService from "@/services/ScienceService";

interface WidgetProps {
  augerId: number;
  handleSentSteps: Function;
}

const STEPS_MAP: Record<number, number[]> = {
  1: [20, 50, 100],
  2: [25, 250, 1250], // 25 steps per mm
  3: [130, 260, 1300], // 130 steps per mm

};
const MM_PER_STEPS_MAP: Record<number, number> = {
  3: 130,
  2: 25,
};
const ID_MAP: Record<number, string> = {
  1: "Swivel",
  2: "Microscope Stepper",
  3: "Extraction Stepper",
};

const AugerWidget = memo(({ augerId, handleSentSteps }: WidgetProps) => {
  const { getEndpointsOfService } = useEndpoints();

  const [inputSteps, setInputSteps] = useState<number>(0);
  const displaySteps = useStepperData(augerId);

  const handleStepperSubmit = async (motorId: number, steps: number) => {
    await ScienceService.setStepperStep(
      getEndpointsOfService,
      motorId,
      steps,
    );
  };

  return (
    <div className={styles.AugerWidget}>
      <div className={styles.Title}>
        <h3>{ID_MAP[augerId]}</h3>
        <h5>Id {augerId}</h5>
      </div>
      <div className={styles.Contents}>
        <div className={styles.InputContainer}>
          <div className={styles.OutputContainer}>
            <div className={styles.TelemetryDisplay}>
              <h1>{displaySteps}</h1>
              <h4 className={styles.Units}> Steps</h4>
            </div>
          </div>
          <hr />
          <div>{augerId != 1 && <h4> {MM_PER_STEPS_MAP[augerId]} steps per mm</h4>}</div>
          <div className={styles.Inputs}>
            <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][0])}>-{STEPS_MAP[augerId][0]}</button>
            <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][0])}>+{STEPS_MAP[augerId][0]}</button>
            <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][1])}>-{STEPS_MAP[augerId][1]}</button>
            <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][1])}>+{STEPS_MAP[augerId][1]}</button>
            <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][2])}>-{STEPS_MAP[augerId][2]}</button>
            <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][2])}>+{STEPS_MAP[augerId][2]}</button>
          </div>
          <h4>Manual input</h4>
          <div className={styles.Inputs}>
            <input
              type="number"
              value={inputSteps}
              onChange={(e) => setInputSteps(Number(e.target.value))}
            />
            <button onClick={() => handleStepperSubmit(augerId, inputSteps)}>
              Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AugerWidget;
