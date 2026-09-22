import { RECENT_INSIGHT_SESSIONS } from "./historyStats";

// The words worth drilling, from the recent sessions' per-word stats: the
// ones you get wrong a lot, and the ones that hold you up even when you
// get them right.

// A word needs to have come up this often before it says anything
export const MIN_WORD_TIMES = 3;
// Wrong in this share of the times it came up...
export const ERROR_RATE_BAR = 0.34;
// ...or this much slower per letter than your typical word
export const SLOW_RATIO_BAR = 1.4;
const MAX_PROBLEM_WORDS = 10;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// results: history, most recent first. Returns the words, worst first:
// { word, times, errors, errorRate, slowRatio }.
export const computeProblemWords = (results, { limit = MAX_PROBLEM_WORDS } = {}) => {
  const totals = new Map();
  for (const result of results.slice(0, RECENT_INSIGHT_SESSIONS)) {
    for (const [word, [times, errors, msSum, timed]] of Object.entries(
      result.wordStats ?? {}
    )) {
      const total = totals.get(word) ?? { word, times: 0, errors: 0, msSum: 0, timed: 0 };
      total.times += times;
      total.errors += errors;
      total.msSum += msSum;
      total.timed += timed;
      totals.set(word, total);
    }
  }

  const words = [...totals.values()].filter((w) => w.times >= MIN_WORD_TIMES);
  const paces = words.filter((w) => w.timed).map((w) => w.msSum / w.timed);
  const typical = paces.length ? median(paces) : null;

  return (
    words
      .map((w) => ({
        word: w.word,
        times: w.times,
        errors: w.errors,
        errorRate: w.errors / w.times,
        slowRatio: typical && w.timed ? w.msSum / w.timed / typical : 1,
      }))
      .filter((w) => w.errorRate >= ERROR_RATE_BAR || w.slowRatio >= SLOW_RATIO_BAR)
      // How far over each bar, on one scale, like the improvement tips
      .map((w) => ({
        ...w,
        score:
          Math.max(0, w.errorRate / ERROR_RATE_BAR) +
          Math.max(0, w.slowRatio / SLOW_RATIO_BAR),
      }))
      .sort((a, b) => b.score - a.score || b.times - a.times)
      .slice(0, limit)
      .map(({ score, ...w }) => w)
  );
};
