import { apiUrl } from "../backend";
import {
  parseBoardDocument,
  type BoardDocument,
} from "../../shared/board";

export type BoardSummary = {
  id: string;
  name: string;
  updatedAt: string;
};

export async function listServerBoards(): Promise<BoardSummary[]> {
  const res = await fetch(apiUrl("/api/boards"));
  if (!res.ok) throw new Error("Could not list boards");
  const data = (await res.json()) as { boards?: BoardSummary[] };
  return data.boards || [];
}

export async function loadServerBoard(id: string): Promise<BoardDocument> {
  const res = await fetch(apiUrl(`/api/boards/${encodeURIComponent(id)}`));
  if (!res.ok) throw new Error("Board not found");
  const data = (await res.json()) as { document: unknown };
  return parseBoardDocument(data.document);
}

export async function saveServerBoard(
  id: string,
  document: BoardDocument,
): Promise<BoardDocument> {
  const res = await fetch(apiUrl(`/api/boards/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Save failed");
  }
  const data = (await res.json()) as { document: unknown };
  return parseBoardDocument(data.document);
}
