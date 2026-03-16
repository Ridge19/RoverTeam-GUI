import { useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

export function usePdbData() {
  const { roverStatus } = useTelemetryContext();

  return useMemo(() => {
    const found = roverStatus.find((s) => s.data.pdb_data)?.data.pdb_data;
    return found || {};
  }, [roverStatus]);
}

export function useBoardData(boardKey: string) {
  const pdbData = usePdbData();

  return useMemo(() => {
    return pdbData[boardKey] || [];
  }, [pdbData, boardKey]);
}

// specifically bms
export function useBmsData() {
  const pdbData = usePdbData();
  return useMemo(() => pdbData.bms || [], [pdbData]);
}
