import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { renderVideo } from "@revideo/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const projectFile = path.join(rootDir, "revideo", "project.ts");
const outDir = path.join(rootDir, "public", "videos");

export async function renderRevideoVideo(
  id: string,
  variables: Record<string, unknown>,
): Promise<string> {
  await fs.mkdir(outDir, { recursive: true });
  const outFile = `${id}.mp4` as `${string}.mp4`;

  const renderedPath = await renderVideo({
    projectFile,
    variables,
    settings: {
      outDir,
      outFile,
      logProgress: true,
      workers: 1,
      viteBasePort: 9100,
    },
  });

  // renderVideo returns absolute path; expose under /videos
  const basename = path.basename(renderedPath);
  return `/videos/${basename}`;
}
