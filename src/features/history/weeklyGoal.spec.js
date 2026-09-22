import { describe, it, expect } from "vitest";
import {
  startOfWeek,
  weekKey,
  suggestWeeklyGoal,
  computeWeekProgress,
} from "./weeklyGoal";

// Wednesday 23 September 2026, mid-afternoon
const NOW = new Date(2026, 8, 23, 15, 0);

const session = (date, minutes) => ({
  id: String(Math.random()),
  date: date.toISOString(),
  timeElapsed: minutes * 60,
});

const day = (offset, hour = 12) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + offset, hour);

describe("startOfWeek", () => {
  it("starts the week on Monday", () => {
    expect(startOfWeek(NOW)).toEqual(new Date(2026, 8, 21));
  });

  it("puts Sunday in the week that began the Monday before", () => {
    expect(startOfWeek(new Date(2026, 8, 27, 22))).toEqual(new Date(2026, 8, 21));
  });

  it("keys the week by its Monday", () => {
    expect(weekKey(NOW)).toBe("2026-09-21");
  });
});

describe("computeWeekProgress", () => {
  it("adds up this week's minutes, Monday to Sunday", () => {
    const results = [
      session(day(-2), 10), // Monday
      session(day(0), 15), // today, Wednesday
      session(day(-3), 40), // last Sunday: previous week
    ];
    const week = computeWeekProgress(results, 60, NOW);

    expect(week.minutes).toBe(25);
    expect(week.completed).toBe(false);
    expect(week.fraction).toBeCloseTo(25 / 60);
    expect(week.days.map((d) => d.minutes)).toEqual([10, 0, 15, 0, 0, 0, 0]);
    expect(week.days[2].isToday).toBe(true);
    expect(week.days[3].isFuture).toBe(true);
  });

  it("counts as done once the minutes reach the goal", () => {
    const week = computeWeekProgress([session(day(-1), 30)], 30, NOW);
    expect(week.completed).toBe(true);
    expect(week.fraction).toBe(1);
  });

  it("fills a day's bar against its share of the goal", () => {
    // 70 minutes a week is 10 a day
    const week = computeWeekProgress([session(day(0), 5)], 70, NOW);
    expect(week.days[2].fraction).toBeCloseTo(0.5);
  });
});

describe("suggestWeeklyGoal", () => {
  it("starts at an hour with no history", () => {
    expect(suggestWeeklyGoal([], NOW)).toBe(60);
  });

  it("covers what you've been averaging in previous weeks", () => {
    const results = [session(day(-7), 70), session(day(-14), 80)];
    expect(suggestWeeklyGoal(results, NOW)).toBe(90);
  });

  it("ignores this week, so it doesn't move while you play", () => {
    const before = suggestWeeklyGoal([session(day(-7), 20)], NOW);
    const after = suggestWeeklyGoal([session(day(-7), 20), session(day(0), 200)], NOW);
    expect(after).toBe(before);
  });

  it("leaves weeks off out of the average", () => {
    // One 100-minute week and three empty ones is still a 100-minute habit
    expect(suggestWeeklyGoal([session(day(-21), 100)], NOW)).toBe(120);
  });
});
