// The in-session version of the history's "qué mejorar": which letters are
// getting away from you *in this session*, soon enough to act on it. Works
// on one session's counters, so its bars are far lower than the history's
// -- and far stricter about the gap to your own average, since a handful of
// keystrokes is mostly noise.
import { t } from "@/shared/i18n";

// Not before this many keystrokes: the first line is warm-up.
const MIN_SESSION_KEYSTROKES = 40;
const MIN_KEY_MISSES = 3;
// A letter has to be missed often in absolute terms...
const MIN_KEY_RATE = 0.15;
// ...and clearly more often than everything else this session.
const WEAK_FACTOR = 2;
const MAX_KEYS = 3;
// The wrong key only gets named when it's a habit, not a one-off.
const MIN_CONFUSION_SLIPS = 2;

const isLetter = (key) => /^\p{L}$/u.test(key);

// Case-folded, the way the drill and the history both see keys: "A" and "a"
// are one key on the keyboard.
const foldCounts = (counts) => {
  const folded = {};
  for (const [key, count] of Object.entries(counts ?? {})) {
    const lower = key.toLowerCase();
    folded[lower] = (folded[lower] || 0) + count;
  }
  return folded;
};

// { keyAttempts, missedKeys, confusions } straight off the typing store.
// Returns null until a pattern stands out, otherwise the letters to drill
// plus the words to say about them.
export const computeLiveCoach = ({ keyAttempts, missedKeys, confusions } = {}) => {
  const attempts = foldCounts(keyAttempts);
  const misses = foldCounts(missedKeys);

  const totalAttempts = Object.values(attempts).reduce((sum, n) => sum + n, 0);
  const totalMisses = Object.values(misses).reduce((sum, n) => sum + n, 0);
  if (totalAttempts < MIN_SESSION_KEYSTROKES || !totalMisses) return null;
  const overallRate = totalMisses / totalAttempts;

  const weak = Object.entries(misses)
    .filter(([key]) => isLetter(key))
    .map(([key, missed]) => ({ key, misses: missed, attempts: attempts[key] || missed }))
    .map((stat) => ({ ...stat, rate: stat.misses / stat.attempts }))
    .filter(
      (stat) =>
        stat.misses >= MIN_KEY_MISSES &&
        stat.rate >= MIN_KEY_RATE &&
        stat.rate >= overallRate * WEAK_FACTOR
    )
    // Ranked by what they cost over your own average, same as the history
    .sort(
      (a, b) =>
        b.misses - b.attempts * overallRate - (a.misses - a.attempts * overallRate)
    )
    .slice(0, MAX_KEYS);

  if (!weak.length) return null;

  const worst = weak[0];
  const labels = weak.map((stat) => stat.key.toUpperCase());

  // What the worst key turns into most often, if it keeps being the same one
  let slip = null;
  for (const [pair, count] of Object.entries(confusions ?? {})) {
    const [expected, typed] = [...pair];
    if (expected?.toLowerCase() !== worst.key || !typed) continue;
    if (count >= MIN_CONFUSION_SLIPS && (!slip || count > slip.count)) {
      slip = { typed, count };
    }
  }

  const slipText = slip
    ? t(
        "typing.liveCoach.slip",
        slip.count,
        slip.typed === " " ? " " : slip.typed.toUpperCase()
      )
    : "";

  return {
    keys: weak.map((stat) => stat.key),
    title: t("typing.liveCoach.slipping", labels),
    detail: t(
      "typing.liveCoach.missedTimes",
      labels[0],
      worst.misses,
      worst.attempts,
      slipText
    ),
  };
};
