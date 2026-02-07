import React, { useState } from "react";
import { useRoverUrl } from "@/hooks/useRoverUrl";
import { CameraFeed } from "@/components/CameraFeed";
import { CAMERA_GRID } from "@/layout/cameraLayout";
import { ControllerVisual } from "@/components/ControllerVisual";
import { AxisTooltip } from "@/components/AxisTooltip";
import { ButtonTooltip } from "@/components/ButtonTooltip";
import { ButtonHoldTooltip } from "@/components/ButtonHoldTooltip";
import { useGamepad } from "@/contexts/GamepadContext";
import { StatusBanner } from "@/components/StatusBanner";

const ArmControl: React.FC = () => {
  const Roverurl = useRoverUrl();
  const gamepad = useGamepad();

  const columnWidth = `400px`;

  // Hard-coded actuator degrees for demo (replace with real state later)
  const [actuators] = useState([
    { name: "J1", degree: 0 },
    { name: "J2", degree: 0 },
    { name: "J3", degree: 0 },
    { name: "J4", degree: 0 },
    { name: "J5", degree: 0 },
    { name: "J6", degree: 0 },
  ]);

  const c1 = "#ff3636AA"
  const c2 = "#e3e3e3AA"
  const c3 = "#000000"
  const c4 = "#FFFFFF"
  const c5 = "#89e582aa"
  const c6 = "#e3e3e3AA"

  return (
    <div style={{
        padding: 20,
        maxHeight: "calc(100% - 110px)",       // don't let it grow beyond parent
        overflowY: "auto",       // allow vertical scroll if content exceeds height
        flexShrink: 0,           // prevent flexbox from shrinking/stretching it
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    }}>

      <StatusBanner controlDevice="arm" controlDeviceLabel="Arm"/>          

        Hello world! this is a controller input test :)

              

      {/* Camera view */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
          gap: 20
        }}
    >
      <AxisTooltip xAxisIndex={0} yAxisIndex={1} style={{marginRight: 30}}/>
      <AxisTooltip xAxisIndex={2} yAxisIndex={3} style={{marginRight: 30}}/>

    </div>

    <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
          gap: 20
        }}
    >
      <ButtonTooltip buttonIndex={0}/>
      <ButtonTooltip buttonIndex={1}/>
      <ButtonTooltip buttonIndex={2}/>
      <ButtonTooltip buttonIndex={4}/>
      <ButtonTooltip buttonIndex={5}/>
      <ButtonTooltip buttonIndex={6}/>
      <ButtonTooltip buttonIndex={7}/>
      <ButtonTooltip buttonIndex={8}/>
      <ButtonTooltip buttonIndex={9}/>
      <ButtonTooltip buttonIndex={10}/>
      <ButtonTooltip buttonIndex={11}/>
      <ButtonTooltip buttonIndex={12}/>
      <ButtonTooltip buttonIndex={13}/>
      <ButtonTooltip buttonIndex={14}/>
      <ButtonTooltip buttonIndex={15}/>

    </div>
  
  </div>

      
  );
};

export default ArmControl;