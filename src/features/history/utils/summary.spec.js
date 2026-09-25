import { describe, it, expect } from "vitest";
import {
  computeSummary,
  availablePeriods,
  periodLabel,
  periodId,
  parsePeriodId,
  previousPeriod,
} from "./summary";
import { METRICS_VERSION } from "./historyStats";

let id = 0;
const session = (y, m, d, fields = {}) => ({
  id: `s${id++}`,
  date: new Date(y, m, d, 12).toISOString(),
  metricsVersion: METRICS_VERSION,
  mode: "time",
  modeValue: 30,
  wpm: 50,
  accuracy: 95,
  errors: 1,
  timeElapsed: 60,
  ...fields,
});

const SEPT = { kind: "month", year: 2026, month: 8 };
const NOW = new Date(2026, 8, 30, 20);

describe("periods", () => {
  it("names, ids and steps back", () => {
    expect(periodLabel(SEPT)).toBe("septiembre de 2026");
    expect(periodLabel({ kind: "year", year: 2026 })).toBe("2026");
    expect(periodId(SEPT)).toBe("2026-09");
    expect(parsePeriodId("2026-09")).toEqual(SEPT);
    expect(parsePeriodId("2026")).toEqual({ kind: "year", year: 2026 });
    expect(parsePeriodId("2026-13")).toBeNull();
    expect(parsePeriodId("nope")).toBeNull();
    expect(previousPeriod({ kind: "month", year: 2026, month: 0 })).toEqual({
      kind: "month",
      year: 2025,
      month: 11,
    });
  });

  it("lists the months and years with sessions, newest first", () => {
    const periods = availablePeriods([
      session(2026, 8, 3),
      session(2026, 6, 3),
      session(2025, 11, 3),
    ]);
    expect(periods.months.map(periodId)).toEqual(["2026-09", "2026-07", "2025-12"]);
    expect(periods.years.map(periodId)).toEqual(["2026", "2025"]);
  });
});

describe("computeSummary", () => {
  it("is nothing for a period without sessions", () => {
    expect(computeSummary([session(2026, 7, 3)], SEPT, NOW)).toBeNull();
  });

  it("adds up the month, and compares it with the one before", () => {
    const results = [
      session(2026, 8, 1, { wpm: 60 }),
      session(2026, 8, 2, { wpm: 70, mode: "words", modeValue: 25 }),
      session(2026, 8, 2, { wpm: 62 }),
      session(2026, 8, 3, { wpm: 64 }),
      session(2026, 8, 10, { wpm: 58 }),
      session(2026, 7, 15, { wpm: 50 }),
      session(2026, 7, 16, { wpm: 52 }),
    ];
    const summary = computeSummary(results, SEPT, NOW);
    expect(summary.label).toBe("septiembre de 2026");
    expect(summary.sessions).toBe(5);
    expect(summary.minutes).toBe(5);
    expect(summary.daysPracticed).toBe(4);
    expect(summary.longestStreak).toBe(3);
    expect(summary.busiestDay.sessions).toBe(2);
    expect(summary.best).toEqual({ wpm: 70, label: "25 palabras", record: true });
    expect(summary.averageWpm).toBe(63);
    expect(summary.wpmChange).toBe(24);
    expect(summary.favoriteMode).toEqual({ name: "Tiempo", sessions: 4 });
  });

  it("names the key that improved the most since the month before", () => {
    const keys = (misses) => ({
      keyAttempts: { ñ: 50, e: 50 },
      missedKeys: { ñ: misses, e: 2 },
    });
    const results = [session(2026, 8, 5, keys(1)), session(2026, 7, 5, keys(8))];
    const { tamedKey } = computeSummary(results, SEPT, NOW);
    expect(tamedKey.key).toBe("ñ");
    expect(tamedKey.before).toBeCloseTo(0.16);
    expect(tamedKey.after).toBeCloseTo(0.02);
  });

  it("lists what was unlocked during the period, not before it", () => {
    const summary = computeSummary([session(2026, 8, 5), session(2026, 7, 5)], SEPT, NOW);
    const ids = summary.achievements.map((a) => a.id);
    expect(ids).not.toContain("first_session");
  });

  it("counts a year's days out of the days it has had so far", () => {
    const summary = computeSummary(
      [session(2026, 1, 1)],
      { kind: "year", year: 2026 },
      NOW
    );
    expect(summary.daysPracticed).toBe(1);
    expect(summary.daysSoFar).toBeGreaterThan(260);
    expect(summary.daysSoFar).toBeLessThanOrEqual(273);
  });
});
