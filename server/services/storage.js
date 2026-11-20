import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");
const profilesPath = path.join(dataDir, "profiles.json");
const statePath = path.join(dataDir, "state.json");

// Default initial state
const DEFAULT_INCOMING_LIKES = ["p01", "p04", "p07", "p11", "p16", "p22"];

// Mutex promise chain to prevent race conditions during concurrent state writes
let stateLock = Promise.resolve();

function withStateLock(operation) {
  const result = stateLock.then(() => operation());
  stateLock = result.catch(() => {});
  return result;
}

/**
 * Load all seeded profiles from profiles.json directly from disk
 * (Always fresh so changes to profiles.json are immediately reflected)
 */
export async function loadProfiles() {
  try {
    const raw = await fs.readFile(profilesPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read profiles.json:", error);
    throw new Error("Unable to load profile dataset.");
  }
}

/**
 * Create initial clean state
 */
function createDefaultState() {
  return {
    swipes: {},
    // Private server-side incoming likes. NEVER exposed to client.
    incomingLikes: [...DEFAULT_INCOMING_LIKES],
    matches: []
  };
}

/**
 * Read current state or initialize if missing or corrupted
 */
export async function getState() {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.swipes || !Array.isArray(parsed.matches)) {
      throw new Error("Invalid state structure");
    }
    return parsed;
  } catch {
    const defaultState = createDefaultState();
    await saveState(defaultState);
    return defaultState;
  }
}

/**
 * Persist state to disk safely
 */
export async function saveState(state) {
  await fs.mkdir(dataDir, { recursive: true });
  // Direct formatted write
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

/**
 * Reset state to fresh demo values
 */
export async function resetState() {
  return withStateLock(async () => {
    const freshState = createDefaultState();
    await saveState(freshState);
    return freshState;
  });
}

/**
 * Fetch profiles that the user hasn't swiped on yet
 * Strictly projects only public fields, never exposing incomingLikes
 */
export async function getFeed() {
  const [profiles, state] = await Promise.all([loadProfiles(), getState()]);
  const seenSet = new Set(Object.keys(state.swipes || {}));

  return profiles
    .filter((profile) => !seenSet.has(profile.id))
    .map(({ id, name, age, photo, bio, city, interests }) => ({
      id,
      name,
      age,
      photo,
      bio,
      city,
      interests
    }));
}

/**
 * Process a swipe action (like or pass) with full validation and concurrency safety
 */
export async function processSwipe(profileId, direction) {
  return withStateLock(async () => {
    // 1. Validate inputs
    if (!profileId || typeof profileId !== "string" || !profileId.trim()) {
      const error = new Error("profileId is required and must be a non-empty string.");
      error.status = 400;
      throw error;
    }

    const cleanDirection = typeof direction === "string" ? direction.trim().toLowerCase() : "";
    if (cleanDirection !== "like" && cleanDirection !== "pass") {
      const error = new Error("direction must be either 'like' or 'pass'.");
      error.status = 400;
      throw error;
    }

    // 2. Load profiles and state
    const [profiles, state] = await Promise.all([loadProfiles(), getState()]);

    const targetProfile = profiles.find((item) => item.id === profileId);
    if (!targetProfile) {
      const error = new Error(`Profile with ID '${profileId}' not found.`);
      error.status = 404;
      throw error;
    }

    // 3. Prevent duplicate swipes
    if (state.swipes[profileId]) {
      const error = new Error(`Profile '${profileId}' has already been swiped on.`);
      error.status = 409;
      throw error;
    }

    // 4. Record swipe
    state.swipes[profileId] = cleanDirection;

    // 5. Check for mutual match
    let match = null;
    const isIncomingLike = Array.isArray(state.incomingLikes) && state.incomingLikes.includes(profileId);

    if (cleanDirection === "like" && isIncomingLike) {
      match = {
        id: targetProfile.id,
        name: targetProfile.name,
        age: targetProfile.age,
        photo: targetProfile.photo,
        city: targetProfile.city,
        bio: targetProfile.bio,
        interests: targetProfile.interests,
        matchedAt: new Date().toISOString()
      };

      if (!state.matches.some((m) => m.id === profileId)) {
        state.matches.unshift(match);
      }
    }

    // 6. Persist updated state
    await saveState(state);

    return {
      ok: true,
      matched: Boolean(match),
      match
    };
  });
}

/**
 * Get all mutual matches
 */
export async function getMatches() {
  const state = await getState();
  return state.matches || [];
}
