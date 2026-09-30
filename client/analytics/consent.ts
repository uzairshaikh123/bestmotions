/** Persisted analytics cookie preference (local only — never sent to our servers). */

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "bm-analytics-consent";

export function readConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
