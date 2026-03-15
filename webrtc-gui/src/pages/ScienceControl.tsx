import React from "react";
import AugerWidget from "@/components/science/AugerWidget"
import DrillWidget from "@/components/science/DrillWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import MicroscopeCamera from "@/components/science/MicroscopeCamera"
import styles from "./Science.module.scss"

const ScienceControl: React.FC = () => {
    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ color: "#aaa" }}>Telemetry Feed</h2>

            <div className={styles.ScienceControl}>

                <DrillWidget />
                <AugerWidget augerId={1} />
                <AugerWidget augerId={2} />
                <AugerWidget augerId={3} />
                <HeatpadWidget />

                <MicroscopeCamera />
            </div>
        </div >
    );
};

export default ScienceControl