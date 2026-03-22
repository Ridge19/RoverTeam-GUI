import React, { useState, useEffect, Suspense } from "react";
import DrillWidget from "@/components/science/DrillWidget"
import AugerWidget from "@/components/science/AugerWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import MicroscopeCamera from "@/components/science/MicroscopeCamera"
import styles from "./Science.module.scss"
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei"
import ScienceModel from "@/components/science/ScienceModel"; // Import the component
import { useScienceData } from "@/hooks/science/useScienceTelemetry"
import Spectrometer from "@/components/science/Spectrometer"

const ScienceControl: React.FC = () => {
  const [sentSteps, setSentSteps] = useState<Array<number>>([]);

  const handleSentSteps = (motor_idx: number, steps: number) => {
    setSentSteps((prevSentSteps) =>
      prevSentSteps.map((value, index) =>
        index === motor_idx ? steps : value
      ))
  }

  const scienceData = useScienceData()

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
          </div>
          <HeatpadWidget />
        </div>
        <div className={styles.MiddleColumn}>
          <div className={styles.MicroscopeContainer}>
            <div>
              <MicroscopeCamera />
            </div>
            <Spectrometer />
          </div>
        </div>
        <div className={styles.ModelContainer}>
          <Canvas camera={{ position: [50, 50, 50], fov: 45, zoom: 0.8 }}>
            <Suspense fallback={null}>
              <Stage environment="sunset" intensity={0.5}>
                <ScienceModel />
              </Stage>
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
      </div >
    </div>
  );
};

export default ScienceControl
