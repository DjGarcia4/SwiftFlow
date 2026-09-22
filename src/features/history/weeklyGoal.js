import { toLocalDayKey } from "@/features/history/utils/historyStats";

// Minutes of practice to reach in a week, Monday to Sunday. The daily
// challenges ask for a little every day; this is the steadier, longer bar
// behind them.

export const WEEKLY_GOAL_OPTIONS = [30, 60, 90, 120, 180];
const DEFAULT_WEEKLY_GOAL = 60;
// How many finished weeks "your usual" looks back over
const SUGGESTION_WEEKS = 4;

export const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// Monday 00:00 of the week `date` falls in, local time
export const startOfWeek = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  // getDay: Sunday is 0, and a Sunday belongs to the week that began on the
  // Monday six days earlier
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// "2026-09-21" for the week starting that Monday: stable, sortable, and
// readable in storage
export const weekKey = (date) => {
  const start = startOfWeek(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
};

const secondsIn = (results, from, to) =>
  results.reduce((sum, r) => {
    const at = Date.parse(r.date);
    return at >= from && at < to ? sum + (r.timeElapsed || 0) : sum;
  }, 0);

// The goal "Auto" picks: the smallest option that covers what you've been
// averaging over the last few full weeks, so it asks for your usual and a
// bit. Only weeks before this one count, so it doesn't creep up while you
// play. Weeks without any practice are left out -- a holiday shouldn't
// drag the bar down to nothing.
export const suggestWeeklyGoal = (results, now = new Date()) => {
  const thisWeek = startOfWeek(now);
  const totals = [];
  for (let i = 1; i <= SUGGESTION_WEEKS; i++) {
    const from = addDays(thisWeek, -7 * i);
    const seconds = secondsIn(results, from.getTime(), addDays(from, 7).getTime());
    if (seconds > 0) totals.push(seconds / 60);
  }
  if (!totals.length) return DEFAULT_WEEKLY_GOAL;

  const average = totals.reduce((sum, m) => sum + m, 0) / totals.length;
  return (
    WEEKLY_GOAL_OPTIONS.find((option) => option >= average) ??
    WEEKLY_GOAL_OPTIONS[WEEKLY_GOAL_OPTIONS.length - 1]
  );
};

// Where the week containing `now` stands against a goal in minutes
export const computeWeekProgress = (results, goal, now = new Date()) => {
  const start = startOfWeek(now);
  const todayKey = toLocalDayKey(now);

  const days = DAY_LABELS.map((label, index) => {
    const from = addDays(start, index);
    const minutes = secondsIn(results, from.getTime(), addDays(from, 1).getTime()) / 60;
    return {
      label,
      minutes: Math.floor(minutes),
      exactMinutes: minutes,
      isToday: toLocalDayKey(from) === todayKey,
      isFuture: from.getTime() > now.getTime(),
    };
  });

  const exact = days.reduce((sum, day) => sum + day.exactMinutes, 0);
  return {
    key: weekKey(now),
    goal,
    minutes: Math.floor(exact),
    fraction: Math.min(1, exact / goal),
    completed: exact >= goal,
    days: days.map(({ exactMinutes, ...day }) => ({
      ...day,
      // Against the goal's daily share, so a bar full to the top means "on
      // pace for the week", not "the biggest day"
      fraction: Math.min(1, exactMinutes / (goal / 7)),
    })),
  };
};
