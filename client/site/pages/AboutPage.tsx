import React from "react";
import { Link } from "react-router-dom";

const VALUES = [
  {
    title: "Editorial first",
    body: "We design motion that reads like a finished channel — restrained type, clear hierarchy, and pacing that earns the scroll.",
  },
  {
    title: "Creators over complexity",
    body: "Timelines and keyframes are great for specialists. Most creators just need the right template and a fast way to make it theirs.",
  },
  {
    title: "Ship in the browser",
    body: "No install wall. Preview live, tweak copy and color, export when it looks right. The studio is the product.",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="site-page-hero">
        <p className="site-kicker">About</p>
        <h1>Motion graphics for people who publish every week</h1>
        <p className="site-lead">
          BestMotions is a browser-based motion studio built for YouTubers,
          Shorts creators, marketers, and agencies who need pro-looking animation
          without hiring a motion designer for every upload.
        </p>
      </section>

      <section className="site-section">
        <div className="site-prose">
          <h2>Why we built this</h2>
          <p>
            Faceless channels, SaaS launches, and social proof videos all share the
            same bottleneck: motion design. Stock After Effects packs feel generic.
            Full editors feel slow. BestMotions sits in the middle — curated
            templates with live controls so you keep the craft and drop the friction.
          </p>
          <p>
            The workflow is simple on purpose: match the brief, customize
            instantly, export something you are proud to post — without learning a
            timeline or hiring a motion designer for every upload.
          </p>
        </div>
      </section>

      <section className="site-section site-section-alt">
        <div className="site-section-head">
          <p className="site-kicker">What we believe</p>
          <h2>Three principles behind the studio</h2>
        </div>
        <div className="site-feature-grid">
          {VALUES.map((value) => (
            <article key={value.title} className="site-feature-card">
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-cta-band">
        <div>
          <h2>See the studio for yourself</h2>
          <p>Browse the full template library and preview motion live.</p>
        </div>
        <div className="site-hero-cta">
          <Link to="/app" className="site-cta">
            Open Studio
          </Link>
          <Link to="/contact" className="site-cta site-cta-ghost">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
