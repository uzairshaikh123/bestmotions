import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { renderVideo } from "@revideo/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "public", "videos");

/**
 * Absolute project path with forward slashes.
 * @revideo/renderer injects this into `import project from '...'` unescaped.
 * Windows backslashes break that string (`\U`, `\b` → garbage path).
 */
const projectFile = path
  .join(rootDir, "revideo", "project.ts")
  .split(path.sep)
  .join("/");

/** Hard cap so stuck Puppeteer/Chrome jobs don't hang forever (default 3 min). */
export const RENDER_TIMEOUT_MS = Number(
  process.env.RENDER_TIMEOUT_MS || 180_000,
);

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s.`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function isTransientRenderError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /Navigating frame was detached|Target closed|Protocol error|net::ERR_/i.test(
    msg,
  );
}

async function runRender(
  id: string,
  variables: Record<string, unknown>,
): Promise<string> {
  const outFile = `${id}.mp4` as `${string}.mp4`;
  // Avoid colliding with leftover Vite servers from failed renders
  const viteBasePort = 9200 + Math.floor(Math.random() * 200);

  const renderedPath = await withTimeout(
    renderVideo({
      projectFile,
      variables,
      settings: {
        outDir,
        outFile,
        logProgress: true,
        workers: 1,
        viteBasePort,
        puppeteer: {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--autoplay-policy=no-user-gesture-required",
          ],
        },
      },
    }),
    RENDER_TIMEOUT_MS,
    "Video render",
  );

  return path.basename(renderedPath);
}

export async function renderRevideoVideo(
  id: string,
  variables: Record<string, unknown>,
): Promise<string> {
  await fs.mkdir(outDir, { recursive: true });

  const previousCwd = process.cwd();
  if (previousCwd !== rootDir) {
    process.chdir(rootDir);
  }

  try {
    try {
      const basename = await runRender(id, variables);
      return `/videos/${basename}`;
    } catch (err) {
      if (!isTransientRenderError(err)) throw err;
      console.warn("[revideo] transient render failure, retrying once:", err);
      const basename = await runRender(`${id}-retry`, variables);
      return `/videos/${basename}`;
    }
  } finally {
    if (previousCwd !== rootDir) {
      process.chdir(previousCwd);
    }
  }
}
