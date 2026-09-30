/**
 * Google Analytics 4 (gtag) — privacy-first bootstrap.
 *
 * Security / privacy posture (aligned with large product apps):
 * - Measurement ID only from Vite env (never hardcoded)
 * - Consent Mode v2 defaults to denied until the user opts in
 * - Ads / remarketing signals stay denied (analytics traffic only)
 * - IP anonymization + no Google Signals
 * - Script loads only when a valid G- ID is configured
 * - No PII in events (page path + title only)
 */

import { readConsent, type ConsentChoice } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
const GA_ID_RE = /^G-[A-Z0-9]+$/i;

let scriptRequested = false;
let configured = false;

export function getMeasurementId(): string | null {
  if (!MEASUREMENT_ID || !GA_ID_RE.test(MEASUREMENT_ID)) return null;
  return MEASUREMENT_ID;
}

export function isAnalyticsConfigured(): boolean {
  return getMeasurementId() !== null;
}

function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
}

/** Must run before the gtag.js script tag is injected. */
export function initConsentDefaults(): void {
  if (!isAnalyticsConfigured()) return;
  ensureGtagStub();
  window.gtag!("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
  // Extra lockdown for regions that require it (Consent Mode v2).
  window.gtag!("set", "ads_data_redaction", true);
  window.gtag!("set", "url_passthrough", false);
}

function loadGtagScript(id: string): void {
  if (scriptRequested) return;
  scriptRequested = true;

  ensureGtagStub();
  window.gtag!("js", new Date());

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

function applyConfig(id: string): void {
  if (configured) return;
  configured = true;
  window.gtag!("config", id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false,
    // Keep client storage under GA control via Consent Mode.
  });
}

export function updateAnalyticsConsent(choice: ConsentChoice): void {
  const id = getMeasurementId();
  if (!id) return;

  ensureGtagStub();
  loadGtagScript(id);
  applyConfig(id);

  window.gtag!("consent", "update", {
    analytics_storage: choice === "granted" ? "granted" : "denied",
    // Traffic analytics only — never enable ads / remarketing from this app.
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (choice === "granted") {
    trackPageView();
  }
}

/**
 * Call once on app boot: set denied defaults, then apply any saved choice.
 * Does not show UI — ConsentBanner handles that.
 */
export function bootstrapAnalytics(): void {
  const id = getMeasurementId();
  if (!id) return;

  initConsentDefaults();
  loadGtagScript(id);
  applyConfig(id);

  const saved = readConsent();
  if (saved) {
    updateAnalyticsConsent(saved);
  }
}

export function trackPageView(path?: string, title?: string): void {
  const id = getMeasurementId();
  if (!id || !window.gtag) return;
  if (readConsent() !== "granted") return;

  const page_path =
    path ?? `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const page_title = title ?? document.title;

  window.gtag!("event", "page_view", {
    page_path,
    page_title,
    page_location: window.location.origin + page_path,
  });
}
