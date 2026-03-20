import React, { useState } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import PDBService from "@/services/pdbService";

const PollingInput = ({ initialInterval }: { initialInterval: number }) => {
  const [intervalValue, setIntervalValue] = useState<number>(initialInterval);
  const [loading, setLoading] = useState(false);

  const { currentEndpoint } = useTelemetryContext();
  const { getEndpointsOfService } = useEndpoints();

  // This handles the service call
  const updateInterval = async (newValue: number) => {
    setLoading(true);
    try {
      if (!currentEndpoint || loading) return;

      await PDBService.setInterval(
        getEndpointsOfService,
        newValue,
      );
      console.log("Interval updated successfully");
    } catch (error) {
      console.error("Failed to update interval:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setIntervalValue(val);
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <label htmlFor="interval-input">Polling Interval (ms):</label>
      <input
        id="interval-input"
        type="number"
        value={intervalValue}
        onChange={handleChange}
      />
      <button onClick={() => updateInterval(intervalValue)} disabled={loading}>
        {loading ? "Updating..." : "Set Interval"}
      </button>
    </div>
  );
};

export default PollingInput