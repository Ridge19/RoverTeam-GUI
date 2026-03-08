import React, { useMemo } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import ChannelRow from "@/components/pdb/ChannelRow";
import EstopButton from "@/components/pdb/EStop";
import PollingInput from "@/components/pdb/PollingInput";

function formatValue(value: number, unit: "V" | "A" | "W") {
  if (value === undefined || value === null) return "-";
  return value < 1
    ? `${(value * 1000).toFixed(1)} m${unit}`
    : `${value.toFixed(2)} ${unit}`;
}

const DEFAULT_METRICS = { voltage: 0, current: 0, power: 0, temp: 0 };
const BOARD_CONFIGS = {
  buck1: { title: "Buck Board 1", channels: 2 },
  buck2: { title: "Buck Board 2", channels: 2 },
  switch: { title: "Switch Board", channels: 8 },
};

const BoardTable = ({
  title,
  boardKey,
  data,
  channelCount,
}: {
  title: string;
  boardKey: string;
  data: any;
  channelCount: number;
}) => {
  const rows = useMemo(() => {
    return Array.from({ length: channelCount }, (_, i) => {
      // If backend has data for this index, use it. Otherwise use defaults.
      return data && data[i] ? data[i] : DEFAULT_METRICS;
    });
  }, [data, channelCount]);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] text-gray-500 uppercase bg-black/40 border-b border-gray-800">
              <th className="p-2">ID</th>
              <th className="p-2">Voltage</th>
              <th className="p-2">Current</th>
              <th className="p-2 text-gray-600">Max I</th>
              <th className="p-2">Power</th>
              <th className="p-2 text-gray-600">Max P</th>
              <th className="p-2">Temp</th>
              <th className="p-2 text-gray-600">Max T</th>
              <th className="p-2 text-right">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((metrics, i) => (
              <ChannelRow
                key={`${boardKey}-${i}`}
                id={i}
                metrics={metrics}
                board={boardKey}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PDB = () => {
  const { roverStatus } = useTelemetryContext();
  const pdbData = useMemo(() => {
    const found = roverStatus.find((s) => s.data.pdb_data)?.data.pdb_data;
    return found || {}; 
  }, [roverStatus]);

  const busVoltage = useMemo(() => {
    if (!pdbData.bms) return 0;
    const bmsValues = Array.isArray(pdbData.bms)
      ? pdbData.bms
      : Object.values(pdbData.bms);
    return bmsValues.reduce((a: any, b: any) => a + (Number(b) || 0), 0);
  }, [pdbData.bms]);
  
  if (!pdbData)
    return (
      <div className="p-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 font-mono text-sm">
          INITIALIZING PDB LINK...
        </p>
      </div>
    );

  return (
    <div className="p-4 space-y-6 bg-[#0a0a0c] min-h-screen text-white">
      {/* Header Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">
            Power Distribution Center
          </h1>
          <p className="text-[10px] text-gray-500 font-mono">
            SYSTEM_STATUS: <span className="text-green-500">NOMINAL</span>
          </p>
        </div>
        <div className="flex gap-8 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <div>
            <p className="text-[9px] text-gray-500 uppercase">Bus Voltage</p>
            <p className="text-xl font-mono text-blue-400">
              {pdbData.bms &&
                pdbData.bms.reduce((a: any, b: any) => a + b, 0).toFixed(2)}
              {!pdbData.bms && 0.0}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase">Battery Cells</p>
            {pdbData.bms && (
              <p className="text-xl font-mono text-green-500">
                {pdbData.bms.length}
              </p>
            )}
            {!pdbData.bms && (
              <p className="text-xl font-mono text-green-500">0</p>
            )}
          </div>
        </div>
      </header>
      4{/* Tables Grid */}
      <div className="grid grid-cols-1 gap-6">
        <BoardTable
          title={BOARD_CONFIGS.buck1.title}
          boardKey="buck1"
          data={pdbData.buck1}
          channelCount={BOARD_CONFIGS.buck1.channels}
        />
        <BoardTable
          title={BOARD_CONFIGS.buck2.title}
          boardKey="buck2"
          data={pdbData.buck2}
          channelCount={BOARD_CONFIGS.buck2.channels}
        />
        <BoardTable
          title={BOARD_CONFIGS.switch.title}
          boardKey="switch"
          data={pdbData.switch}
          channelCount={BOARD_CONFIGS.switch.channels}
        />

        {/* BMS View */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-green-500 mb-4">BMS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 12 }).map((_, i) => {
              const val = pdbData.bms?.[i] || 0;
              return (
                <div key={i} className="bg-black/40 border border-gray-800 p-2 rounded-md">
                  <p className="text-[9px] text-gray-600 font-bold mb-1">CELL {i}</p>
                  <p className="text-sm font-mono text-gray-200">{val.toFixed(3)}V</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
        <PollingInput initialInterval={1} />
        <EstopButton />
      </div>
    </div>
  );
};

export default PDB;
