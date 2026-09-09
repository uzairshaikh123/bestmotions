import type { Express, Request, Response } from "express";
import type { MotionPlanRequest } from "../../shared/ai/types.js";
import { isAiFeatureEnabled } from "../featureFlags.js";
import { geminiConfigured, geminiModelName } from "./gemini.js";
import { createMotionPlan } from "./plan.js";

export function registerAiRoutes(app: Express): void {
  app.get("/api/ai/status", (_req, res) => {
    const enabled = isAiFeatureEnabled();
    res.json({
      enabled,
      configured: enabled && geminiConfigured(),
      model: enabled && geminiConfigured() ? geminiModelName() : null,
    });
  });

  app.post("/api/ai/plan", async (req: Request, res: Response) => {
    if (!isAiFeatureEnabled()) {
      res.status(403).json({
        error: "AI feature is disabled. Set FEATURE_AI=true on the server.",
      });
      return;
    }
    if (!geminiConfigured()) {
      res.status(503).json({
        error: "GEMINI_API_KEY is missing. Add it to the server environment.",
      });
      return;
    }

    try {
      const body = (req.body || {}) as MotionPlanRequest;
      const plan = await createMotionPlan(body);
      res.json({ plan });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Planning failed.";
      const status = /too short|too long|No templates/i.test(message) ? 400 : 502;
      res.status(status).json({ error: message });
    }
  });
}
