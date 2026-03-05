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

const DriveControl: React.FC = () => {

  const gamepad = useGamepad();

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
      <StatusBanner controlDevice="drive" controlDeviceLabel="Drive"/>
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
                <ButtonHoldTooltip buttonIndex={2} holdDuration={1} onComplete={()=>{}} size={50}></ButtonHoldTooltip>
              </div>
            </TooltipLabel>

            <TooltipLabel label="Tourque Mode (Hold)">
              <div className="mr-1">
                <ButtonHoldTooltip buttonIndex={9} holdDuration={3} onComplete={()=>{
                  setWarningModal(true)
                }} size={50}></ButtonHoldTooltip>
              </div>
            </TooltipLabel>

            <Modal
              open={warningModal}
              onClose={()=>{
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
          <div style={{flex: 1}}>
            {/* 2x2 grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: 10,
              height: "100%",
            }}>
              {/*<ActuatorStatus/>
              <ActuatorStatus/>
              <ActuatorStatus/>
              <ActuatorStatus/>*/}
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
              flex:1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                background: "#000",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                borderRadius: 10,
                padding: "0px 20px",
                border: "5px solid #222",
              }}>
                <div style={{
                  fontWeight: "bold",
                  fontFamily: "segment-eglas, monospace",
                  position: "relative",
                  fontSize: 80,
                  letterSpacing: 20,
                }}>
                  <div style={{color: "#222"}}>88888
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0,
                      color: "#ff9100",
                      textShadow: "0 0 10px #fab861",
                      whiteSpace: "pre"
                    }}> 6770</div>
                    <div style={{
                      position: "absolute",
                      top: 0, left: 20,
                      color: "#ff9100",
                      textShadow: "0 0 10px #fab861",
                      whiteSpace: "pre"
                    }}>  .</div>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 15,
                  gap: 5,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}>
                  <div style={{
                    fontSize: 24,
                    lineHeight: "24px",
                    color: "#ff9100",
                    textShadow: "0 0 10px #fab861",
                  }}>m⋅s⁻¹</div>
                  <div style={{
                    fontSize: 24,
                    lineHeight: "24px",
                    color: "#222",
                  }}>kph</div>
                  <div style={{
                    fontSize: 24,
                    lineHeight: "24px",
                    color: "#222",
                  }}>rpm</div>
                </div>
              </div>
            </div>
            <div style={{
              flex: 1
            }}>
              {cameras[0] && <CameraFeed camera={cameras[0]}>
                <AircraftHUD pitch={-gamepad.axes[1] * 90} roll={-gamepad.axes[0] * 90} />
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
            <div style={{flex: 1, width: "100%"}}>
              <AngleView label="PITCH" angle={gamepad.axes[1] * 90} imageUrl="diagrams/eq-side.png"/>
            </div>
            <div style={{flex: 1, width: "100%"}}>
              <AngleView label="ROLL" angle={gamepad.axes[0] * 90} imageUrl="diagrams/eq-back.png"/>
            </div>
            <div style={{flex: 1, width: "100%"}}>
              <AngleView label="YAW" angle={gamepad.axes[2] * 180} imageUrl="diagrams/eq-top.png"/>
            </div>
          </div>
        </div>
      </div>
    </div>          
  );
};

export default DriveControl;