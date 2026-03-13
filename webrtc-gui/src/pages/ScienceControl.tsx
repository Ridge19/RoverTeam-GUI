import React from "react";
import { StatusBanner } from "@/components/StatusBanner"
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
      <StatusBanner controlDevice="science" controlDeviceLabel="Science" />
      
    </div>
  );
};

export default ScienceControl;
