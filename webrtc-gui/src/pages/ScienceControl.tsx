import React from "react";
import AugerWidget from "@/components/science/AugerWidget"
import DrillWidget from "@/components/science/DrillWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import styles from "./Science.module.scss"

const ScienceControl: React.FC = () => {
    return (
        <div
            style={{
                height: "calc(100% - 110px)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ display: "flex", flexDirection: "row", flex: 1, gap: 20 }}
            >
                {/* Left Column: Controls */}
                <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
                    <div style={{
                        flex: 1,
                        background: "#1a1a1a",
                        padding: 20,
                        borderRadius: 8,
                    }}
                    >
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 20,
                        }}
                        >
                            <div style={{ flex: 1, padding: 20, color: "#aaa" }}>
                                <h2>Telemetry Feed</h2>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <DrillWidget />
                                    <AugerWidget augerId={1} />
                                    <AugerWidget augerId={2} />
                                    <AugerWidget augerId={3} />
                                    <HeatpadWidget />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column: Status/Visualization */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                }}
                >

                </div>
            </div>
        </div >
    );
};

export default ScienceControl;