import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { BrandLogo } from "../BrandLogo";
import { useTheme } from "../theme";

type Props = {
  center: React.ReactNode;
  drawer: (close: () => void) => React.ReactNode;
  right?: React.ReactNode;
  inviteTo?: string;
  inviteLabel?: string;
};

export function AeNav({
  center,
  drawer,
  right,
  inviteTo = "/app",
  inviteLabel = "Open Studio",
}: Props) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onResize() {
      if (window.matchMedia("(min-width: 961px)").matches) {
        setMenuOpen(false);
      }
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  function close() {
    setMenuOpen(false);
  }

  return (
    <header className="ae-nav">
      <Link to="/" className="ae-nav-brand" aria-label="BestMotions home" onClick={close}>
        <BrandLogo className="ae-nav-logo" />
        <strong>BestMotions</strong>
      </Link>

      <nav className="ae-nav-center" aria-label="Main">
        {center}
      </nav>

      <div className="ae-nav-right">
        {right}
        <button
          type="button"
          className="theme-toggle ae-nav-theme"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <Link to={inviteTo} className="ae-nav-invite" onClick={close}>
          {inviteLabel}
        </Link>
        <button
          type="button"
          className={menuOpen ? "nav-burger on ae-nav-burger" : "nav-burger ae-nav-burger"}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen
        ? createPortal(
            <div className="nav-drawer-root" role="presentation">
              <button
                type="button"
                className="nav-drawer-scrim"
                aria-label="Close menu"
                onClick={close}
              />
              <nav className="nav-drawer ae-drawer" aria-label="Mobile">
                <p className="nav-drawer-label">Navigate</p>
                {drawer(close)}
                <button
                  type="button"
                  className="nav-drawer-link theme-drawer-link"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

export function AeSparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.3A8.5 8.5 0 1 1 9.7 3a7 7 0 1 0 11.3 11.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
