import { readFileSync, writeFileSync } from "fs";

const p = "client/assets/catalog.ts";
let s = readFileSync(p, "utf8");
const start = s.indexOf('  {\n    ...base,\n    id: "fire-campfire"');
const end = s.indexOf('  {\n    ...base,\n    id: "yt-connection"');
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}
s = s.slice(0, start) + s.slice(end);
s = s.replace(/\s*\{ id: "fire", label: "Fire" \},\n/, "\n");
writeFileSync(p, s);
console.log("removed fire assets");
