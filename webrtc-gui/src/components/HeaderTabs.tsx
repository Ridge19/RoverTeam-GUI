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
  return (
    <nav className="flex gap-6 border-b border-gray-700 justify-center" style={{marginTop: -30}}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "relative pb-2 text-m font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-200",
            ].join(" ")}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gray-300 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export { HeaderTabs };