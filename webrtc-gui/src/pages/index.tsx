import React from "react";
import { Header } from "@/components/Header";
import Cameras from "./Cameras";
import ArmControl from "./ArmControl";

const IndexPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("cameras");

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden"
    }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "cameras" && <Cameras />}
      {activeTab === "arm" && <ArmControl/>}
    </main>
  );
};

export default IndexPage;
