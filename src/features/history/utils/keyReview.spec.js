import { describe, it, expect } from "vitest";
import {
  applyDrillSession,
  reviewForDay,
  listReviewKeys,
  sessionKeyRates,
  daysUntil,
  REVIEW_INTERVALS,
} from "./keyReview";

const at = (day, hour = 12) => new Date(2026, 8, day, hour).getTime();

// A drill of `key` on `day` that missed it at `rate`
const drill = (schedule, key, rate, day, baselineRates = {}) =>
  applyDrillSession(schedule, {
    keys: [key],
    rates: { [key]: rate },
    baselineRates,
    now: at(day),
  });

describe("sessionKeyRates", () => {
  it("folds case and skips letters tried too few times to judge", () => {
    expect(
      sessionKeyRates({
        keyAttempts: { ñ: 6, Ñ: 4, q: 3 },
        missedKeys: { ñ: 1, Ñ: 1, q: 3 },
      })
    ).toEqual({ ñ: 0.2 });
  });
});

describe("applyDrillSession", () => {
  it("puts a newly drilled letter in review for tomorrow", () => {
    const { schedule, changes } = drill({}, "ñ", 0.1, 1, { ñ: 0.22 });
    expect(daysUntil(schedule.ñ.dueAt, at(1))).toBe(1);
    expect(changes).toEqual([
      {
        key: "ñ",
        fromRate: 0.22,
        toRate: 0.1,
        counted: true,
        outcome: "started",
        nextInDays: 1,
        mastered: false,
      },
    ]);
  });

  it("pushes the next review out when a due review holds up", () => {
    let { schedule } = drill({}, "ñ", 0.1, 1);
    ({ schedule } = drill(schedule, "ñ", 0.08, 2));
    expect(schedule.ñ.step).toBe(1);
    expect(daysUntil(schedule.ñ.dueAt, at(2))).toBe(REVIEW_INTERVALS[1]);
  });

  it("sends a letter that got clearly worse back to one day", () => {
    let { schedule } = drill({}, "ñ", 0.1, 1);
    ({ schedule } = drill(schedule, "ñ", 0.05, 2));
    const { schedule: after, changes } = drill(schedule, "ñ", 0.2, 5);
    expect(after.ñ.step).toBe(0);
    expect(changes[0].outcome).toBe("slipped");
    expect(changes[0].nextInDays).toBe(1);
  });

  it("repeats the same gap when it's a little worse", () => {
    let { schedule } = drill({}, "ñ", 0.1, 1);
    const { schedule: after, changes } = drill(schedule, "ñ", 0.11, 2);
    expect(after.ñ.step).toBe(0);
    expect(changes[0].outcome).toBe("repeated");
  });

  it("notes early practice without moving the schedule", () => {
    const { schedule } = drill({}, "ñ", 0.1, 1);
    const { schedule: after, changes } = drill(schedule, "ñ", 0.01, 1);
    expect(after.ñ.dueAt).toBe(schedule.ñ.dueAt);
    expect(after.ñ.lastRate).toBe(0.01);
    expect(changes[0]).toMatchObject({ counted: false, outcome: "early" });
  });

  it("masters a letter after the last interval", () => {
    let { schedule } = drill({}, "ñ", 0.02, 1);
    let day = 1;
    let changes;
    for (const interval of REVIEW_INTERVALS) {
      day += interval;
      ({ schedule, changes } = drill(schedule, "ñ", 0.02, day));
    }
    expect(schedule.ñ.mastered).toBe(true);
    expect(changes[0]).toMatchObject({ outcome: "mastered", nextInDays: null });
  });

  it("ignores letters the session didn't try enough", () => {
    const { schedule, changes } = applyDrillSession(
      {},
      { keys: ["ñ", "q"], rates: { ñ: 0.1 }, now: at(1) }
    );
    expect(Object.keys(schedule)).toEqual(["ñ"]);
    expect(changes).toHaveLength(1);
  });
});

describe("reviewForDay", () => {
  it("lists what's due, and keeps it listed once reviewed that day", () => {
    let { schedule } = drill({}, "ñ", 0.1, 1);
    ({ schedule } = applyDrillSession(schedule, {
      keys: ["q"],
      rates: { q: 0.1 },
      now: at(1),
    }));

    expect(reviewForDay(schedule, at(1))).toEqual({
      keys: [],
      done: [],
      completed: false,
    });
    expect(reviewForDay(schedule, at(2))).toEqual({
      keys: ["ñ", "q"],
      done: [],
      completed: false,
    });

    ({ schedule } = drill(schedule, "ñ", 0.05, 2));
    expect(reviewForDay(schedule, at(2, 20))).toEqual({
      keys: ["ñ", "q"],
      done: ["ñ"],
      completed: false,
    });
  });
});

describe("listReviewKeys", () => {
  it("puts the next ones due first and the mastered ones last", () => {
    const schedule = {
      a: { key: "a", dueAt: at(9), mastered: false },
      b: { key: "b", dueAt: null, mastered: true },
      c: { key: "c", dueAt: at(3), mastered: false },
    };
    expect(listReviewKeys(schedule, at(1)).map((e) => [e.key, e.dueInDays])).toEqual([
      ["c", 2],
      ["a", 8],
      ["b", null],
    ]);
  });
});
