import React, { useEffect, useState } from "react";
import { ButtonTooltip } from "./ButtonTooltip";
import { useButtonPress } from "@/contexts/GamepadContext";

interface Tab {
  id: string;
  label: string;
}

interface HeaderTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

const LEFT = 14
const RIGHT = 15

const HeaderTabs: React.FC<HeaderTabsProps> = ({ tabs, active, onChange }) => {

  useButtonPress(LEFT, () => moveActiveTab(-1))
  useButtonPress(RIGHT, () => moveActiveTab(+1))

  function moveActiveTab(delta: 1 | -1) {
    const currentIndex = tabs.findIndex(tab => tab.id === active);
    if (currentIndex === -1) return; // active not found
  
    // Compute new index and clamp to array bounds
    const newIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + delta));
  
    // Only change if different
    if (newIndex !== currentIndex) {
      onChange(tabs[newIndex].id);
    }
  }  

  return (
    <nav
      className="flex gap-6 border-b border-gray-700 justify-center"
      style={{ marginTop: -40, height: 32 }}
    >
      <ButtonTooltip buttonIndex={LEFT} size={32}></ButtonTooltip>
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
      <ButtonTooltip buttonIndex={RIGHT} size={32}></ButtonTooltip>
    </nav>
  );
};

export { HeaderTabs };