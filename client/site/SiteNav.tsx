import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { isBoardEnabled, useFeatureFlags } from "../featureFlags";
import { AeNav, AeSparkIcon } from "./AeNav";

export function SiteNav() {
  const navigate = useNavigate();
  const boardEnabled = isBoardEnabled();
  const { ai: aiEnabled } = useFeatureFlags();

  function goStudio(tab?: string, close?: () => void) {
    close?.();
    navigate(tab ? `/app?tab=${tab}` : "/app");
  }

  return (
    <AeNav
      center={
        <>
          <button
            type="button"
            className="ae-nav-item"
            onClick={() => goStudio("prompt")}
          >
            <AeSparkIcon />
            <span>AI</span>
            <em className="ae-nav-meta">{aiEnabled ? "live" : "soon"}</em>
          </button>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              isActive ? "ae-nav-item on" : "ae-nav-item"
            }
          >
            Features
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "ae-nav-item on" : "ae-nav-item"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/app"
            className={({ isActive }) =>
              isActive ? "ae-nav-item on" : "ae-nav-item"
            }
          >
            Studio
          </NavLink>
          <button
            type="button"
            className="ae-nav-item"
            onClick={() => goStudio("board")}
          >
            Magic Board
            {boardEnabled ? null : <em className="ae-nav-meta">soon</em>}
          </button>
        </>
      }
      drawer={(close) => (
        <>
          <Link to="/" className="nav-drawer-link" onClick={close}>
            Home
          </Link>
          <button
            type="button"
            className="nav-drawer-link"
            onClick={() => goStudio("prompt", close)}
          >
            AI
            {aiEnabled ? null : <span className="nav-soon">Coming soon</span>}
          </button>
          <Link to="/features" className="nav-drawer-link" onClick={close}>
            Features
          </Link>
          <Link to="/about" className="nav-drawer-link" onClick={close}>
            About
          </Link>
          <Link to="/app" className="nav-drawer-link" onClick={close}>
            Studio
          </Link>
          <button
            type="button"
            className="nav-drawer-link"
            onClick={() => goStudio("board", close)}
          >
            Magic Board
            {boardEnabled ? null : <span className="nav-soon">Coming soon</span>}
          </button>
          <Link to="/feedback" className="nav-drawer-link" onClick={close}>
            Feedback
          </Link>
        </>
      )}
    />
  );
}
