import React, { useState } from "react";
import { Heart, MapPin, MessageCircle, ArrowLeft, ShieldCheck, Sparkles, X } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function MatchesView({ matches = [], onNavigateDiscover, onRefreshMatches }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <section className="matches-view-section" aria-label="Mutual matches">
      {/* Header */}
      <div className="matches-header">
        <div>
          <div className="matches-eyebrow">
            <Sparkles size={14} />
            <span>MUTUAL ATTRACTION</span>
          </div>
          <h1 className="matches-title">
            Your Matches<span className="accent">.</span>
          </h1>
          <p className="matches-subtitle">
            People who liked you back. The feeling is mutual.
          </p>
        </div>

        <button
          type="button"
          className="btn-back-discover"
          onClick={onNavigateDiscover}
        >
          <ArrowLeft size={16} />
          <span>Keep Discovering</span>
        </button>
      </div>

      {/* Grid or Empty State */}
      {matches.length === 0 ? (
        <EmptyState
          type="matches"
          onAction={onNavigateDiscover}
        />
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <article
              key={match.id}
              className="match-card-item"
              onClick={() => setSelectedMatch(match)}
              tabIndex={0}
              role="button"
              aria-label={`View match details for ${match.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedMatch(match);
              }}
            >
              <div className="match-card-thumb-wrap">
                <img
                  src={match.photo}
                  alt={match.name}
                  className="match-card-photo"
                  loading="lazy"
                />
                <span className="match-card-heart-pill" title="Mutual connection">
                  <Heart size={12} fill="currentColor" />
                </span>
              </div>

              <div className="match-card-body">
                <div className="match-card-top-row">
                  <h3 className="match-card-name">
                    {match.name}{match.age ? `, ${match.age}` : ""}
                  </h3>
                  <span className="badge-verified-tiny">
                    <ShieldCheck size={14} />
                  </span>
                </div>

                {match.city && (
                  <p className="match-card-city">
                    <MapPin size={12} />
                    <span>{match.city}</span>
                  </p>
                )}

                {match.bio && (
                  <p className="match-card-bio-snippet">{match.bio}</p>
                )}

                <div className="match-card-action-row">
                  <span className="match-mutual-label">Mutual like</span>
                  <button
                    type="button"
                    className="match-chat-btn"
                    title="Send a message"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMatch(match);
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>Say Hello</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="match-detail-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${selectedMatch.name}`}
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="match-detail-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-close-detail"
              onClick={() => setSelectedMatch(null)}
              aria-label="Close match detail"
            >
              <X size={20} />
            </button>

            <div className="detail-photo-wrapper">
              <img
                src={selectedMatch.photo}
                alt={selectedMatch.name}
                className="detail-photo"
              />
              <div className="detail-photo-gradient" />
              <div className="detail-photo-badge">
                <Heart size={14} fill="currentColor" />
                <span>Matched with you</span>
              </div>
            </div>

            <div className="detail-body">
              <div className="detail-name-row">
                <h2>
                  {selectedMatch.name}{selectedMatch.age ? `, ${selectedMatch.age}` : ""}
                </h2>
                <ShieldCheck size={18} className="accent" />
              </div>

              {selectedMatch.city && (
                <p className="detail-location">
                  <MapPin size={15} />
                  <span>{selectedMatch.city}</span>
                </p>
              )}

              {selectedMatch.bio && (
                <div className="detail-section">
                  <h4>About</h4>
                  <p className="detail-bio">{selectedMatch.bio}</p>
                </div>
              )}

              {Array.isArray(selectedMatch.interests) && selectedMatch.interests.length > 0 && (
                <div className="detail-section">
                  <h4>Interests</h4>
                  <div className="detail-interests">
                    {selectedMatch.interests.map((interest) => (
                      <span key={interest} className="interest-pill">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-icebreaker">
                <Sparkles size={16} />
                <span>
                  Icebreaker: Ask {selectedMatch.name} about{" "}
                  {selectedMatch.interests?.[0] || "their favorite weekend playlist"}!
                </span>
              </div>

              <button
                type="button"
                className="btn-primary btn-start-chat"
                onClick={() => {
                  alert(`Direct messaging with ${selectedMatch.name} is ready for integration!`);
                }}
              >
                <MessageCircle size={18} />
                <span>Start Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
