import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiUrl } from "./backend";

export type FeatureFlags = {
  /** When false, Sound field is hidden and playback/export force sound off. */
  videoSound: boolean;
};

function envBool(raw: unknown): boolean | null {
  if (raw === undefined || raw === null || raw === "") return null;
  return /^(1|true|yes|on)$/i.test(String(raw).trim());
}

/** Frontend toggle: set VITE_FEATURE_VIDEO_SOUND=true in repo-root .env */
function readViteVideoSound(): boolean | null {
  return envBool(import.meta.env.VITE_FEATURE_VIDEO_SOUND);
}

const viteOverride = readViteVideoSound();

const DEFAULT_FLAGS: FeatureFlags = {
  // Off until VITE_FEATURE_VIDEO_SOUND (or the API) turns it on.
  videoSound: viteOverride ?? false,
};

const FeatureFlagsContext = createContext<FeatureFlags>(DEFAULT_FLAGS);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  useEffect(() => {
    // Explicit frontend env wins over the API so local VITE_ toggles are reliable.
    if (viteOverride !== null) {
      setFlags({ videoSound: viteOverride });
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(apiUrl("/api/feature-flags"));
        if (!res.ok) return;
        const data = (await res.json()) as Partial<FeatureFlags>;
        if (cancelled) return;
        setFlags({
          videoSound: Boolean(data.videoSound),
        });
      } catch {
        /* keep defaults (sound off) if backend is down */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}

/** Apply flag rules to scene variables before preview / export. */
export function withFeatureFlagVariables(
  variables: Record<string, string | number>,
  flags: FeatureFlags,
): Record<string, string | number> {
  if (flags.videoSound) return variables;
  return { ...variables, sound: "off" };
}
