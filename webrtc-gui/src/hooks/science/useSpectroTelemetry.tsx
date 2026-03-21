import { useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

export function useSpectroTelemetry() {
  const { roverStatus } = useTelemetryContext();

  return useMemo(() => {
    // Try to find under data.spectrometer_data (matching science format)
    const found = roverStatus.find((s) => s.data && s.data.spectrometer_data)?.data?.spectrometer_data;
    
    return found || { channels: [] };
  }, [roverStatus]);
}
