import React, { useState, useEffect, memo } from "react"
import styles from "./TelemetryWidget.module.scss"
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

interface WidgetProps {
    augerId: number
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
            <h3>{ID_MAP[augerId]}</h3>
            <div className={styles.Inputs}>
                <button onClick={() => handleStepperSubmit(augerId, -100)}>-100</button>
                <button onClick={() => handleStepperSubmit(augerId, 100)}>+100</button>
                <button onClick={() => handleStepperSubmit(augerId, -200)}>-200</button>
                <button onClick={() => handleStepperSubmit(augerId, 200)}>+200</button>
                <button onClick={() => handleStepperSubmit(augerId, -400)}>-400</button>
                <button onClick={() => handleStepperSubmit(augerId, 400)}>+400</button>
            </div>
            <h4>Manual input</h4><span></span>
            <div className={styles.Inputs}>
                <input
                    type="number"
                    value={inputSteps}
                    onChange={(e) => setInputSteps(Number(e.target.value))}
                />
                <button onClick={() => handleStepperSubmit(augerId, inputSteps)}>Step</button>
            </div>
            <h5>Motor {augerId}</h5>
            <p>{displaySteps}</p>
        </div>
    );
});

export default AugerWidget