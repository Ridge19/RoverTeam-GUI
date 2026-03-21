import React, { Suspense } from "react";
import DrillWidget from "@/components/science/DrillWidget"
import AugerWidget from "@/components/science/AugerWidget"
import HeatpadWidget from "@/components/science/HeatpadWidget"
import MicroscopeCamera from "@/components/science/MicroscopeCamera"
import styles from "./Science.module.scss"
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei"
import { ScienceModel } from "@/components/science/ScienceModel"; // Import the component above
import SpectrometerWidget from "@/components/science/SpectrometerWidget";

function Model() {
  // Ensure this file is at: public/models/SciencePayload.gltf
  const { scene } = useGLTF('/models/SciencePayload.gltf');
  return <primitive object={scene} />;
}

const ScienceControl: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#aaa" }}>Telemetry Feed</h2>

      <div className={styles.ScienceControl}>
        <div className={styles.MotorControl}>
          <AugerWidget augerId={1} />
          <AugerWidget augerId={2} />
          <DrillWidget />
          <AugerWidget augerId={3} />
        </div>
        <HeatpadWidget />

        <MicroscopeCamera />

        <SpectrometerWidget />

        <div style={{ width: '100%', height: '400px', background: '#111', borderRadius: '8px' }}>
          <Canvas camera={{ position: [20, 20, 20], fov: 45 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.5}>
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