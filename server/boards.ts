import fs from "fs/promises";
import path from "path";
import type { Request, Response } from "express";
import { parseBoardDocument, stringifyBoard } from "../shared/board/document.js";
import type { BoardDocument } from "../shared/board/types.js";

export type BoardSummary = {
  id: string;
  name: string;
  updatedAt: string;
};

function boardsDir(rootDir: string): string {
  return path.join(rootDir, "data", "boards");
}

function boardPath(rootDir: string, id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  if (!safe) throw new Error("Invalid board id");
  return path.join(boardsDir(rootDir), `${safe}.json`);
}

async function ensureDir(rootDir: string): Promise<void> {
  await fs.mkdir(boardsDir(rootDir), { recursive: true });
}

export async function listBoards(rootDir: string): Promise<BoardSummary[]> {
  await ensureDir(rootDir);
  const dir = boardsDir(rootDir);
  let names: string[] = [];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  const out: BoardSummary[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const id = name.slice(0, -5);
    const full = path.join(dir, name);
    try {
      const raw = await fs.readFile(full, "utf8");
      const doc = parseBoardDocument(JSON.parse(raw));
      const stat = await fs.stat(full);
      out.push({
        id,
        name: doc.name || id,
        updatedAt: stat.mtime.toISOString(),
      });
    } catch {
      /* skip bad files */
    }
  }
  out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return out;
}

export async function readBoard(
  rootDir: string,
  id: string,
): Promise<BoardDocument | null> {
  try {
    const raw = await fs.readFile(boardPath(rootDir, id), "utf8");
    return parseBoardDocument(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeBoard(
  rootDir: string,
  id: string,
  doc: BoardDocument,
): Promise<BoardDocument> {
  await ensureDir(rootDir);
  const parsed = parseBoardDocument(doc);
  parsed.name = parsed.name || id;
  await fs.writeFile(boardPath(rootDir, id), stringifyBoard(parsed), "utf8");
  return parsed;
}

export function registerBoardRoutes(
  app: import("express").Express,
  rootDir: string,
) {
  app.get("/api/boards", async (_req: Request, res: Response) => {
    try {
      res.json({ boards: await listBoards(rootDir) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "List failed";
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/boards/:id", async (req: Request, res: Response) => {
    try {
      const doc = await readBoard(rootDir, String(req.params.id));
      if (!doc) {
        res.status(404).json({ error: "Board not found" });
        return;
      }
      res.json({ document: doc });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Read failed";
      res.status(500).json({ error: message });
    }
  });

  app.put("/api/boards/:id", async (req: Request, res: Response) => {
    try {
      const document = parseBoardDocument(req.body?.document ?? req.body);
      const saved = await writeBoard(rootDir, String(req.params.id), document);
      res.json({ document: saved });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed";
      res.status(500).json({ error: message });
    }
  });
}
