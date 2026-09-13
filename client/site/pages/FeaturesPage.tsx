import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Template library",
    body: "Hooks, social mockups, crime-scene graphics, documentary captions, charts, maps, books, and UI title packs — organized for how creators actually publish.",
  },
  {
    title: "Live asset editor",
    body: "Change text, colors, and media while the preview updates. What you see is what exports — no surprise renders.",
  },
  {
    title: "AI-assisted matching",
    body: "Describe the motion you need and jump into a fitted template. Keep full control of copy and style before you export.",
  },
  {
    title: "Magic Board",
    body: "Compose multi-beat sequences on a visual board when a single template is not enough for the story.",
  },
  {
    title: "Save for later",
    body: "Bookmark the cuts you love and return with your preferred packs ready to customize.",
  },
  {
    title: "Creator formats",
    body: "Vertical and landscape-ready motion for Reels, Shorts, YouTube B-roll, launch videos, and course explainers.",
  },
];

const COMPARE = [
  { label: "Timeline editing", value: "Not required" },
  { label: "Keyframe animation", value: "Pre-built motion" },
  { label: "Preview", value: "Live in browser" },
  { label: "Export", value: "Ready-to-post video" },
  { label: "Learning curve", value: "Minutes, not weeks" },
];

export function FeaturesPage() {
  return (
    <>
      <section className="site-page-hero">
        <p className="site-kicker">Features</p>
        <h1>Everything you need to ship motion fast</h1>
        <p className="site-lead">
          BestMotions combines curated templates, live editing, and optional AI
          matching so you can go from idea to export without opening After Effects.
        </p>
        <div className="site-hero-cta">
          <Link to="/app" className="site-cta">
            Try the studio
          </Link>
          <Link to="/about" className="site-cta site-cta-ghost">
            About
          </Link>
        </div>
      </section>

      <section className="site-section">
        <div className="site-feature-grid site-feature-grid-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="site-feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section site-section-alt">
        <div className="site-section-head">
          <p className="site-kicker">Workflow</p>
          <h2>Designed to feel like a studio, not software training</h2>
        </div>
        <div className="site-compare">
          {COMPARE.map((row) => (
            <div key={row.label} className="site-compare-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="site-cta-band">
        <div>
          <h2>Browse every pack in the studio</h2>
          <p>Open templates, preview motion, and customize on the spot.</p>
        </div>
        <Link to="/app" className="site-cta">
          Open Studio
        </Link>
      </section>
    </>
  );
}
