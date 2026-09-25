import { describe, it, expect } from "vitest";
import {
  buildDailyChallenges,
  computeChallengeStats,
  msUntilNextDay,
  DAILY_CHALLENGES_COUNT,
} from "./dailyChallenges";
import { METRICS_VERSION } from "@/features/history/utils/historyStats";

const DAY = new Date(2026, 8, 22, 15, 0);

let nextId = 0;
const session = (date, fields = {}) => ({
  id: `s${nextId++}`,
  date: date.toISOString(),
  metricsVersion: METRICS_VERSION,
  mode: "time",
  modeValue: 30,
  wpm: 50,
  accuracy: 95,
  errors: 1,
  timeElapsed: 30,
  maxStreak: 40,
  keystrokes: 150,
  errorKeystrokes: 3,
  ...fields,
});

const at = (daysAgo, hour = 12) =>
  new Date(DAY.getFullYear(), DAY.getMonth(), DAY.getDate() - daysAgo, hour);

// Every template shows up on some day of a long enough run, so tests that
// need one in particular go looking for it.
const findDayWith = (kind, results = []) => {
  for (let offset = 0; offset < 400; offset++) {
    const day = at(-offset);
    const found = buildDailyChallenges(results, day).find((c) => c.kind === kind);
    if (found) return { day, challenge: found };
  }
  throw new Error(`no day with a ${kind} challenge`);
};

describe("buildDailyChallenges", () => {
  it("gives three different challenges", () => {
    const challenges = buildDailyChallenges([], DAY);
    expect(challenges).toHaveLength(DAILY_CHALLENGES_COUNT);
    expect(new Set(challenges.map((c) => c.kind)).size).toBe(DAILY_CHALLENGES_COUNT);
  });

  it("gives the same challenges all day long", () => {
    const morning = buildDailyChallenges([], at(0, 7));
    const night = buildDailyChallenges([], at(0, 23));
    expect(night.map((c) => c.title)).toEqual(morning.map((c) => c.title));
  });

  it("changes from one day to the next", () => {
    const days = Array.from({ length: 7 }, (_, i) =>
      buildDailyChallenges([], at(i))
        .map((c) => c.kind)
        .join()
    );
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it("doesn't move its targets as the day's sessions come in", () => {
    const { day } = findDayWith("speed");
    const before = buildDailyChallenges([], day);
    const after = buildDailyChallenges([session(day, { wpm: 200 })], day);
    expect(after.map((c) => c.title)).toEqual(before.map((c) => c.title));
  });

  it("counts only the day's sessions toward progress", () => {
    const { day } = findDayWith("sessions");
    const yesterday = new Date(day);
    yesterday.setDate(yesterday.getDate() - 1);
    const results = [session(day), session(day), session(yesterday)];

    const challenge = buildDailyChallenges(results, day).find(
      (c) => c.kind === "sessions"
    );
    expect(challenge.progress).toBe(2);
    expect(challenge.completed).toBe(challenge.target <= 2);
  });

  it("sets the speed target just above your recent average", () => {
    const { day } = findDayWith("speed");
    const earlier = new Date(day);
    earlier.setDate(earlier.getDate() - 1);
    const history = Array.from({ length: 5 }, () => session(earlier, { wpm: 60 }));

    const challenge = buildDailyChallenges(history, day).find((c) => c.kind === "speed");
    expect(challenge.target).toBeGreaterThan(60);
    expect(challenge.target).toBeLessThanOrEqual(66);
  });

  it("completes a perfect-round challenge with a flawless session", () => {
    const { day } = findDayWith("perfect");
    const challenge = buildDailyChallenges(
      [session(day, { errorKeystrokes: 0, accuracy: 100, errors: 0 })],
      day
    ).find((c) => c.kind === "perfect");
    expect(challenge.completed).toBe(true);
  });

  it("points a mode challenge at that mode", () => {
    const { day, challenge } = findDayWith("mode");
    expect(challenge.action.mode).toBeTruthy();
    const done = buildDailyChallenges(
      [session(day, { mode: challenge.action.mode })],
      day
    ).find((c) => c.kind === "mode");
    expect(done.completed).toBe(true);
  });
});

describe("challenges added later", () => {
  const LAUNCH = new Date(2026, 8, 26, 12);
  const NEW_KINDS = ["sudden-death", "min-accuracy", "focus"];
  const daysFrom = (start, count, step) =>
    Array.from(
      { length: count },
      (_, i) =>
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * step, 12)
    );

  it("never show up on a day before theirs", () => {
    for (const day of daysFrom(LAUNCH, 400, -1).slice(1)) {
      for (const challenge of buildDailyChallenges([], day)) {
        expect(NEW_KINDS).not.toContain(challenge.kind);
        expect(["classics", "dictation", "lesson"]).not.toContain(challenge.action?.mode);
      }
    }
  });

  it("come up from their day on, and count the right sessions", () => {
    const seen = new Map();
    for (const day of daysFrom(LAUNCH, 400, 1)) {
      for (const challenge of buildDailyChallenges([], day)) {
        if (NEW_KINDS.includes(challenge.kind) && !seen.has(challenge.kind)) {
          seen.set(challenge.kind, day);
        }
        for (const mode of ["classics", "dictation", "lesson"]) {
          if (challenge.action?.mode === mode && !seen.has(mode)) seen.set(mode, day);
        }
      }
    }
    expect([...seen.keys()].sort()).toEqual(
      [...NEW_KINDS, "classics", "dictation", "lesson"].sort()
    );

    const doneBy = {
      "sudden-death": { strict: "sudden-death" },
      "min-accuracy": { minAccuracy: 98 },
      focus: { focus: true },
    };
    for (const kind of NEW_KINDS) {
      const day = seen.get(kind);
      const challenge = buildDailyChallenges([session(day, doneBy[kind])], day).find(
        (c) => c.kind === kind
      );
      expect(challenge.completed, kind).toBe(true);
    }
  });
});

describe("computeChallengeStats", () => {
  it("adds up the challenges completed on every day", () => {
    expect(computeChallengeStats([])).toEqual({ completed: 0, fullDays: 0 });

    const { day } = findDayWith("sessions");
    const results = Array.from({ length: 5 }, () => session(day));
    const expected = buildDailyChallenges(results, day).filter((c) => c.completed).length;

    expect(expected).toBeGreaterThan(0);
    expect(computeChallengeStats(results).completed).toBe(expected);
  });
});

describe("msUntilNextDay", () => {
  it("counts down to local midnight", () => {
    expect(msUntilNextDay(new Date(2026, 8, 22, 23, 0))).toBe(60 * 60 * 1000);
  });
});
