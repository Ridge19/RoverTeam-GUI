// File: /pages/api/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type LogRequest = {
  file?: string;
  log?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { file, log }: LogRequest = req.body;

  if (!file || !log) {
    return res.status(400).json({ error: "Missing 'file' or 'log'" });
  }

  try {
    // Create folder for today's logs
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const logsDir = path.join(process.cwd(), "../", "logs", dateStr);

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Log file path
    const filePath = path.join(logsDir, `${file}.log`);

    // Timestamp
    const timestamp = today
      .toISOString()
      .replace("T", " ")
      .split(".")[0]; // YYYY-MM-DD HH:MM:SS

    // Append log line
    fs.appendFileSync(filePath, `[${timestamp}] ${log}\n`, "utf-8");

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to write log:", err);
    return res.status(500).json({ error: "Failed to write log" });
  }
}
