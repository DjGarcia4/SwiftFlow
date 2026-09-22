import { describe, it, expect } from "vitest";
import { computeDrillReadiness, MIN_DAY_ATTEMPTS } from "./drillReadiness";

// A drill round on `keys`, trying each `tries` times and missing it
// `misses[key]` of those
const round = (keys, misses, tries = 25) => ({
  mode: "drill",
  drillKeys: keys,
  keyAttempts: Object.fromEntries(keys.map((k) => [k, tries])),
  missedKeys: Object.fromEntries(keys.map((k) => [k, misses[k] ?? 0])),
});

describe("computeDrillReadiness", () => {
  it("has nothing to say before the first round", () => {
    expect(
      computeDrillReadiness({ keys: ["ñ"], sessions: [], baselineRates: { ñ: 0.2 } })
    ).toMatchObject({ verdict: "new", rounds: 0 });
  });

  it("asks for another round while a letter is above its target", () => {
    const result = computeDrillReadiness({
      keys: ["ñ", "q"],
      sessions: [round(["ñ", "q"], { ñ: 5, q: 1 })],
      baselineRates: { ñ: 0.25, q: 0.1 },
    });
    expect(result.verdict).toBe("keep");
    // 60% of where each started, but never under 5%
    expect(result.letters.map((l) => [l.key, l.target])).toEqual([
      ["ñ", 0.15],
      ["q", 0.06],
    ]);
    expect(result.pending).toEqual(["ñ", "q"]);
  });

  it("is done for the day once every letter is under target with enough tries", () => {
    const result = computeDrillReadiness({
      keys: ["ñ"],
      sessions: [round(["ñ"], { ñ: 5 }), round(["ñ"], { ñ: 1 })],
      baselineRates: { ñ: 0.25 },
    });
    expect(result.verdict).toBe("ready");
    expect(result.letters[0]).toMatchObject({ latest: 0.04, attempts: 50, ready: true });
  });

  it("doesn't let one lucky short round end it", () => {
    const tries = MIN_DAY_ATTEMPTS - 10;
    const result = computeDrillReadiness({
      keys: ["ñ"],
      sessions: [round(["ñ"], { ñ: 0 }, tries)],
      baselineRates: { ñ: 0.25 },
    });
    expect(result.verdict).toBe("keep");
  });

  it("uses the first round as the start when there's no history", () => {
    const result = computeDrillReadiness({
      keys: ["ñ"],
      sessions: [round(["ñ"], { ñ: 5 })],
    });
    expect(result.letters[0]).toMatchObject({ start: 0.2, target: 0.12 });
  });

  it("says to rest after several rounds without getting better", () => {
    const sessions = [3, 4, 3, 4, 4].map((n) => round(["ñ"], { ñ: n }));
    expect(
      computeDrillReadiness({ keys: ["ñ"], sessions, baselineRates: { ñ: 0.25 } })
    ).toMatchObject({ verdict: "rest", restReason: "stalled" });
  });

  it("says to rest after a lot of rounds even while still improving", () => {
    const sessions = [12, 11, 10, 10, 9, 9, 8, 8].map((n) => round(["ñ"], { ñ: n }));
    expect(
      computeDrillReadiness({ keys: ["ñ"], sessions, baselineRates: { ñ: 0.5 } })
    ).toMatchObject({ verdict: "rest", restReason: "enough" });
  });

  it("keeps going while the rounds are still improving", () => {
    // Still above the 24% target, but 28% beats everything before it
    const sessions = [10, 9, 9, 8, 7].map((n) => round(["ñ"], { ñ: n }));
    expect(
      computeDrillReadiness({ keys: ["ñ"], sessions, baselineRates: { ñ: 0.4 } }).verdict
    ).toBe("keep");
  });

  it("ignores rounds on other letters and other modes", () => {
    const result = computeDrillReadiness({
      keys: ["ñ"],
      sessions: [round(["q"], { q: 0 }), { ...round(["ñ"], { ñ: 0 }), mode: "words" }],
    });
    expect(result.rounds).toBe(0);
  });
});
