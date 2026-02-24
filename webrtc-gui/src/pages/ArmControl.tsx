import React, { useEffect, useState } from "react";
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
import { Camera, useCameraStreams } from "@/contexts/CameraStreamsContext";

const ArmControl: React.FC = () => {

  const gamepad = useGamepad();

  const { cameras, loading, fetchCameras } = useCameraStreams();
  const [refreshing, setRefreshing] = useState(false);

  // Pre-fetch /cameras for all endpoints to ensure IDs are loaded
  useEffect(() => {
    let cancelled = false;

    const loadCameras = async () => {
      for (const cam of cameras) {
        await fetchCameras(cam.endpoint.replace(`:${cam.port}`, ""), cam.port);
      }
    };

    loadCameras();

    return () => {
      cancelled = true;
    };
  }, [cameras, fetchCameras]);

  return (
    <div style={{
        padding: 20,
        maxHeight: "calc(100% - 110px)",       // don't let it grow beyond parent
        overflowY: "auto",       // allow vertical scroll if content exceeds height
        flexShrink: 0,           // prevent flexbox from shrinking/stretching it
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20
    }}>

      <StatusBanner controlDevice="arm" controlDeviceLabel="Arm"/>          

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

    <div style={{display: "flex", flexDirection: "row", gap: 40}}>
      <div className="flex flex-col gap-2">
        <ActuatorStatus name="J1" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J1_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J1_pos"] as number || 0} maxVelocity={500}/>
        <ActuatorStatus name="J2" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J2_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J2_pos"] as number || 0} maxVelocity={500}/>
        <ActuatorStatus name="J3" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J3_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J3_pos"] as number || 0} maxVelocity={500}/>
      </div>
      <div>
        <ActuatorStatus name="J4" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J4_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J4_pos"] as number || 0} maxVelocity={500}/>
        <ActuatorStatus name="J5" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J5_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J5_pos"] as number || 0} maxVelocity={500}/>
        <ActuatorStatus name="J6" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J6_vel"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J6_pos"] as number || 0} maxVelocity={500}/>
      </div>
    </div> 
  </div>

      
  );
};

export default ArmControl;