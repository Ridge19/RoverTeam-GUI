import React, { useEffect, useState } from "react";
import { useGamepad } from "@/hooks/useGamepad";
import { InputHint } from "./InputHint";

interface Tab {
  id: string;
  label: string;
}

interface HeaderTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ tabs, active, onChange }) => {
  const gamepad = useGamepad();
  const [hasGamepad, setHasGamepad] = useState(gamepad.currentIndex !== null);

  useEffect(() => {
    const update = () => {
      setHasGamepad(gamepad.currentIndex !== null);
      requestAnimationFrame(update);
    };
    update();

    return () => {
      // nothing to clean up, just stops update loop automatically on unmount
    };
  }, [gamepad]);

  return (
    <nav
      className="flex gap-6 border-b border-gray-700 justify-center"
      style={{ marginTop: -40, height: 32 }}
    >
      {hasGamepad && <InputHint type="text" content="L1" inputLabel="BUMP_LEFT" />}
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "relative pb-2 text-m font-medium transition-colors",
              isActive ? "text-white" : "text-gray-400 hover:text-gray-200",
            ].join(" ")}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gray-300 rounded-full" />
            )}
          </button>
        );
      })}
      {hasGamepad && <InputHint type="text" content="R1" inputLabel="BUMP_RIGHT" />}
    </nav>
  );
};

export { HeaderTabs };