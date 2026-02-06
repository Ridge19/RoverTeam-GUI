import React from "react";
import { Header } from "@/components/Header";
import Cameras from "./Cameras";
import ArmControl from "./ArmControl";
import TelemetryConsole from "./Telemetry";
import SystemVitals from "./SystemVitals";
import { useGamepad } from "@/contexts/GamepadContext";

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("cameras");
  const gamepad = useGamepad();

  const onChange = (page: string) => {
    if(gamepad.hasControl!="none") return;
    setActiveTab(page)
  }

  return (
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
      {activeTab === "arm" && <ArmControl/>}
      {activeTab === "telemetry" && <TelemetryConsole/>}
      {activeTab === "vitals" && <SystemVitals/>}
    </main>
  );
};

export default IndexPage;
