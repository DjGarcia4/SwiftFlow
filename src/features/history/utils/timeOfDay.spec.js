import { describe, it, expect } from "vitest";
import { computeTimeOfDay } from "./timeOfDay";
import { METRICS_VERSION } from "./historyStats";

let id = 0;
const session = (hour, wpm, mode = "time") => ({
  id: String(id++),
  date: new Date(2026, 8, 1 + (id % 20), hour, 30).toISOString(),
  metricsVersion: METRICS_VERSION,
  mode,
  wpm,
});

const many = (count, hour, wpm, mode) =>
  Array.from({ length: count }, () => session(hour, wpm, mode));

describe("computeTimeOfDay", () => {
  it("needs a few sessions in at least two parts of the day", () => {
    const result = computeTimeOfDay([...many(8, 9, 60), ...many(3, 21, 40)]);
    expect(result.enoughData).toBe(false);
  });

  it("finds the part of the day you type fastest in", () => {
    const result = computeTimeOfDay([...many(5, 9, 66), ...many(5, 21, 54)]);
    expect(result.enoughData).toBe(true);
    expect(result.best.id).toBe("morning");
    expect(result.best.relative).toBeCloseTo(1.1);
    expect(result.worst.id).toBe("night");
  });

  it("compares each session with your average in its own mode", () => {
    // Words in the morning, code at night: both at exactly your usual pace
    // in their mode, so neither part of the day is better
    const result = computeTimeOfDay([
      ...many(5, 9, 70, "words"),
      ...many(5, 21, 35, "code"),
    ]);
    expect(result.enoughData).toBe(true);
    expect(result.best).toBeNull();
    expect(result.worst).toBeNull();
  });

  it("keeps quiet about a gap too small to matter", () => {
    const result = computeTimeOfDay([...many(5, 9, 61), ...many(5, 21, 59)]);
    expect(result.best).toBeNull();
  });

  it("ignores sessions measured with the old formula", () => {
    const old = { ...session(9, 200), metricsVersion: 1 };
    const result = computeTimeOfDay([old, ...many(5, 9, 60), ...many(5, 21, 60)]);
    expect(result.parts.find((p) => p.id === "morning").sessions).toBe(5);
  });
});
