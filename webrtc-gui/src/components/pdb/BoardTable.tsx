import { useMemo } from "react";
import { useBoardData } from "@/hooks/pdb/usePDBTelemetry";
import ChannelRow from "./ChannelRow";
import styles from "./PDBTable.module.scss";

const DEFAULT_METRICS = { voltage: 0, current: 0, power: 0, temp: 0 };

const BoardTable = ({
  title,
  boardKey,
  channelCount,
}: {
  title: string;
  boardKey: string;
  channelCount: number;
}) => {
  const boardData = useBoardData(boardKey);

  const rows = useMemo(() => {
    return Array.from(
      { length: channelCount },
      (_, i) => boardData[i] || DEFAULT_METRICS,
    );
  }, [boardData, channelCount]);

  return (
    <section className={styles.BoardWidget}>
      <div className={styles.TitleBar}>
        <h3>{title}</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Voltage</th>
              <th>Current</th>
              <th>Peak I</th>
              <th>Power</th>
              <th>Peak P</th>
              <th>Temp</th>
              <th style={{ textAlign: "right" }}>State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((metrics, i) => (
              <ChannelRow key={i} id={i} metrics={metrics} board={boardKey} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BoardTable;
