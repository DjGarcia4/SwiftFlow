// How each key is going: its miss rate over your latest sessions against
// the ones before them, for the keys that clearly moved. Sessions rather
// than dates, so it reads the same whether you play daily or now and then.
import { computeKeyErrorStats } from "./historyStats";

// Each side of the comparison: up to this many sessions, and never fewer
// than MIN_SESSIONS (below that it's one good or bad day, not a trend)
export const TREND_SESSIONS = 30;
const MIN_SESSIONS = 10;
// A key needs this many attempts on each side for its rate to mean anything
const MIN_ATTEMPTS = 40;
// ...and to have moved by at least this much, both ways of measuring it:
// two points, and a quarter of where it was
const MIN_POINTS = 0.02;
const MIN_RELATIVE = 0.25;
const MAX_LISTED = 3;

const byKey = (results) => new Map(computeKeyErrorStats(results).map((s) => [s.key, s]));

// results: the history, most recent first. Null until there's enough of it.
export const computeKeyTrends = (results) => {
  const measured = results.filter(
    (result) => result.keyAttempts && Object.keys(result.keyAttempts).length
  );
  const size = Math.min(TREND_SESSIONS, Math.floor(measured.length / 2));
  if (size < MIN_SESSIONS) return null;

  const now = byKey(measured.slice(0, size));
  const before = byKey(measured.slice(size, size * 2));

  const moved = [];
  for (const [key, after] of now) {
    const earlier = before.get(key);
    if (!earlier || after.attempts < MIN_ATTEMPTS || earlier.attempts < MIN_ATTEMPTS) {
      continue;
    }
    const change = after.rate - earlier.rate;
    const relative = earlier.rate ? Math.abs(change) / earlier.rate : Infinity;
    if (Math.abs(change) < MIN_POINTS || relative < MIN_RELATIVE) continue;
    moved.push({ key, before: earlier.rate, after: after.rate, change });
  }

  // Biggest moves first: the points gained or lost
  const improved = moved
    .filter((trend) => trend.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, MAX_LISTED);
  const worsened = moved
    .filter((trend) => trend.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, MAX_LISTED);

  return { sessions: size, improved, worsened, all: moved };
};

// Whether a key's miss rate has at least halved: the "tamed key" achievement
export const hasTamedKey = (results) =>
  Boolean(
    computeKeyTrends(results)?.all.some((trend) => trend.after <= trend.before / 2)
  );
