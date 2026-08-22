/**
 * Patch @revideo/renderer so Windows renders don't force --single-process
 * (that flag causes "Navigating frame was detached" with Chromium).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(
  root,
  "node_modules",
  "@revideo",
  "renderer",
  "lib",
  "server",
  "render-video.js",
);

if (!fs.existsSync(target)) {
  console.warn("[patch-revideo-renderer] skip — file not found");
  process.exit(0);
}

const src = fs.readFileSync(target, "utf8");
const needle =
  "if (!args.includes('--single-process')) {\n        args.push('--single-process');\n    }";
const replacement = `// --single-process frequently crashes Chromium on Windows ("Navigating frame was detached").
    if (process.platform !== 'win32' && !args.includes('--single-process')) {
        args.push('--single-process');
    }`;

if (src.includes("process.platform !== 'win32' && !args.includes('--single-process')")) {
  console.log("[patch-revideo-renderer] already applied");
  process.exit(0);
}

if (!src.includes(needle)) {
  console.warn("[patch-revideo-renderer] skip — expected code not found");
  process.exit(0);
}

fs.writeFileSync(target, src.replace(needle, replacement));
console.log("[patch-revideo-renderer] applied Windows Chromium fix");
