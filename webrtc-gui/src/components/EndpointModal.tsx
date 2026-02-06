import { useEndpoints } from "@/contexts/EndpointContext";
import StatusChip from "./StatusChip";
import { Modal } from "./Modal";

export function EndpointModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { endpoints } = useEndpoints();

  return (
    <Modal open={open} onClose={onClose} title="Endpoints">
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {endpoints.map(ep => {
          const anyOnline = ep.ports.some(p => p.status === "online");
          if (!anyOnline) return null;

          return (
            <div
              key={ep.host}
              className="border rounded-xl p-3 bg-gray-800"
            >
              <div className="font-medium mb-1 flex justify-between">
                <code style={{ backgroundColor: "#000", padding: "1px 3px", borderRadius: 5 }}>{ep.host}/</code>
              </div>

              <div className="space-y-1 text-sm">
                {ep.ports.map(p => {

                  if(p.status !== "online") return ""
                  
                  return(
                    <div key={p.port} className="flex justify-between">
                      <span style={{ marginLeft: 10 }}>
                        Port <code style={{ backgroundColor: "#000", padding: "1px 3px", borderRadius: 5 }}>{p.port}</code>
                      </span>
                      <span>
                        <StatusChip
                          compact
                          noDot
                          color={p.status === "online" ? "success" : "error"}
                          label={p.status === "online" ? p.service : "no service"}
                        />
                      </span>
                    </div>
                )})}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}