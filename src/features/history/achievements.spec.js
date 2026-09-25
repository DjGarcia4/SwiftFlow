import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, computeAchievements } from "./achievements";
import { classics } from "@/features/typing-test/content/classics";
import { LESSONS } from "@/features/course/course";
import { METRICS_VERSION } from "@/features/history/utils/historyStats";

const isUnlocked = (achievements, id) => achievements.find((a) => a.id === id).unlocked;

const at = (isoDateLike) => new Date(isoDateLike).toISOString();

describe("computeAchievements", () => {
  it("returns the full catalog, all locked, for an empty history", () => {
    const achievements = computeAchievements([]);
    expect(achievements).toHaveLength(ACHIEVEMENTS.length);
    expect(achievements.every((a) => a.unlocked === false)).toBe(true);
  });

  it("unlocks first_session after one completed session", () => {
    const achievements = computeAchievements([{ mode: "time", wpm: 10, accuracy: 90 }]);
    expect(isUnlocked(achievements, "first_session")).toBe(true);
    expect(isUnlocked(achievements, "sessions_10")).toBe(false);
  });

  it("unlocks session-count achievements at their thresholds", () => {
    const results = Array.from({ length: 10 }, () => ({
      mode: "time",
      wpm: 10,
      accuracy: 90,
    }));
    const achievements = computeAchievements(results);
    expect(isUnlocked(achievements, "sessions_10")).toBe(true);
    expect(isUnlocked(achievements, "sessions_50")).toBe(false);
  });

  it("unlocks wpm achievements based on the best wpm ever recorded", () => {
    const results = [
      { mode: "time", wpm: 30, accuracy: 90 },
      { mode: "time", wpm: 125, accuracy: 90 },
    ];
    const achievements = computeAchievements(results);
    expect(isUnlocked(achievements, "wpm_40")).toBe(true);
    expect(isUnlocked(achievements, "wpm_100")).toBe(true);
    expect(isUnlocked(achievements, "wpm_120")).toBe(true);
  });

  it("unlocks accuracy_100 and accuracy_100_x5 by counting perfect sessions", () => {
    const fourPerfect = Array.from({ length: 4 }, () => ({
      mode: "time",
      wpm: 40,
      accuracy: 100,
    }));
    const withFour = computeAchievements(fourPerfect);
    expect(isUnlocked(withFour, "accuracy_100")).toBe(true);
    expect(isUnlocked(withFour, "accuracy_100_x5")).toBe(false);

    const fivePerfect = [...fourPerfect, { mode: "time", wpm: 40, accuracy: 100 }];
    expect(isUnlocked(computeAchievements(fivePerfect), "accuracy_100_x5")).toBe(true);
  });

  it("unlocks the demanding-mode achievements from runs that made it", () => {
    const shortDeath = [
      { mode: "words", modeValue: 25, wpm: 50, accuracy: 100, strict: "sudden-death" },
    ];
    expect(isUnlocked(computeAchievements(shortDeath), "sudden_death_1")).toBe(true);
    expect(isUnlocked(computeAchievements(shortDeath), "sudden_death_long")).toBe(false);

    const longDeath = [
      { mode: "time", modeValue: 60, wpm: 50, accuracy: 100, strict: "sudden-death" },
    ];
    expect(isUnlocked(computeAchievements(longDeath), "sudden_death_long")).toBe(true);

    // Must-correct isn't sudden death
    const corrected = [
      { mode: "words", modeValue: 50, wpm: 50, accuracy: 96, strict: "must-correct" },
    ];
    expect(isUnlocked(computeAchievements(corrected), "sudden_death_1")).toBe(false);

    expect(
      isUnlocked(
        computeAchievements([{ mode: "time", wpm: 50, accuracy: 99, minAccuracy: 98 }]),
        "min_accuracy_98"
      )
    ).toBe(true);
    expect(
      isUnlocked(
        computeAchievements([{ mode: "time", wpm: 50, accuracy: 99, minAccuracy: 95 }]),
        "min_accuracy_98"
      )
    ).toBe(false);
  });

  it("unlocks the reading achievements", () => {
    const read = (ids) =>
      ids.map((modeValue) => ({ mode: "classics", modeValue, wpm: 40, accuracy: 97 }));
    const one = computeAchievements(read(["becquer-liii", "becquer-liii"]));
    expect(isUnlocked(one, "classics_1")).toBe(true);
    expect(isUnlocked(one, "classics_5")).toBe(false);

    const five = computeAchievements(
      read(["becquer-liii", "becquer-xxi", "marti-rosa", "dario-sonatina", "lazarillo"])
    );
    expect(isUnlocked(five, "classics_5")).toBe(true);
    expect(isUnlocked(five, "classics_all")).toBe(false);

    const all = computeAchievements(read(classics.map((c) => c.id)));
    expect(isUnlocked(all, "classics_all")).toBe(true);

    // A passage no longer in the bank doesn't count toward the collection
    expect(isUnlocked(computeAchievements(read(["gone"])), "classics_1")).toBe(false);
  });

  it("unlocks the course achievements from the lessons' results", () => {
    const lesson = (id, wpm = 30, accuracy = 97) => ({
      mode: "lesson",
      modeValue: id,
      wpm,
      accuracy,
    });
    const first = computeAchievements([lesson("home-1")]);
    expect(isUnlocked(first, "course_1")).toBe(true);
    expect(isUnlocked(first, "course_home_row")).toBe(false);
    expect(isUnlocked(first, "course_stars")).toBe(false);

    const homeRow = LESSONS.filter((l) => l.stage === "home").map((l) => lesson(l.id));
    expect(isUnlocked(computeAchievements(homeRow), "course_home_row")).toBe(true);
    expect(
      isUnlocked(computeAchievements([lesson("home-1", 30, 99)]), "course_stars")
    ).toBe(true);

    const all = LESSONS.map((l) => lesson(l.id));
    expect(isUnlocked(computeAchievements(all), "course_complete")).toBe(true);
    // A lesson not passed doesn't count
    expect(isUnlocked(computeAchievements([lesson("home-1", 2, 99)]), "course_1")).toBe(
      false
    );
  });

  it("unlocks tamed_key when a key's misses halve", () => {
    const withKey = (misses) => ({
      mode: "time",
      wpm: 40,
      accuracy: 95,
      keyAttempts: { r: 20 },
      missedKeys: { r: misses },
    });
    const recent = Array.from({ length: 10 }, () => withKey(1));
    const earlier = Array.from({ length: 10 }, () => withKey(3));
    expect(isUnlocked(computeAchievements([...recent, ...earlier]), "tamed_key")).toBe(
      true
    );
    expect(isUnlocked(computeAchievements(earlier), "tamed_key")).toBe(false);
  });

  it("unlocks steady_days after a week of steady days", () => {
    const day = (daysAgo, wpm) => ({
      mode: "time",
      modeValue: 30,
      wpm,
      accuracy: 95,
      metricsVersion: METRICS_VERSION,
      date: new Date(2026, 8, 25 - daysAgo, 12).toISOString(),
    });
    const steadyWeek = [60, 61, 59, 60, 62, 58, 60].map((wpm, i) => day(i, wpm));
    expect(isUnlocked(computeAchievements(steadyWeek), "steady_days")).toBe(true);
    expect(isUnlocked(computeAchievements(steadyWeek.slice(0, 6)), "steady_days")).toBe(
      false
    );
    const bumpy = [40, 70, 45, 75, 40, 70, 50].map((wpm, i) => day(i, wpm));
    expect(isUnlocked(computeAchievements(bumpy), "steady_days")).toBe(false);
  });

  it("unlocks month_20_days for twenty days in one month", () => {
    const days = (count, month) =>
      Array.from({ length: count }, (_, i) => ({
        mode: "time",
        wpm: 40,
        accuracy: 95,
        date: new Date(2026, month, i + 1, 12).toISOString(),
      }));
    expect(isUnlocked(computeAchievements(days(20, 8)), "month_20_days")).toBe(true);
    // Twenty days, but across two months
    expect(
      isUnlocked(computeAchievements([...days(10, 7), ...days(10, 8)]), "month_20_days")
    ).toBe(false);
  });

  it("unlocks the dictation achievements", () => {
    const dictation = (fields) => ({
      mode: "dictation",
      modeValue: 3,
      wpm: 35,
      accuracy: 95,
      ...fields,
    });
    expect(isUnlocked(computeAchievements([dictation()]), "dictation_1")).toBe(true);
    expect(isUnlocked(computeAchievements([dictation()]), "dictation_clean")).toBe(false);
    expect(
      isUnlocked(
        computeAchievements([dictation({ modeValue: 5, accuracy: 98 })]),
        "dictation_clean"
      )
    ).toBe(true);
    const ten = Array.from({ length: 10 }, () => dictation());
    expect(isUnlocked(computeAchievements(ten), "dictation_10")).toBe(true);
  });

  it("unlocks punctuated words, focus and must-correct achievements", () => {
    const words100 = { mode: "words", modeValue: 100, wpm: 40, accuracy: 97 };
    expect(isUnlocked(computeAchievements([words100]), "punctuated_words_100")).toBe(
      false
    );
    expect(
      isUnlocked(
        computeAchievements([{ ...words100, punctuation: true }]),
        "punctuated_words_100"
      )
    ).toBe(true);

    const focused = Array.from({ length: 10 }, () => ({
      mode: "time",
      wpm: 40,
      accuracy: 97,
      focus: true,
    }));
    expect(isUnlocked(computeAchievements(focused.slice(1)), "focus_10")).toBe(false);
    expect(isUnlocked(computeAchievements(focused), "focus_10")).toBe(true);

    const corrected = Array.from({ length: 5 }, () => ({
      mode: "time",
      wpm: 40,
      accuracy: 90,
      strict: "must-correct",
    }));
    expect(isUnlocked(computeAchievements(corrected), "must_correct_5")).toBe(true);
  });

  it("unlocks explorer only once all 5 modes have been played", () => {
    const fourModes = ["time", "words", "quote", "code"].map((mode) => ({
      mode,
      wpm: 40,
      accuracy: 90,
    }));
    expect(isUnlocked(computeAchievements(fourModes), "explorer")).toBe(false);

    const allModes = [...fourModes, { mode: "zen", wpm: 40, accuracy: 90 }];
    expect(isUnlocked(computeAchievements(allModes), "explorer")).toBe(true);
  });

  it("unlocks polyglot once all 3 code languages have been played", () => {
    const twoLanguages = [
      { mode: "code", modeValue: "JavaScript", wpm: 40, accuracy: 90 },
      { mode: "code", modeValue: "Python", wpm: 40, accuracy: 90 },
    ];
    expect(isUnlocked(computeAchievements(twoLanguages), "polyglot")).toBe(false);

    const threeLanguages = [
      ...twoLanguages,
      { mode: "code", modeValue: "Java", wpm: 40, accuracy: 90 },
    ];
    expect(isUnlocked(computeAchievements(threeLanguages), "polyglot")).toBe(true);
  });

  it("unlocks quote_lover after 15 quote-mode sessions", () => {
    const results = Array.from({ length: 15 }, () => ({
      mode: "quote",
      wpm: 40,
      accuracy: 90,
    }));
    expect(isUnlocked(computeAchievements(results), "quote_lover")).toBe(true);
    expect(isUnlocked(computeAchievements(results.slice(0, 14)), "quote_lover")).toBe(
      false
    );
  });

  it("unlocks time-practiced achievements from the sum of timeElapsed", () => {
    const results = [
      { mode: "time", wpm: 40, accuracy: 90, timeElapsed: 1800 },
      { mode: "time", wpm: 40, accuracy: 90, timeElapsed: 1800 },
    ];
    const achievements = computeAchievements(results);
    expect(isUnlocked(achievements, "time_10min")).toBe(true);
    expect(isUnlocked(achievements, "time_1h")).toBe(true);
    expect(isUnlocked(achievements, "time_5h")).toBe(false);
  });

  it("unlocks zen_marathon only for a zen session of 3+ minutes", () => {
    const short = [{ mode: "zen", wpm: 40, accuracy: 90, timeElapsed: 90 }];
    expect(isUnlocked(computeAchievements(short), "zen_marathon")).toBe(false);

    const long = [{ mode: "zen", wpm: 40, accuracy: 90, timeElapsed: 200 }];
    expect(isUnlocked(computeAchievements(long), "zen_marathon")).toBe(true);
  });

  it("unlocks night_owl and early_bird from the session's local hour", () => {
    const midnight = [
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-15T03:00:00") },
    ];
    expect(isUnlocked(computeAchievements(midnight), "night_owl")).toBe(true);
    expect(isUnlocked(computeAchievements(midnight), "early_bird")).toBe(false);

    const dawn = [
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-15T06:00:00") },
    ];
    expect(isUnlocked(computeAchievements(dawn), "early_bird")).toBe(true);
    expect(isUnlocked(computeAchievements(dawn), "night_owl")).toBe(false);

    const noon = [
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-15T12:00:00") },
    ];
    expect(isUnlocked(computeAchievements(noon), "night_owl")).toBe(false);
    expect(isUnlocked(computeAchievements(noon), "early_bird")).toBe(false);
  });

  it("unlocks comeback only when two sessions are 7+ days apart", () => {
    const closeTogether = [
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-01T09:00:00") },
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-05T09:00:00") },
    ];
    expect(isUnlocked(computeAchievements(closeTogether), "comeback")).toBe(false);

    const farApart = [
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-01T09:00:00") },
      { mode: "time", wpm: 40, accuracy: 90, date: at("2024-06-10T09:00:00") },
    ];
    expect(isUnlocked(computeAchievements(farApart), "comeback")).toBe(true);
  });

  it("unlocks streak achievements from the longest streak ever, not just current", () => {
    const day = (n) => {
      const d = new Date(2024, 0, 1 + n, 9, 0, 0);
      return d.toISOString();
    };
    // A 3-day streak, long broken — should still unlock streak_3.
    const results = [0, 1, 2].map((n) => ({
      mode: "time",
      wpm: 40,
      accuracy: 90,
      date: day(n),
    }));
    const achievements = computeAchievements(results);
    expect(isUnlocked(achievements, "streak_3")).toBe(true);
    expect(isUnlocked(achievements, "streak_7")).toBe(false);
  });
});

describe("combo and numbers achievements", () => {
  it("unlocks combo achievements from the best single-session streak", () => {
    const results = [
      { mode: "time", wpm: 40, accuracy: 90, maxStreak: 60 },
      { mode: "time", wpm: 40, accuracy: 90, maxStreak: 20 },
    ];
    const achievements = computeAchievements(results);
    expect(isUnlocked(achievements, "combo_50")).toBe(true);
    expect(isUnlocked(achievements, "combo_150")).toBe(false);
  });

  it("does not unlock combo achievements for sessions without streak data", () => {
    const achievements = computeAchievements([{ mode: "time", wpm: 40, accuracy: 90 }]);
    expect(isUnlocked(achievements, "combo_50")).toBe(false);
  });

  it("unlocks numbers_lover after 10 numbers sessions", () => {
    const nine = Array.from({ length: 9 }, () => ({
      mode: "numbers",
      wpm: 30,
      accuracy: 90,
    }));
    expect(isUnlocked(computeAchievements(nine), "numbers_lover")).toBe(false);

    const ten = [...nine, { mode: "numbers", wpm: 30, accuracy: 90 }];
    expect(isUnlocked(computeAchievements(ten), "numbers_lover")).toBe(true);
  });
});
