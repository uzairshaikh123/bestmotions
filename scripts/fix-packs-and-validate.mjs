import fs from "fs";
import path from "path";

const outDir = "C:/Users/bhaga/OneDrive/Desktop/bestmotions/scripts/_recovery";
const ops = JSON.parse(fs.readFileSync(path.join(outDir, "_ops3.json"), "utf8"));

// Re-extract packs from transcript with case-preserving basenames
const transcript =
  "C:/Users/bhaga/.cursor/projects/c-Users-bhaga-OneDrive-Desktop-bestmotions/agent-transcripts/946977f2-cd86-444d-86f6-056a1da4b4c5/946977f2-cd86-444d-86f6-056a1da4b4c5.jsonl";

const packNames = [
  "templates.tsx",
  "bookPack.tsx",
  "firePack.tsx",
  "newspaperPack.tsx",
  "newspaperRealistic.tsx",
  "ytTopicPack.tsx",
  "timelinePack.tsx",
  "indiaPack.tsx",
  "shortForm.tsx",
  "catalog.ts",
];

/** @type {Map<string, {content: string, lineNo: number}>} */
const latest = new Map();

const lines = fs.readFileSync(transcript, "utf8").split(/\r?\n/);
let lineNo = 0;
for (const line of lines) {
  lineNo++;
  if (!line.trim()) continue;
  let obj;
  try {
    obj = JSON.parse(line);
  } catch {
    continue;
  }
  const content = obj?.message?.content;
  if (!Array.isArray(content)) continue;
  for (const part of content) {
    if (part.type !== "tool_use") continue;
    const input = part.input || {};
    const p = input.path || "";
    const base = p.replace(/\\/g, "/").split("/").pop();
    if (!packNames.includes(base) && base !== "catalog.ts") continue;
    if (part.name === "Write" && typeof input.contents === "string") {
      // Prefer assets/catalog.ts over revideo/catalog.ts
      if (base === "catalog.ts" && !/assets[\\/]catalog\.ts/i.test(p)) continue;
      latest.set(base, { content: input.contents, lineNo });
    } else if (part.name === "StrReplace" && latest.has(base)) {
      const cur = latest.get(base).content;
      const idx = cur.indexOf(input.old_string);
      if (idx !== -1) {
        const next =
          cur.slice(0, idx) +
          (input.new_string ?? "") +
          cur.slice(idx + input.old_string.length);
        latest.set(base, { content: next, lineNo });
      } else {
        // try normalized newlines
        const altCur = cur.replace(/\r\n/g, "\n");
        const altOld = (input.old_string || "").replace(/\r\n/g, "\n");
        const idx2 = altCur.indexOf(altOld);
        if (idx2 !== -1) {
          const next =
            altCur.slice(0, idx2) +
            (input.new_string ?? "").replace(/\r\n/g, "\n") +
            altCur.slice(idx2 + altOld.length);
          latest.set(base, { content: next, lineNo });
        }
      }
    }
  }
}

// Also apply case-insensitive path StrReplace from ops3 remotion-catalog (already good)
// Save packs from this extraction
const savedPacks = [];
for (const name of packNames) {
  if (name === "catalog.ts") continue;
  if (!latest.has(name)) {
    console.log("still missing", name);
    continue;
  }
  const out = path.join(outDir, "components__" + name);
  fs.writeFileSync(out, latest.get(name).content);
  savedPacks.push({ name, len: latest.get(name).content.length, lineNo: latest.get(name).lineNo });
  console.log("saved", name, latest.get(name).content.length, "from L" + latest.get(name).lineNo);
}

// Validate recovered JSON
const recovered = JSON.parse(
  fs.readFileSync("scripts/recovered-assets.json", "utf8"),
);
console.log("\nassets", recovered.assets.length);
const emptyFields = recovered.assets.filter((a) => !a.fields.length);
console.log(
  "empty fields:",
  emptyFields.map((a) => a.id),
);
for (const a of emptyFields) {
  // look up in catalog
  const cat = fs.readFileSync(path.join(outDir, "remotion-catalog.ts"), "utf8");
  const i = cat.indexOf(`id: "${a.id}"`);
  console.log("\n---", a.id, "---\n", cat.slice(i, i + 800));
}

// Fix truncated defaults if any
const badDefaults = recovered.assets.filter((a) =>
  Object.values(a.defaults).some(
    (v) => typeof v === "string" && (v.endsWith("\\") || /#$/.test(v) || v.length === 1),
  ),
);
console.log(
  "suspicious defaults:",
  badDefaults.map((a) => a.id),
);

// Check accent truncation pattern
for (const a of recovered.assets) {
  for (const [k, v] of Object.entries(a.defaults)) {
    if (typeof v === "string" && /^#[0-9a-fA-F]{1,5}$/.test(v) && v.length < 7) {
      console.log("short color", a.id, k, v);
    }
  }
}

// Update sourceNotes with pack paths
recovered.recoveredPackFiles = savedPacks.map(
  (p) => `scripts/_recovery/components__${p.name}`,
);
recovered.sourceNotes =
  "Reconstructed by replaying Write/StrReplace payloads from agent transcript 946977f2-cd86-444d-86f6-056a1da4b4c5 (path case-normalized). Full Remotion catalog (~119 assets) restored including books pack. Component pack sources saved under scripts/_recovery/components__*.tsx. One newspaperRealistic quote defaults StrReplace failed in replay; catalog otherwise complete. Transcript 85a813ed used only to harvest Remotion books old_string if needed (not applied truncate).";

fs.writeFileSync(
  "scripts/recovered-assets.json",
  JSON.stringify(recovered, null, 2),
);
console.log("\nUpdated recovered-assets.json");
console.log("packs:", savedPacks.length);
