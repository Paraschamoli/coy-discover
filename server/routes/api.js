import { Router } from "express";
import { getFeed, processSwipe, getMatches, resetState } from "../services/storage.js";

export const apiRouter = Router();

// Disable caching on all API routes so the client always receives fresh state and updated profiles
apiRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/**
 * GET /feed
 * Returns unswiped profiles with public fields only.
 * Deliberately excludes incomingLikes or private data.
 */
apiRouter.get("/feed", async (_req, res, next) => {
  try {
    const feed = await getFeed();
    res.json(feed);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /swipe
 * Body: { profileId: string, direction: "like" | "pass" }
 * Records swipe decision, checks for mutual match, and returns match info if created.
 */
apiRouter.post("/swipe", async (req, res, next) => {
  try {
    const { profileId, direction } = req.body ?? {};
    const result = await processSwipe(profileId, direction);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /matches
 * Returns list of confirmed mutual matches.
 */
apiRouter.get("/matches", async (_req, res, next) => {
  try {
    const matches = await getMatches();
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /reset
 * Resets state.json back to default seeded state.
 * Helpful for reviewing, re-running demos, and automated testing.
 */
apiRouter.post("/reset", async (_req, res, next) => {
  try {
    await resetState();
    res.json({ ok: true, message: "State successfully reset to initial demo data." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /health
 * Simple healthcheck probe.
 */
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});
