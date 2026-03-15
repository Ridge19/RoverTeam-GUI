import React, { useState, useEffect, memo } from "react"
import styles from "./TelemetryWidget.module.scss"
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

interface WidgetProps {
    augerId: number
    label?: string
    steps?: number
}

const ID_MAP: Record<number, string> = {
    1: "Extraction Auger",
    2: "Microscope Auger",
    3: "Microscope Swivel",
};

const AugerWidget = memo(({
  augerId,
}: WidgetProps) => {
    const { getEndpointsOfService } = useEndpoints();
    const { roverStatus } = useTelemetryContext();

    // const [drillSpeed, setDrillSpeed] = useState<number>(0);
    
    const [inputSteps, setInputSteps] = useState<number>(0);
    
    const handleStepperSubmit = async (motorId: number) => {
      await ScienceService.setStepperStep(
        window.location.href,
        getEndpointsOfService,
        motorId,
        inputSteps,
      );
    };
    
    const scienceData = roverStatus.find((s) => s.data.science_data)?.data
      ?.science_data;
    const displaySteps = scienceData?.stepper_motors?.[augerId] ?? 0;


    return (
      <div className={styles.AugerWidget}>
        <div>
          <input
            type="number"
            value={inputSteps}
            onChange={(e) => setInputSteps(Number(e.target.value))}
            style={{
              background: "#333",
              color: "white",
              padding: 5,
              width: 60,
            }}
          />
          <button onClick={() => handleStepperSubmit(augerId)}>Step</button>
        </div>

        <h3>{ID_MAP[augerId]}</h3>
        <h5>Motor {augerId}</h5>
        <p>{displaySteps}</p>
      </div>
    );
});

export default AugerWidget