export type GeminiJsonResult = {
  text: string;
  model: string;
};

function envModel(): string {
  return (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function geminiModelName(): string {
  return envModel();
}

/**
 * Flat schema so invent stays reliable.
 * Preferred invent payload: composeJson (stringified CompositionSpec).
 * Fallback invent fields: inventKind / year* / beatLines.
 */
const PLAN_SCHEMA = {
  type: "OBJECT",
  properties: {
    mode: { type: "STRING" },
    assetId: { type: "STRING" },
    rationale: { type: "STRING" },
    alternatives: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    props: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          key: { type: "STRING" },
          value: { type: "STRING" },
        },
        required: ["key", "value"],
      },
    },
    /** Full CompositionSpec as a JSON string — preferred invent output. */
    composeJson: { type: "STRING" },
    inventKind: { type: "STRING" },
    yearStart: { type: "STRING" },
    yearEnd: { type: "STRING" },
    yearHoldSec: { type: "STRING" },
    yearDirection: { type: "STRING" },
    finaleTitle: { type: "STRING" },
    finaleSubtitle: { type: "STRING" },
    icons: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    beatLines: {
      type: "ARRAY",
      items: { type: "STRING" },
      description:
        "Fallback beats: type|fields… e.g. title|EYEBROW|Title|Subtitle ; bullets|Title|a|b ; stats|Title|GDP|7.2% ; bars|Title|A|72 ; cards|Title|Card|Body ; timeline|Title|1991|Reform|Detail ; quote|Text|Who ; compare|Title|Left|L point|Right|R point ; outro|Title|Sub ; year_flip|1981|1991|1|vertical|Finale|Sub",
    },
    accent: { type: "STRING" },
    bg: { type: "STRING" },
  },
  required: ["mode", "assetId", "props", "rationale", "alternatives"],
};

export async function generateGeminiJson(
  system: string,
  user: string,
): Promise<GeminiJsonResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const model = envModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: user }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: PLAN_SCHEMA,
        },
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Gemini timed out — try a shorter prompt or Create new again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const body = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  if (!res.ok) {
    throw new Error(body.error?.message || `Gemini request failed (${res.status})`);
  }

  const text = body.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return { text, model };
}
