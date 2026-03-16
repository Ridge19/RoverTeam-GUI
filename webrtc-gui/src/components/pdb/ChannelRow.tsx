import React, { memo, useState } from "react";
import usePDBPeaks from "@/hooks/pdb/usePDBPeaks";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import PDBService from "@/services/pdbService";
import styles from "./PDBTable.module.scss";

const formatUnit = (val: number | undefined | null, unit: string) => {
  if (val === undefined || val === null) return "--";

  return val < 1
    ? `${(val * 1000).toFixed(1)}m${unit}`
    : `${val.toFixed(2)}${unit}`;
};

const ChannelRow = memo(
  ({ id, metrics, board }: { id: number; metrics: any; board: string }) => {
    const { voltage = 0, current = 0, power = 0, temp = 0 } = metrics || {};

    const [state, setState] = useState(false);
    const [loading, setLoading] = useState(false);

    const peaks = usePDBPeaks(current, power, temp);
    const { currentEndpoint } = useTelemetryContext();
    const { getEndpointsOfService } = useEndpoints();

    const handleToggle = async () => {
      if (!currentEndpoint || loading) return;

      setLoading(true);
      const nextState = !state;

      try {
        await PDBService.toggleChannel(
          currentEndpoint,
          getEndpointsOfService,
          board,
          id,
          nextState,
        );

        setState(nextState);
      } catch (err) {
        console.error("Toggle failed", err);
        alert(`Network Error: Could not reach the PDB controller.`);
      } finally {
        setLoading(false);
      }
    };

    const isDrawing = current > 0.01;
    const rowOpacity = state ? "opacity-100" : "opacity-40";

    return (
      <tr className={`${styles.ChannelRow} ${!state ? styles.Off : ""}`}>
        <td>
          <span
            className={`${styles.ChannelId} ${isDrawing ? styles.Active : styles.Inactive}`}
          >
            Ch{id.toString().padStart(2, "0")}
          </span>
        </td>
        <td>{formatUnit(voltage, "V")}</td>
        <td style={{ color: isDrawing ? "#fbbf24" : "#666" }}>
          {formatUnit(current, "A")}
        </td>
        <td style={{ color: "#444", fontStyle: "italic", fontSize: "0.65rem" }}>
          {formatUnit(peaks?.maxI, "A")}
        </td>
        <td>{formatUnit(power, "W")}</td>
        <td style={{ color: "#444", fontStyle: "italic", fontSize: "0.65rem" }}>
          {formatUnit(peaks?.maxP, "W")}
        </td>
        <td style={{ color: temp > 50 ? "#ef4444" : "#fdba74" }}>
          {temp.toFixed(1)}°C
        </td>
        <td style={{ textAlign: "right" }}>
          <label className={styles.Switch}>
            <input
              type="checkbox"
              checked={state}
              disabled={loading || !currentEndpoint}
              onChange={handleToggle}
            />
            <span className={styles.Slider}></span>
          </label>
        </td>
      </tr>
    );
  },
);

export default ChannelRow;
