import React from "react";
import { Heart, X, Info, RotateCcw } from "lucide-react";

export function ActionButtons({
  onPass,
  onLike,
  onToggleInfo,
  onReset,
  disabled = false,
  showInfoToggle = false,
  isInfoExpanded = false
}) {
  return (
    <div className="action-buttons-container" role="group" aria-label="Swipe actions">
      {onReset && (
        <button
          type="button"
          className="action-btn btn-rewind"
          onClick={onReset}
          disabled={disabled}
          title="Reset demo profiles"
          aria-label="Reset demo profiles"
        >
          <RotateCcw size={20} />
        </button>
      )}

      <button
        type="button"
        className="action-btn btn-pass"
        onClick={onPass}
        disabled={disabled}
        title="Pass (Swipe Left or Left Arrow key)"
        aria-label="Pass profile"
      >
        <X size={28} strokeWidth={2.5} />
      </button>

      {showInfoToggle && (
        <button
          type="button"
          className={`action-btn btn-info ${isInfoExpanded ? "active" : ""}`}
          onClick={onToggleInfo}
          disabled={disabled}
          title="Toggle profile details"
          aria-label="Toggle profile details"
        >
          <Info size={22} />
        </button>
      )}

      <button
        type="button"
        className="action-btn btn-like"
        onClick={onLike}
        disabled={disabled}
        title="Like (Swipe Right or Right Arrow key)"
        aria-label="Like profile"
      >
        <Heart size={30} fill="currentColor" strokeWidth={1.5} />
      </button>
    </div>
  );
}
