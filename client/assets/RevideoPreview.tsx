import type { Player as CorePlayer } from "@revideo/core";
import { Player } from "@revideo/player-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import project from "../../revideo/project";

type Props = {
  variables: Record<string, string | number>;
  /** When true, start playback once the player is ready. Default false (paused). */
  playing?: boolean;
  controls?: boolean;
  muted?: boolean;
  quality?: number;
  className?: string;
  instanceKey?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

let mediaUnlocked = false;

/** HTMLAudioElement.play() runs later in canvas draw, so unlock on the click. */
function unlockMediaPlayback() {
  if (mediaUnlocked || typeof window === "undefined") return;
  mediaUnlocked = true;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      void ctx.resume();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  } catch {
    /* ignore */
  }
  try {
    const dummy = document.createElement("audio");
    dummy.src = SILENT_WAV;
    dummy.volume = 0.01;
    void dummy.play().then(() => dummy.pause()).catch(() => {});
  } catch {
    /* ignore */
  }
}

function unmutePlayer(player: CorePlayer) {
  // Player starts muted:true. Passing true means "if muted, flip to unmuted".
  player.toggleAudio(true);
  player.setAudioVolume(1);
}

/**
 * Revideo preview with our own control bar.
 *
 * Important: drive the package `playing` prop for real. Forcing
 * `playing={false}` and calling togglePlayback in onPlayerReady races the
 * web component attribute sync and pauses many gallery thumbs again.
 */
export function RevideoPreview({
  variables,
  playing = false,
  controls = true,
  muted = false,
  quality = 1,
  className,
  instanceKey,
}: Props) {
  const coreRef = useRef<CorePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const wantPlay = useRef(playing);

  useEffect(() => {
    wantPlay.current = playing;
    setIsPlaying(playing);
  }, [playing]);

  useEffect(() => {
    setReady(false);
    setIsPlaying(playing);
    setCurrentTime(0);
    setDuration(0);
    coreRef.current = null;
  }, [instanceKey]);

  const varsKey = useMemo(() => JSON.stringify(variables), [variables]);
  const stableVariables = useMemo(
    () => JSON.parse(varsKey) as Record<string, string | number>,
    [varsKey],
  );

  function handleReady(player: CorePlayer) {
    coreRef.current = player;
    setReady(true);
    if (!muted) unmutePlayer(player);
    // Beat @revideo/player-react race: playing="true" before Ready clears
    // the flag; re-assert after ready.
    if (wantPlay.current) {
      requestAnimationFrame(() => {
        if (!muted) unmutePlayer(player);
        player.togglePlayback(true);
        setIsPlaying(true);
      });
    }
  }

  function togglePlay() {
    if (!ready) return;
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && !muted) {
        unlockMediaPlayback();
        const player = coreRef.current;
        if (player) unmutePlayer(player);
      }
      return next;
    });
  }

  function seekTo(ratio: number) {
    const player = coreRef.current;
    if (!player || !ready || duration <= 0) return;
    const t = Math.max(0, Math.min(1, ratio)) * duration;
    player.requestSeek(t * player.playback.fps);
    setCurrentTime(t);
  }

  function onScrubPointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    seekTo(ratio);
  }

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div
      className={
        className ? `revideo-preview ${className}` : "revideo-preview"
      }
      onPointerDown={() => {
        if (!muted) unlockMediaPlayback();
      }}
    >
      <Player
        key={instanceKey}
        project={project}
        variables={stableVariables}
        playing={isPlaying}
        controls={false}
        looping
        width={1280}
        height={720}
        fps={30}
        quality={quality}
        volume={muted ? 0 : 1}
        onPlayerReady={handleReady}
        onTimeUpdate={(t) => setCurrentTime(t)}
        onDurationChange={(d) => {
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
      />

      {controls ? (
        <div className="rv-controls" onClick={(e) => e.stopPropagation()}>
          <div
            className="rv-scrub"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onScrubPointer(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) onScrubPointer(e);
            }}
          >
            <div className="rv-scrub-track">
              <div
                className="rv-scrub-fill"
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className="rv-scrub-thumb"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="rv-controls-row">
            <button
              type="button"
              className="rv-play"
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!ready}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <span className="rv-icon pause" />
              ) : (
                <span className="rv-icon play" />
              )}
            </button>
            <span className="rv-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
