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
import { AxisFunction } from "@/components/AxisFunction";
import { ButtonFunction } from "@/components/ButtonFunction";

const ArmControl: React.FC = () => {

  const gamepad = useGamepad();

  // Pre-fetch /cameras for all endpoints to ensure IDs are loaded
  const { cameras, loading, fetchCameras } = useCameraStreams();
  const [refreshing, setRefreshing] = useState(false);

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
        <TooltipLabel label="J1 (Base)"><AxisFunction size={32} axisIndex={0}/></TooltipLabel>
        <TooltipLabel label="J2 (Shoulder)"><AxisFunction size={32} axisIndex={1}/></TooltipLabel>
        <TooltipLabel label="J3 (Elbow)"><AxisFunction size={32} axisIndex={3}/></TooltipLabel>
        <TooltipLabel label="J4 (Wrist Pitch)"><ButtonFunction size={32} buttonIndex={12}/></TooltipLabel>
        <TooltipLabel label="J5 (Wrist Yaw)"><AxisFunction size={32} axisIndex={2}/></TooltipLabel>
        <TooltipLabel label="J6 (Wrist Roll)"><ButtonFunction size={32} buttonIndex={14}/></TooltipLabel>
        <TooltipLabel label="Gripper Grab"><ButtonTooltip size={32} buttonIndex={7}/></TooltipLabel>
        <TooltipLabel label="Gripper Release"><ButtonTooltip size={32} buttonIndex={6}/></TooltipLabel>

    </div>

    <div style={{display: "flex", flexDirection: "row", gap: 40}}>
      <div className="flex flex-col gap-2">
        <ActuatorStatus name="J1" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J1_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J1_position"] as number || 0} maxVelocity={20}/>
        <ActuatorStatus name="J2" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J2_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J2_position"] as number || 0} maxVelocity={20}/>
        <ActuatorStatus name="J3" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J3_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J3_position"] as number || 0} maxVelocity={20}/>
      </div>
      <div className="flex flex-col gap-2">
        <ActuatorStatus name="J4" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J4_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J4_position"] as number || 0} maxVelocity={20}/>
        <ActuatorStatus name="J5" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J5_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J5_position"] as number || 0} maxVelocity={20}/>
        <ActuatorStatus name="J6" status="active" velocity={gamepad.hardwareStates.arm?.outputs?.["J6_velocity"] as number || 0} position={gamepad.hardwareStates.arm?.outputs?.["J6_position"] as number || 0} maxVelocity={20}/>
      </div>
      <div>
        {cameras[0] && <CameraFeed camera={cameras[0]}></CameraFeed>}
      </div>
    </div> 
  </div>

      
  );
};

export default ArmControl;