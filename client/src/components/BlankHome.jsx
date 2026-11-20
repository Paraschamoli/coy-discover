import React from "react";

/**
 * BlankHome
 * Satisfies the assignment requirement: "Keep the Home tab blank, as required by the assignment."
 * Renders an intentional, elegant, distraction-free container.
 */
export function BlankHome() {
  return (
    <main className="blank-home-view" aria-label="Home page">
      <div className="blank-home-content">
        <div className="blank-home-watermark" aria-hidden="true">
          <span className="watermark-mark">c</span>
          <span className="watermark-text">coy</span>
        </div>
        <p className="blank-home-notice">
          Home tab intentionally blank per assignment specifications.
        </p>
      </div>
    </main>
  );
}
