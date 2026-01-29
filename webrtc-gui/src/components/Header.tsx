import React, { useEffect, useRef } from 'react';
import StatusChip from './StatusChip';
import { useRoverWatchdog } from '@/hooks/useRoverWatchdog';
import { HeaderTabs } from './HeaderTabs';
import { useRoverUrl } from '@/hooks/useRoverUrl';
import { useGamepad } from '@/hooks/useGamepad';

interface HeaderProps {
  target?: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ target, activeTab, setActiveTab }) => {
  const roverWatchdog = useRoverWatchdog();
  const gamepad = useGamepad();
  const lastBumpState = useRef<{ [key: string]: boolean }>({});

  const bumpTab = (amount: number) => {
    if(amount>0 && activeTab === "cameras") setActiveTab("arm");
    if(amount<0 && activeTab === "arm") setActiveTab("cameras");
  };

  useEffect(() => {
    // Edge-triggered bump left
    const handleBumpLeft = (pressed: any) => {
      if (pressed && !lastBumpState.current['BUMP_LEFT']) {
        bumpTab(-1);
      }
      lastBumpState.current['BUMP_LEFT'] = pressed;
    };

    // Edge-triggered bump right
    const handleBumpRight = (pressed: any) => {
      if (pressed && !lastBumpState.current['BUMP_RIGHT']) {
        bumpTab(1);
      }
      lastBumpState.current['BUMP_RIGHT'] = pressed;
    };

    gamepad.registerInputChanged('BUMP_LEFT', handleBumpLeft);
    gamepad.registerInputChanged('BUMP_RIGHT', handleBumpRight);

    return () => {
      gamepad.deregisterInputChanged('BUMP_LEFT', handleBumpLeft);
      gamepad.deregisterInputChanged('BUMP_RIGHT', handleBumpRight);
    };
  }, [gamepad]);

  return (
    <header
      className="text-gray-100 shadow-md"
      style={{
        background: '#222',
        flexShrink: 0, // ensure header doesn't shrink in a flex column
        height: 110
      }}
    >
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
            <span className="text-xs text-gray-400">
              {useRoverUrl()?.replace('http://', '')}
            </span>
            <StatusChip
              color={
                roverWatchdog.status === 'connected'
                  ? 'success'
                  : roverWatchdog.status === 'connecting'
                  ? 'warning'
                  : 'error'
              }
              label={roverWatchdog.status}
            />
          </div>
        </div>

        {/* Tabs row */}
        <HeaderTabs
          tabs={[
            { id: 'cameras', label: 'Cameras' },
            { id: 'arm', label: 'Arm' },
            { id: 'telemetry', label: 'Telemetry' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </header>
  );
};
