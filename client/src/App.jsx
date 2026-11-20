import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { DiscoverView } from "./components/DiscoverView";
import { MatchesView } from "./components/MatchesView";
import { BlankHome } from "./components/BlankHome";
import { MatchModal } from "./components/MatchModal";
import { Toast } from "./components/Toast";
import { getFeed, submitSwipe, getMatches, resetDemoState } from "./services/api";

export function App() {
  const [currentTab, setCurrentTab] = useState("discover");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);
  const [newMatch, setNewMatch] = useState(null);

  const showToast = useCallback((message, type = "info", duration = 1800) => {
    setToast({ message, type });
    window.setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  // Fetch unswiped profiles
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFeed();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Unable to reach backend API. Is the server running?", "error", 3500);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch mutual matches
  const loadMatches = useCallback(async () => {
    try {
      const data = await getMatches();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load matches:", err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadFeed();
    loadMatches();
  }, [loadFeed, loadMatches]);

  // Handle Swipe (Like or Pass)
  const handleSwipe = useCallback(
    async (direction) => {
      if (busy || !profiles[0]) return;
      const current = profiles[0];

      setBusy(true);

      // Provide instant tactile toast feedback
      if (direction === "like") {
        showToast(`Liked ${current.name}`, "like", 900);
      } else {
        showToast(`Passed ${current.name}`, "pass", 900);
      }

      try {
        const result = await submitSwipe(current.id, direction);

        // Remove profile from feed immediately
        setProfiles((prev) => prev.filter((p) => p.id !== current.id));

        // If a mutual match was created, update matches and show celebration modal
        if (result.matched && result.match) {
          await loadMatches();
          setNewMatch(result.match);
        }
      } catch (err) {
        showToast(err.message || "Swipe failed. Please try again.", "error", 2500);
      } finally {
        setBusy(false);
      }
    },
    [busy, profiles, loadMatches, showToast]
  );

  // Reset Demo State
  const handleResetDemo = useCallback(async () => {
    try {
      setResetting(true);
      await resetDemoState();
      await Promise.all([loadFeed(), loadMatches()]);
      setNewMatch(null);
      showToast("Demo profiles and state have been reset!", "success", 2000);
    } catch (err) {
      showToast("Failed to reset state: " + err.message, "error", 2500);
    } finally {
      setResetting(false);
    }
  }, [loadFeed, loadMatches, showToast]);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        matchesCount={matches.length}
        onResetDemo={handleResetDemo}
        resetting={resetting}
      />

      {/* Main View Area */}
      <main className="main-viewport">
        {currentTab === "home" && <BlankHome />}

        {currentTab === "discover" && (
          <DiscoverView
            profiles={profiles}
            matchesCount={matches.length}
            onSwipe={handleSwipe}
            onResetFeed={handleResetDemo}
            onNavigateMatches={() => setCurrentTab("matches")}
            busy={busy}
            loading={loading}
          />
        )}

        {currentTab === "matches" && (
          <MatchesView
            matches={matches}
            onNavigateDiscover={() => setCurrentTab("discover")}
            onRefreshMatches={loadMatches}
          />
        )}
      </main>

      {/* Footer / Copyright (Desktop) */}
      <footer className="desktop-footer" aria-label="Site footer">
        <div className="footer-inner">
          <span className="footer-brand">COY DISCOVER</span>
          <span className="footer-tagline">Good connections are mutual.</span>
          <button
            type="button"
            className="footer-matches-link"
            onClick={() => setCurrentTab("matches")}
          >
            Mutual Matches ({matches.length})
          </button>
        </div>
      </footer>

      {/* Celebratory Mutual Match Modal */}
      {newMatch && (
        <MatchModal
          match={newMatch}
          onContinue={() => setNewMatch(null)}
          onViewMatches={() => {
            setNewMatch(null);
            setCurrentTab("matches");
          }}
        />
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        matchesCount={matches.length}
      />
    </div>
  );
}

export default App;
