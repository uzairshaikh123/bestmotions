import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAssetById } from "../../assets/catalog";
import { AssetThumb } from "../../assets/AssetThumb";
import type { AssetDefinition } from "../../assets/types";

const HOME_TEMPLATE_IDS = [
  "hook-but-why",
  "hook-shocking-truth",
  "social-yt-subscribe",
  "social-viral-post",
  "crime-board",
  "crime-mugshot",
  "book-page-flip",
  "book-cover-slam",
] as const;

const HOME_TEMPLATES = HOME_TEMPLATE_IDS.map((id) => getAssetById(id)).filter(
  (a): a is AssetDefinition => Boolean(a),
);

const MARQUEE = [
  "Hooks",
  "Social mockups",
  "Crime scene",
  "Documentary text",
  "Charts",
  "Books",
  "UI titles",
  "Maps",
];

const HEADLINE_PARTS = [
  { text: "Templates", markable: true },
  { text: " that feel ", markable: true },
  { text: "studio-made", markable: true },
] as const;

const MARKER_COLORS = [
  { id: "yellow", fill: "rgba(250, 255, 0, 0.55)", solid: "#FAFF00", label: "Yellow" },
  { id: "blue", fill: "rgba(96, 165, 250, 0.5)", solid: "#60A5FA", label: "Blue" },
  { id: "red", fill: "rgba(248, 113, 113, 0.5)", solid: "#F87171", label: "Red" },
] as const;

const FLOW_STEPS = [
  {
    n: "01",
    title: "Select a template",
    body: "Browse motion packs built for hooks, social, docs, and more — preview live before you commit.",
    chip: "Browse",
    accent: "#FAFF00",
    tags: ["Hooks", "Social", "Crime"],
    icon: "select" as const,
  },
  {
    n: "02",
    title: "Customize for your niche",
    body: "Swap copy, colors, and timing in clicks so the cut sounds like your brand, not a stock demo.",
    chip: "Edit live",
    accent: "#60A5FA",
    tags: ["Copy", "Colors", "Timing"],
    icon: "customize" as const,
  },
  {
    n: "03",
    title: "Download & use",
    body: "Export a ready-to-post video and drop it straight into your Short, reel, or client project.",
    chip: "Export",
    accent: "#F472B6",
    tags: ["MP4", "Ready", "Ship"],
    icon: "download" as const,
  },
] as const;

function FlowIcon({ name }: { name: (typeof FLOW_STEPS)[number]["icon"] }) {
  if (name === "select") {
    return (
      <svg className="site-flow-icon" viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect x="10" y="12" width="28" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
        <rect x="26" y="18" width="28" height="36" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <path d="M18 28h12M18 36h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="44" r="8" fill="currentColor" opacity="0.18" />
        <path d="M44 40.5v7M40.5 44h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "customize") {
    return (
      <svg className="site-flow-icon" viewBox="0 0 64 64" fill="none" aria-hidden>
        <path
          d="M14 42 38 18l8 8-24 24H14v-8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M34 22l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="40" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.35" />
        <circle cx="28" cy="14" r="3" fill="currentColor" opacity="0.2" />
      </svg>
    );
  }
  return (
    <svg className="site-flow-icon" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 12v28m0 0-9-9m9 9 9-9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 44v4a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Real highlighter band: mostly flat, slight hand wobble on edges,
 * soft rounded ends — not a jagged ribbon.
 */
function MarkerStroke({ color }: { color: string }) {
  return (
    <svg
      className="site-mark-svg"
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill={color}
        d="M2.8 2.6
           C 14 1.4, 28 3.2, 42 2.0
           C 56 0.9, 70 2.8, 84 1.7
           C 96 0.8, 108 2.4, 116.8 1.6
           C 118.6 1.5, 119.4 2.8, 119.2 4.4
           L 117.8 20.2
           C 117.6 22.0, 116.2 22.9, 114.4 22.8
           C 102 23.7, 90 21.8, 78 23.0
           C 64 24.3, 50 22.2, 36 23.5
           C 22 24.7, 12 22.7, 3.6 23.3
           C 1.9 23.4, 1.0 22.1, 1.2 20.4
           L 2.4 4.2
           C 2.5 3.1, 2.6 2.7, 2.8 2.6
           Z"
      />
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [markIndex, setMarkIndex] = useState(0);
  const [paintKey, setPaintKey] = useState(0);
  const [flowActive, setFlowActive] = useState(false);
  const flowRef = useRef<HTMLElement | null>(null);

  const markableIndexes = HEADLINE_PARTS.map((p, i) =>
    p.markable ? i : -1,
  ).filter((i) => i >= 0);
  const activePart = markableIndexes[markIndex % markableIndexes.length] ?? 0;
  const activeColor = MARKER_COLORS[colorIndex % MARKER_COLORS.length];

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setColorIndex((c) => (c + 1) % MARKER_COLORS.length);
      setMarkIndex((m) => (m + 1) % markableIndexes.length);
      setPaintKey((k) => k + 1);
    }, 2600);
    return () => window.clearInterval(id);
  }, [markableIndexes.length]);

  useEffect(() => {
    const node = flowRef.current;
    if (!node) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setFlowActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setFlowActive(true);
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="site-hero site-hero-slim site-hero-solo site-hero-center">
        <div className="site-hero-copy">
          <p className="site-kicker site-anim-in" style={{ ["--in-delay" as string]: "0ms" }}>
            Motion templates · live preview
          </p>
          <h1 className="site-hero-title">
            {HEADLINE_PARTS.map((part, index) =>
              index === activePart ? (
                <span
                  key={`${paintKey}-${index}`}
                  className="site-mark-word is-painting"
                  style={{ ["--mark-color" as string]: activeColor.fill }}
                >
                  <MarkerStroke color={activeColor.fill} />
                  <span className="site-mark-text">{part.text}</span>
                </span>
              ) : (
                <span key={index} className="site-hero-plain">
                  {part.text}
                </span>
              ),
            )}
          </h1>
          <p className="site-mark-swatches site-anim-in" style={{ ["--in-delay" as string]: "160ms" }}>
            {MARKER_COLORS.map((swatch, i) => (
              <button
                key={swatch.id}
                type="button"
                className={
                  i === colorIndex % MARKER_COLORS.length
                    ? "site-mark-swatch on"
                    : "site-mark-swatch"
                }
                style={{ background: swatch.solid }}
                aria-label={`${swatch.label} highlight`}
                onClick={() => {
                  setColorIndex(i);
                  setPaintKey((k) => k + 1);
                }}
              />
            ))}
            <span>Customize the highlight</span>
          </p>
          <p className="site-lead site-anim-in" style={{ ["--in-delay" as string]: "220ms" }}>
            Pick a template, customize in clicks, export ready-to-post video.
          </p>
          <div className="site-hero-cta site-anim-in" style={{ ["--in-delay" as string]: "320ms" }}>
            <Link to="/app" className="site-cta">
              Browse templates
            </Link>
            <Link to="/features" className="site-cta site-cta-ghost">
              Features
            </Link>
          </div>
        </div>
      </section>

      <div className="site-marquee" aria-hidden>
        <div className="site-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((label, i) => (
            <span key={`${label}-${i}`}>{label}</span>
          ))}
        </div>
      </div>

      <section
        ref={flowRef}
        className={
          flowActive
            ? "site-section site-flow-section is-active"
            : "site-section site-flow-section"
        }
        aria-labelledby="flow-heading"
      >
        <div className="site-section-head site-flow-head">
          <p className="site-kicker">How it works</p>
          <h2 id="flow-heading" className="site-heading-anim">
            <span className="site-heading-line" style={{ ["--line-delay" as string]: "40ms" }}>
              Pick. Customize. Ship.
            </span>
          </h2>
          <p>
            Three beats from blank canvas to a cut that fits your niche —
            ready for your next edit, Short, or campaign.
          </p>
        </div>

        <div className="site-flow-stage">
          <svg className="site-flow-track" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden>
            <path
              className="site-flow-track-base"
              d="M40 40 H960"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="site-flow-track-draw"
              d="M40 40 H960"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FAFF00" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="site-flow">
            {FLOW_STEPS.map((step, index) => (
              <li
                key={step.n}
                className="site-flow-step"
                style={
                  {
                    ["--flow-delay" as string]: `${index * 0.55}s`,
                    ["--flow-accent" as string]: step.accent,
                  } as React.CSSProperties
                }
              >
                <div className="site-flow-node" aria-hidden>
                  <span className="site-flow-node-ring" />
                  <span className="site-flow-node-core">{step.n}</span>
                  {index === FLOW_STEPS.length - 1 ? (
                    <span className="site-flow-finish">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12.5 10 17.5 19 7.5"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                </div>

                <div className="site-flow-visual" aria-hidden>
                  <span className="site-flow-chip">{step.chip}</span>
                  <FlowIcon name={step.icon} />
                  <div className="site-flow-tags">
                    {step.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-section site-templates-section">
        <div className="site-section-head site-section-head-row">
          <div>
            <p className="site-kicker">Templates</p>
            <h2 className="site-heading-anim">
              <span className="site-heading-line" style={{ ["--line-delay" as string]: "60ms" }}>
                Start with a motion pack
              </span>
            </h2>
          </div>
          <Link to="/app" className="site-view-more">
            View more →
          </Link>
        </div>

        <div className="site-template-grid">
          {HOME_TEMPLATES.map((asset, index) => (
            <article
              key={asset.id}
              className="asset-card site-template-card"
              style={{
                ["--accent" as string]: asset.accent,
                ["--card-delay" as string]: `${Math.min(index, 7) * 55}ms`,
              }}
              onMouseEnter={() => setHoverId(asset.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <button
                type="button"
                className="asset-card-hit"
                onClick={() => navigate(`/app?asset=${asset.id}`)}
                aria-label={`Open ${asset.name}`}
              >
                <div className="asset-card-media">
                  <AssetThumb
                    asset={asset}
                    playing={hoverId === asset.id}
                    instanceKey={`home-${asset.id}`}
                  />
                  <span className="asset-duration">
                    {Math.max(
                      1,
                      Math.round(asset.durationInFrames / Math.max(asset.fps, 1)),
                    )}
                    s
                  </span>
                </div>
                <div className="asset-card-body">
                  <h3>{asset.name}</h3>
                  <p className="asset-tag">{asset.category}</p>
                </div>
              </button>
            </article>
          ))}
        </div>

        <div className="site-templates-more">
          <Link to="/app" className="site-cta site-cta-ghost">
            View all templates
          </Link>
        </div>
      </section>

      <section className="site-cta-band">
        <div>
          <h2 className="site-heading-anim">
            <span className="site-heading-line" style={{ ["--line-delay" as string]: "40ms" }}>
              Ship the cut you preview.
            </span>
          </h2>
          <p>Open the studio and customize any template live.</p>
        </div>
        <Link to="/app" className="site-cta">
          Open Studio
        </Link>
      </section>
    </>
  );
}
