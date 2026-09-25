// How steady you are from one day to the next -- not within a session (that's
// the per-session consistency), but whether Tuesday's you types like
// Thursday's. Read off your most-played kind of session only, since 15
// seconds and 120 seconds, or words and code, don't run at the same speed.
import { t } from "@/shared/i18n";
import {
  isCurrentMetrics,
  toLocalDayKey,
  formatModeLabel,
  sessionKind,
} from "./historyStats";

// The latest days you played, each one's average against the others
export const CONSISTENCY_DAYS = 14;
const MIN_DAYS = 5;
// Which kind of session to judge by: the most played among the latest ones
const LOOKBACK_SESSIONS = 80;

export const CONSISTENCY_LEVELS = [
  { min: 93, id: "veryEven" },
  { min: 87, id: "even" },
  { min: 80, id: "bumpy" },
  { min: 0, id: "irregular" },
].map((level) => ({
  ...level,
  get label() {
    return t(`history.consistencyLevels.${level.id}`);
  },
}));

const kindOf = sessionKind;

// results: the history, most recent first. Null until there are days enough.
export const computeDayConsistency = (results) => {
  const current = results.filter(isCurrentMetrics);
  const counts = new Map();
  for (const result of current.slice(0, LOOKBACK_SESSIONS)) {
    counts.set(kindOf(result), (counts.get(kindOf(result)) || 0) + 1);
  }
  const kind = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!kind) return null;

  const byDay = new Map();
  for (const result of current) {
    if (kindOf(result) !== kind) continue;
    const day = toLocalDayKey(result.date);
    if (!byDay.has(day)) {
      if (byDay.size === CONSISTENCY_DAYS) break;
      byDay.set(day, { date: result.date, wpms: [] });
    }
    byDay.get(day).wpms.push(result.wpm);
  }
  if (byDay.size < MIN_DAYS) return null;

  const days = [...byDay.values()]
    .map(({ date, wpms }) => ({
      date,
      sessions: wpms.length,
      wpm: wpms.reduce((sum, wpm) => sum + wpm, 0) / wpms.length,
    }))
    .reverse();
  const mean = days.reduce((sum, day) => sum + day.wpm, 0) / days.length;
  const sd = Math.sqrt(
    days.reduce((sum, day) => sum + (day.wpm - mean) ** 2, 0) / days.length
  );
  const score = mean ? Math.round(Math.max(0, 1 - sd / mean) * 100) : 0;
  const sample = current.find((result) => kindOf(result) === kind);

  return {
    score,
    level: CONSISTENCY_LEVELS.find((level) => score >= level.min).label,
    label: formatModeLabel(sample),
    days,
    mean,
    sd,
    min: Math.min(...days.map((day) => day.wpm)),
    max: Math.max(...days.map((day) => day.wpm)),
  };
};
