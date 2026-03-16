import { useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

function useScienceData() {
  const { roverStatus } = useTelemetryContext();

  return useMemo(() => {
    const found = roverStatus.find((s) => s.data.science_data)?.data
      ?.science_data;
    return found || {};
  }, [roverStatus]);
}

export function useStepperData(motorId: number) {
  const scienceData = useScienceData();

  return useMemo(() => {
    return scienceData?.stepper_motors?.[motorId] ?? 0;
  }, [scienceData, motorId]);
}

export function useDrillData() {
  const scienceData = useScienceData();

  return useMemo(() => scienceData?.drill ?? 0, [scienceData]);
}

export function useHeatpadData() {
  const scienceData = useScienceData();

  return useMemo(() => !!scienceData?.heatpad_status, [scienceData])
}
