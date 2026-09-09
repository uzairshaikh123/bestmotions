import { apiUrl } from "../backend";
import type {
  AiStatusResponse,
  MotionPlan,
  MotionPlanRequest,
} from "../../shared/ai/types";

export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const res = await fetch(apiUrl("/api/ai/status"));
  if (!res.ok) {
    throw new Error("Could not reach AI status endpoint.");
  }
  return (await res.json()) as AiStatusResponse;
}

export async function requestMotionPlan(
  body: MotionPlanRequest,
): Promise<MotionPlan> {
  const res = await fetch(apiUrl("/api/ai/plan"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { plan?: MotionPlan; error?: string };
  if (!res.ok || !data.plan) {
    throw new Error(data.error || "Could not generate a motion plan.");
  }
  return data.plan;
}
