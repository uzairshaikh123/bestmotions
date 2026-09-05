import type { Player as CorePlayer } from "@revideo/core";
import { Player } from "@revideo/player-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { findCanvas } from "../recordCanvas";
import project from "../../revideo/project";

export type RevideoPreviewHandle = {
  getCanvas: () => HTMLCanvasElement | null;
  getDuration: () => number;
  isReady: () => boolean;
  seek: (seconds: number) => void;
  play: () => void;
  pause: () => void;
};

type Props = {
  variables: Record<string, string | number>;
  /** When true, start playback once the player is ready. Default false (paused). */
  playing?: boolean;
  controls?: boolean;
  muted?: boolean;
  quality?: number;
  className?: string;
  instanceKey?: string;
  /** Catalog estimate shown until the player finishes measuring the scene. */
  estimatedDuration?: number;
  /** Output canvas size. Defaults to 1280×720 (16:9). */
  width?: number;
  height?: number;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function playerFps(player: CorePlayer) {
  const fps = player.status?.fps || player.playback?.fps || 30;
  return Number.isFinite(fps) && fps > 0 ? fps : 30;
}

/** Scene length in seconds from the core player (frames / fps). */
function secondsFromPlayer(player: CorePlayer): number {
  const fps = playerFps(player);
  const candidates = [
    player.playback?.duration,
    player.onDurationChanged.current,
  ];
  for (const frames of candidates) {
    if (!Number.isFinite(frames) || frames <= 0 || frames > 1e7) continue;
    const seconds = frames / fps;
    if (Number.isFinite(seconds) && seconds > 0.05) return seconds;
  }
  return 0;
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
export const RevideoPreview = forwardRef<RevideoPreviewHandle, Props>(
  function RevideoPreview(
    {
      variables,
      playing = false,
      controls = true,
      muted = false,
      quality = 1,
      className,
      instanceKey,
      estimatedDuration = 0,
      width = 1280,
      height = 720,
    },
    ref,
  ) {
  const rootRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<CorePlayer | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [currentTime, setCurrentTime] = useState(0);
  const seedDuration = Number.isFinite(estimatedDuration)
    ? Math.max(0, estimatedDuration)
    : 0;
  const [duration, setDuration] = useState(seedDuration);
  const wantPlay = useRef(playing);
  const durationRef = useRef(seedDuration);
  const estimatedRef = useRef(seedDuration);
  estimatedRef.current = seedDuration;

  function commitDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0.05 || seconds > 1e6) return;
    if (Math.abs(seconds - durationRef.current) < 0.04) return;
    durationRef.current = seconds;
    setDuration(seconds);
  }

  function syncDuration(player: CorePlayer | null) {
    if (!player) return;
    const live = secondsFromPlayer(player);
    if (live > 0) commitDuration(live);
  }

  useEffect(() => {
    wantPlay.current = playing;
    setIsPlaying(playing);
  }, [playing]);

  useEffect(() => {
    const seed = estimatedRef.current;
    setReady(false);
    setIsPlaying(wantPlay.current);
    setCurrentTime(0);
    durationRef.current = seed;
    setDuration(seed);
    coreRef.current = null;
    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [instanceKey, width, height]);

  const varsKey = useMemo(() => JSON.stringify(variables), [variables]);
  const stableVariables = useMemo(
    () => JSON.parse(varsKey) as Record<string, string | number>,
    [varsKey],
  );

  function handleReady(player: CorePlayer) {
    unsubRef.current?.();
    coreRef.current = player;
    setReady(true);
    syncDuration(player);

    const unsubDur = player.onDurationChanged.subscribe((frames) => {
      if (!Number.isFinite(frames) || frames <= 0 || frames > 1e7) return;
      commitDuration(frames / playerFps(player));
    });
    const unsubRecalc = player.onRecalculated.subscribe(() => {
      syncDuration(player);
    });
    let tries = 0;
    const poll = window.setInterval(() => {
      syncDuration(player);
      tries += 1;
      if (secondsFromPlayer(player) > 0.2 || tries > 40) {
        window.clearInterval(poll);
      }
    }, 50);
    unsubRef.current = () => {
      window.clearInterval(poll);
      unsubDur();
      unsubRecalc();
    };

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

  function seekSeconds(seconds: number) {
    const player = coreRef.current;
    if (!player) return;
    const fps = player.playback.fps || 30;
    const d = durationRef.current;
    const t = d > 0 ? Math.max(0, Math.min(d, seconds)) : Math.max(0, seconds);
    player.requestSeek(t * fps);
    setCurrentTime(t);
  }

  function seekTo(ratio: number) {
    const d = durationRef.current;
    if (!coreRef.current || !ready || d <= 0) return;
    seekSeconds(Math.max(0, Math.min(1, ratio)) * d);
  }

  useImperativeHandle(ref, () => ({
    getCanvas: () => findCanvas(rootRef.current),
    getDuration: () => {
      const live = coreRef.current ? secondsFromPlayer(coreRef.current) : 0;
      return live > 0 ? live : durationRef.current;
    },
    isReady: () => Boolean(coreRef.current && ready),
    seek: seekSeconds,
    play: () => {
      const player = coreRef.current;
      if (!player) return;
      if (!muted) {
        unlockMediaPlayback();
        unmutePlayer(player);
      }
      player.togglePlayback(true);
      setIsPlaying(true);
    },
    pause: () => {
      coreRef.current?.togglePlayback(false);
      setIsPlaying(false);
    },
  }));

  function onScrubPointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    seekTo(ratio);
  }

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const ratio = `${Math.max(1, width)} / ${Math.max(1, height)}`;
  const orientation =
    width === height ? "square" : width > height ? "landscape" : "portrait";
  const sizeKey = `${Math.round(width)}x${Math.round(height)}`;
  const playerKey = instanceKey ? `${instanceKey}-${sizeKey}` : sizeKey;

  const rootClass = [
    "revideo-preview",
    `ar-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={{ aspectRatio: ratio }}
      onPointerDown={() => {
        if (!muted) unlockMediaPlayback();
      }}
    >
      <Player
        key={playerKey}
        project={project}
        variables={stableVariables}
        playing={isPlaying}
        controls={false}
        looping
        width={width}
        height={height}
        fps={30}
        quality={quality}
        volume={muted ? 0 : 1}
        onPlayerReady={handleReady}
        onTimeUpdate={(t) => {
          setCurrentTime(t);
          syncDuration(coreRef.current);
        }}
        onDurationChange={(d) => commitDuration(d)}
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
  },
);
