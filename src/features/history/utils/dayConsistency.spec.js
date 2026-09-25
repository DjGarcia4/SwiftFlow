import { describe, it, expect } from "vitest";
import { computeDayConsistency } from "./dayConsistency";
import { METRICS_VERSION } from "./historyStats";

let id = 0;
// A session `daysAgo` days back at noon, newest first once sorted
const session = (daysAgo, wpm, fields = {}) => ({
  id: `s${id++}`,
  date: new Date(2026, 8, 25 - daysAgo, 12).toISOString(),
  metricsVersion: METRICS_VERSION,
  mode: "time",
  modeValue: 30,
  wpm,
  accuracy: 95,
  ...fields,
});
const byDays = (wpms) => wpms.map((wpm, daysAgo) => session(daysAgo, wpm));

describe("computeDayConsistency", () => {
  it("waits for five days of play", () => {
    expect(computeDayConsistency(byDays([50, 50, 50, 50]))).toBeNull();
    expect(computeDayConsistency(byDays([50, 50, 50, 50, 50]))).not.toBeNull();
  });

  it("scores the same speed every day as fully steady", () => {
    const steady = computeDayConsistency(byDays([60, 60, 60, 60, 60]));
    expect(steady.score).toBe(100);
    expect(steady.level).toBe("Muy parejo");
    expect(steady.label).toBe("30s");
  });

  it("scores swings from day to day lower", () => {
    const swinging = computeDayConsistency(byDays([40, 70, 45, 75, 40, 70]));
    expect(swinging.score).toBeLessThan(80);
    expect(swinging.level).toBe("Irregular");
    expect(swinging.min).toBe(40);
    expect(swinging.max).toBe(75);
  });

  it("averages each day first, and lists days oldest first", () => {
    const results = [
      session(0, 50),
      session(0, 70),
      ...byDays([0, 60, 60, 60, 60]).slice(1),
    ];
    const { days } = computeDayConsistency(results);
    expect(days).toHaveLength(5);
    expect(days.at(-1)).toMatchObject({ wpm: 60, sessions: 2 });
  });

  it("only compares the kind of session played most", () => {
    const results = [
      ...byDays([60, 60, 60, 60, 60]),
      ...[0, 1, 2].map((d) => session(d, 20, { mode: "code", modeValue: "Python" })),
    ];
    expect(computeDayConsistency(results).score).toBe(100);
  });

  it("looks at the latest fourteen days of play only", () => {
    const results = byDays([...Array(14).fill(60), ...Array(10).fill(10)]);
    expect(computeDayConsistency(results).days).toHaveLength(14);
    expect(computeDayConsistency(results).score).toBe(100);
  });
});
