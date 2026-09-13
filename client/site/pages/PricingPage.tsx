import React from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    note: "Explore the library",
    features: [
      "Browse all template packs",
      "Live preview editing",
      "Export watermark-free previews*",
      "Save favorites locally",
    ],
    cta: "Open Studio",
    to: "/app",
    highlight: false,
  },
  {
    name: "Creator",
    price: "$19",
    note: "per month · coming soon",
    features: [
      "Everything in Starter",
      "Full commercial exports",
      "AI template matching",
      "Priority new packs weekly",
    ],
    cta: "Join waitlist",
    to: "/contact",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$49",
    note: "per month · coming soon",
    features: [
      "Everything in Creator",
      "Magic Board sequences",
      "Team-ready brand kits",
      "Agency usage rights",
    ],
    cta: "Talk to us",
    to: "/contact",
    highlight: false,
  },
];

export function PricingPage() {
  return (
    <>
      <section className="site-page-hero">
        <p className="site-kicker">Pricing</p>
        <h1>Simple plans for creators who ship weekly</h1>
        <p className="site-lead">
          Start in the studio today. Paid tiers unlock full commercial exports and
          AI workflows — accounts and checkout arrive soon.
        </p>
      </section>

      <section className="site-section">
        <div className="site-pricing-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlight
                  ? "site-price-card site-price-card-hot"
                  : "site-price-card"
              }
            >
              {plan.highlight ? (
                <span className="site-price-badge">Most popular</span>
              ) : null}
              <h2>{plan.name}</h2>
              <p className="site-price">
                {plan.price}
                {plan.price.startsWith("$") ? <em>/mo</em> : null}
              </p>
              <p className="site-price-note">{plan.note}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={
                  plan.highlight ? "site-cta" : "site-cta site-cta-ghost"
                }
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="site-fineprint">
          * Export policy for Starter may change when billing launches. No sign-in
          required to explore the studio today.
        </p>
      </section>
    </>
  );
}
