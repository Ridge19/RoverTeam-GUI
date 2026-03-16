import { useBmsData } from "@/hooks/pdb/usePDBTelemetry";
import styles from "./PDBTable.module.scss";
import { memo } from "react";

const BatteryCell = memo(
  ({ index, voltage }: { index: number; voltage: number }) => (
    <div className={styles.cell}>
      <p className={styles.cellLabel}>Cell {index}</p>
      <p className={styles.cellValue}>{voltage.toFixed(3)}V</p>
    </div>
  ),
);

BatteryCell.displayName = "BatteryCell";

const BMSTable = () => {
  // 2. The hook handles the telemetry connection
  const bmsData = useBmsData();

  return (
    <section className={styles.container}>
      <h3 className={styles.title}>BMS Monitor</h3>
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <BatteryCell
            key={i}
            index={i}
            // 3. Ensure we access the data correctly (bmsData is the array)
            voltage={bmsData[i] || 0}
          />
        ))}
      </div>
    </section>
  );
};

export default BMSTable;
