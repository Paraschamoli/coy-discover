import React from "react";
import { Sparkles, Heart, RotateCcw, Compass } from "lucide-react";

export function EmptyState({ type = "feed", onAction, onSecondaryAction, loading = false }) {
  if (type === "matches") {
    return (
      <div className="empty-state-card matches">
        <div className="empty-icon-wrap heart-pulse">
          <Heart size={32} className="empty-icon-accent" />
        </div>
        <h2 className="empty-title">Your matches will live here.</h2>
        <p className="empty-description">
          When you swipe right on someone who already liked you, they'll show up here instantly.
        </p>
        <button
          className="btn-primary"
          onClick={onAction}
          disabled={loading}
        >
          <Compass size={18} />
          <span>Explore Profiles</span>
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state-card feed">
      <div className="empty-icon-wrap sparkles-glow">
        <Sparkles size={32} className="empty-icon-accent" />
      </div>
      <h2 className="empty-title">You're all caught up!</h2>
      <p className="empty-description">
        You've reviewed every profile in your area for now. Reset the demo dataset to swipe again from the beginning.
      </p>
      <div className="empty-actions">
        <button
          className="btn-primary"
          onClick={onAction}
          disabled={loading}
          title="Reset seeded demo dataset"
        >
          <RotateCcw size={18} className={loading ? "spin" : ""} />
          <span>{loading ? "Resetting..." : "Reset Demo Feed"}</span>
        </button>

        {onSecondaryAction && (
          <button
            className="btn-secondary"
            onClick={onSecondaryAction}
          >
            <Heart size={17} />
            <span>View Matches</span>
          </button>
        )}
      </div>
    </div>
  );
}
