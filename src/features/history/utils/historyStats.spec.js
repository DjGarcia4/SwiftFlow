import { describe, it, expect } from "vitest";
import {
  computeBestWpm,
  computeAverageWpm,
  computeAverageAccuracy,
  formatModeLabel,
  computePersonalBests,
  computeDailyStreak,
  computeLongestDailyStreak,
  computeBestStreak,
  computeTotalTimeElapsed,
  computeTotalKeystrokes,
  computeTotalCorrectedErrors,
  isCurrentMetrics,
  computeKeyErrorStats,
  formatKeyLabel,
  computeConfusionStats,
  computeTranspositionStats,
  INSIGHTS_VERSION,
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

describe("keystroke stats", () => {
  const tracked = [
    {
      maxStreak: 42,
      timeElapsed: 30,
      keystrokes: 100,
      errorKeystrokes: 10,
      keyAttempts: { a: 20, A: 5, " ": 15, q: 2 },
      missedKeys: { a: 3, A: 2, " ": 1, q: 2 },
    },
    {
      maxStreak: 80,
      timeElapsed: 60,
      keystrokes: 100,
      errorKeystrokes: 0,
      keyAttempts: { e: 30 },
      missedKeys: {},
    },
    // Saved before keystroke tracking existed
    { wpm: 50, accuracy: 90, timeElapsed: 15 },
  ];

  it("computeBestStreak returns the longest combo, ignoring old sessions", () => {
    expect(computeBestStreak(tracked)).toBe(80);
    expect(computeBestStreak([])).toBe(0);
  });

  it("sums total time and keystrokes", () => {
    expect(computeTotalTimeElapsed(tracked)).toBe(105);
    expect(computeTotalKeystrokes(tracked)).toBe(200);
  });

  it("computeTotalCorrectedErrors sums mistakes fixed with backspace", () => {
    // first session: 10 wrong keystrokes, none left in the text
    expect(computeTotalCorrectedErrors(tracked)).toBe(10);
    expect(computeTotalCorrectedErrors([{ errorKeystrokes: 3, errors: 5 }])).toBe(0);
  });

  it("isCurrentMetrics only accepts results measured with the current formula", () => {
    expect(isCurrentMetrics({ metricsVersion: 3 })).toBe(true);
    expect(isCurrentMetrics({ metricsVersion: 2 })).toBe(false);
    expect(isCurrentMetrics({ wpm: 50 })).toBe(false);
  });

  it("computeKeyErrorStats merges case and sorts by misses, then rate", () => {
    const stats = computeKeyErrorStats(tracked);

    expect(stats[0]).toEqual({ key: "a", attempts: 25, misses: 5, rate: 0.2 });
    expect(stats.map((s) => s.key)).toEqual(["a", "q", " ", "e"]);
    expect(stats.at(-1)).toEqual({ key: "e", attempts: 30, misses: 0, rate: 0 });
  });

  it("formatKeyLabel names invisible keys", () => {
    expect(formatKeyLabel(" ")).toBe("espacio");
    expect(formatKeyLabel("\n")).toBe("enter");
    expect(formatKeyLabel("ñ")).toBe("ñ");
  });

  it("formatModeLabel knows the numbers mode", () => {
    expect(formatModeLabel({ mode: "numbers", modeValue: 25 })).toBe("25 números");
  });
});

describe("confusion stats", () => {
  // Two sessions of the same habit: reaching for the T when the R was due,
  // plus the "ue"/"eu" swap, which shows up in both tallies.
  const insight = (fields) => ({ insightsVersion: INSIGHTS_VERSION, ...fields });
  const sessions = [
    insight({
      missedKeys: { r: 8, u: 3 },
      confusions: { rt: 5, ue: 3, eu: 3, rf: 1 },
      transpositions: { ue: 3 },
    }),
    insight({
      missedKeys: { R: 4 },
      confusions: { Rt: 3, rd: 1 },
      transpositions: {},
    }),
  ];

  it("merges across sessions and folds case together", () => {
    const [top] = computeConfusionStats(sessions);

    expect(top.pair).toBe("rt");
    expect(top.total).toBe(8);
    expect(top.expected).toBe("r");
    expect(top.typed).toBe("t");
  });

  it("measures a confusion against that key's own mistakes", () => {
    const [top] = computeConfusionStats(sessions);

    // 8 of the 12 times the r was missed, the t got pressed
    expect(top.shareOfKeyMisses).toBeCloseTo(8 / 12);
  });

  it("takes swapped letters out of the slip count, in both directions", () => {
    const stats = computeConfusionStats(sessions);

    // "ue" and "eu" were each seen 3 times, and all 3 were the same swap
    expect(stats.find((s) => s.pair === "ue")).toBeUndefined();
    expect(stats.find((s) => s.pair === "eu")).toBeUndefined();
  });

  it("ignores shift slips but keeps missing tildes", () => {
    const stats = computeConfusionStats([
      insight({ missedKeys: { a: 10, á: 10 }, confusions: { Aa: 6, áa: 6 } }),
    ]);

    expect(stats.map((s) => s.pair)).toEqual(["áa"]);
  });

  it("skips malformed pairs and sessions from before the tracking existed", () => {
    const stats = computeConfusionStats([
      insight({ missedKeys: { r: 10 }, confusions: { rt: 6, "r>t": 4, r: 2 } }),
      { missedKeys: { r: 10 }, confusions: { rz: 9 } }, // no insightsVersion
    ]);

    expect(stats.map((s) => s.pair)).toEqual(["rt"]);
  });

  it("reports swapped pairs with what they came out as", () => {
    expect(computeTranspositionStats(sessions)).toEqual([
      { pair: "ue", typedAs: "eu", count: 3 },
    ]);
  });
});
