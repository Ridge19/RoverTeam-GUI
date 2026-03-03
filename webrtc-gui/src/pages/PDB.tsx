import React, { useEffect } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

const PDB = () => {
  const { roverStatus } = useTelemetryContext();

  // Find the PDB data within the roverStatus array
  // We look for the entry that has "pdb_data" inside its data object
  const pdbEntry = roverStatus.find((status) => status.data.pdb_data);
  const pdbData = pdbEntry?.data.pdb_data;

  useEffect(() => {
    if (pdbData) {
      console.log("PDB Data Update:", pdbData);
    }
  }, [pdbData]);

  if (!pdbData) return <div>Waiting for PDB telemetry...</div>;

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h2 className="text-xl font-bold mb-2">PDB Telemetry</h2>

      <div className="grid grid-cols-2 gap-4">
        <section>
          <h3 className="font-semibold text-blue-400">Buck 1</h3>
          {pdbData.buck1.map((ch: any, i: number) => (
            <div key={i} className="text-sm">
              Ch {i}: {ch.voltage.toFixed(2)}V | {ch.power.toFixed(2)}W
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-semibold text-blue-400">Buck 2</h3>
          {pdbData.buck2.map((ch: any, i: number) => (
            <div key={i} className="text-sm">
              Ch {i}: {ch.voltage.toFixed(2)}V | {ch.power.toFixed(2)}W
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-semibold text-blue-400">Switch</h3>
          {pdbData.switch.map((ch: any, i: number) => (
            <div key={i} className="text-sm">
              Ch {i}: {ch.voltage.toFixed(2)}V | {ch.power.toFixed(2)}W
            </div>
          ))}
        </section>

        <section>
          <h3 className="font-semibold text-green-400">BMS Voltages</h3>
          <div className="text-xs grid grid-cols-3">
            {pdbData.bms.map((v: number, i: number) => (
              <span key={i}>
                [{i}]: {v.toFixed(2)}V
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PDB;
