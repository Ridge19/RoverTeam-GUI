import React, { useMemo, useState, useEffect } from "react";
import { HeaderTabs } from "./HeaderTabs";
import { EndpointModal } from "@/components/EndpointModal";
import { GithubModal } from "./GithubModal";
import { useEndpoints } from "@/contexts/EndpointContext";

interface HeaderProps {
  target?: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  target,
  activeTab,
  setActiveTab,
}) => {
  const [endpointModalOpen, setEndpointModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const { endpoints } = useEndpoints();
  const [gitData, setGitData] = useState<any>({});

  // Fetch Git info from server API
  useEffect(() => {
    fetch("/api/git")
      .then((res) => res.json())
      .then((data) => {
        setGitData(data);
      })
      .catch(() => setGitData({ error: "Bad fetch" }));
  }, []);

  // Compute port & endpoint counts
  const { portCount, endpointCount } = useMemo(() => {
    const activeEndpoints = endpoints.filter((ep) =>
      ep.ports.some((p) => p.status === "online"),
    );
    const ports = activeEndpoints.reduce(
      (sum, ep) => sum + ep.ports.filter((p) => p.status === "online").length,
      0,
    );
    return { portCount: ports, endpointCount: activeEndpoints.length };
  }, [endpoints]);

  const statusColor =
    portCount === 0 && endpointCount === 0 ? "error" : "success";
  const statusLabel = `${portCount} port${portCount === 1 ? "" : "s"}, ${endpointCount} endpoint${endpointCount === 1 ? "" : "s"}`;

  return (
    <header
      className="text-gray-100 shadow-md"
      style={{ background: "#222", flexShrink: 0, height: 110 }}
    >
      <EndpointModal
        open={endpointModalOpen}
        onClose={() => setEndpointModalOpen(false)}
      />
      <GithubModal
        data={gitData}
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
      />
      <div className="mx-auto px-4 py-4 flex flex-col gap-6">
        {/* Top row */}
        <div className="relative flex items-center">
          {/* Logo (left) */}
          <img src="Team Logo.png" className="h-[70px] flex-shrink-0" />

          {gitData.available && ( //&& gitData.branch!=="main"
            <div
              className="cursor-pointer text-xs text-center -mt-3 ml-5 -mt-15"
              style={{ color: "#777" }}
              onClick={() => setGithubModalOpen(true)}
            >
              {gitData.branch} @ {gitData.shortCommit}
            </div>
          )}

          {/* Title (centered absolutely) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1
              onClick={() => setEndpointModalOpen(true)}
              className="text-3xl font-extrabold text-center cursor-pointer"
              style={{ transform: "translateY(-18px)" }}
            >
              Command & Control Centre
            </h1>
          </div>

          <img
            src="Equinox Logo.png"
            className="h-[70px] flex-shrink-0 ml-auto"
          />
        </div>

        {/* Tabs row */}
        <HeaderTabs
          tabs={[
            { id: "cameras", label: "Cameras" },
            { id: "arm", label: "Arm" },
            { id: "telemetry", label: "Telemetry" },
            { id: "vitals", label: "System" },
            { id: "pdb", label: "PDB" },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </header>
  );
};
