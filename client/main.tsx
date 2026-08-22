import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { FeatureFlagsProvider } from "./featureFlags";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FeatureFlagsProvider>
      <App />
    </FeatureFlagsProvider>
  </React.StrictMode>,
);
