import { sessionKeyRates } from "./keyReview";

// When to stop drilling a set of letters for the day. A drill has no end of
// its own -- space just starts another round -- so this is what says "one
// more", "that'll do for today" or "you've stopped improving, rest".

// Each letter aims to come down to this share of the rate it started the
// day with...
const TARGET_FACTOR = 0.6;
// ...but never below this: a handful of misses in a hundred is typing, not
// a weak letter.
const TARGET_FLOOR = 0.05;
// A good last round only counts on enough volume across the day, so a lucky
// short one doesn't end it.
export const MIN_DAY_ATTEMPTS = 40;
// Past this many rounds with no letter getting better, more of the same
// isn't doing anything.
const STALL_ROUNDS = 5;
// And past this many, stop regardless: practice this concentrated stops
// sticking, and the review schedule brings the letters back anyway.
const MAX_ROUNDS = 8;

const targetFor = (baseline) =>
  Math.max(TARGET_FLOOR, Math.round(baseline * TARGET_FACTOR * 100) / 100);

// keys: the drill's letters. sessions: today's drill sessions, oldest
// first (anything else in the list is ignored). baselineRates: each
// letter's rate from before today, for where it started.
export const computeDrillReadiness = ({ keys, sessions, baselineRates = {} }) => {
  const rounds = sessions.filter(
    (s) => s.mode === "drill" && keys.some((key) => s.drillKeys?.includes(key))
  );

  const letters = keys.map((key) => {
    const tries = [];
    let attempts = 0;
    for (const session of rounds) {
      const rate = sessionKeyRates(session)[key];
      if (rate === undefined) continue;
      tries.push(rate);
      for (const [char, count] of Object.entries(session.keyAttempts ?? {})) {
        if (char.toLowerCase() === key) attempts += count;
      }
    }

    const start = baselineRates[key] ?? tries[0] ?? null;
    const target = start === null ? TARGET_FLOOR : targetFor(start);
    const latest = tries.length ? tries[tries.length - 1] : null;
    return {
      key,
      start,
      target,
      latest,
      best: tries.length ? Math.min(...tries) : null,
      attempts,
      ready: latest !== null && latest <= target && attempts >= MIN_DAY_ATTEMPTS,
    };
  });

  const pending = letters.filter((letter) => !letter.ready);
  // "Stalled": none of the pending letters has beaten its best from the
  // rounds before the last two.
  const stalled =
    rounds.length >= STALL_ROUNDS &&
    pending.every((letter) => {
      const rates = rounds
        .map((s) => sessionKeyRates(s)[letter.key])
        .filter((rate) => rate !== undefined);
      const earlier = rates.slice(0, -2);
      const recent = rates.slice(-2);
      return earlier.length > 0 && Math.min(...recent) >= Math.min(...earlier);
    });

  const verdict = !rounds.length
    ? "new"
    : !pending.length
      ? "ready"
      : stalled || rounds.length >= MAX_ROUNDS
        ? "rest"
        : "keep";

  return {
    verdict,
    // Why a "rest": no progress lately, or simply a lot of rounds already
    restReason: verdict === "rest" ? (stalled ? "stalled" : "enough") : null,
    rounds: rounds.length,
    letters,
    pending: pending.map((l) => l.key),
  };
};
