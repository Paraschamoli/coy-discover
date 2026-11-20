import React from "react";
import { House, Compass, Heart, RotateCcw } from "lucide-react";

export function Navbar({
  currentTab,
  onSelectTab,
  matchesCount = 0,
  onResetDemo,
  resetting = false
}) {
  return (
    <header className="app-topbar">
      <div className="topbar-inner">
        {/* Brand */}
        <button
          type="button"
          className="brand-logo-btn"
          onClick={() => onSelectTab("home")}
          aria-label="Coy home"
        >
          <span className="brand-glyph">c</span>
          <span className="brand-word">coy</span>
        </button>

        {/* Live Subtitle (Desktop) */}
        <div className="topbar-status">
          <span className="live-status-dot" aria-hidden="true" />
          <span>A little closer to a connection</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-link ${currentTab === "home" ? "active" : ""}`}
            onClick={() => onSelectTab("home")}
          >
            <House size={16} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-link ${currentTab === "discover" ? "active" : ""}`}
            onClick={() => onSelectTab("discover")}
          >
            <Compass size={16} />
            <span>Discover</span>
          </button>

          <button
            type="button"
            className={`nav-link ${currentTab === "matches" ? "active" : ""}`}
            onClick={() => onSelectTab("matches")}
          >
            <Heart size={16} fill={matchesCount > 0 && currentTab === "matches" ? "currentColor" : "none"} />
            <span>Matches</span>
            {matchesCount > 0 && (
              <span className="nav-badge-count">{matchesCount}</span>
            )}
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="topbar-right-tools">
          <button
            type="button"
            className="btn-icon-reset"
            onClick={onResetDemo}
            disabled={resetting}
            title="Reset demo data"
            aria-label="Reset demo data"
          >
            <RotateCcw size={16} className={resetting ? "spin" : ""} />
            <span className="reset-btn-label">Reset Demo</span>
          </button>

          <div className="user-profile-avatar" title="You (Demo User)">
            <span>P</span>
          </div>
        </div>
      </div>
    </header>
  );
}
