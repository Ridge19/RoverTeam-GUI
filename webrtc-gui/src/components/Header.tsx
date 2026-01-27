import React, { useState } from 'react';
import StatusChip from './StatusChip';
import { useRoverWatchdog } from '@/hooks/useRoverWatchdog';
import { HeaderTabs } from './HeaderTabs';
import { useRoverUrl } from '@/hooks/useRoverUrl';

export const Header: React.FC<{ target?: string }> = ({ target }) => {
  const roverWatchdog = useRoverWatchdog();
  const [activeTab, setActiveTab] = useState("cameras");

  return (
    <header className="text-gray-100 shadow-md" style={{ background: "#222" }}>
      <div className="mx-auto px-4 py-4 flex flex-col gap-6">

        {/* Top row */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <img src="Equinox Logo.png" className="h-[70px]" />

          {/* Title */}
          <div>
            <h1 className="text-3xl font-extrabold">RMIT Rover Team</h1>
            <p className="text-gray-400 mt-1">Equinox Control Centre</p>
          </div>

          {/* Status */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {useRoverUrl()?.replace("http://", "")}
            </span>
            <StatusChip
              color={
                roverWatchdog.status === "connected"
                  ? "success"
                  : roverWatchdog.status === "connecting"
                  ? "warning"
                  : "error"
              }
              label={roverWatchdog.status}
            />
          </div>
        </div>

        {/* Tabs row */}
        <HeaderTabs
          tabs={[
            { id: "cameras", label: "Cameras" },
            { id: "arm", label: "Arm" },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </header>
  );
};