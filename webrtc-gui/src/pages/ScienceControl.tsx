import React, { useState, useEffect, Suspense } from "react";
import DrillWidget from "@/components/science/DrillWidget"
import AugerWidget from "@/components/science/AugerWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import MicroscopeCamera from "@/components/science/MicroscopeCamera"
import styles from "./Science.module.scss"
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei"
import ScienceModel from "@/components/science/ScienceModel"; // Import the component
import { useScienceData, useSpectrometerData } from "@/hooks/science/useScienceTelemetry"


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

  // Downsample 288 channels into NUM_BARS display bins by averaging each bin.
  const NUM_BARS = 40
  const displayBars: number[] = Array.from({ length: NUM_BARS }, (_, barIdx) => {
    if (spectrometerData.length === 0) {
      // Fallback mock while no data has arrived yet
      const normalized = barIdx / NUM_BARS;
      const bell = Math.exp(-Math.pow(normalized - 0.5, 2) / 0.05);
      return (bell * 0.7 + 0.15) * 100;
    }
    const chunkSize = spectrometerData.length / NUM_BARS;
    const start = Math.floor(barIdx * chunkSize);
    const end = Math.floor((barIdx + 1) * chunkSize);
    const slice = spectrometerData.slice(start, end);
    const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
    // Normalise: the Arduino uses 12-bit ADC (0-4095)
    return Math.min(100, (avg / 4095) * 100);
  });
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
          </div>
          <HeatpadWidget />
        </div>
        <div className={styles.MiddleColumn}>
          <div className={styles.MicroscopeContainer}>
            <div style={{ width: "100%", aspectRatio: "4/3", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: "1px dashed #555" }}>
              <span style={{ color: "#888" }}>Microscope Camera Placeholder</span>
            </div>
            {/* <MicroscopeCamera /> */}
          </div>
          
          <div className={styles.SpectrumContainer}>
            <h3 style={{ color: "#aaa", marginTop: 0, marginBottom: 12, fontSize: 16 }}>Light Spectrum{spectrometerData.length === 0 ? " (Waiting…)" : " (Live)"}</h3>
            <div style={{ width: "100%", height: 220, display: "flex", alignItems: "flex-end", gap: 3, background: "#1a1a1a", padding: 16, borderRadius: 12, border: "1px solid #333" }}>
              {displayBars.map((height, i) => (
                <div key={i} style={{ 
                  flex: 1, 
                  backgroundColor: `hsl(${(i / NUM_BARS) * 300}, 80%, 60%)`, 
                  height: `${Math.max(1, height)}%`,
                  borderRadius: "2px 2px 0 0",
                  transition: "height 0.15s ease"
                }} />
              ))}
            </div>
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
