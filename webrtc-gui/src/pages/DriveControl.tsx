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
import AngleView from "@/components/AngleView";
import { AircraftHUD } from "@/components/AircraftHUD";
import { Modal } from "@/components/Modal";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { SpeedDisplay } from "@/components/SpeedDisplay";

/*
{
  "type": "imu_data",
  "data":{
      "gyro":{"p":0, "y":0, "r":0},
      "vel":{"fd":0,"up":0,"lr":0}
  }
}

*/


const DriveControl: React.FC = () => {

  const gamepad = useGamepad();

  // Telemetry Access
  const { roverStatus } = useTelemetryContext();
  const imuData = roverStatus.find((s) => s.data.imu_data)?.data;

  const { cameras, loading, fetchCameras } = useCameraStreams();
  const [refreshing, setRefreshing] = useState(false);

  const [warningModal, setWarningModal] = useState<boolean>(false);

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
      height: "calc(100% - 110px)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
    }}>
      <StatusBanner controlDevice="drive" controlDeviceLabel="Drive" />
      <div style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
      }}>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            flex: 0,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10
          }}>
            <TooltipLabel label="Drive Control">
              <div className="mr-1">
                <AxisTooltip xAxisIndex={2} yAxisIndex={3} label="R" size={60}></AxisTooltip>
              </div>
            </TooltipLabel>

            <TooltipLabel label="Clear Errors (Hold)">
              <div className="mr-1">
                <ButtonHoldTooltip buttonIndex={2} holdDuration={1} onComplete={() => { }} size={50}></ButtonHoldTooltip>
              </div>
            </TooltipLabel>

            <TooltipLabel label="Torque Mode (Hold)">
              <div className="mr-1">
                <ButtonHoldTooltip buttonIndex={9} holdDuration={3} onComplete={() => {
                  setWarningModal(true)
                }} size={50}></ButtonHoldTooltip>
              </div>
            </TooltipLabel>

            <Modal
              open={warningModal}
              onClose={() => {
                setWarningModal(false);
              }}
              title="ENABLE TORQUE MODE?"
              actions={["Enable Torque Mode", "Cancel"]}
            >
              <div className="space-y-3 max-h-[400px] overflow-y-auto align-middle text-center">
                <img src="warning.png" width="50px" className="m-auto" />
                DO YOU KNOW WHAT YOU'RE DOING?????? YOU BUM!!
              </div>
            </Modal>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <img
              src="/diagrams/eq-top.png"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "saturate(0) brightness(2)",
              }}
            />

            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "40%",
              transform: "translate(-50%, -50%)",
              background: "#222222EE",
              border: "2px solid white",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              paddingBottom: 10,
            }}>
              <div>Torque Differential:</div>
              <div style={{
                flex: 1,
                color: "#ff9100",
                textShadow: "0 0 10px #fab861",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>LOCKED</div>
              <div style={{ fontSize: 14 }}>
                <TooltipLabel label="Unlock Differential (Hold)">
                  <ButtonHoldTooltip buttonIndex={0} holdDuration={0.5} onComplete={() => { }} size={32}></ButtonHoldTooltip>
                </TooltipLabel>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: 0,
                height: "100%",
              }}
            >
              <div style={{ padding: 20, display: "flex", alignItems: "flex-start", justifyContent: "left" }}><ActuatorStatus name="FL" status="inactive" /></div>
              <div style={{ padding: 20, display: "flex", alignItems: "flex-start", justifyContent: "right" }}><ActuatorStatus name="FR" status="active" /></div>
              <div style={{ padding: 20, display: "flex", alignItems: "flex-end", justifyContent: "left" }}><ActuatorStatus name="RL" status="error" /></div>
              <div style={{ padding: 20, display: "flex", alignItems: "flex-end", justifyContent: "right" }}><ActuatorStatus name="RR" status="active" /></div>
            </div>
          </div>
        </div>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
        }}>
          <div style={{
            flex: "70%",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <SpeedDisplay value={imuData?.imu_data?.vel?.fd} />
            </div>
            <div style={{
              flex: 1
            }}>
              {cameras[0] && <CameraFeed camera={cameras[0]}>
                <AircraftHUD/>
              </CameraFeed>}
            </div>

          </div>
          <div style={{
            flex: "30%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
              <>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AngleView label="PITCH" angle={imuData?.imu_data?.gyro?.p || 0} imageUrl="diagrams/eq-side.png" hasData={!!imuData} simulated={imuData && imuData.imu_data.simulated}/>
                </div>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AngleView label="ROLL" angle={imuData?.imu_data?.gyro?.r || 0} imageUrl="diagrams/eq-back.png" hasData={!!imuData} simulated={imuData && imuData.imu_data.simulated}/>
                </div>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AngleView label="YAW" angle={imuData?.imu_data?.gyro?.y || 0} imageUrl="diagrams/eq-top.png" hasData={!!imuData} simulated={imuData && imuData.imu_data.simulated}/>
                </div>
              </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveControl;