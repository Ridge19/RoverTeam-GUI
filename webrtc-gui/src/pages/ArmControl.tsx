import React, { useState } from "react";
import { useRoverUrl } from "@/hooks/useRoverUrl";
import { CameraFeed } from "@/components/CameraFeed";
import { CAMERA_GRID } from "@/layout/cameraLayout";
import { ControllerVisual } from "@/components/ControllerVisual";
import { AxisTooltip } from "@/components/AxisTooltip";
import { ButtonTooltip } from "@/components/ButtonTooltip";
import { ButtonHoldTooltip } from "@/components/ButtonHoldTooltip";
import { useGamepad } from "@/contexts/HardwareControl/useGamepad";
import { StatusBanner } from "@/components/StatusBanner";
import { TooltipLabel } from "@/components/TooltipLabel";
import { ActuatorStatus } from "@/components/ActuatorStatus";

const ArmControl: React.FC = () => {

  const gamepad = useGamepad();

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

      <TooltipLabel label="Test Function"><ButtonTooltip size={32} buttonIndex={0}/></TooltipLabel>

    </div>

    <ActuatorStatus name="J1" status="active" velocity={Math.abs(gamepad.axes[0]) > 0.1 ? -gamepad.axes[0]*10 : 0 || 0} maxVelocity={10}/>
    <ActuatorStatus name="J2" status="active" velocity={Math.abs(gamepad.axes[1]) > 0.1 ? -gamepad.axes[1]*40 : 0 || 0} maxVelocity={40}/>
    <ActuatorStatus name="J3" status="active" velocity={Math.abs(gamepad.axes[2]) > 0.1 ? -gamepad.axes[2]*80 : 0 || 0} maxVelocity={80}/>
    <ActuatorStatus name="J4" status="active" velocity={Math.abs(gamepad.axes[3]) > 0.1 ? -gamepad.axes[3]*10 : 0 || 0} maxVelocity={10}/>
  
  </div>

      
  );
};

export default ArmControl;