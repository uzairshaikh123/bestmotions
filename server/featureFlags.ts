/** Public flag keys the client may read. */
export const FLAG_VIDEO_SOUND = "video_sound";

export type FeatureFlagsPublic = {
  videoSound: boolean;
};

function envBool(raw: string | undefined, fallback = false): boolean {
  if (raw === undefined || raw === "") return fallback;
  return /^(1|true|yes|on)$/i.test(raw.trim());
}

function envOverride(key: string): boolean {
  if (key === FLAG_VIDEO_SOUND) {
    // Default off — enable with FEATURE_VIDEO_SOUND=true in the environment.
    return envBool(process.env.FEATURE_VIDEO_SOUND, false);
  }
  return false;
}

export function isFlagEnabled(key: string): boolean {
  return envOverride(key);
}

export function getPublicFlags(): FeatureFlagsPublic {
  return {
    videoSound: isFlagEnabled(FLAG_VIDEO_SOUND),
  };
}

export function listFlags(): { key: string; enabled: boolean; updatedAt: string }[] {
  const now = new Date().toISOString();
  return [
    {
      key: FLAG_VIDEO_SOUND,
      enabled: isFlagEnabled(FLAG_VIDEO_SOUND),
      updatedAt: now,
    },
  ];
}

/**
 * Env-backed flags are read-only at runtime.
 * Toggle via FEATURE_VIDEO_SOUND / VITE_FEATURE_VIDEO_SOUND in the host env.
 */
export function setFlagEnabled(key: string, enabled: boolean): {
  key: string;
  enabled: boolean;
  updatedAt: string;
  readOnly: true;
  hint: string;
} {
  return {
    key,
    enabled: isFlagEnabled(key),
    updatedAt: new Date().toISOString(),
    readOnly: true,
    hint:
      "Feature flags are env-only. Set FEATURE_VIDEO_SOUND=true (and VITE_FEATURE_VIDEO_SOUND=true for the UI) then redeploy/restart.",
  };
}

/** Strip sound when the feature flag is off (preview + export). */
export function applySoundFlag(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  if (isFlagEnabled(FLAG_VIDEO_SOUND)) return variables;
  return { ...variables, sound: "off" };
}
