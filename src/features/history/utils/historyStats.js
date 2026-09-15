// Pure helpers over a list of history results (most-recent-first), kept
// separate from the store so they're trivial to unit test.

export const computeBestWpm = (results) => {
  if (!results.length) return 0;
  return Math.max(...results.map((r) => r.wpm));
};

export const computeAverageWpm = (results) => {
  if (!results.length) return 0;
  const total = results.reduce((sum, r) => sum + r.wpm, 0);
  return Math.round(total / results.length);
};

export const computeAverageAccuracy = (results) => {
  if (!results.length) return 0;
  const total = results.reduce((sum, r) => sum + r.accuracy, 0);
  return Math.round(total / results.length);
};

const MODE_LABELS = {
  time: (value) => `${value}s`,
  words: (value) => `${value} palabras`,
  code: (value) => (value ? `Código · ${value}` : "Código"),
  quote: () => "Cita",
  zen: () => "Zen",
};

export const formatModeLabel = ({ mode, modeValue }) => {
  const format = MODE_LABELS[mode];
  return format ? format(modeValue) : mode;
};

// One entry per distinct mode+modeValue combo (e.g. "time · 15s", "code ·
// JavaScript"), keeping only the highest-wpm result seen for each. Sorted
// best-wpm-first so the most impressive record shows up on top.
export const computePersonalBests = (results) => {
  const bestByKey = new Map();

  for (const result of results) {
    const key = `${result.mode}:${result.modeValue ?? ""}`;
    const current = bestByKey.get(key);
    if (!current || result.wpm > current.wpm) {
      bestByKey.set(key, result);
    }
  }

  return [...bestByKey.values()].sort((a, b) => b.wpm - a.wpm);
};

const toLocalDayKey = (isoDate) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// Consecutive local calendar days (ending today or yesterday) with at least
// one completed session. Matches the usual "streak" UX: doing a session
// today extends it, but the streak isn't broken until a full day is missed
// — practicing yesterday and skipping today (so far) still counts.
export const computeDailyStreak = (results, now = new Date()) => {
  if (!results.length) return 0;

  const activeDays = new Set(results.map((r) => toLocalDayKey(r.date)));

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  if (!activeDays.has(toLocalDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDays.has(toLocalDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (activeDays.has(toLocalDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const parseDayKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month, day);
};

// The longest run of consecutive practice days anywhere in history — unlike
// computeDailyStreak (which only reports the streak ending today/yesterday,
// i.e. whether it's still alive), this looks at the whole history, so a
// streak achievement stays earned even after the streak itself later breaks.
export const computeLongestDailyStreak = (results) => {
  if (!results.length) return 0;

  const days = [...new Set(results.map((r) => toLocalDayKey(r.date)))]
    .map(parseDayKey)
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const expectedNext = new Date(days[i - 1]);
    expectedNext.setDate(expectedNext.getDate() + 1);

    current = expectedNext.getTime() === days[i].getTime() ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
};
