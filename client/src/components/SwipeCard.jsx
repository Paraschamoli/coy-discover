import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { MapPin, ShieldCheck, Sparkles, User } from "lucide-react";

export const SwipeCard = forwardRef(function SwipeCard(
  {
    profile,
    nextProfile,
    onSwipe,
    disabled = false
  },
  ref
) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animatingExit, setAnimatingExit] = useState(null); // 'like' | 'pass' | null
  const [imgError, setImgError] = useState(false);
  const [nextImgError, setNextImgError] = useState(false);

  const startPos = useRef(null);
  const cardElementRef = useRef(null);
  const activePointerId = useRef(null);

  // Expose imperative trigger for Like / Pass button clicks
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction) => {
      if (disabled || animatingExit) return;
      triggerExit(direction);
    }
  }));

  // Reset state when profile changes
  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setDragging(false);
    setAnimatingExit(null);
    setImgError(false);
  }, [profile?.id]);

  const triggerExit = (direction) => {
    setAnimatingExit(direction);
    // Let animation complete before advancing feed
    setTimeout(() => {
      onSwipe(direction);
    }, 280);
  };

  const handlePointerDown = (e) => {
    if (disabled || animatingExit || e.button !== 0) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    activePointerId.current = e.pointerId;
    setDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer capture not supported
    }
  };

  const handlePointerMove = (e) => {
    if (!dragging || !startPos.current) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setDrag({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);

    try {
      if (activePointerId.current !== null && e.currentTarget.hasPointerCapture(activePointerId.current)) {
        e.currentTarget.releasePointerCapture(activePointerId.current);
      }
    } catch {
      // Ignore
    }
    activePointerId.current = null;

    const threshold = 85;
    if (drag.x > threshold) {
      triggerExit("like");
    } else if (drag.x < -threshold) {
      triggerExit("pass");
    } else {
      // Spring back to center
      setDrag({ x: 0, y: 0 });
    }
    startPos.current = null;
  };

  if (!profile) return null;

  // Calculate dynamic transform values
  const exitX = animatingExit === "like" ? 600 : animatingExit === "pass" ? -600 : 0;
  const exitRotate = animatingExit === "like" ? 22 : animatingExit === "pass" ? -22 : 0;

  const currentX = animatingExit ? exitX : drag.x;
  const currentY = animatingExit ? drag.y : drag.y;
  const currentRotate = animatingExit ? exitRotate : drag.x * 0.055;

  // Card stack underneath interpolation
  const dragRatio = Math.min(1, Math.abs(drag.x) / 100);
  const underScale = 0.94 + dragRatio * 0.06;
  const underOpacity = 0.55 + dragRatio * 0.45;
  const underTranslateY = 12 - dragRatio * 12;

  // Stamp opacities
  const likeOpacity = animatingExit === "like" ? 1 : Math.min(1, Math.max(0, (drag.x - 20) / 60));
  const passOpacity = animatingExit === "pass" ? 1 : Math.min(1, Math.max(0, (-drag.x - 20) / 60));

  return (
    <div className="card-stack-stage">
      {/* Background Underneath Card */}
      {nextProfile && (
        <article
          className="profile-card peek-card"
          style={{
            transform: `translate3d(0, ${underTranslateY}px, 0) scale(${underScale})`,
            opacity: underOpacity
          }}
          aria-hidden="true"
        >
          {nextProfile.photo && !nextImgError ? (
            <img
              src={nextProfile.photo}
              alt=""
              className="card-photo"
              onError={() => setNextImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="card-photo-fallback">
              <User size={64} />
            </div>
          )}
          <div className="card-gradient-shade" />
          <div className="card-content-preview">
            <h3 className="card-title-preview">{nextProfile.name}, {nextProfile.age}</h3>
          </div>
        </article>
      )}

      {/* Main Interactive Draggable Card */}
      <article
        ref={cardElementRef}
        className={`profile-card active-card ${dragging ? "is-dragging" : ""} ${animatingExit ? "is-exiting" : ""}`}
        style={{
          transform: `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRotate}deg)`,
          transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.15)"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label={`${profile.name}, ${profile.age}`}
      >
        {/* Dynamic Swipe Badges / Stamps */}
        <div
          className="stamp-badge like-stamp"
          style={{ opacity: likeOpacity, transform: `scale(${0.8 + likeOpacity * 0.2}) rotate(-14deg)` }}
          aria-hidden="true"
        >
          LIKE
        </div>

        <div
          className="stamp-badge pass-stamp"
          style={{ opacity: passOpacity, transform: `scale(${0.8 + passOpacity * 0.2}) rotate(14deg)` }}
          aria-hidden="true"
        >
          PASS
        </div>

        {/* Profile Image */}
        {profile.photo && !imgError ? (
          <img
            src={profile.photo}
            alt={profile.name}
            className="card-photo"
            draggable="false"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-photo-fallback">
            <User size={80} />
            <span>{profile.name}</span>
          </div>
        )}

        {/* Ambient Overlay Shade */}
        <div className="card-gradient-shade" />

        {/* Profile Content */}
        <div className="card-info-box">
          <div className="card-header-line">
            <h2 className="card-name-age">
              {profile.name}, <span className="card-age">{profile.age}</span>
            </h2>
            <span className="badge-verified" title="Verified Coy Profile">
              <ShieldCheck size={16} />
            </span>
          </div>

          <p className="card-location">
            <MapPin size={14} className="location-pin" />
            <span>{profile.city}</span>
          </p>

          <p className="card-bio">{profile.bio}</p>

          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div className="card-interests-wrap">
              {profile.interests.map((interest) => (
                <span key={interest} className="interest-tag">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
});
