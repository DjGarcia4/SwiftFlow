import { describe, it, expect } from "vitest";
import {
  isoWeek,
  weeklyKey,
  weeklyLabel,
  generateWeeklyText,
  WEEKLY_WORD_COUNT,
} from "./weekly";

describe("isoWeek", () => {
  it("numbers weeks the ISO way, Monday to Sunday", () => {
    expect(isoWeek(new Date(2026, 8, 21))).toEqual({ year: 2026, week: 39 }); // Monday
    expect(isoWeek(new Date(2026, 8, 27))).toEqual({ year: 2026, week: 39 }); // Sunday
    expect(isoWeek(new Date(2026, 8, 28))).toEqual({ year: 2026, week: 40 });
  });

  it("gives the turn of the year to the week its Thursday falls in", () => {
    // 1 January 2027 is a Friday: still the last week of 2026
    expect(isoWeek(new Date(2027, 0, 1))).toEqual({ year: 2026, week: 53 });
    // 29 December 2025 is a Monday whose Thursday is in 2026
    expect(isoWeek(new Date(2025, 11, 29))).toEqual({ year: 2026, week: 1 });
  });
});

describe("weekly keys", () => {
  it("stores by year and week, and reads as S-week·year", () => {
    expect(weeklyKey(new Date(2026, 8, 23))).toBe("2026-W39");
    expect(weeklyKey(new Date(2026, 0, 5))).toBe("2026-W02");
    expect(weeklyLabel("2026-W02")).toBe("S2·2026");
  });
});

describe("generateWeeklyText", () => {
  it("is the same text every time for the same week", () => {
    expect(generateWeeklyText("2026-W39")).toBe(generateWeeklyText("2026-W39"));
  });

  it("is a different text each week", () => {
    expect(generateWeeklyText("2026-W39")).not.toBe(generateWeeklyText("2026-W40"));
  });

  it("has the set number of words, never the same one twice in a row", () => {
    const words = generateWeeklyText("2026-W39").split(" ");
    expect(words).toHaveLength(WEEKLY_WORD_COUNT);
    for (let i = 1; i < words.length; i++) expect(words[i]).not.toBe(words[i - 1]);
  });
});
