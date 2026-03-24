import { useState, useMemo } from "react";
import { usePdbData } from "@/hooks/pdb/usePDBTelemetry";
import BoardTable from "@/components/pdb/BoardTable";
import BMSTable from "@/components/pdb/BMSTable";
import EstopButton from "@/components/pdb/EStop";
import PollingInput from "@/components/pdb/PollingInput";
import styles from "./PDB.module.scss";

const BOARD_CONFIGS = [
  { key: "buck1", title: "Buck Board 1", channels: 2 },
  { key: "buck2", title: "Buck Board 2", channels: 2 },
  { key: "switch", title: "Switch Board", channels: 8 },
];

const PDB = () => {
  const pdbData = usePdbData();

  const busVoltage = useMemo(() => {
    return pdbData.bms?.metric_data?.reduce((a: number, b: number) => a + b, 0) || 0;
  }, [pdbData.bms]);

  return (
    <div className={styles.PdbPage}>
      <header className={styles.Header}>
        <div>
          <h1>Power Distribution Boards</h1>
        </div>

        <div className={styles.StatsContainer}>
          <div className={styles.StatBlock}>
            <p>Bus Voltage</p>
            <p className={`${styles.Value} ${styles.Blue}`}>
              {busVoltage.toFixed(2)}V
            </p>
          </div>
          <div className={styles.StatBlock}>
            <p>Battery Cells</p>
            <p className={`${styles.Value} ${styles.Green}`}>
              {pdbData.bms?.metric_data?.length || 0}
            </p>
          </div>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {BOARD_CONFIGS.map((config) => (
          <BoardTable
            key={config.key}
            title={config.title}
            boardKey={config.key}
            channelCount={config.channels}
          />
        ))}

        <BMSTable />
      </main>

      <footer className={styles.Footer}>
        <PollingInput initialInterval={1} />
        <EstopButton />
      </footer>
    </div>
  );
};

export default PDB;
