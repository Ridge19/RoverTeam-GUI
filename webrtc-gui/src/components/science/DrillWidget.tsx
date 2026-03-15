
import React, { useState, useEffect, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

const DrillWidget = () => {
    const { getEndpointsOfService } = useEndpoints();
    const { roverStatus } = useTelemetryContext();

    const [drillSpeed, setDrillSpeed] = useState<number>(0);

    const handleDrillSubmit = async () => {
        await ScienceService.setDrillSpeed(
            window.location.href,
            getEndpointsOfService,
            drillSpeed,
        );
    };

    const scienceData = roverStatus.find((s) => s.data.science_data)
        ?.data?.science_data;
    const displaySpeed = scienceData?.drill ?? 0;
        
    return (
      <div className={styles.DrillWidget}>
        <div className={styles.Inputs}>
            <input
            type="number"
            value={drillSpeed}
            onChange={(e) => setDrillSpeed(Number(e.target.value))}
            />
            <button onClick={handleDrillSubmit}>Set Speed</button>
        </div>
        <h3>Drill</h3>
        <h5>Motor 0</h5>
        <p>{displaySpeed}</p>
      </div>
    );
}

export default DrillWidget