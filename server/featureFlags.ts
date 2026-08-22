import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dbPath =
  process.env.FEATURE_FLAGS_DB || path.join(dataDir, "feature-flags.sqlite");

/** Public flag keys the client may read. */
export const FLAG_VIDEO_SOUND = "video_sound";

export type FeatureFlagsPublic = {
  videoSound: boolean;
};

let db: Database.Database | null = null;

function openDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      key TEXT PRIMARY KEY NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);
  seedDefaults(db);
  return db;
}

function seedDefaults(database: Database.Database) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO feature_flags (key, enabled, updated_at)
    VALUES (@key, @enabled, @updated_at)
  `);
  const now = new Date().toISOString();
  // Sound UI / playback controls stay off until toggled in the DB.
  insert.run({ key: FLAG_VIDEO_SOUND, enabled: 0, updated_at: now });
}

function envOverride(key: string): boolean | null {
  if (key === FLAG_VIDEO_SOUND) {
    const raw = process.env.FEATURE_VIDEO_SOUND;
    if (raw === undefined || raw === "") return null;
    return /^(1|true|yes|on)$/i.test(raw);
  }
  return null;
}

export function isFlagEnabled(key: string): boolean {
  const override = envOverride(key);
  if (override !== null) return override;

  const row = openDb()
    .prepare(`SELECT enabled FROM feature_flags WHERE key = ?`)
    .get(key) as { enabled: number } | undefined;
  return Boolean(row?.enabled);
}

export function getPublicFlags(): FeatureFlagsPublic {
  return {
    videoSound: isFlagEnabled(FLAG_VIDEO_SOUND),
  };
}

export function listFlags(): { key: string; enabled: boolean; updatedAt: string }[] {
  const rows = openDb()
    .prepare(`SELECT key, enabled, updated_at AS updatedAt FROM feature_flags ORDER BY key`)
    .all() as { key: string; enabled: number; updatedAt: string }[];
  return rows.map((r) => ({
    key: r.key,
    enabled: Boolean(r.enabled),
    updatedAt: r.updatedAt,
  }));
}

export function setFlagEnabled(key: string, enabled: boolean): {
  key: string;
  enabled: boolean;
  updatedAt: string;
} {
  const now = new Date().toISOString();
  const result = openDb()
    .prepare(
      `UPDATE feature_flags SET enabled = ?, updated_at = ? WHERE key = ?`,
    )
    .run(enabled ? 1 : 0, now, key);

  if (result.changes === 0) {
    openDb()
      .prepare(
        `INSERT INTO feature_flags (key, enabled, updated_at) VALUES (?, ?, ?)`,
      )
      .run(key, enabled ? 1 : 0, now);
  }

  return { key, enabled, updatedAt: now };
}

/** Strip sound when the feature flag is off (preview + export). */
export function applySoundFlag(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  if (isFlagEnabled(FLAG_VIDEO_SOUND)) return variables;
  return { ...variables, sound: "off" };
}
