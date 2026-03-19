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


const ScienceControl: React.FC = () => {
  const [sentSteps, setSentSteps] = useState<Array<number>>([]);

  const handleSentSteps = (motor_idx: number, steps: number) => {
    setSentSteps((prevSentSteps) =>
      prevSentSteps.map((value, index) =>
        index === motor_idx ? steps : value
      ))
  }

  const scienceData = useScienceData()
  useEffect(() => {
    console.log(scienceData)
  }, [scienceData])
  useEffect(() => {
    console.log(sentSteps);
  }, [sentSteps])
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#aaa" }}>Telemetry Feed</h2>

      <div className={styles.ScienceControl}>
        <div className={styles.MotorControl}>
          <AugerWidget augerId={2} handleSentSteps={handleSentSteps} />
          <AugerWidget augerId={3} handleSentSteps={handleSentSteps} />
          <DrillWidget handleSentSteps={handleSentSteps} />
          <AugerWidget augerId={1} handleSentSteps={handleSentSteps} />

        </div>
        <HeatpadWidget />
        <MicroscopeCamera />
        <div style={{ display: 'flex', flexFlow: 'column', width: '100%', height: '1000px', background: '#111', borderRadius: '8px' }}>
          <Canvas camera={{ position: [50, 50, 50], fov: 45, zoom: 0.8 }}>
            <Suspense fallback={null}>
              <Stage environment="sunset" intensity={0.5}>
                <ScienceModel />
              </Stage>
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div >
  );
};

export default ScienceControl