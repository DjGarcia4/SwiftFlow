// "Tu resumen": a month or a year of practice, the way the history leaves
// it. Everything is worked out from the sessions -- how much, how fast,
// what got better, what was unlocked along the way -- and compared with the
// period before, so there's a story to tell rather than a table.
import {
  isCurrentMetrics,
  computeAverageWpm,
  computeAverageAccuracy,
  computeLongestDailyStreak,
  computeKeyErrorStats,
  formatModeLabel,
  formatModeName,
  toLocalDayKey,
  languageOf,
} from "./historyStats";
import { computeAchievements } from "@/features/history/achievements";
import { t, localeTag } from "@/shared/i18n";

// A key needs this many attempts in both periods to say it improved
const MIN_KEY_ATTEMPTS = 40;

// { kind: "month", year, month } (month 0-11) or { kind: "year", year }
export const periodBounds = ({ kind, year, month }) =>
  kind === "year"
    ? { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) }
    : { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };

export const previousPeriod = (period) =>
  period.kind === "year"
    ? { kind: "year", year: period.year - 1 }
    : period.month === 0
      ? { kind: "month", year: period.year - 1, month: 11 }
      : { kind: "month", year: period.year, month: period.month - 1 };

// The month named the way the current language names it
export const periodLabel = (period) =>
  period.kind === "year"
    ? `${period.year}`
    : t(
        "history.summary.period",
        new Date(period.year, period.month, 1).toLocaleDateString(localeTag(), {
          month: "long",
        }),
        period.year
      );

// The same period, as a URL-friendly id and back: "2026-09" or "2026"
export const periodId = (period) =>
  period.kind === "year"
    ? `${period.year}`
    : `${period.year}-${String(period.month + 1).padStart(2, "0")}`;

export const parsePeriodId = (id) => {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(id ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  if (!match[2]) return { kind: "year", year };
  const month = Number(match[2]) - 1;
  return month >= 0 && month < 12 ? { kind: "month", year, month } : null;
};

const within = (results, { start, end }) =>
  results.filter((result) => {
    const time = Date.parse(result.date);
    return time >= start.getTime() && time < end.getTime();
  });

// The periods there's something to look back on, newest first: every month
// and every year with at least one session
export const availablePeriods = (results) => {
  const months = new Map();
  const years = new Set();
  for (const result of results) {
    const date = new Date(result.date);
    const month = { kind: "month", year: date.getFullYear(), month: date.getMonth() };
    months.set(periodId(month), month);
    years.add(date.getFullYear());
  }
  const byNewest = (a, b) => (periodId(b) > periodId(a) ? 1 : -1);
  return {
    months: [...months.values()].sort(byNewest),
    years: [...years].sort((a, b) => b - a).map((year) => ({ kind: "year", year })),
  };
};

// The key whose miss rate dropped the most from one period to the next
const tamedKeyBetween = (before, now) => {
  const earlier = new Map(computeKeyErrorStats(before).map((stat) => [stat.key, stat]));
  let best = null;
  for (const stat of computeKeyErrorStats(now)) {
    const past = earlier.get(stat.key);
    if (!past || stat.attempts < MIN_KEY_ATTEMPTS || past.attempts < MIN_KEY_ATTEMPTS) {
      continue;
    }
    const drop = past.rate - stat.rate;
    if (drop > 0.01 && (!best || drop > best.drop)) {
      best = { key: stat.key, before: past.rate, after: stat.rate, drop };
    }
  }
  return best;
};

const unlockedIds = (results) =>
  new Set(
    computeAchievements(results)
      .filter((a) => a.unlocked)
      .map((a) => a.id)
  );

// results: the whole history (any order). Null for a period with nothing in it.
export const computeSummary = (results, period, now = new Date()) => {
  const bounds = periodBounds(period);
  const inPeriod = within(results, bounds);
  if (!inPeriod.length) return null;
  const before = within(results, periodBounds(previousPeriod(period)));
  const comparable = inPeriod.filter(isCurrentMetrics);
  const comparableBefore = before.filter(isCurrentMetrics);

  // Days: the ones practiced, out of the ones the period has had so far
  const daysSoFar = Math.max(
    1,
    Math.round(
      (Math.min(bounds.end.getTime(), now.getTime()) - bounds.start.getTime()) /
        (24 * 60 * 60 * 1000)
    )
  );
  const perDay = new Map();
  for (const result of inPeriod) {
    const day = toLocalDayKey(result.date);
    perDay.set(day, {
      date: result.date,
      sessions: (perDay.get(day)?.sessions ?? 0) + 1,
    });
  }
  const busiestDay = [...perDay.values()].sort((a, b) => b.sessions - a.sessions)[0];

  // The fastest session, and whether it beat everything before the period
  // in the same language
  const fastest = comparable.reduce(
    (top, r) => (!top || r.wpm > top.wpm ? r : top),
    null
  );
  const bestBefore = results
    .filter(
      (r) =>
        isCurrentMetrics(r) &&
        Date.parse(r.date) < bounds.start.getTime() &&
        languageOf(r) === (fastest && languageOf(fastest))
    )
    .reduce((top, r) => Math.max(top, r.wpm), 0);

  const averageWpm = comparable.length ? computeAverageWpm(comparable) : null;
  const averageBefore = comparableBefore.length
    ? computeAverageWpm(comparableBefore)
    : null;

  const modeCounts = new Map();
  for (const result of inPeriod) {
    modeCounts.set(result.mode, (modeCounts.get(result.mode) ?? 0) + 1);
  }
  const [favoriteMode, favoriteCount] = [...modeCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  // What was unlocked in the period: unlocked by its end, not by its start
  const upToStart = results.filter((r) => Date.parse(r.date) < bounds.start.getTime());
  const upToEnd = results.filter((r) => Date.parse(r.date) < bounds.end.getTime());
  const hadBefore = unlockedIds(upToStart);
  const achievements = computeAchievements(upToEnd).filter(
    (a) => a.unlocked && !hadBefore.has(a.id)
  );

  return {
    period,
    label: periodLabel(period),
    sessions: inPeriod.length,
    minutes: Math.round(inPeriod.reduce((sum, r) => sum + (r.timeElapsed || 0), 0) / 60),
    daysPracticed: perDay.size,
    daysSoFar: Math.min(daysSoFar, Math.round((bounds.end - bounds.start) / 864e5)),
    longestStreak: computeLongestDailyStreak(inPeriod),
    busiestDay,
    best: fastest
      ? {
          wpm: fastest.wpm,
          label: formatModeLabel(fastest),
          record: fastest.wpm > bestBefore,
        }
      : null,
    averageWpm: averageWpm === null ? null : Math.round(averageWpm),
    // Percent faster than the period before, when both have sessions
    wpmChange:
      averageWpm !== null && averageBefore
        ? Math.round(((averageWpm - averageBefore) / averageBefore) * 100)
        : null,
    averageAccuracy: comparable.length
      ? Math.round(computeAverageAccuracy(comparable))
      : null,
    favoriteMode: { name: formatModeName(favoriteMode), sessions: favoriteCount },
    tamedKey: tamedKeyBetween(before, inPeriod),
    achievements: achievements.map(({ id, title, icon, category }) => ({
      id,
      title,
      icon,
      category,
    })),
  };
};
