import React, { useState } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";
import { useEndpoints } from "@/contexts/EndpointContext";
import PDBService from "@/services/pdbService";

const EstopButton = () => {
  const [loading, setLoading] = useState(false);
  const { currentEndpoint } = useTelemetryContext();
  const { getEndpointsOfService } = useEndpoints();

  const handleEstop = async () => {
    // Basic safety check: Don't fire if already loading or no connection
    if (!currentEndpoint || loading) return;

    const confirm = window.confirm(
      "!!! EMERGENCY STOP: SHUT DOWN ALL CHANNELS? !!!",
    );
    if (!confirm) return;

    setLoading(true);
    try {
      await PDBService.estop(currentEndpoint, getEndpointsOfService);
      alert("EMERGENCY STOP COMMAND SENT");
    } catch (err) {
      console.error("E-Stop failed", err);
      alert("CRITICAL ERROR: Could not send E-Stop command!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEstop}
      disabled={loading || !currentEndpoint}
      className={`
        group relative flex items-center justify-center gap-3
        px-8 py-4 rounded-xl font-black uppercase tracking-tighter transition-all
        ${
          loading || !currentEndpoint
            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] active:scale-95"
        }
      `}
    >
      <div className="absolute inset-0 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-colors" />

      <span className="text-xl">
        {loading ? "SENDING..." : "Emergency Stop"}
      </span>

      {!currentEndpoint && (
        <span className="absolute -bottom-6 left-0 right-0 text-[10px] text-red-500 font-bold text-center">
          PDB DISCONNECTED
        </span>
      )}
    </button>
  );
};

export default EstopButton;
