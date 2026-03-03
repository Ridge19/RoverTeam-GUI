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
    const { voltage, current, power, temp } = metrics;
    const peaks = usePDBPeaks(current, power, temp);

    const { currentEndpoint } = useTelemetryContext(); // Get the active endpoint
    const { getEndpointsOfService } = useEndpoints();
    const [loading, setLoading] = useState(false);

    const toggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // 1. Safety check: Do we have a connection?
      if (!currentEndpoint) return;

      setLoading(true);
      const enable = e.target.checked;

      try {
        await PDBService.toggleChannel(
          currentEndpoint,
          getEndpointsOfService,
          board,
          id,
          enable,
        );
      } catch (err) {
        console.error("Toggle failed", err);
        e.target.checked = !enable;
        alert(`Hardware Error: Could not toggle Ch ${id}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-xs">
        <td className="p-2 font-mono text-blue-400 font-bold">Ch{id}</td>

        {/* Voltage */}
        <td className="p-2 font-mono text-gray-200">{format(voltage, "V")}</td>

        {/* Current & Max I */}
        <td className="p-2 font-mono text-gray-200">{format(current, "A")}</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {format(peaks.maxI, "A")}
        </td>

        {/* Power & Max P */}
        <td className="p-2 font-mono text-gray-200">{format(power, "W")}</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {format(peaks.maxP, "W")}
        </td>

        {/* Temp & Max Temp */}
        <td className="p-2 font-mono text-orange-300">{temp.toFixed(1)}°C</td>
        <td className="p-2 font-mono text-gray-500 italic">
          {peaks.maxT.toFixed(1)}°C
        </td>

        {/* Status Toggle */}
        <td className="p-2 text-right">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              disabled={loading || !currentEndpoint} // Disable if no connection
              onChange={toggle}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </td>
      </tr>
    );
  },
);

export default ChannelRow;
