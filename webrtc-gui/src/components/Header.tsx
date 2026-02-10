import React, { useMemo, useState } from 'react';
import StatusChip from './StatusChip';
import { HeaderTabs } from './HeaderTabs';
import { useRoverUrl } from '@/hooks/useRoverUrl';
import { EndpointModal } from "@/components/EndpointModal";
import { useEndpoints } from "@/contexts/EndpointContext";

interface HeaderProps {
  target?: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ target, activeTab, setActiveTab }) => {
  const [endpointModalOpen, setEndpointModalOpen] = useState<boolean>(false);
  const { endpoints } = useEndpoints();

  // Compute port & endpoint counts
  const { portCount, endpointCount } = useMemo(() => {
    const activeEndpoints = endpoints.filter(ep =>
      ep.ports.some(p => p.status === "online")
    );
    const ports = activeEndpoints.reduce(
      (sum, ep) => sum + ep.ports.filter(p => p.status === "online").length,
      0
    );
    return {
      portCount: ports,
      endpointCount: activeEndpoints.length,
    };
  }, [endpoints]);

  const statusColor = portCount === 0 && endpointCount === 0 ? "error" : "success";
  const statusLabel = `${portCount} port${portCount === 1 ? "" : "s"}, ${endpointCount} endpoint${endpointCount === 1 ? "" : "s"}`;

  return (
    <header
      className="text-gray-100 shadow-md"
      style={{
        background: '#222',
        flexShrink: 0,
        height: 110,
      }}
    >
      <EndpointModal open={endpointModalOpen} onClose={()=>setEndpointModalOpen(false)}/>
      <div className="mx-auto px-4 py-4 flex flex-col gap-6">

        {/* Top row */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <img src="Equinox Logo.png" className="h-[70px] flex-shrink-0" />

          {/* Title */}
          <div>
            <h1 className="text-3xl font-extrabold">RMIT Rover Team</h1>
            <p className="text-gray-400 mt-1">Equinox Control Centre</p>
          </div>

          {/* Status */}
          <div className="ml-auto flex items-center gap-3">
            <StatusChip
              onClick={() => setEndpointModalOpen(true)}
              color={statusColor}
              label={statusLabel}
            />
          </div>
        </div>

        {/* Tabs row */}
        <HeaderTabs
          tabs={[
            { id: 'cameras', label: 'Cameras' },
            { id: 'arm', label: 'Arm' },
            { id: 'telemetry', label: 'Telemetry' },
            { id: 'vitals', label: 'System' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </header>
  );
};