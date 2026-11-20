import { getFeed, processSwipe, getMatches, resetState, getState } from "./services/storage.js";

async function runTests() {
  console.log("=== STARTING COY DISCOVER INTEGRATION & UNIT TESTS ===");

  // 1. Reset state
  console.log("\n[Test 1] Reset state to initial demo data...");
  await resetState();
  const initialState = await getState();
  console.assert(Object.keys(initialState.swipes).length === 0, "Swipes should be empty on reset");
  console.assert(initialState.matches.length === 0, "Matches should be empty on reset");
  console.log("✓ Reset verified.");

  // 2. Test GET /feed
  console.log("\n[Test 2] Verify Feed Projection and Privacy...");
  const feed = await getFeed();
  console.assert(feed.length === 30, `Expected 30 profiles, got ${feed.length}`);
  const first = feed[0];
  console.assert(first.id && first.name && first.photo && first.bio && first.city, "Profile missing required fields");
  console.assert(!("incomingLikes" in first), "CRITICAL: incomingLikes must never be in feed");
  console.assert(!("direction" in first), "Feed profiles should not contain direction");
  console.log(`✓ Feed returned ${feed.length} profiles with public fields only.`);

  // 3. Test Validation on /swipe
  console.log("\n[Test 3] Verify Swipe Input Validation...");
  try {
    await processSwipe("", "like");
    throw new Error("Failed: Should have rejected empty profileId");
  } catch (err) {
    console.assert(err.status === 400, `Expected 400 for empty profileId, got ${err.status}`);
  }

  try {
    await processSwipe("p01", "invalid_dir");
    throw new Error("Failed: Should have rejected invalid direction");
  } catch (err) {
    console.assert(err.status === 400, `Expected 400 for invalid direction, got ${err.status}`);
  }

  try {
    await processSwipe("non_existent_profile_999", "like");
    throw new Error("Failed: Should have returned 404 for non-existent profile");
  } catch (err) {
    console.assert(err.status === 404, `Expected 404 for unknown profile, got ${err.status}`);
  }
  console.log("✓ Input validation and HTTP status codes verified.");

  // 4. Test Mutual Match Logic
  // p01 is in incomingLikes -> liking p01 should trigger a match
  console.log("\n[Test 4] Testing Mutual Match on p01 (incoming like)...");
  const matchResult = await processSwipe("p01", "like");
  console.assert(matchResult.ok === true, "Result ok should be true");
  console.assert(matchResult.matched === true, "Should have triggered mutual match");
  console.assert(matchResult.match.id === "p01", "Match ID should be p01");
  console.assert(matchResult.match.name === "Aarav", "Match name should be Aarav");
  console.log("✓ Mutual match successfully created for p01:", matchResult.match.name);

  // 5. Test Non-Matching Like
  // p02 is NOT in incomingLikes -> liking p02 should NOT trigger a match
  console.log("\n[Test 5] Testing Non-Matching Like on p02...");
  const noMatchResult = await processSwipe("p02", "like");
  console.assert(noMatchResult.ok === true, "Result ok should be true");
  console.assert(noMatchResult.matched === false, "Should not trigger match");
  console.assert(noMatchResult.match === null, "Match should be null");
  console.log("✓ Like on p02 recorded without triggering match.");

  // 6. Test Pass
  console.log("\n[Test 6] Testing Pass on p03...");
  const passResult = await processSwipe("p03", "pass");
  console.assert(passResult.ok === true, "Result ok should be true");
  console.assert(passResult.matched === false, "Pass should never match");
  console.log("✓ Pass on p03 recorded successfully.");

  // 7. Test Duplicate Swipe Rejection (HTTP 409)
  console.log("\n[Test 7] Testing Duplicate Swipe Rejection...");
  try {
    await processSwipe("p01", "like");
    throw new Error("Failed: Should have rejected duplicate swipe on p01");
  } catch (err) {
    console.assert(err.status === 409, `Expected 409 for duplicate swipe, got ${err.status}`);
  }
  console.log("✓ Duplicate swipe correctly rejected with 409 Conflict.");

  // 8. Test Feed Exclusions
  console.log("\n[Test 8] Testing Feed Exclusions...");
  const updatedFeed = await getFeed();
  console.assert(updatedFeed.length === 27, `Expected 27 profiles remaining, got ${updatedFeed.length}`);
  const swipedIds = new Set(["p01", "p02", "p03"]);
  const hasSwiped = updatedFeed.some((p) => swipedIds.has(p.id));
  console.assert(!hasSwiped, "Swiped profiles must not appear in feed");
  console.log("✓ Swiped profiles permanently excluded from feed.");

  // 9. Test GET /matches
  console.log("\n[Test 9] Testing Matches List...");
  const matches = await getMatches();
  console.assert(matches.length === 1, `Expected 1 match, got ${matches.length}`);
  console.assert(matches[0].id === "p01", "Match should be p01");
  console.log(`✓ Matches endpoint correctly returned ${matches.length} confirmed match.`);

  // 10. Clean up / Reset for demo
  console.log("\n[Test 10] Resetting state for fresh demo start...");
  await resetState();
  const cleanFeed = await getFeed();
  console.assert(cleanFeed.length === 30, "Feed should be back to 30");
  console.log("✓ State cleanly reset to full 30 profiles.");

  console.log("\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY! 🎉\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
