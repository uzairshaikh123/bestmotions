import React from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Analytics } from "./analytics/Analytics";
import { App } from "./App";
import { FeatureFlagsProvider } from "./featureFlags";
import { SiteLayout } from "./site/SiteLayout";
import { AboutPage } from "./site/pages/AboutPage";
import { ContactPage, FeedbackPage } from "./site/pages/FeedbackPage";
import { FeaturesPage } from "./site/pages/FeaturesPage";
import { HomePage } from "./site/pages/HomePage";
import { PrivacyPage, TermsPage } from "./site/pages/LegalPages";
import { ThemeProvider } from "./theme";
import "./styles.css";
import "./site/site.css";

/** Old bookmarks used `/?tab=…` — send those into the studio. */
function MarketingHome() {
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  const looksLikeStudio =
    params.has("tab") ||
    params.has("category") ||
    params.has("asset") ||
    params.has("q") ||
    params.has("sort") ||
    params.has("sub") ||
    params.has("revideo");
  if (looksLikeStudio) {
    return <Navigate to={`/app${search}${hash}`} replace />;
  }
  return <HomePage />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FeatureFlagsProvider>
        <BrowserRouter>
          <Analytics />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<MarketingHome />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="pricing" element={<Navigate to="/features" replace />} />
            </Route>
            <Route path="app/*" element={<App />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FeatureFlagsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
