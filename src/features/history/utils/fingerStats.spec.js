import { describe, it, expect } from "vitest";
import { computeFingerStats, computeFingerTrends, hasTamedFinger } from "./fingerStats";
import { INSIGHTS_VERSION } from "./historyStats";

// A session where every letter was tried `attempts` times, missing the
// ones in `missed` as often as `misses` says
const session = ({ attempts = 20, missed = {}, timing = {} } = {}) => {
  const letters = [..."qwertyuiopasdfghjklñzxcvbnm"];
  return {
    insightsVersion: INSIGHTS_VERSION,
    keyAttempts: Object.fromEntries(letters.map((key) => [key, attempts])),
    missedKeys: { ...missed },
    keyTiming: Object.fromEntries(
      letters.map((key) => [key, [(timing[key] ?? 150) * attempts, attempts]])
    ),
  };
};

describe("computeFingerStats", () => {
  it("folds the keys onto the fingers that type them", () => {
    const { fingers } = computeFingerStats(
      [session({ missed: { q: 4, a: 2 } })],
      "latam"
    );
    const pinky = fingers.find((f) => f.finger === "left-pinky");
    // Q, A and Z: 60 tries, 6 misses
    expect(pinky.attempts).toBe(60);
    expect(pinky.rate).toBeCloseTo(0.1);
    expect(pinky.keys).toEqual(["A", "Q", "Z"]);
    expect(pinky.meanMs).toBe(150);
  });

  it("names the finger that misses most, and the one that lags", () => {
    const results = [
      session({
        missed: { w: 6, s: 6, x: 6, e: 1, r: 1, u: 1, o: 1 },
        timing: { i: 260, k: 260 },
      }),
    ];
    const { weakest, slowest } = computeFingerStats(results, "latam");
    expect(weakest.finger).toBe("left-ring");
    expect(slowest.finger).toBe("right-middle");
    expect(slowest.meanMs).toBe(260);
  });

  it("still names the one bad finger of an otherwise clean typist", () => {
    const { weakest } = computeFingerStats(
      [session({ missed: { q: 5, a: 4 } })],
      "latam"
    );
    expect(weakest.finger).toBe("left-pinky");
  });

  it("says nothing when the fingers are even", () => {
    const { weakest, slowest, hasData } = computeFingerStats([session()], "latam");
    expect(hasData).toBe(true);
    expect(weakest).toBeNull();
    expect(slowest).toBeNull();
  });
});

describe("computeFingerTrends", () => {
  it("compares the latest sessions with the ones before", () => {
    const before = Array.from({ length: 10 }, () =>
      session({ missed: { q: 6, a: 6, z: 6 } })
    );
    const after = Array.from({ length: 10 }, () =>
      session({ missed: { q: 2, a: 2, z: 2 } })
    );
    // Most recent first
    const trends = computeFingerTrends([...after, ...before], "latam");
    expect(trends["left-pinky"].before).toBeCloseTo(0.3);
    expect(trends["left-pinky"].after).toBeCloseTo(0.1);
    expect(trends["left-index"]).toBeUndefined();
    expect(hasTamedFinger([...after, ...before], "latam")).toBe(true);
    expect(hasTamedFinger([...before, ...after], "latam")).toBe(false);
  });

  it("waits for enough sessions", () => {
    expect(computeFingerTrends([session(), session()], "latam")).toBeNull();
  });
});
