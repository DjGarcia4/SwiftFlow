import { describe, it, expect } from "vitest";
import { computeKeyTrends, hasTamedKey } from "./keyTrends";

// A session where each key was typed `attempts` times and missed `misses`
const session = (keys) => ({
  mode: "time",
  keyAttempts: Object.fromEntries(Object.entries(keys).map(([k, [a]]) => [k, a])),
  missedKeys: Object.fromEntries(Object.entries(keys).map(([k, [, m]]) => [k, m])),
});
const sessions = (count, keys) => Array.from({ length: count }, () => session(keys));

describe("computeKeyTrends", () => {
  it("waits for ten sessions on each side", () => {
    expect(computeKeyTrends(sessions(19, { a: [10, 1] }))).toBeNull();
    expect(computeKeyTrends(sessions(20, { a: [10, 1] }))).not.toBeNull();
  });

  it("finds the keys that got better and worse, newest sessions first", () => {
    const recent = sessions(10, { ñ: [10, 0], q: [10, 2], e: [50, 1] });
    const earlier = sessions(10, { ñ: [10, 1], q: [10, 1], e: [50, 1] });
    const trends = computeKeyTrends([...recent, ...earlier]);
    expect(trends.sessions).toBe(10);
    expect(trends.improved).toEqual([{ key: "ñ", before: 0.1, after: 0, change: -0.1 }]);
    expect(trends.worsened.map((t) => t.key)).toEqual(["q"]);
    // The e didn't move
    expect(trends.all.map((t) => t.key)).not.toContain("e");
  });

  it("ignores keys typed too little to tell", () => {
    const recent = sessions(10, { x: [2, 0] });
    const earlier = sessions(10, { x: [2, 1] });
    expect(computeKeyTrends([...recent, ...earlier]).all).toEqual([]);
  });

  it("ignores moves too small to be more than noise", () => {
    // 5% to 4%: a fifth less, but one point
    const recent = sessions(10, { a: [100, 4] });
    const earlier = sessions(10, { a: [100, 5] });
    expect(computeKeyTrends([...recent, ...earlier]).all).toEqual([]);
  });

  it("compares at most thirty sessions a side", () => {
    const recent = sessions(30, { a: [10, 0] });
    const earlier = sessions(30, { a: [10, 1] });
    const oldest = sessions(40, { a: [10, 5] });
    const trends = computeKeyTrends([...recent, ...earlier, ...oldest]);
    expect(trends.sessions).toBe(30);
    expect(trends.improved[0].before).toBeCloseTo(0.1);
  });
});

describe("hasTamedKey", () => {
  it("is a key whose misses halved", () => {
    const halved = [...sessions(10, { r: [20, 1] }), ...sessions(10, { r: [20, 2] })];
    expect(hasTamedKey(halved)).toBe(true);
    const notQuite = [
      ...sessions(10, { r: [100, 7] }),
      ...sessions(10, { r: [100, 10] }),
    ];
    expect(hasTamedKey(notQuite)).toBe(false);
  });
});
