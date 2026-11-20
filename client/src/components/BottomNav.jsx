import React from "react";
import { House, Compass, Heart } from "lucide-react";

export function BottomNav({ currentTab, onSelectTab, matchesCount = 0 }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`bottom-nav-item ${currentTab === "home" ? "active" : ""}`}
        onClick={() => onSelectTab("home")}
      >
        <div className="nav-icon-container">
          <House size={22} />
        </div>
        <span className="nav-label">Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentTab === "discover" ? "active" : ""}`}
        onClick={() => onSelectTab("discover")}
      >
        <div className="nav-icon-container discover-icon-container">
          <Compass size={24} />
        </div>
        <span className="nav-label">Discover</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentTab === "matches" ? "active" : ""}`}
        onClick={() => onSelectTab("matches")}
      >
        <div className="nav-icon-container">
          <Heart
            size={22}
            fill={matchesCount > 0 && currentTab === "matches" ? "currentColor" : "none"}
          />
          {matchesCount > 0 && (
            <span className="mobile-badge-count">{matchesCount}</span>
          )}
        </div>
        <span className="nav-label">Matches</span>
      </button>
    </nav>
  );
}
