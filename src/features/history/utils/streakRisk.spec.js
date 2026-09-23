import { describe, it, expect } from "vitest";
import { computeStreakRisk, formatTimeLeft, shouldRemind } from "./streakRisk";
import { toLocalDayKey } from "./historyStats";

const day = (offset, hour = 12) => new Date(2026, 8, 22 + offset, hour);
const session = (date) => ({ id: String(Math.random()), date: date.toISOString() });

describe("computeStreakRisk", () => {
  it("is at risk when the streak ends yesterday and today has nothing yet", () => {
    const risk = computeStreakRisk([session(day(-1)), session(day(-2))], day(0, 21));
    expect(risk).toMatchObject({
      atRisk: true,
      streak: 2,
      practicedToday: false,
      hoursLeft: 3,
    });
  });

  it("is safe once today has a session", () => {
    expect(
      computeStreakRisk([session(day(0, 9)), session(day(-1))], day(0, 21)).atRisk
    ).toBe(false);
  });

  it("has nothing at risk without a streak", () => {
    expect(computeStreakRisk([session(day(-3))], day(0)).atRisk).toBe(false);
  });

  it("counts down to midnight", () => {
    const risk = computeStreakRisk([session(day(-1))], new Date(2026, 8, 22, 23, 20));
    expect(formatTimeLeft(risk)).toBe("40 min");
  });
});

describe("shouldRemind", () => {
  const risk = { atRisk: true };
  const now = day(0, 21);

  it("reminds once the hour has come, once a day", () => {
    expect(shouldRemind({ hour: 21, lastRemindedDay: null, risk, now })).toBe(true);
    expect(shouldRemind({ hour: 22, lastRemindedDay: null, risk, now })).toBe(false);
    expect(
      shouldRemind({ hour: 21, lastRemindedDay: toLocalDayKey(now), risk, now })
    ).toBe(false);
  });

  it("doesn't remind with no reminder set, or nothing at risk", () => {
    expect(shouldRemind({ hour: null, lastRemindedDay: null, risk, now })).toBe(false);
    expect(
      shouldRemind({ hour: 21, lastRemindedDay: null, risk: { atRisk: false }, now })
    ).toBe(false);
  });
});
