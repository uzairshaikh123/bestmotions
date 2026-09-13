import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import "./site.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function SiteLayout() {
  return (
    <div className="site">
      <ScrollToTop />
      <div className="site-ambient" aria-hidden>
        <span className="site-orb site-orb-a" />
        <span className="site-orb site-orb-b" />
        <span className="site-orb site-orb-c" />
      </div>
      <SiteNav />
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
