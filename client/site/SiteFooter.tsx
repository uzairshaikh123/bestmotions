import React from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../BrandLogo";

export function SiteFooter() {
  return (
    <footer className="site-footer ae-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="ae-nav-brand site-brand-footer">
            <BrandLogo className="ae-nav-logo" />
            <strong>BestMotions</strong>
          </Link>
          <p>
            Browser-based motion graphics for creators, marketers, and agencies.
            Pick a template, customize live, export ready-to-post video.
          </p>
        </div>

        <div className="site-footer-col">
          <h3>Product</h3>
          <Link to="/features">Features</Link>
          <Link to="/app">Studio</Link>
          <Link to="/app?tab=prompt">AI generation</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="site-footer-col">
          <h3>Legal</h3>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/feedback">Feedback</Link>
        </div>

        <div className="site-footer-col">
          <h3>Company</h3>
          <Link to="/about">About</Link>
          <Link to="/feedback">Send feedback</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} BestMotions. All rights reserved.</span>
        <div className="site-footer-legal">
          <Link to="/privacy">Privacy</Link>
          <span aria-hidden>·</span>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
