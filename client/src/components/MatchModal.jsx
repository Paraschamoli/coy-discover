import React, { useEffect } from "react";
import { Heart, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

export function MatchModal({ match, onContinue, onViewMatches }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onContinue();
      if (e.key === "Enter") onViewMatches();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue, onViewMatches]);

  if (!match) return null;

  return (
    <div className="match-modal-backdrop" role="dialog" aria-modal="true" aria-label="Match celebration">
      {/* Decorative Confetti Elements */}
      <div className="confetti-item c1" aria-hidden="true" />
      <div className="confetti-item c2" aria-hidden="true" />
      <div className="confetti-item c3" aria-hidden="true" />
      <div className="confetti-item c4" aria-hidden="true" />
      <div className="confetti-item c5" aria-hidden="true" />
      <div className="confetti-item c6" aria-hidden="true" />

      <div className="match-modal-dialog">
        <div className="match-kicker">
          <Sparkles size={16} />
          <span>MUTUAL CONNECTION MADE</span>
        </div>

        {/* Dual Avatars Connection */}
        <div className="match-dual-avatars">
          <div className="match-avatar-circle user-avatar">
            <span className="user-initial">You</span>
          </div>

          <div className="match-heart-bridge">
            <Heart size={26} fill="currentColor" />
          </div>

          <div className="match-avatar-circle match-avatar">
            <img src={match.photo} alt={match.name} />
          </div>
        </div>

        <h1 className="match-headline">
          It's a Match<span className="accent">.</span>
        </h1>

        <p className="match-subcopy">
          You and <strong>{match.name}</strong> both liked each other! That's the spark of a genuine connection.
        </p>

        {match.bio && (
          <div className="match-quote-snippet">
            <span>"{match.bio}"</span>
          </div>
        )}

        <div className="match-actions-group">
          <button
            type="button"
            className="btn-primary btn-match-cta"
            onClick={onViewMatches}
            autoFocus
          >
            <span>View in Matches</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="btn-ghost btn-match-secondary"
            onClick={onContinue}
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
