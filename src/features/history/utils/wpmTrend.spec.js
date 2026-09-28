import { describe, it, expect } from "vitest";
import { movingAverage, summarizeTrend, bestIndex } from "./wpmTrend";

describe("movingAverage", () => {
  it("averages each run with the ones just before it", () => {
    expect(movingAverage([10, 20, 30, 40], 2)).toEqual([10, 15, 25, 35]);
    expect(movingAverage([], 5)).toEqual([]);
  });
});

describe("summarizeTrend", () => {
  it("needs a couple of runs on each side", () => {
    expect(summarizeTrend([40, 50, 60])).toBeNull();
  });

  it("compares the latest runs with the ones before", () => {
    expect(summarizeTrend([40, 40, 50, 50])).toEqual({
      recent: 50,
      before: 40,
      change: 10,
      count: 2,
      direction: "up",
    });
    expect(summarizeTrend([50, 50, 40, 40]).direction).toBe("down");
    expect(summarizeTrend([50, 50, 51, 50]).direction).toBe("steady");
  });

  it("takes at most ten runs each side", () => {
    const values = [...Array(30).fill(20), ...Array(10).fill(30), ...Array(10).fill(40)];
    const summary = summarizeTrend(values);
    expect(summary.count).toBe(10);
    expect(summary.before).toBe(30);
    expect(summary.recent).toBe(40);
  });
});

describe("bestIndex", () => {
  it("finds the fastest run, the latest when tied", () => {
    expect(bestIndex([30, 50, 40, 50])).toBe(3);
    expect(bestIndex([])).toBe(-1);
  });
});
