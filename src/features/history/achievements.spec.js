import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, computeAchievements } from "./achievements";

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
