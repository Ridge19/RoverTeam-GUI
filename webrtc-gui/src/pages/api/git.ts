// pages/api/git.ts
import { execSync } from "child_process";
import path from "path";

export default function handler(req:any, res:any) {
  const result: any = {
    available: false,
    cwd: process.cwd(),
    branch: null,
    commit: null,
    shortCommit: null,
    lastAuthor: null,
    authors: [],
    raw: "",
    repoName: null,
    remoteUrl: null,
  };

  try {
    // Branch & latest commit
    result.branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    result.commit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    result.shortCommit = result.commit.slice(0, 7);

    // Last author
    result.lastAuthor = execSync("git log -1 --pretty=format:%an", { encoding: "utf8" }).trim();

    // Authors & commit counts
    const authorsRaw = execSync("git shortlog -s -n -e --all", { encoding: "utf8" });
    result.raw = authorsRaw.trim();
    result.authors = authorsRaw
      .trim()
      .split("\n")
      .map((line) => {
        const m = line.trim().match(/^(\d+)\s+(.*)$/);
        if (!m) return null;
        return { commits: parseInt(m[1]), name: m[2] };
      })
      .filter(Boolean);

    // Repo remote info
    const remoteUrl = execSync("git config --get remote.origin.url", { encoding: "utf8" }).trim();
    result.remoteUrl = remoteUrl;

    // Repo name
    result.repoName = path.basename(remoteUrl.replace(/\.git$/, ""));

    result.available = true;
  } catch (e:any) {
    console.warn("Git API error:", e.message);
  }

  res.status(200).json(result);
}