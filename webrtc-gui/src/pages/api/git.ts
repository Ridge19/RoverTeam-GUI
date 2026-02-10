// pages/api/git.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const gitDir = path.join(process.cwd(), "../", ".git");

  if (!fs.existsSync(gitDir)) {
    return res.status(200).json({ branch: null, commit: null, error: ".git folder not found" });
  }

  try {
    const headPath = path.join(gitDir, "HEAD");
    const head = fs.readFileSync(headPath, "utf-8").trim();

    let branch: string | null = null;
    let commit: string | null = null;

    if (head.startsWith("ref:")) {
      const refPath = head.split(" ")[1]; // e.g., refs/heads/main
      branch = refPath.split("/").slice(2).join("/");
      const commitPath = path.join(gitDir, refPath);
      commit = fs.existsSync(commitPath) ? fs.readFileSync(commitPath, "utf-8").trim() : null;
    } else {
      // Detached HEAD
      branch = null;
      commit = head;
    }

    return res.status(200).json({ branch, commit });
  } catch (err: any) {
    return res.status(500).json({ branch: null, commit: null, error: err.message });
  }
}
