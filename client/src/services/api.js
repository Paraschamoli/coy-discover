/**
 * Coy Discover API Service
 * Encapsulates backend communication with fallback and timeout resilience.
 */

// If VITE_API_URL is explicitly set (e.g. in production), prioritize it.
// In dev with Vite proxy or production served by Express, relative paths ("") work natively.
const CONFIGURED_API = import.meta.env.VITE_API_URL;

// Known potential local API hosts to probe if relative fetch fails in isolated standalone dev
const LOCAL_FALLBACKS = [
  "",
  "http://localhost:4000",
  "http://localhost:4001",
  "http://127.0.0.1:4000",
  "http://127.0.0.1:4001"
];

let activeBaseUrl = CONFIGURED_API ?? null;

/**
 * Resolves the operational API base URL
 */
async function getBaseUrl() {
  if (activeBaseUrl !== null) return activeBaseUrl;

  for (const candidate of LOCAL_FALLBACKS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${candidate}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        activeBaseUrl = candidate;
        return activeBaseUrl;
      }
    } catch {
      // Continue searching
    }
  }

  // Default to relative if no probe succeeded
  activeBaseUrl = "";
  return activeBaseUrl;
}

/**
 * Generic JSON fetch wrapper with error extraction
 */
async function request(endpoint, options = {}) {
  const base = await getBaseUrl();
  const url = `${base}${endpoint}`;

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers
    }
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch unswiped profiles for the feed
 */
export async function getFeed() {
  return request("/feed");
}

/**
 * Submit a swipe decision (like or pass)
 */
export async function submitSwipe(profileId, direction) {
  return request("/swipe", {
    method: "POST",
    body: JSON.stringify({ profileId, direction })
  });
}

/**
 * Fetch mutual matches
 */
export async function getMatches() {
  return request("/matches");
}

/**
 * Reset demo state back to default seeded values
 */
export async function resetDemoState() {
  return request("/reset", {
    method: "POST"
  });
}
