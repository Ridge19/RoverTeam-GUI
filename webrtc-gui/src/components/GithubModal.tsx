import StatusChip from "./StatusChip";
import { Modal } from "./Modal";

interface GithubModalProps {
  data: any;
  open: boolean;
  onClose: () => void;
}

export function GithubModal({ data, open, onClose }: GithubModalProps) {
  if (!data) return null;

  const authors = Array.isArray(data.authors) ? data.authors : [];

  return (
    <Modal open={open} onClose={onClose} title="Git Information">
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {/* Repo & Branch */}
        <div className="border rounded-xl p-3 bg-gray-800">
          <div className="font-medium mb-1">Repository</div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-semibold">Repo Name:</span>{" "}
              <code className="bg-black px-1 rounded">{data.repoName ?? "N/A"}</code>
            </div>
            <div>
              <span className="font-semibold">Remote URL:</span>{" "}
              <code className="bg-black px-1 rounded">{data.remoteUrl ?? "N/A"}</code>
            </div>
            <div>
              <span className="font-semibold">Branch:</span>{" "}
              <code className="bg-black px-1 rounded">{data.branch ?? "N/A"}</code>
            </div>
            <div>
              <span className="font-semibold">Commit:</span>{" "}
              <code className="bg-black px-1 rounded">{data.commit ?? "N/A"}</code>
            </div>
            <div>
              <span className="font-semibold">Short Commit:</span>{" "}
              <code className="bg-black px-1 rounded">{data.shortCommit ?? "N/A"}</code>
            </div>
            <div>
              <span className="font-semibold">Last Author:</span>{" "}
              <code className="bg-black px-1 rounded">{data.lastAuthor ?? "N/A"}</code>
            </div>
          </div>
        </div>

        {/* Authors List */}
        <div className="border rounded-xl p-3 bg-gray-800">
          <div className="font-medium mb-1">Leaderboard</div>
          <div className="space-y-1 text-sm">
            {authors.length === 0 && <div>No authors found</div>}
            {authors.map((a:any, i:any) => {
              // remove email from name
              const nameOnly = a.name.replace(/<.*>/, "").trim();
              return (
                <div key={i} className="flex justify-between" style={{
                  background: (i==0?"rgba(255, 213, 0, 0.5)":i==1?"#cccccc80":i==2?"rgba(192, 95, 54, 0.5)":"none"),
                  padding: 3,
                  borderRadius: 5
                }}>
                  <span>{nameOnly}</span>
                  <span className="font-mono" >{a.commits} commits</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}