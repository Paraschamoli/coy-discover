import React, { useRef, useEffect } from "react";
import { Heart, ShieldCheck, Sparkles, Compass, Command } from "lucide-react";
import { SwipeCard } from "./SwipeCard";
import { ActionButtons } from "./ActionButtons";
import { EmptyState } from "./EmptyState";

export function DiscoverView({
  profiles = [],
  matchesCount = 0,
  onSwipe,
  onResetFeed,
  onNavigateMatches,
  busy = false,
  loading = false
}) {
  const swipeCardRef = useRef(null);
  const activeProfile = profiles[0];
  const nextProfile = profiles[1];

  // Handle keyboard shortcuts (Left Arrow = Pass, Right Arrow = Like)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input or dialog
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || busy || !activeProfile) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swipeCardRef.current?.triggerSwipe("pass");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        swipeCardRef.current?.triggerSwipe("like");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, activeProfile]);

  const handlePassClick = () => {
    swipeCardRef.current?.triggerSwipe("pass");
  };

  const handleLikeClick = () => {
    swipeCardRef.current?.triggerSwipe("like");
  };

  return (
    <div className="discover-container" aria-label="Discover profiles">
      {/* Top Section Header */}
      <div className="discover-top-header">
        <div>
          <div className="eyebrow-tag">
            <Sparkles size={12} />
            <span>DISCOVER CONNECTIONS</span>
          </div>
          <h1 className="discover-heading">
            Find Your Person<span className="accent">.</span>
          </h1>
          <p className="discover-subhead">
            Genuine profiles. Mutual matches only.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="matches-badge-pill"
            onClick={onNavigateMatches}
            title="Open mutual matches"
          >
            <Heart size={16} fill={matchesCount > 0 ? "currentColor" : "none"} />
            <span>Matches</span>
            <span className="badge-bubble">{matchesCount}</span>
          </button>
        </div>
      </div>

      {/* Main Discover Layout */}
      <div className="discover-grid-layout">
        {/* Left Side Note: The Coy Promise */}
        <aside className="discover-side-panel left-panel">
          <div className="panel-card">
            <div className="panel-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <h3>Mutual, Always.</h3>
            <p>
              Your likes remain strictly private until the other person likes you back. No awkwardness, ever.
            </p>
            <div className="panel-divider" />
            <div className="panel-footer-tip">
              <Sparkles size={14} />
              <span>Real people. Zero games.</span>
            </div>
          </div>

          <div className="panel-card shortcuts-card">
            <h4>
              <Command size={14} />
              <span>Keyboard Controls</span>
            </h4>
            <ul className="shortcuts-list">
              <li>
                <kbd>←</kbd>
                <span>Swipe Left (Pass)</span>
              </li>
              <li>
                <kbd>→</kbd>
                <span>Swipe Right (Like)</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Swipe Column */}
        <div className="swipe-center-column">
          <div className="card-counter-row">
            <span className="counter-label">DISCOVER QUEUE</span>
            <span className="counter-value">
              {profiles.length > 0 ? `${profiles.length} profiles left` : "ALL CAUGHT UP"}
            </span>
          </div>

          {activeProfile ? (
            <>
              <SwipeCard
                ref={swipeCardRef}
                profile={activeProfile}
                nextProfile={nextProfile}
                onSwipe={onSwipe}
                disabled={busy}
              />

              <ActionButtons
                onPass={handlePassClick}
                onLike={handleLikeClick}
                disabled={busy}
              />

              <div className="swipe-hints-row">
                <span className="hint-pass">← Swipe Left to Pass</span>
                <span className="hint-divider">·</span>
                <span className="hint-like">Swipe Right to Like →</span>
              </div>
            </>
          ) : (
            <EmptyState
              type="feed"
              loading={loading}
              onAction={onResetFeed}
              onSecondaryAction={onNavigateMatches}
            />
          )}
        </div>

        {/* Right Side Panel */}
        <aside className="discover-side-panel right-panel">
          <div className="panel-card profile-curation-card">
            <div className="curation-header">
              <Compass size={18} />
              <h4>How Coy Works</h4>
            </div>
            <ol className="how-it-works-steps">
              <li>
                <strong>Discover</strong>
                <p>Browse detailed profiles with shared interests & vibes.</p>
              </li>
              <li>
                <strong>Decide</strong>
                <p>Swipe right to like or left to pass with smooth touch gestures.</p>
              </li>
              <li>
                <strong>Connect</strong>
                <p>When you both like each other, it's an instant match!</p>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
