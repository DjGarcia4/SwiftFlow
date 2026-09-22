// Spaced review for the letters you drill: a drilled letter comes back
// after a day, and each review that holds up pushes the next one further
// out -- 1, 3, 7, 14, 30 days -- until it's mastered. Getting clearly worse
// sends it back to the start. Pure functions over a plain schedule object
// ({ [key]: entry }); the store keeps it and the repository persists it.

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
// A session needs this many tries at a letter before its rate says anything
export const MIN_REVIEW_ATTEMPTS = 8;
// At or under this miss rate a letter is fine, whatever it was before
const GOOD_ENOUGH_RATE = 0.03;
// Worse than last time by more than this sends it back to one day
const SLIP_FACTOR = 1.25;
// How many past rates each letter keeps, for its trend
const HISTORY_LENGTH = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

// Alphabetical the Spanish way: the Ñ after the N, not after the Z
const byLetter = (a, b) => a.localeCompare(b, "es");

const startOfDay = (time) => {
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

const addDays = (time, days) => {
  const day = new Date(startOfDay(time));
  day.setDate(day.getDate() + days);
  return day.getTime();
};

// Whole days from `now`'s day to `time`'s day
export const daysUntil = (time, now = Date.now()) =>
  Math.round((startOfDay(time) - startOfDay(now)) / DAY_MS);

// Per-letter miss rates from one session's counters, case-folded, keeping
// only the letters tried often enough to judge.
export const sessionKeyRates = ({ keyAttempts = {}, missedKeys = {} }) => {
  const attempts = {};
  const misses = {};
  for (const [key, count] of Object.entries(keyAttempts)) {
    const lower = key.toLowerCase();
    attempts[lower] = (attempts[lower] || 0) + count;
  }
  for (const [key, count] of Object.entries(missedKeys)) {
    const lower = key.toLowerCase();
    misses[lower] = (misses[lower] || 0) + count;
  }
  const rates = {};
  for (const [key, tried] of Object.entries(attempts)) {
    if (tried >= MIN_REVIEW_ATTEMPTS) rates[key] = (misses[key] || 0) / tried;
  }
  return rates;
};

// Folds one drill session into the schedule. keys: the letters the drill
// aimed at. rates: sessionKeyRates of that session. baselineRates: each
// letter's rate from the history before this, for a letter drilled the
// first time. Returns the new schedule and what happened to each letter.
export const applyDrillSession = (
  schedule,
  { keys, rates, baselineRates = {}, now = Date.now() }
) => {
  const next = { ...schedule };
  const changes = [];

  for (const key of keys) {
    const rate = rates[key];
    if (rate === undefined) continue;
    const entry = schedule[key];

    if (!entry) {
      const baseline = baselineRates[key] ?? rate;
      next[key] = {
        key,
        step: 0,
        dueAt: addDays(now, REVIEW_INTERVALS[0]),
        previousDueAt: null,
        lastReviewedAt: now,
        baselineRate: baseline,
        lastRate: rate,
        history: [rate],
        mastered: false,
      };
      changes.push({
        key,
        fromRate: baseline,
        toRate: rate,
        counted: true,
        outcome: "started",
        nextInDays: REVIEW_INTERVALS[0],
        mastered: false,
      });
      continue;
    }

    const history = [...entry.history, rate].slice(-HISTORY_LENGTH);
    // Early practice is noted but doesn't move the schedule: cramming a
    // letter three times in one afternoon isn't three reviews.
    const isDue = !entry.mastered && startOfDay(now) >= entry.dueAt;
    if (!isDue) {
      next[key] = { ...entry, lastRate: rate, history };
      changes.push({
        key,
        fromRate: entry.lastRate,
        toRate: rate,
        counted: false,
        outcome: entry.mastered ? "mastered" : "early",
        nextInDays: entry.mastered ? null : daysUntil(entry.dueAt, now),
        mastered: entry.mastered,
      });
      continue;
    }

    const slipped = rate > GOOD_ENOUGH_RATE && rate > entry.lastRate * SLIP_FACTOR;
    const held = rate <= GOOD_ENOUGH_RATE || rate <= entry.lastRate;
    const step = slipped ? 0 : held ? entry.step + 1 : entry.step;
    const mastered = step >= REVIEW_INTERVALS.length;

    next[key] = {
      ...entry,
      step: Math.min(step, REVIEW_INTERVALS.length - 1),
      previousDueAt: entry.dueAt,
      dueAt: mastered ? null : addDays(now, REVIEW_INTERVALS[step]),
      lastReviewedAt: now,
      lastRate: rate,
      history,
      mastered,
    };
    changes.push({
      key,
      fromRate: entry.lastRate,
      toRate: rate,
      counted: true,
      outcome: mastered
        ? "mastered"
        : slipped
          ? "slipped"
          : held
            ? "advanced"
            : "repeated",
      nextInDays: mastered ? null : REVIEW_INTERVALS[step],
      mastered,
    });
  }

  return { schedule: next, changes };
};

// The letters to review on `now`'s day: the ones due by then, plus the ones
// that were due and already got reviewed today -- so the day's list holds
// still as you work through it instead of emptying itself.
export const reviewForDay = (schedule, now = Date.now()) => {
  const today = startOfDay(now);
  const entries = Object.values(schedule).filter((entry) => {
    const reviewedToday =
      entry.lastReviewedAt !== null && startOfDay(entry.lastReviewedAt) === today;
    if (reviewedToday && entry.previousDueAt !== null && entry.previousDueAt <= today) {
      return true;
    }
    return !entry.mastered && entry.dueAt !== null && entry.dueAt <= today;
  });

  const keys = entries.map((entry) => entry.key).sort(byLetter);
  const done = entries
    .filter((entry) => entry.dueAt === null || entry.dueAt > today)
    .map((entry) => entry.key)
    .sort(byLetter);
  return { keys, done, completed: keys.length > 0 && done.length === keys.length };
};

// Every letter in review, the next ones due first and the mastered ones last
export const listReviewKeys = (schedule, now = Date.now()) =>
  Object.values(schedule)
    .map((entry) => ({
      ...entry,
      dueInDays: entry.mastered ? null : daysUntil(entry.dueAt, now),
    }))
    .sort((a, b) => {
      if (a.mastered !== b.mastered) return a.mastered ? 1 : -1;
      if (a.mastered) return byLetter(a.key, b.key);
      return a.dueAt - b.dueAt || byLetter(a.key, b.key);
    });
