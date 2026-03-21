import React from "react";
import { Header } from "@/components/Header";
import Cameras from "./Cameras";
import ArmControl from "./ArmControl";
import ExcControl from "./ExControl";
import TelemetryConsole from "./Telemetry";
import SystemVitals from "./SystemVitals";
import { useGamepad } from "@/contexts/HardwareControl/useGamepad";
import SplashScreen from "@/components/SplashScreen";
import { useEndpoints } from "@/contexts/EndpointContext";
import DriveControl from "./DriveControl";
import PDB from "./PDB";
import Science from "./ScienceControl";

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("cameras");
  const [loading, setLoading] = React.useState(true);
  const gamepad = useGamepad();
  const endpoints = useEndpoints();

  React.useEffect(() => {
    const ready = () => setLoading(false);
    setTimeout(ready, 10_000); // max 10s if the scan complete never fires
  }, []);

  React.useEffect(() => {
    const off = endpoints.onEvent((e) => {
      if (e.type === "scan-complete") {
        setLoading(false);
      }
    });
    return off;
  }, []);

  const onChange = (page: string) => {
    if (gamepad.hasControl != "none") return;
    setActiveTab(page);
  };

  return (<>
    <SplashScreen visible={loading} />
    <main style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      background: "#111",
      color: "#EEE"
    }}>
      <Header activeTab={activeTab} setActiveTab={onChange} />
      {activeTab === "cameras" && <Cameras />}
      {activeTab === "drive" && <DriveControl />}
      {activeTab === "arm" && <ArmControl />}
      {activeTab === "exc" && <ExcControl />}
      {activeTab === "telemetry" && <TelemetryConsole />}
      {activeTab === "vitals" && <SystemVitals />}
      {activeTab === "science" && <Science />}
      {activeTab === "pdb" && <PDB />}
    </main>
  </>);
};

export default IndexPage;
