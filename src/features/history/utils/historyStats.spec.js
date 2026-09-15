import { describe, it, expect } from "vitest";
import {
  computeBestWpm,
  computeAverageWpm,
  computeAverageAccuracy,
  formatModeLabel,
  computePersonalBests,
  computeDailyStreak,
  computeLongestDailyStreak,
} from "./historyStats";

const results = [
  { wpm: 60, accuracy: 95 },
  { wpm: 40, accuracy: 85 },
  { wpm: 80, accuracy: 100 },
];

describe("computeBestWpm", () => {
  it("is 0 for an empty list", () => {
    expect(computeBestWpm([])).toBe(0);
  });

  it("returns the highest wpm in the list", () => {
    expect(computeBestWpm(results)).toBe(80);
  });
});

describe("computeAverageWpm", () => {
  it("is 0 for an empty list", () => {
    expect(computeAverageWpm([])).toBe(0);
  });

  it("averages and rounds the wpm values", () => {
    expect(computeAverageWpm(results)).toBe(60);
  });
});

describe("computeAverageAccuracy", () => {
  it("is 0 for an empty list", () => {
    expect(computeAverageAccuracy([])).toBe(0);
  });

  it("averages and rounds the accuracy values", () => {
    expect(computeAverageAccuracy(results)).toBe(93);
  });
});

describe("formatModeLabel", () => {
  it("formats time mode with seconds", () => {
    expect(formatModeLabel({ mode: "time", modeValue: 15 })).toBe("15s");
  });

  it("formats words mode with the word count", () => {
    expect(formatModeLabel({ mode: "words", modeValue: 50 })).toBe("50 palabras");
  });

  it("formats code mode with a language", () => {
    expect(formatModeLabel({ mode: "code", modeValue: "JavaScript" })).toBe(
      "Código · JavaScript"
    );
  });

  it("formats code mode without a language", () => {
    expect(formatModeLabel({ mode: "code", modeValue: null })).toBe("Código");
  });

  it("formats quote mode", () => {
    expect(formatModeLabel({ mode: "quote", modeValue: null })).toBe("Cita");
  });

  it("formats zen mode", () => {
    expect(formatModeLabel({ mode: "zen", modeValue: null })).toBe("Zen");
  });
});

describe("computePersonalBests", () => {
  it("is empty for an empty list", () => {
    expect(computePersonalBests([])).toEqual([]);
  });

  it("keeps only the best result per mode+modeValue combo", () => {
    const bests = computePersonalBests([
      { mode: "time", modeValue: 15, wpm: 40 },
      { mode: "time", modeValue: 15, wpm: 70 },
      { mode: "time", modeValue: 15, wpm: 55 },
    ]);

    expect(bests).toHaveLength(1);
    expect(bests[0].wpm).toBe(70);
  });

  it("tracks separate records for different mode/modeValue combos", () => {
    const bests = computePersonalBests([
      { mode: "time", modeValue: 15, wpm: 40 },
      { mode: "time", modeValue: 30, wpm: 60 },
      { mode: "code", modeValue: "JavaScript", wpm: 50 },
      { mode: "code", modeValue: "Python", wpm: 45 },
    ]);

    expect(bests).toHaveLength(4);
  });

  it("sorts records by wpm, highest first", () => {
    const bests = computePersonalBests([
      { mode: "time", modeValue: 15, wpm: 40 },
      { mode: "words", modeValue: 50, wpm: 90 },
      { mode: "zen", modeValue: null, wpm: 60 },
    ]);

    expect(bests.map((b) => b.wpm)).toEqual([90, 60, 40]);
  });

  it("treats a null modeValue as its own group (e.g. quote/zen)", () => {
    const bests = computePersonalBests([
      { mode: "quote", modeValue: null, wpm: 40 },
      { mode: "zen", modeValue: null, wpm: 50 },
    ]);

    expect(bests).toHaveLength(2);
  });
});

describe("computeDailyStreak", () => {
  // Fixed "now" so day-boundary math isn't flaky around midnight.
  const now = new Date(2024, 5, 15, 14, 0, 0); // Sat 2024-06-15, 14:00 local
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(9, 0, 0, 0); // some time during that day
    return d.toISOString();
  };

  it("is 0 for an empty list", () => {
    expect(computeDailyStreak([], now)).toBe(0);
  });

  it("is 0 when the last session was more than a day ago", () => {
    const results = [{ date: daysAgo(2) }];
    expect(computeDailyStreak(results, now)).toBe(0);
  });

  it("is 1 with only a session today", () => {
    const results = [{ date: daysAgo(0) }];
    expect(computeDailyStreak(results, now)).toBe(1);
  });

  it("stays alive (not reset) if yesterday has a session but today doesn't yet", () => {
    const results = [{ date: daysAgo(1) }, { date: daysAgo(2) }];
    expect(computeDailyStreak(results, now)).toBe(2);
  });

  it("counts consecutive days ending today", () => {
    const results = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(2) }];
    expect(computeDailyStreak(results, now)).toBe(3);
  });

  it("stops counting at the first gap", () => {
    const results = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(3) }];
    expect(computeDailyStreak(results, now)).toBe(2);
  });

  it("counts multiple sessions on the same day as a single day", () => {
    const results = [{ date: daysAgo(0) }, { date: daysAgo(0) }, { date: daysAgo(0) }];
    expect(computeDailyStreak(results, now)).toBe(1);
  });
});

describe("computeLongestDailyStreak", () => {
  const base = new Date(2024, 5, 15, 14, 0, 0);
  const dateOffset = (n) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  it("is 0 for an empty list", () => {
    expect(computeLongestDailyStreak([])).toBe(0);
  });

  it("is 1 for a single day", () => {
    expect(computeLongestDailyStreak([{ date: dateOffset(0) }])).toBe(1);
  });

  it("counts a consecutive run", () => {
    const results = [0, 1, 2, 3].map((n) => ({ date: dateOffset(n) }));
    expect(computeLongestDailyStreak(results)).toBe(4);
  });

  it("returns the longest run even if a later, shorter run is more recent", () => {
    // A 5-day streak long ago, then a gap, then only 2 days recently — the
    // achievement should still reflect the 5-day best, not the current 2.
    const results = [
      ...[0, 1, 2, 3, 4].map((n) => ({ date: dateOffset(n) })),
      ...[20, 21].map((n) => ({ date: dateOffset(n) })),
    ];
    expect(computeLongestDailyStreak(results)).toBe(5);
  });

  it("ignores duplicate sessions on the same day", () => {
    const results = [
      { date: dateOffset(0) },
      { date: dateOffset(0) },
      { date: dateOffset(1) },
    ];
    expect(computeLongestDailyStreak(results)).toBe(2);
  });
});
