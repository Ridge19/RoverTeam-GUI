import React, { useState, useEffect, memo } from "react"
import styles from "./TelemetryWidget.module.scss"
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

interface WidgetProps {
    augerId: number
}

const STEPS_MAP: Record<number, number[]> = {
    1: [130, 260, 1300],  // 130 steps per mm
    2: [25, 250, 1250],  // 25 steps per mm
    3: [20, 50, 100],
}
const MM_PER_STEPS_MAP: Record<number, number> = {
    1: 130,
    2: 25
}
const ID_MAP: Record<number, string> = {
    1: "Auger Stepper",
    2: "Microscope Stepper",
    3: "Microscope Swivel",
};

const AugerWidget = memo(({
    augerId,
}: WidgetProps) => {
    const { getEndpointsOfService } = useEndpoints();
    const { roverStatus } = useTelemetryContext();

    // const [drillSpeed, setDrillSpeed] = useState<number>(0);

    const [inputSteps, setInputSteps] = useState<number>(0);

    const handleStepperSubmit = async (motorId: number, steps: number) => {
        await ScienceService.setStepperStep(
            window.location.href,
            getEndpointsOfService,
            motorId,
            steps,
        );
    };

    const scienceData = roverStatus.find((s) => s.data.science_data)?.data
        ?.science_data;
    const displaySteps = scienceData?.stepper_motors?.[augerId] ?? 0;


    return (
        <div className={styles.AugerWidget}>
            <div className={styles.Title}>
                <h3>{ID_MAP[augerId]}</h3>
                <h5>Id {augerId}</h5>
            </div>
            <div className={styles.Contents}>
                <div className={styles.InputContainer}>
                    <div className={styles.Inputs}>
                        <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][0])}>-{STEPS_MAP[augerId][0]}</button>
                        <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][0])}>+{STEPS_MAP[augerId][0]}</button>
                        <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][1])}>-{STEPS_MAP[augerId][1]}</button>
                        <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][1])}>+{STEPS_MAP[augerId][1]}</button>
                        <button onClick={() => handleStepperSubmit(augerId, -STEPS_MAP[augerId][2])}>-{STEPS_MAP[augerId][2]}</button>
                        <button onClick={() => handleStepperSubmit(augerId, STEPS_MAP[augerId][2])}>+{STEPS_MAP[augerId][2]}</button>
                    </div>
                    <div className={styles.Steps}>
                        {augerId != 3 &&
                            <h4> {MM_PER_STEPS_MAP[augerId]} steps per mm</h4>
                        }
                    </div>
                    <hr />
                    <h4>Manual input</h4><span></span>
                    <div className={styles.Inputs}>
                        <input
                            type="number"
                            value={inputSteps}
                            onChange={(e) => setInputSteps(Number(e.target.value))}
                        />
                        <button onClick={() => handleStepperSubmit(augerId, inputSteps)}>Step</button>
                    </div>
                </div>
                <div className={styles.VerticalRule}></div>
                <div className={styles.OutputContainer}>
                    <div className={styles.TelemetryDisplay}>
                        <h1>{displaySteps}</h1>
                        <h4 className={styles.Units}> Steps</h4>
                    </div>
                </div>
            </div>
        </div >
    );
});

export default AugerWidget