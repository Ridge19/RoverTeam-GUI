import React, { useState, useEffect, Suspense } from "react";
import DrillWidget from "@/components/science/DrillWidget"
import AugerWidget from "@/components/science/AugerWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import MicroscopeCamera from "@/components/science/MicroscopeCamera"
import SpectroscopyGraph from "@/components/science/SpectroscopyGraph"
import styles from "./Science.module.scss"
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei"
import ScienceModel from "@/components/science/ScienceModel"; // Import the component
import { useScienceData, useSpectrometerData } from "@/hooks/science/useScienceTelemetry"
import { useHotkeys } from 'react-hotkeys-hook'

const ScienceControl: React.FC = () => {
  const [sentSteps, setSentSteps] = useState<Array<number>>([]);

  const handleSentSteps = (motor_idx: number, steps: number) => {
    setSentSteps((prevSentSteps) =>
      prevSentSteps.map((value, index) =>
        index === motor_idx ? steps : value
      ))
  }

  const scienceData = useScienceData()
  const spectrometerData = useSpectrometerData()

  // The 289th element (index 288) is the distance value
  const spectralChannels = spectrometerData.length >= 289 ? spectrometerData.slice(1, 288) : spectrometerData;
  const distanceValue = spectrometerData.length >= 289 ? spectrometerData[288] : null;



  useEffect(() => {
    console.log(sentSteps);
  }, [sentSteps])
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#aaa" }}>Space Resources Control</h2>

      <div className={styles.ScienceControl}>
        <div className={styles.ControlSidebar}>
          <div className={styles.MotorControl}>
            <AugerWidget augerId={2} handleSentSteps={handleSentSteps} />
            <AugerWidget augerId={3} handleSentSteps={handleSentSteps} />
            <DrillWidget handleSentSteps={handleSentSteps} />
            <AugerWidget augerId={1} handleSentSteps={handleSentSteps} />
            <HeatpadWidget motorId={4} />
            <HeatpadWidget motorId={5} />
          </div>
        </div>
        <div className={styles.MiddleColumn}>
          <div className={styles.MicroscopeContainer}>
            <MicroscopeCamera />
          </div>

          <div className={styles.SpectrumContainer}>
            <h3 style={{ color: "#aaa", marginTop: 0, marginBottom: 12, fontSize: 16 }}>Light Spectrum{spectrometerData.length === 0 ? " (Waiting…)" : " (Live)"}</h3>
            <SpectroscopyGraph spectralChannels={spectralChannels} isLive={spectrometerData.length > 0} />

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              padding: "12px 16px",
              background: "#1a1a1a",
              borderRadius: 12,
              border: "1px solid #333"
            }}>
              <span style={{ color: "#aaa", fontSize: 14, fontWeight: 500 }}>Distance</span>
              <span style={{
                color: distanceValue !== null ? "#4fc3f7" : "#666",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "monospace",
                letterSpacing: 1
              }}>
                {distanceValue !== null ? `${distanceValue} mm` : "—"}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.ModelContainer}>
          <Canvas camera={{ position: [50, 50, 50], fov: 45, zoom: 0.8 }}>
            <Suspense fallback={null}>
              <ScienceModel />
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
      </div >
    </div>
  );
};

export default ScienceControl
