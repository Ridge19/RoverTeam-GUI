import React, { memo, useState } from "react";
import usePDBPeaks from "@/hooks/pdb/usePDBPeaks";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import PDBService from "@/services/pdbService";

const format = (val: number, unit: string) => {
  if (val === undefined) return "--";
  return val < 1
    ? `${(val * 1000).toFixed(1)}m${unit}`
    : `${val.toFixed(2)}${unit}`;
};

const ChannelRow = memo(
  ({ id, metrics, board }: { id: number; metrics: any; board: string }) => {
    // 1. Manage state LOCALLY since the hardware doesn't report it back
    const [isOn, setIsOn] = useState(false);
    const [loading, setLoading] = useState(false);

    const { voltage, current, power, temp } = metrics;
    const peaks = usePDBPeaks(current, power, temp);
    const { currentEndpoint } = useTelemetryContext();
    const { getEndpointsOfService } = useEndpoints();

    const handleToggle = async () => {
      if (!currentEndpoint || loading) return;

      setLoading(true);
      const nextState = !isOn;

      try {
        // 2. Send the command "into the void"
        await PDBService.toggleChannel(
          currentEndpoint,
          getEndpointsOfService,
          board,
          id,
          nextState,
        );

        // 3. Update the UI locally if the network request succeeded
        setIsOn(nextState);
      } catch (err) {
        console.error("Toggle failed", err);
        alert(`Network Error: Could not reach the PDB controller.`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-xs">
        <td className="p-2 font-mono text-blue-400 font-bold">Ch{id}</td>

        {/* Voltage/Current/etc logic stays the same */}
        <td className="p-2 font-mono text-gray-200">{format(voltage, "V")}</td>
        <td className="p-2 font-mono text-gray-200">{format(current, "A")}</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {format(peaks.maxI, "A")}
        </td>
        <td className="p-2 font-mono text-gray-200">{format(power, "W")}</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {format(peaks.maxP, "W")}
        </td>
        <td className="p-2 font-mono text-orange-300">{temp.toFixed(1)}°C</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {peaks.maxT.toFixed(1)}°C
        </td>

        {/* Status Toggle */}
        <td className="p-2 text-right">
          <label
            className={`relative inline-flex items-center ${loading ? "opacity-50" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={loading || !currentEndpoint}
              checked={isOn}
              onChange={handleToggle}
            />
            <div
              className="w-8 h-4 bg-gray-700 rounded-full peer 
              peer-checked:bg-green-600 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:rounded-full after:h-3 after:w-3 
              after:transition-all peer-checked:after:translate-x-full"
            ></div>
          </label>
        </td>
      </tr>
    );
  },
);

export default ChannelRow;
