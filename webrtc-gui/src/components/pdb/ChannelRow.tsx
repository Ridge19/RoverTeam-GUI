import React, { memo, useState, useEffect } from "react";
import usePDBPeaks from "@/hooks/pdb/usePDBPeaks";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import PDBService from "@/services/pdbService";

const format = (val: number | undefined | null, unit: string) => {
  if (val === undefined || val === null) return "--";

  return val < 1
    ? `${(val * 1000).toFixed(1)}m${unit}`
    : `${val.toFixed(2)}${unit}`;
};

const ChannelRow = memo(
  ({ id, metrics, board }: { id: number; metrics: any; board: string }) => {
    const [isOn, setIsOn] = useState(false);
    const [loading, setLoading] = useState(false);

    const { voltage = 0, current = 0, power = 0, temp = 0 } = metrics || {};

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

    const isActuallyDrawingPower = current > 0.01;
    const rowOpacity = isOn ? "opacity-100" : "opacity-40";

    return (
      <tr
        className={`border-b border-gray-800/50 hover:bg-white/5 transition-all text-xs ${rowOpacity}`}
      >
        <td className="p-2 font-mono">
          <span
            className={`${isActuallyDrawingPower ? "text-green-400 animate-pulse" : "text-blue-400"} font-bold`}
          >
            Ch{id.toString().padStart(2, "0")}
          </span>
        </td>

        <td className="p-2 font-mono text-gray-300">{format(voltage, "V")}</td>

        <td
          className={`p-2 font-mono ${isActuallyDrawingPower ? "text-yellow-400" : "text-gray-400"}`}
        >
          {format(current, "A")}
        </td>

        <td className="p-2 font-mono text-gray-600 italic text-[10px]">
          {format(peaks?.maxI, "A")}
        </td>

        <td className="p-2 font-mono text-gray-300">{format(power, "W")}</td>

        <td className="p-2 font-mono text-gray-600 italic text-[10px]">
          {format(peaks?.maxP, "W")}
        </td>

        <td
          className={`p-2 font-mono ${temp > 50 ? "text-red-500" : "text-orange-300"}`}
        >
          {temp > 0 ? `${temp.toFixed(1)}°C` : "0.0°C"}
        </td>

        <td className="p-2 text-right">
          <label
            className={`relative inline-flex items-center ${loading ? "animate-pulse" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={loading || !currentEndpoint}
              checked={isOn}
              onChange={handleToggle}
            />
            <div
              className="w-7 h-4 bg-gray-700 rounded-full peer 
              peer-checked:bg-green-600 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:rounded-full after:h-3 after:w-3 
              after:transition-all peer-checked:after:translate-x-3"
            ></div>
          </label>
        </td>
      </tr>
    );
  },
);

export default ChannelRow;
