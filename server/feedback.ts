import fs from "fs/promises";
import path from "path";
import type { Express, Request, Response } from "express";
import { randomUUID } from "crypto";

export type FeedbackEntry = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  userAgent?: string;
};

function feedbackDir(rootDir: string) {
  return path.join(rootDir, "data", "feedback");
}

function feedbackFile(rootDir: string) {
  return path.join(feedbackDir(rootDir), "entries.json");
}

async function ensureStore(rootDir: string) {
  await fs.mkdir(feedbackDir(rootDir), { recursive: true });
  try {
    await fs.access(feedbackFile(rootDir));
  } catch {
    await fs.writeFile(feedbackFile(rootDir), "[]\n", "utf8");
  }
}

async function readAll(rootDir: string): Promise<FeedbackEntry[]> {
  await ensureStore(rootDir);
  try {
    const raw = await fs.readFile(feedbackFile(rootDir), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

async function appendEntry(
  rootDir: string,
  entry: FeedbackEntry,
): Promise<FeedbackEntry> {
  const all = await readAll(rootDir);
  all.unshift(entry);
  await fs.writeFile(
    feedbackFile(rootDir),
    `${JSON.stringify(all, null, 2)}\n`,
    "utf8",
  );
  return entry;
}

function cleanText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, max);
}

export function registerFeedbackRoutes(app: Express, rootDir: string) {
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const name = cleanText(req.body?.name, 120);
      const email = cleanText(req.body?.email, 200);
      const message = cleanText(req.body?.message, 4000);

      if (!name || !email || !message) {
        res.status(400).json({ error: "Name, email, and message are required." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Enter a valid email address." });
        return;
      }

      const entry = await appendEntry(rootDir, {
        id: randomUUID(),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
        userAgent: cleanText(req.header("user-agent"), 300) || undefined,
      });

      res.status(201).json({ ok: true, id: entry.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save feedback.";
      res.status(500).json({ error: message });
    }
  });
}
