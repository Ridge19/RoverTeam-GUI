
import React, { useState, useEffect, memo } from "react";
import styles from "./TelemetryWidget.module.scss";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import ScienceService from "@/services/ScienceService";

const DrillWidget = () => {
    const { getEndpointsOfService } = useEndpoints();
    const { roverStatus } = useTelemetryContext();

    const [drillSpeed, setDrillSpeed] = useState<number>(0);

    const handleDrillSubmit = async (speed: number) => {
        await ScienceService.setDrillSpeed(
            window.location.href,
            getEndpointsOfService,
            speed,
        );
    };

    const scienceData = roverStatus.find((s) => s.data.science_data)
        ?.data?.science_data;
    const displaySpeed = scienceData?.drill ?? 0;

    return (
        <div className={styles.DrillWidget}>
            <div className={styles.Title}>
                <h3>Drill</h3>
                <h5>Id 0</h5>
            </div>
            <div className={styles.Contents}>
                <div className={styles.InputContainer}>
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
                <div className={styles.VerticalRule}></div>
                <div className={styles.OutputContainer}>
                    <div className={styles.TelemetryDisplay}>
                        <h1>{displaySpeed}</h1>
                        <h4 className={styles.Units}> PWM</h4>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default DrillWidget