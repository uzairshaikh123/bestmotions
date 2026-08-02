import React, { useState } from "react";
import { downloadVideo, videoFilename } from "./downloadVideo";

type Props = {
  videoUrl: string | null | undefined;
  title?: string;
  className?: string;
  label?: string;
};

export function DownloadVideoButton({
  videoUrl,
  title = "bestmotions",
  className = "secondary",
  label = "Download MP4",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!videoUrl) return null;

  async function onClick() {
    setError(null);
    setBusy(true);
    try {
      await downloadVideo(videoUrl as string, videoFilename(title));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="download-wrap">
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={busy}
      >
        {busy ? "Downloading…" : label}
      </button>
      {error ? <span className="status error">{error}</span> : null}
    </span>
  );
}
