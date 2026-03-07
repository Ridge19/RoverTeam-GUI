import React from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import ChannelRow from "@/components/pdb/ChannelRow";
import EstopButton from "@/components/pdb/EStop";
function formatValue(value: number, unit: "V" | "A" | "W") {
  if (value === undefined || value === null) return "-";
  return value < 1
    ? `${(value * 1000).toFixed(1)} m${unit}`
    : `${value.toFixed(2)} ${unit}`;
}
const BoardTable = ({
  title,
  data,
  boardKey,
}: {
  title: string;
  data: any[];
  boardKey: string;
}) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
    <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
      <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">
        {title}
      </h3>
      <div className="space-x-2">
        <button className="text-[10px] bg-gray-700 hover:bg-green-900 px-2 py-0.5 rounded text-gray-300 transition-colors">
          Enable All
        </button>
        <button className="text-[10px] bg-gray-700 hover:bg-red-900 px-2 py-0.5 rounded text-gray-300 transition-colors">
          Disable All
        </button>
      </div>
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
          {data.map((ch, i) => (
            <ChannelRow
              key={`${boardKey}-${i}`}
              id={i}
              metrics={ch}
              board={boardKey}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PDB = () => {
  const { roverStatus } = useTelemetryContext();
  const pdbData = roverStatus.find((s) => s.data.pdb_data)?.data.pdb_data;

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
              {pdbData.bms.reduce((a: any, b: any) => a + b, 0).toFixed(2)}V
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase">Battery Cells</p>
            <p className="text-xl font-mono text-green-500">
              {pdbData.bms.length}S
            </p>
          </div>
        </div>
      </header>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 gap-6">
        <BoardTable
          title="Buck Board 1"
          data={pdbData.buck1}
          boardKey="buck1"
        />
        <BoardTable
          title="Buck Board 2"
          data={pdbData.buck2}
          boardKey="buck2"
        />
        <BoardTable
          title="Switch Board"
          data={pdbData.switch}
          boardKey="switch"
        />

        {/* BMS View */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-green-500 mb-4">
            BMS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {pdbData.bms.map((v: number, i: number) => (
              <div
                key={i}
                className="bg-black/40 border border-gray-800 p-2 rounded-md"
              >
                <p className="text-[9px] text-gray-600 font-bold mb-1">
                  CELL {i.toString().padStart(2, "0")}
                </p>
                <p
                  className={`text-sm font-mono ${v < 3.2 ? "text-red-500 animate-pulse" : "text-gray-200"}`}
                >
                  {v.toFixed(3)}V
                </p>
                <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full"
                    style={{ width: `${((v - 3) / (4.2 - 3)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EstopButton />
    </div>
  );
};

export default PDB;
