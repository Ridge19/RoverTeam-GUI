import React, { useState } from "react";
import { useEndpoints } from "@/contexts/EndpointContext";
import { StatusBanner } from "@/components/StatusBanner";
import { TooltipLabel } from "@/components/TooltipLabel";
import { ButtonHoldTooltip } from "@/components/ButtonHoldTooltip";
import { ActuatorStatus } from "@/components/ActuatorStatus";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import ScienceService from "@/services/ScienceService";

const ScienceControl: React.FC = () => {
  const { getEndpointsOfService } = useEndpoints();
  const { roverStatus } = useTelemetryContext();

  // Extract science telemetry
  const scienceData = roverStatus.find((s) => s.data.science_data)?.data
    ?.science_data;

  const [drillSpeed, setDrillSpeed] = useState<number>(0);
  const [stepperSteps, setStepperSteps] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
  });


  const handleEstop = async () => {
    try {
      await ScienceService.estop(window.location.href, getEndpointsOfService);
      alert("Emergency Stop Triggered");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrillSubmit = async () => {
    await ScienceService.setDrillSpeed(
      window.location.href,
      getEndpointsOfService,
      drillSpeed,
    );
  };

  const handleStepperSubmit = async (motorId: number) => {
    await ScienceService.setStepperStep(
      window.location.href,
      getEndpointsOfService,
      motorId,
      stepperSteps[motorId],
    );
  };

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

      <div style={{ display: "flex", flexDirection: "row", flex: 1, gap: 20 }}>
        {/* Left Column: Controls */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div style={{ background: "#222", padding: 15, borderRadius: 8 }}>
            <h3>Drill Controls</h3>
            <input
              type="number"
              value={drillSpeed}
              onChange={(e) => setDrillSpeed(Number(e.target.value))}
              style={{ background: "#333", color: "white", padding: 5 }}
            />
            <button onClick={handleDrillSubmit}>Set Speed</button>
          </div>

          <div style={{ background: "#222", padding: 15, borderRadius: 8 }}>
            <h3>Stepper Motors</h3>
            {[1, 2, 3].map((id) => (
              <div key={id} style={{ marginBottom: 10 }}>
                <span>Motor {id}: </span>
                <input
                  type="number"
                  value={stepperSteps[id]}
                  onChange={(e) =>
                    setStepperSteps({
                      ...stepperSteps,
                      [id]: Number(e.target.value),
                    })
                  }
                  style={{
                    background: "#333",
                    color: "white",
                    padding: 5,
                    width: 60,
                  }}
                />
                <button onClick={() => handleStepperSubmit(id)}>Step</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto" }}>
            <TooltipLabel label="EMERGENCY STOP">
              <ButtonHoldTooltip
                buttonIndex={0}
                holdDuration={0.5}
                onComplete={handleEstop}
                size={80}
              >
                <div style={{ color: "red", fontWeight: "bold" }}>ESTOP</div>
              </ButtonHoldTooltip>
            </TooltipLabel>
          </div>
        </div>

        {/* Right Column: Status/Visualization */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flex: 1,
              background: "#1a1a1a",
              padding: 20,
              borderRadius: 8,
            }}
          >
            <h3>Actuator Health</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <ActuatorStatus
                name="Drill"
                status={scienceData ? "active" : "inactive"}
              />
              <ActuatorStatus name="Auger" status="active" />
              <ActuatorStatus name="Microscope" status="active" />
              <ActuatorStatus name="Swivel" status="active" />
            </div>
          </div>

          <div style={{ flex: 1, padding: 20, color: "#aaa" }}>
            <h3>Telemetry Feed</h3>
            <pre style={{ fontSize: 12 }}>
              {JSON.stringify(scienceData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScienceControl;