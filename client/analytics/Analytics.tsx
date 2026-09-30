import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  bootstrapAnalytics,
  isAnalyticsConfigured,
  trackPageView,
  updateAnalyticsConsent,
} from "./ga";
import {
  clearConsent,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "./consent";
import "./analytics.css";

/**
 * Boots GA4 + Consent Mode, tracks SPA navigations, and shows a cookie bar
 * until the visitor chooses Accept or Reject.
 */
export function Analytics() {
  if (!isAnalyticsConfigured()) return null;
  return <AnalyticsInner />;
}

function AnalyticsInner() {
  const location = useLocation();
  const [choice, setChoice] = useState<ConsentChoice | null>(() => readConsent());
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    bootstrapAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}${location.hash}`);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    function onOpenPrefs() {
      setPrefsOpen(true);
    }
    window.addEventListener("bm:open-cookie-prefs", onOpenPrefs);
    return () => window.removeEventListener("bm:open-cookie-prefs", onOpenPrefs);
  }, []);

  function decide(next: ConsentChoice) {
    writeConsent(next);
    updateAnalyticsConsent(next);
    setChoice(next);
    setPrefsOpen(false);
  }

  function reopen() {
    clearConsent();
    setChoice(null);
    setPrefsOpen(true);
  }

  const showBanner = choice === null || prefsOpen;

  return (
    <>
      {showBanner ? (
        <div
          className="cookie-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="cookie-banner-inner">
            <div className="cookie-banner-copy">
              <p id="cookie-banner-title" className="cookie-banner-title">
                Analytics cookies
              </p>
              <p id="cookie-banner-desc" className="cookie-banner-desc">
                We use Google Analytics to understand how many people visit
                BestMotions and which pages they use. We do not use it for ads
                or remarketing.{" "}
                <Link to="/privacy">Privacy policy</Link>
              </p>
            </div>
            <div className="cookie-banner-actions">
              <button
                type="button"
                className="cookie-btn cookie-btn-ghost"
                onClick={() => decide("denied")}
              >
                Reject
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn-primary"
                onClick={() => decide("granted")}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="cookie-prefs-trigger"
          onClick={reopen}
          aria-label="Cookie preferences"
        >
          Cookies
        </button>
      )}
    </>
  );
}

/** Open the cookie preference bar from footer / legal links. */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event("bm:open-cookie-prefs"));
}
