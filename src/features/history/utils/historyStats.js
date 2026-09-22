// Pure helpers over a list of history results (most-recent-first), kept
// separate from the store so they're trivial to unit test.
import { weeklyLabel } from "@/features/typing-test/content/weekly";

// Bumped whenever how wpm/accuracy are measured changes. v1 (unversioned)
// counted whole words over whole seconds and accuracy on the final text
// only; v2 uses correct characters / 5 over milliseconds and accuracy over
// every keystroke; v3 only counts fully correct words and drops the first
// keystroke. Records and averages only compare like with like.
export const METRICS_VERSION = 3;

export const isCurrentMetrics = (result) => result.metricsVersion === METRICS_VERSION;

// Bumped when the *rules* behind the per-keystroke insights change (which
// mistakes count as a swap, which intervals count as typing) -- not when a
// formula changes. Kept apart from METRICS_VERSION on purpose: throwing out
// stale insights should never throw out someone's records along with them.
export const INSIGHTS_VERSION = 1;

// How far back the per-keystroke insights look. What you fumbled fifty
// sessions ago isn't what to practice now, and a rate per key needs
// keystroke volume before it means anything.
export const RECENT_INSIGHT_SESSIONS = 30;

export const hasCurrentInsights = (result) => result.insightsVersion === INSIGHTS_VERSION;

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
  numbers: (value) => `${value} números`,
  code: (value) => (value ? `Código · ${value}` : "Código"),
  quote: () => "Cita",
  zen: () => "Zen",
  // Sessions saved before the drill reported its word count have no value
  drill: (value) => (value ? `Entrenar · ${value} palabras` : "Entrenar"),
  weekly: (value) => (value ? `Semanal · ${weeklyLabel(value)}` : "Semanal"),
};

// The mode on its own, without the value formatModeLabel tacks on --
// "Tiempo", not "15s", for anything that covers every length at once.
const MODE_NAMES = {
  time: "Tiempo",
  words: "Palabras",
  numbers: "Números",
  quote: "Cita",
  code: "Código",
  zen: "Zen",
  drill: "Entrenar",
  weekly: "Semanal",
};

export const formatModeName = (mode) => MODE_NAMES[mode] ?? mode;

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

export const toLocalDayKey = (isoDate) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// One entry per day over the recent past, oldest first, including the days
// with nothing on them -- a calendar with holes in it isn't a calendar.
export const computeDailyActivity = (results, { days = 91, now = new Date() } = {}) => {
  const sessionsByDay = new Map();
  for (const result of results) {
    const key = toLocalDayKey(result.date);
    sessionsByDay.set(key, (sessionsByDay.get(key) || 0) + 1);
  }

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  const activity = [];
  for (let i = 0; i < days; i++) {
    const dayKey = toLocalDayKey(cursor);
    activity.push({
      dayKey,
      date: new Date(cursor),
      sessions: sessionsByDay.get(dayKey) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return activity;
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

// Sessions saved before per-keystroke tracking existed don't have these
// fields, so every helper below just skips over what's missing.

// Longest run of correct characters in a single session.
export const computeBestStreak = (results) =>
  results.reduce((best, r) => Math.max(best, r.maxStreak || 0), 0);

export const computeTotalTimeElapsed = (results) =>
  results.reduce((sum, r) => sum + (r.timeElapsed || 0), 0);

export const computeTotalKeystrokes = (results) =>
  results.reduce((sum, r) => sum + (r.keystrokes || 0), 0);

// Mistakes made and then fixed with backspace, across all sessions.
export const computeTotalCorrectedErrors = (results) =>
  results.reduce(
    (sum, r) => sum + Math.max(0, (r.errorKeystrokes || 0) - (r.errors || 0)),
    0
  );

// Aggregates per-key attempts/misses across sessions, case-insensitive (a
// keyboard key is the same for "a" and "A"). Sorted by most misses, then by
// highest miss rate, so the keys worth practicing come first.
export const computeKeyErrorStats = (results) => {
  const attempts = new Map();
  const misses = new Map();

  const add = (map, counts) => {
    for (const [char, count] of Object.entries(counts || {})) {
      const key = char.toLowerCase();
      map.set(key, (map.get(key) || 0) + count);
    }
  };

  for (const result of results) {
    add(attempts, result.keyAttempts);
    add(misses, result.missedKeys);
  }

  return [...attempts.entries()]
    .map(([key, keyAttempts]) => {
      const keyMisses = misses.get(key) || 0;
      return {
        key,
        attempts: keyAttempts,
        misses: keyMisses,
        rate: keyMisses / keyAttempts,
      };
    })
    .sort((a, b) => b.misses - a.misses || b.rate - a.rate);
};

// Merges one count map per session into a single tally. Every per-keystroke
// aggregate on this page has the same shape -- { someKey: count } -- so they
// all go through here.
const mergeCountMaps = (results, field, normalize = (key) => key.toLowerCase()) => {
  const totals = new Map();
  for (const result of results) {
    for (const [rawKey, count] of Object.entries(result[field] || {})) {
      if (!Number.isFinite(count) || count <= 0) continue;
      const key = normalize(rawKey);
      if (key === null) continue;
      totals.set(key, (totals.get(key) || 0) + count);
    }
  }
  return totals;
};

// Pair keys are two code points back to back ("rt"), so anything else is a
// corrupted entry from a hand-edited or partially written backup.
const normalizePair = (key) => {
  const chars = [...key.toLowerCase()];
  return chars.length === 2 ? chars.join("") : null;
};

const reversePair = (pair) => {
  const [first, second] = [...pair];
  return second + first;
};

// Bigrams that came out backwards, most frequent first. `typedAs` is what
// actually landed on screen, which is just the pair reversed.
export const computeTranspositionStats = (results) => {
  const sessions = results.filter(hasCurrentInsights);
  return [...mergeCountMaps(sessions, "transpositions", normalizePair).entries()]
    .map(([pair, count]) => ({ pair, typedAs: reversePair(pair), count }))
    .sort((a, b) => b.count - a.count);
};

// Which key got pressed instead, most habitual first.
//
// A swap writes two entries here ("ue" and "eu") but only one into the
// transposition tally, so both directions come off the total -- what's left
// (`slips`) is the plain wrong-finger mistakes, which is what the advice is
// about.
export const computeConfusionStats = (results) => {
  const sessions = results.filter(hasCurrentInsights);
  const swaps = mergeCountMaps(sessions, "transpositions", normalizePair);
  // Straight off missedKeys rather than computeKeyErrorStats: the share is
  // per mistake, and a key's attempt count has nothing to do with it.
  const missesByKey = mergeCountMaps(sessions, "missedKeys");

  return (
    [...mergeCountMaps(sessions, "confusions", normalizePair).entries()]
      .map(([pair, total]) => {
        const [expected, typed] = [...pair];
        const transposed = (swaps.get(pair) || 0) + (swaps.get(reversePair(pair)) || 0);
        const slips = Math.max(0, total - transposed);
        const keyMisses = missesByKey.get(expected) || 0;
        return {
          pair,
          expected,
          typed,
          total,
          transposed,
          slips,
          shareOfKeyMisses: keyMisses ? slips / keyMisses : 0,
        };
      })
      // Same letter either side of the pair means a shift slip ("A" for "a"),
      // not a confusion between two keys -- "confundis la A con la A" is
      // nonsense. Accented pairs stay: "a for a" is the dropped-tilde habit.
      .filter((stat) => stat.expected !== stat.typed && stat.slips > 0)
      .sort((a, b) => b.slips - a.slips || b.shareOfKeyMisses - a.shareOfKeyMisses)
  );
};

// Below these a mean is noise. Keys get the same bar as MIN_KEY_ATTEMPTS in
// the tips -- same idea, same number -- and pairs a lower one, since any
// given pair comes up roughly a fifth as often.
export const MIN_KEY_TIMING_SAMPLES = 60;
export const MIN_BIGRAM_TIMING_SAMPLES = 25;

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// Merges the [totalMs, count] tuples and turns them into averages.
//
// Totals are summed before dividing, never averaged twice over: a key seen
// ten times at 100ms in one session and twice at 500ms in another averages
// 167ms, not 300ms.
//
// `ratio` is against the median of the qualifying keys, not their pooled
// mean, because the pooled mean is dragged upward by the very keys being
// looked for -- which would shrink every ratio and quietly cancel out the
// effect. The median is literally "your middle key", which is also what the
// advice claims.
const computeTimingStats = (results, field, minSamples, keyLength) => {
  const totals = new Map();

  for (const result of results) {
    if (!hasCurrentInsights(result)) continue;
    for (const [rawKey, tuple] of Object.entries(result[field] || {})) {
      if (!Array.isArray(tuple) || tuple.length !== 2) continue;
      const [totalMs, count] = tuple;
      if (!Number.isFinite(totalMs) || !Number.isFinite(count) || count <= 0) continue;

      const chars = [...rawKey.toLowerCase()];
      if (chars.length !== keyLength) continue;
      const key = chars.join("");

      const entry = totals.get(key) || [0, 0];
      totals.set(key, [entry[0] + totalMs, entry[1] + count]);
    }
  }

  const stats = [...totals.entries()]
    .filter(([, [, count]]) => count >= minSamples)
    .map(([key, [totalMs, count]]) => ({
      key,
      meanMs: Math.round(totalMs / count),
      samples: count,
    }));

  const baseline = median(stats.map((stat) => stat.meanMs));

  return stats
    .map((stat) => ({ ...stat, ratio: baseline ? stat.meanMs / baseline : 1 }))
    .sort((a, b) => b.ratio - a.ratio);
};

// [{ key, meanMs, samples, ratio }], slowest first.
export const computeKeyTimingStats = (
  results,
  { minSamples = MIN_KEY_TIMING_SAMPLES } = {}
) => computeTimingStats(results, "keyTiming", minSamples, 1);

// Same, for the transition between two keys.
export const computeBigramTimingStats = (
  results,
  { minSamples = MIN_BIGRAM_TIMING_SAMPLES } = {}
) =>
  computeTimingStats(results, "bigramTiming", minSamples, 2).map(({ key, ...rest }) => ({
    pair: key,
    ...rest,
  }));

const KEY_LABELS = { " ": "espacio", "\n": "enter", "\t": "tab" };

export const formatKeyLabel = (key) => KEY_LABELS[key] ?? key;

// A pair with an invisible key in it can't just be concatenated -- "s " would
// read as "sespacio".
export const formatPairLabel = (pair) => {
  const chars = [...pair];
  return chars.some((char) => KEY_LABELS[char])
    ? chars.map(formatKeyLabel).join(" + ")
    : pair;
};
