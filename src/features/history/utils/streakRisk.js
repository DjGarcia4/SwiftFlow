import { t } from "@/shared/i18n";
import { computeDailyStreak, toLocalDayKey } from "./historyStats";

// Whether today can still keep the practice streak alive: there is one
// (ending yesterday, since nothing today yet) and today has no session.
// The reminder and the warning both hang off this.
export const computeStreakRisk = (results, now = new Date()) => {
  const streak = computeDailyStreak(results, now);
  const today = toLocalDayKey(now);
  const practicedToday = results.some((result) => toLocalDayKey(result.date) === today);

  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight.getTime() - now.getTime();

  return {
    atRisk: streak > 0 && !practicedToday,
    streak,
    practicedToday,
    hoursLeft: Math.floor(msLeft / (60 * 60 * 1000)),
    minutesLeft: Math.floor(msLeft / (60 * 1000)),
  };
};

// "3 h" or, in the last hour, "40 min"
export const formatTimeLeft = ({ hoursLeft, minutesLeft }) =>
  hoursLeft >= 1
    ? t("history.timeLeft.hours", hoursLeft)
    : t("history.timeLeft.minutes", minutesLeft);

// The hours a reminder can be set for, evening only: earlier would nag
// about a day that's barely started
export const REMINDER_HOURS = [19, 20, 21, 22];

// Whether it's time to remind: a reminder is set, its hour has come, the
// streak is at risk, and today hasn't been reminded about yet.
export const shouldRemind = ({ hour, lastRemindedDay, risk, now = new Date() }) =>
  hour !== null &&
  risk.atRisk &&
  now.getHours() >= hour &&
  lastRemindedDay !== toLocalDayKey(now);
