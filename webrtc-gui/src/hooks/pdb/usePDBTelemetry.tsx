import { useState, useEffect, useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

export function usePdbData() {
  const { roverStatus } = useTelemetryContext();

  return useMemo(() => {
    // Start with an empty full state
    const fullPdbState = { buck1: {}, buck2: {}, switch: {}, bms: {} };

    // Iterate through ALL received packets to build the complete current view
    roverStatus.forEach((packet) => {
      const data = packet.data?.pdb_data;
      if (data) {
        for (const [board, channels] of Object.entries(data)) {
          // Merge the new channel data into our full state
          fullPdbState[board] = {
            ...(fullPdbState[board] || {}),
            ...(channels as object)
          };
        }
      }
    });

    return fullPdbState;
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
