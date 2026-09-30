import type {
  AiAspect,
  AiCreateMode,
  AiStyle,
  MotionPlan,
  MotionPlanRequest,
} from "../../shared/ai/types.js";
import {
  AI_COMPOSE_ASSET_ID,
  estimateComposeSeconds,
  normalizeComposition,
  parseComposeJson,
  stringifyComposition,
  type CompositionSpec,
} from "../../shared/ai/compose.js";
import {
  compositionFromPrompt,
  needsCustomMotion,
} from "../../shared/ai/promptCompose.js";
import {
  fieldSchemas,
  getAsset,
  retrieveCandidates,
  sanitizeProps,
} from "./catalog.js";
import { generateGeminiJson } from "./gemini.js";
function normalizeStyle(raw: unknown): AiStyle {
  const value = String(raw || "any").toLowerCase();
  const allowed: AiStyle[] = [
    "any",
    "news",
    "doc",
    "chart",
    "map",
    "yt",
    "shorts",
    "books",
  ];
  return (allowed.includes(value as AiStyle) ? value : "any") as AiStyle;
}
function normalizeAspect(raw: unknown): AiAspect {
  return raw === "9:16" ? "9:16" : "16:9";
}
function normalizeCreateMode(raw: unknown): AiCreateMode {
  const value = String(raw || "auto").toLowerCase();
  if (value === "invent" || value === "catalog" || value === "auto") {
    return value;
  }
  return "auto";
}
function propsFromModel(
  raw: Record<string, unknown> | Array<{ key?: string; value?: string }> | undefined,
): Record<string, unknown> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const out: Record<string, unknown> = {};
    for (const row of raw) {
      const key = String(row?.key || "").trim();
      if (!key) continue;
      out[key] = row?.value ?? "";
    }
    return out;
  }
  return raw;
}
function parseModelJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini did not return valid JSON.");
    return JSON.parse(match[0].replace(/,\s*([}\]])/g, "$1")) as Record<
      string,
      unknown
    >;
  }
}
function beatIsUsable(beat: CompositionSpec["beats"][number]): boolean {
  if (beat.type === "title" || beat.type === "outro" || beat.type === "quote") {
    return Boolean(beat.type === "quote" ? beat.text : beat.title);
  }
  if (beat.type === "compare") {
    return beat.left.points.length + beat.right.points.length > 0;
  }
  if (beat.type === "year_flip") {
    return beat.years.length >= 2 && Boolean(beat.finaleTitle);
  }
  if ("items" in beat) return Array.isArray(beat.items) && beat.items.length > 0;
  return true;
}
function compositionLooksDefault(spec: CompositionSpec): boolean {
  const first = spec.beats[0];
  return (
    first?.type === "title" &&
    first.title === "Describe any graphic"
  );
}
function compositionFromComposeJsonField(
  parsed: Record<string, unknown>,
  props: Record<string, unknown>,
): CompositionSpec | null {
  const candidates = [
    parsed.composeJson,
    props.composeJson,
    parsed.composition,
    parsed.compositionJson,
  ];
  for (const raw of candidates) {
    if (raw === undefined || raw === null || raw === "") continue;
    const spec =
      typeof raw === "string"
        ? parseComposeJson(raw)
        : normalizeComposition(raw);
    if (spec.beats.some(beatIsUsable) && !compositionLooksDefault(spec)) {
      return spec;
    }
  }
  return null;
}
function parseBeatLine(line: string, prompt: string): CompositionSpec["beats"][number] | null {
  const parts = String(line)
    .split("|")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (!parts.length) return null;
  const type = parts[0].toLowerCase();
  if (type === "title") {
    return {
      type: "title",
      eyebrow: parts.length >= 3 ? parts[1] : undefined,
      title: parts.length >= 3 ? parts[2] : parts[1] || prompt.slice(0, 64),
      subtitle: parts.length >= 4 ? parts[3] : parts.length === 3 ? undefined : parts[2],
    };
  }
  if (type === "outro") {
    return {
      type: "outro",
      title: parts[1] || "The end",
      subtitle: parts[2],
    };
  }
  if (type === "bullets") {
    return {
      type: "bullets",
      title: parts[1],
      items: parts.slice(2),
    };
  }
  if (type === "cards") {
    const items: Array<{ title: string; body: string }> = [];
    const bodyParts = parts.slice(2);
    for (let i = 0; i < bodyParts.length; i += 2) {
      items.push({
        title: bodyParts[i] || "Card",
        body: bodyParts[i + 1] || "",
      });
    }
    return { type: "cards", title: parts[1], items };
  }
  if (type === "stats") {
    const items: Array<{ label: string; value: string }> = [];
    const rest = parts.slice(2);
    for (let i = 0; i < rest.length; i += 2) {
      const label = rest[i];
      const value = rest[i + 1] || label;
      if (label) items.push({ label, value });
    }
    return { type: "stats", title: parts[1], items };
  }
  if (type === "bars") {
    const items: Array<{ label: string; value: number }> = [];
    const rest = parts.slice(2);
    for (let i = 0; i < rest.length; i += 2) {
      const label = rest[i] || "Item";
      const value = Number(rest[i + 1]);
      items.push({
        label,
        value: Number.isFinite(value) ? Math.max(0, value) : 50,
      });
    }
    return { type: "bars", title: parts[1], items };
  }
  if (type === "timeline") {
    const items: Array<{ when: string; label: string; detail?: string }> = [];
    const rest = parts.slice(2);
    for (let i = 0; i < rest.length; i += 3) {
      if (!rest[i] && !rest[i + 1]) continue;
      items.push({
        when: rest[i] || "Ã¢â‚¬â€",
        label: rest[i + 1] || rest[i] || "Event",
        detail: rest[i + 2] || undefined,
      });
    }
    return { type: "timeline", title: parts[1], items };
  }
  if (type === "quote") {
    return {
      type: "quote",
      text: parts[1] || prompt.slice(0, 120),
      attribution: parts[2],
    };
  }
  if (type === "compare") {
    const title = parts[1];
    const leftTitle = parts[2] || "A";
    // compare|Title|Left|...|Right|... (literal Right separator)
    const mid = parts.findIndex((p, i) => i >= 3 && /^right$/i.test(p));
    if (mid > 0) {
      return {
        type: "compare",
        title,
        left: {
          title: leftTitle,
          points: parts.slice(3, mid).map((p) => p.replace(/^L:/i, "")),
        },
        right: {
          title: parts[mid + 1] || "B",
          points: parts.slice(mid + 2).map((p) => p.replace(/^R:/i, "")),
        },
      };
    }
    const half = Math.ceil((parts.length - 3) / 2);
    const leftPts = parts.slice(3, 3 + half).map((p) => p.replace(/^L:/i, ""));
    const rightPts = parts.slice(3 + half + 1).map((p) => p.replace(/^R:/i, ""));
    const rightTitle = parts[3 + half] || "B";
    return {
      type: "compare",
      title,
      left: { title: leftTitle, points: leftPts.length ? leftPts : ["Ã¢â‚¬â€"] },
      right: {
        title: rightTitle,
        points: rightPts.length ? rightPts : ["Ã¢â‚¬â€"],
      },
    };
  }
  if (type === "year_flip") {
    const start = Number(parts[1]);
    const end = Number(parts[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    const a = Math.min(start, end);
    const b = Math.min(Math.max(start, end), a + 40);
    const years: string[] = [];
    for (let y = a; y <= b; y++) years.push(String(y));
    const holdSec = Math.min(3, Math.max(0.35, Number(parts[3]) || 1));
    const direction =
      String(parts[4] || "").toLowerCase() === "horizontal"
        ? "horizontal"
        : "vertical";
    return {
      type: "year_flip",
      years,
      holdSec,
      direction,
      finaleTitle: parts[5] || `The year ${years[years.length - 1]}`,
      finaleSubtitle: parts[6],
    };
  }
  return null;
}
function compositionFromFlatInvent(
  parsed: Record<string, unknown>,
  prompt: string,
): CompositionSpec | null {
  const inventKind = String(parsed.inventKind || "").toLowerCase();
  const yearStart = Number(parsed.yearStart);
  const yearEnd = Number(parsed.yearEnd);
  const looksLikeYears =
    inventKind === "year_flip" ||
    (Number.isFinite(yearStart) &&
      Number.isFinite(yearEnd) &&
      yearStart >= 1800 &&
      yearEnd >= 1800);
  const accent =
    String(parsed.accent || propsFromModel(parsed.props as never).accent || "").trim() ||
    "#38bdf8";
  const bg =
    String(parsed.bg || propsFromModel(parsed.props as never).bg || "").trim() ||
    "#0b0d12";
  if (looksLikeYears) {
    const start = Math.min(yearStart, yearEnd);
    const end = Math.min(Math.max(yearStart, yearEnd), start + 40);
    const years: string[] = [];
    for (let y = start; y <= end; y++) years.push(String(y));
    if (years.length < 2) return null;
    const holdSec = Math.min(
      3,
      Math.max(0.35, Number(parsed.yearHoldSec) || 1),
    );
    const icons = Array.isArray(parsed.icons)
      ? parsed.icons.map((i) => String(i)).filter(Boolean).slice(0, 4)
      : [];
    const finaleTitle =
      String(parsed.finaleTitle || "").trim() ||
      `The year ${years[years.length - 1]}`;
    return normalizeComposition({
      bg: bg === "#0b0d12" ? "#07090f" : bg,
      accent: accent === "#38bdf8" ? "#f0b429" : accent,
      ink: "#f7f3ea",
      muted: "rgba(247,243,234,0.62)",
      beats: [
        {
          type: "title",
          eyebrow: "YEAR TIMELINE",
          title: `${years[0]} Ã¢â€ â€™ ${years[years.length - 1]}`,
          subtitle: "One year at a time",
        },
        {
          type: "year_flip",
          years,
          holdSec,
          direction:
            String(parsed.yearDirection || "").toLowerCase() === "horizontal"
              ? "horizontal"
              : "vertical",
          finaleTitle,
          finaleSubtitle: String(parsed.finaleSubtitle || "").trim() || undefined,
          icons: icons.length > 0 ? icons : undefined,
        },
      ],
    });
  }
  if (Array.isArray(parsed.beatLines) && parsed.beatLines.length) {
    const beats = parsed.beatLines
      .map((line) => parseBeatLine(String(line), prompt))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
    if (beats.length) {
      return normalizeComposition({
        bg,
        accent,
        ink: "#f4f0e6",
        beats,
      });
    }
  }
  return null;
}
function fallbackCompositionFromPrompt(prompt: string): CompositionSpec {
  const fromPrompt = compositionFromPrompt(prompt);
  if (fromPrompt) return fromPrompt;
  const sentences = prompt
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6)
    .slice(0, 6);
  const chunks = prompt
    .split(/[,;]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 5);
  return normalizeComposition({
    bg: "#0b0d12",
    accent: "#c084fc",
    ink: "#f4f0e6",
    beats: [
      {
        type: "title",
        eyebrow: "FROM YOUR PROMPT",
        title: (sentences[0] || prompt).slice(0, 72),
        subtitle: sentences[1]?.slice(0, 90),
      },
      {
        type: "bullets",
        title: "Key points",
        items: (chunks.length ? chunks : sentences.slice(1)).slice(0, 5),
      },
      {
        type: "outro",
        title: (sentences[sentences.length - 1] || "Continue in editor").slice(
          0,
          72,
        ),
        subtitle: "Edit composition JSON to refine every beat",
      },
    ],
  });
}
/**
 * Prefer model output. Deterministic prompt compiler is fallback only Ã¢â‚¬â€
 * otherwise every year-range prompt produces the same ~21s clip.
 */
function pickInventComposition(
  prompt: string,
  parsed: Record<string, unknown> | null,
): CompositionSpec {
  if (parsed) {
    const props = propsFromModel(parsed.props as never);
    const fromJson = compositionFromComposeJsonField(parsed, props);
    if (fromJson) return fromJson;
    const fromFlat = compositionFromFlatInvent(parsed, prompt);
    if (fromFlat && fromFlat.beats.some(beatIsUsable)) return fromFlat;
  }
  return fallbackCompositionFromPrompt(prompt);
}
function scaleCompositionToLength(
  spec: CompositionSpec,
  lengthSec: number,
): CompositionSpec {
  const estimated = estimateComposeSeconds(spec);
  if (estimated <= 0 || !Number.isFinite(lengthSec)) return spec;
  // Soft-fit year holds when the user asked for a specific length.
  const yearBeats = spec.beats.filter((b) => b.type === "year_flip");
  if (!yearBeats.length) return spec;
  const ratio = lengthSec / estimated;
  if (ratio > 0.85 && ratio < 1.2) return spec;
  return {
    ...spec,
    beats: spec.beats.map((beat) => {
      if (beat.type !== "year_flip") return beat;
      const nextHold = Math.min(
        3,
        Math.max(0.35, Number((beat.holdSec * ratio).toFixed(2))),
      );
      return { ...beat, holdSec: nextHold };
    }),
  };
}
function buildInventPlan(
  composition: CompositionSpec,
  propsRaw: Record<string, unknown>,
  rationale: string,
  alternatives: string[],
  lengthSec: number,
): MotionPlan {
  const asset = getAsset(AI_COMPOSE_ASSET_ID);
  if (!asset) {
    throw new Error("AI Compose asset is missing from the catalog.");
  }
  const scaled = scaleCompositionToLength(composition, lengthSec);
  const usable = scaled.beats.filter(beatIsUsable);
  const finalSpec: CompositionSpec = {
    ...scaled,
    beats: usable.length ? usable : scaled.beats,
  };
  const estimated = estimateComposeSeconds(finalSpec);
  const mergedProps = sanitizeProps(asset, {
    ...propsRaw,
    accent: String(propsRaw.accent || finalSpec.accent),
    bg: String(propsRaw.bg || finalSpec.bg),
    ink: String(propsRaw.ink || finalSpec.ink || ""),
    muted: String(propsRaw.muted || finalSpec.muted || ""),
    title: String(propsRaw.title || findTitle(finalSpec) || asset.defaults.title),
    subtitle: String(
      propsRaw.subtitle || findSubtitle(finalSpec) || asset.defaults.subtitle,
    ),
    composeJson: stringifyComposition(finalSpec),
  });
  if (estimated > 16) {
    mergedProps.revealDuration = Math.max(
      0.25,
      Number(mergedProps.revealDuration || 0.35),
    );
  }
  return {
    assetId: asset.id,
    template: asset.template,
    props: mergedProps,
    rationale:
      rationale ||
      "Invented a prompt-specific motion graphic (not a reusable catalog pack).",
    alternatives,
    invented: true,
  };
}
function findTitle(spec: CompositionSpec): string {
  for (const beat of spec.beats) {
    if (beat.type === "title" || beat.type === "outro") return beat.title;
    if (beat.type === "year_flip") return beat.finaleTitle;
    if ("title" in beat && beat.title) return String(beat.title);
  }
  return "";
}
function findSubtitle(spec: CompositionSpec): string {
  for (const beat of spec.beats) {
    if (beat.type === "title" && beat.subtitle) return beat.subtitle;
    if (beat.type === "outro" && beat.subtitle) return beat.subtitle;
    if (beat.type === "year_flip" && beat.finaleSubtitle) return beat.finaleSubtitle;
  }
  return "";
}
const COMPOSE_BEAT_GUIDE = [
  "When inventing, set mode=invent, assetId=ai-compose, and fill composeJson with a JSON object:",
  '{"bg":"#0b0d12","accent":"#38bdf8","ink":"#f4f0e6","muted":"rgba(244,240,230,0.62)","beats":[...]}',
  "Beat types (use 3Ã¢â‚¬â€œ7 beats that match the prompt Ã¢â‚¬â€ different prompts MUST produce different beats/copy):",
  'title: {"type":"title","eyebrow":"...","title":"...","subtitle":"..."}',
  'bullets: {"type":"bullets","title":"...","items":["..."]}',
  'stats: {"type":"stats","title":"...","items":[{"label":"...","value":"..."}]}',
  'bars: {"type":"bars","title":"...","items":[{"label":"...","value":72}]}',
  'cards: {"type":"cards","title":"...","items":[{"title":"...","body":"..."}]}',
  'timeline: {"type":"timeline","title":"...","items":[{"when":"1991","label":"...","detail":"..."}]}',
  'quote: {"type":"quote","text":"...","attribution":"..."}',
  'compare: {"type":"compare","title":"...","left":{"title":"A","points":["..."]},"right":{"title":"B","points":["..."]}}',
  'outro: {"type":"outro","title":"...","subtitle":"...","icons":["Ã¢Å“Â¨"]}',
  'year_flip: {"type":"year_flip","years":["1981","1982"],"holdSec":1,"direction":"vertical","finaleTitle":"...","finaleSubtitle":"...","icons":["Ã°Å¸Å’Â"]}',
  "Never reuse stock marketing copy. Always derive titles, stats, and finale text from the user prompt.",
  "If composeJson is hard, use beatLines (type|fields) or year_* invent fields instead.",
].join(" ");
export async function createMotionPlan(
  input: MotionPlanRequest,
): Promise<MotionPlan> {
  const prompt = String(input.prompt || "").trim();
  if (prompt.length < 8) {
    throw new Error("Prompt is too short Ã¢â‚¬â€ describe the video you want.");
  }
  if (prompt.length > 4000) {
    throw new Error("Prompt is too long (max 4000 characters).");
  }
  const style = normalizeStyle(input.style);
  const aspect = normalizeAspect(input.aspect);
  const createMode = normalizeCreateMode(input.mode);
  const lengthSec = Math.min(
    90,
    Math.max(6, Number(input.lengthSec) || 12),
  );
  const customMotion = needsCustomMotion(prompt);
  const forceInvent = createMode === "invent" || customMotion;
  const forceCatalog = createMode === "catalog" && !customMotion;
  // Deterministic hint only Ã¢â‚¬â€ never return it before asking the model.
  const promptHint = compositionFromPrompt(prompt);
  const composeAsset = getAsset(AI_COMPOSE_ASSET_ID);
  const candidates = forceInvent ? [] : retrieveCandidates(prompt, style, 12);
  const catalogForModel = candidates.map((asset) => ({
    id: asset.id,
    name: asset.name,
    category: asset.category,
    description: asset.description,
    template: asset.template,
    fields: fieldSchemas(asset),
    defaults: asset.defaults,
  }));
  const system = [
    "You are BestMotions' motion planner for Revideo.",
    "Your job: understand the user's prompt and return a plan that becomes a unique video.",
    "CRITICAL: Different prompts must produce different compositions Ã¢â‚¬â€ never return a generic stock graphic.",
    "CRITICAL: When the user describes specific choreography (year-by-year, one come one go, intervals, vertical flips, icons, unique layouts), you MUST invent Ã¢â‚¬â€ never reuse a catalog timeline pack.",
    forceInvent
      ? "MODE invent: assetId MUST be ai-compose. Always invent a fresh composeJson for this prompt."
      : forceCatalog
        ? "MODE catalog: pick one catalog template only and fill its props."
        : "MODE auto: invent for unique motion or unclear matches; catalog only for clear template matches.",
    COMPOSE_BEAT_GUIDE,
    "For invent year counters you may also set: inventKind=year_flip, yearStart, yearEnd, yearHoldSec, yearDirection, finaleTitle, finaleSubtitle, icons.",
    "For catalog: fill props as {key,value} using only that template's field keys.",
    "Respect lengthSec when choosing how many beats / year holdSec.",
    "Keep rationale to one short sentence naming what you built.",
  ].join(" ");
  const user = JSON.stringify(
    {
      prompt,
      style,
      lengthSec,
      aspect,
      createMode: forceInvent ? "invent" : createMode,
      inventHints: {
        assetId: AI_COMPOSE_ASSET_ID,
        inventKindOptions: ["year_flip", "beats"],
        preferComposeJson: true,
        optionalPromptCompilerHint: promptHint,
        year_flip_fields: [
          "yearStart",
          "yearEnd",
          "yearHoldSec",
          "yearDirection",
          "finaleTitle",
          "finaleSubtitle",
          "icons",
        ],
      },
      composeAsset: composeAsset
        ? { id: composeAsset.id, fields: fieldSchemas(composeAsset) }
        : null,
      candidates: catalogForModel,
    },
    null,
    2,
  );
  let parsed: Record<string, unknown> | null = null;
  try {
    const { text } = await generateGeminiJson(system, user);
    parsed = parseModelJson(text);
  } catch (err) {
    if (forceInvent || !forceCatalog) {
      return buildInventPlan(
        pickInventComposition(prompt, null),
        {},
        err instanceof Error
          ? `Prompt-built custom graphic (${err.message})`
          : "Prompt-built custom graphic after the model failed.",
        retrieveCandidates(prompt, style, 2).map((c) => c.id),
        lengthSec,
      );
    }
    throw err;
  }
  const modelMode = String(parsed.mode || "").toLowerCase();
  const assetId = String(parsed.assetId || "").trim();
  const wantInvent =
    forceInvent ||
    modelMode === "invent" ||
    assetId === AI_COMPOSE_ASSET_ID ||
    String(parsed.inventKind || "").length > 0 ||
    Boolean(parsed.composeJson) ||
    (Array.isArray(parsed.beatLines) && parsed.beatLines.length > 0);
  const altIds = Array.isArray(parsed.alternatives)
    ? parsed.alternatives
        .map((id) => String(id).trim())
        .filter((id) => id && (id === AI_COMPOSE_ASSET_ID || Boolean(getAsset(id))))
        .slice(0, 3)
    : [];
  if (wantInvent) {
    for (const candidate of retrieveCandidates(prompt, style, 4)) {
      if (altIds.length >= 2) break;
      if (candidate.id !== AI_COMPOSE_ASSET_ID && !altIds.includes(candidate.id)) {
        altIds.push(candidate.id);
      }
    }
    return buildInventPlan(
      pickInventComposition(prompt, parsed),
      propsFromModel(parsed.props as never),
      String(parsed.rationale || "").trim(),
      altIds.filter((id) => id !== AI_COMPOSE_ASSET_ID),
      lengthSec,
    );
  }
  if (!candidates.length) {
    return buildInventPlan(
      pickInventComposition(prompt, parsed),
      propsFromModel(parsed.props as never),
      String(parsed.rationale || "").trim() ||
        "No catalog match Ã¢â‚¬â€ invented a custom composition.",
      [],
      lengthSec,
    );
  }
  let asset = getAsset(assetId);
  if (!asset || asset.id === AI_COMPOSE_ASSET_ID) {
    asset = candidates[0];
  }
  const catalogAlts = altIds.filter((id) => id !== asset!.id && id !== AI_COMPOSE_ASSET_ID);
  if (catalogAlts.length === 0) {
    for (const candidate of candidates) {
      if (candidate.id === asset.id) continue;
      catalogAlts.push(candidate.id);
      if (catalogAlts.length >= 2) break;
    }
  }
  catalogAlts.push(AI_COMPOSE_ASSET_ID);
  const props = sanitizeProps(asset, propsFromModel(parsed.props as never));
  if ("duration" in asset.defaults && typeof asset.defaults.duration === "number") {
    props.duration = lengthSec;
  }
  return {
    assetId: asset.id,
    template: asset.template,
    props,
    rationale:
      String(parsed.rationale || "").trim() ||
      `Using Ã¢â‚¬Å“${asset.name}Ã¢â‚¬Â for this prompt.`,
    alternatives: catalogAlts.slice(0, 3),
    invented: false,
  };
}
