import React, { useState, useEffect, useRef, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useEndpoints } from "@/contexts/EndpointContext";
import { useStepperData } from "@/hooks/science/useScienceTelemetry";
import ScienceService from "@/services/ScienceService";
import { useHotkeys } from "react-hotkeys-hook"

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
  1: "Microscope Rotation",
  2: "Microscope Stepper",
  3: "Extraction Stepper",
};

const AugerWidget = memo(({ augerId, handleSentSteps }: WidgetProps) => {
  const { getEndpointsOfService } = useEndpoints();

  const pendingSteps = useStepperData(augerId);

  const [targetPosition, setTargetPosition] = useState<number>(0);
  const [animatedPosition, setAnimatedPosition] = useState<number>(0);
  const [inputSteps, setInputSteps] = useState<number | string>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('r', (event) => {
    if (inputRef.current && augerId == 1) {
      event.preventDefault();
      inputRef.current.focus();
      inputRef.current.select();
    }
  });

  useHotkeys('e', (event) => {
    if (inputRef.current && augerId == 3) {
      event.preventDefault();
      inputRef.current.focus();
      inputRef.current.select();
    }
  });

  useHotkeys('m', (event) => {
    if (inputRef.current && augerId == 2) {
      event.preventDefault();
      inputRef.current.focus();
      inputRef.current.select();
    }
  });

  useHotkeys('esc', (event) => {
    event.preventDefault();
    if (document.activeElement === inputRef.current) {
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }, { enableOnFormTags: ['input'] })

  useHotkeys('-', (event) => {
    if (document.activeElement === inputRef.current) {
      event.preventDefault(); // Stop the "-" from appearing at the cursor position

      setInputSteps((prev) => {
        const stringVal = String(prev);

        if (stringVal.startsWith('-')) {
          return stringVal.substring(1); // Remove minus
        } else {
          // If value is 0 or empty, just make it a minus sign
          return (stringVal === '0' || stringVal === '') ? '-' : '-' + stringVal;
        }
      });
    }
  }, { enableOnFormTags: ['input'] })


  useEffect(() => {
    if (animatedPosition === targetPosition) return;

    const animationTimeout = setTimeout(() => {
      const diff = targetPosition - animatedPosition;

      // Move faster if the gap is large, but at least 1 step
      const stepSize = Math.max(1, Math.abs(Math.floor(diff / 10)));

      setAnimatedPosition((prev) => {
        if (prev < targetPosition) return Math.min(prev + stepSize, targetPosition);
        if (prev > targetPosition) return Math.max(prev - stepSize, targetPosition);
        return prev;
      });
    }, 20);

    return () => clearTimeout(animationTimeout);
  }, [animatedPosition, targetPosition]);


  const handleStepperSubmit = async (motorId: number, steps: number | string) => {
    const stepsNum = Number(steps)
    const currentPos = Math.round(animatedPosition);
    const newTarget = currentPos + stepsNum;

    setTargetPosition(newTarget);

    await ScienceService.setStepperStep(
      getEndpointsOfService,
      motorId,
      stepsNum,
    );

    // if (handleSentSteps) handleSentSteps(steps);
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
              <h1>{animatedPosition}</h1>
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
          <form className={styles.Inputs} onSubmit={(event) => { event.preventDefault(); handleStepperSubmit(augerId, inputSteps) }}>
            <input
              type="text"
              value={inputSteps}
              onChange={(e) => {
                const val = e.target.value;
                if (inputSteps == 0 || inputSteps == "0") {
                  setInputSteps(val);
                }
                if (/^-?\d*$/.test(val)) {
                  setInputSteps(val);
                }
              }}
              onFocus={(e) => {
                // setInputSteps(0);
                e.target.select();
              }}
              ref={inputRef}
            />
            <button onClick={() => handleStepperSubmit(augerId, inputSteps)}>
              Step
            </button>
          </form>
        </div>
      </div>
    </div >
  );
});

export default AugerWidget;
