// How each finger is doing: the per-key stats folded onto the fingers that
// type those keys on your keyboard -- how often it misses, how fast it is,
// and which way it's heading. What "Tus dedos" draws, and what the finger
// tips and the "tamed finger" achievement read.
import {
  computeKeyErrorStats,
  computeKeyTimingStats,
  RECENT_INSIGHT_SESSIONS,
} from "./historyStats";
import { fingerOfChar } from "@/features/typing-test/utils/keyboardMap";
import { FINGER_IDS } from "@/features/typing-test/content/fingers";

// A finger needs this many keystrokes before its miss rate means anything
export const MIN_FINGER_ATTEMPTS = 50;
// ...and this many timed ones before its speed does
export const MIN_FINGER_TIMING = 40;
// ...and to have missed at least this many times before it's the one to
// work on
export const MIN_FINGER_MISSES = 5;
// It stands out when it's this much worse than your middle finger: the
// same bar as a hand or a row in the tips
export const FINGER_GAP = 1.3;
// Slower than your middle finger by this much. Higher than for keys: the
// pinkies are a bit slower for everyone, and this is about you.
export const SLOW_FINGER_FACTOR = 1.35;

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// The finger that stands out for missing, among ones measured enough
// ({ finger, attempts, misses, rate }), or null: needs four to compare, and
// the worst clearly above your middle finger -- or, when most barely miss
// at all, above the rest of them together, so a clean typist's one bad
// finger still shows. { ...finger, typical, gap }. The card and the tips
// both ask this, so they never disagree about which finger it is.
export const pickWeakestFinger = (measured) => {
  if (measured.length < 4) return null;
  const worst = [...measured].sort((a, b) => b.rate - a.rate)[0];
  const others = measured.filter((f) => f !== worst);
  const pooled =
    others.reduce((sum, f) => sum + f.misses, 0) /
    others.reduce((sum, f) => sum + f.attempts, 0);
  const typical = median(measured.map((f) => f.rate)) || pooled;
  const standsOut = typical > 0 ? worst.rate / typical >= FINGER_GAP : true;
  if (worst.misses < MIN_FINGER_MISSES || !standsOut) return null;
  return { ...worst, typical, gap: typical ? worst.rate / typical : Infinity };
};

const emptyFinger = (finger) => ({
  finger,
  attempts: 0,
  misses: 0,
  timedMs: 0,
  timed: 0,
  keys: new Set(),
});

// Per finger, from key stats: attempts, misses, and timing totals
const foldByFinger = (keyStats, keyTiming, layout) => {
  const fingers = new Map(FINGER_IDS.map((id) => [id, emptyFinger(id)]));
  for (const stat of keyStats) {
    const group = fingers.get(fingerOfChar(stat.key, layout));
    if (!group) continue;
    group.attempts += stat.attempts;
    group.misses += stat.misses;
    if (/^\p{L}$/u.test(stat.key)) group.keys.add(stat.key.toUpperCase());
  }
  for (const stat of keyTiming) {
    const group = fingers.get(fingerOfChar(stat.key, layout));
    if (!group) continue;
    group.timedMs += stat.meanMs * stat.samples;
    group.timed += stat.samples;
  }
  return fingers;
};

// results: the history, most recent first. Every one of the 8 fingers, in
// hand order: { finger, attempts, misses, rate, meanMs, keys, measured,
// timedEnough }, plus which is the weakest and the slowest when one clearly
// is (null otherwise), against your middle finger.
export const computeFingerStats = (results, layout) => {
  const recent = results.slice(0, RECENT_INSIGHT_SESSIONS);
  const folded = foldByFinger(
    computeKeyErrorStats(recent),
    computeKeyTimingStats(recent, { minSamples: 1 }),
    layout
  );

  const fingers = [...folded.values()].map((group) => ({
    finger: group.finger,
    attempts: group.attempts,
    misses: group.misses,
    rate: group.attempts ? group.misses / group.attempts : null,
    meanMs: group.timed ? Math.round(group.timedMs / group.timed) : null,
    keys: [...group.keys].sort((a, b) => a.localeCompare(b, "es")),
    measured: group.attempts >= MIN_FINGER_ATTEMPTS,
    timedEnough: group.timed >= MIN_FINGER_TIMING,
  }));

  // Standing out needs a field to stand out from: four fingers at least
  const measured = fingers.filter((f) => f.measured);
  const weakest = pickWeakestFinger(measured);

  const timed = fingers.filter((f) => f.timedEnough);
  let slowest = null;
  if (timed.length >= 4) {
    const middle = median(timed.map((f) => f.meanMs));
    const worst = [...timed].sort((a, b) => b.meanMs - a.meanMs)[0];
    if (middle > 0 && worst.meanMs / middle >= SLOW_FINGER_FACTOR) {
      slowest = { ...worst, typical: Math.round(middle), ratio: worst.meanMs / middle };
    }
  }

  return { fingers, weakest, slowest, hasData: measured.length > 0 };
};

// Each side of the comparison, like the keys' trend: up to this many
// sessions, and never fewer than MIN_TREND_SESSIONS
const TREND_SESSIONS = 30;
const MIN_TREND_SESSIONS = 10;
const MIN_TREND_ATTEMPTS = 100;
// Moved by at least two points and a quarter of where it was
const MIN_POINTS = 0.02;
const MIN_RELATIVE = 0.25;

// finger -> { before, after, change } for the fingers that clearly moved,
// latest sessions against the ones before them. Null until there's enough.
export const computeFingerTrends = (results, layout) => {
  const measured = results.filter(
    (result) => result.keyAttempts && Object.keys(result.keyAttempts).length
  );
  const size = Math.min(TREND_SESSIONS, Math.floor(measured.length / 2));
  if (size < MIN_TREND_SESSIONS) return null;

  const side = (slice) => foldByFinger(computeKeyErrorStats(slice), [], layout);
  const now = side(measured.slice(0, size));
  const before = side(measured.slice(size, size * 2));

  const trends = {};
  for (const id of FINGER_IDS) {
    const after = now.get(id);
    const earlier = before.get(id);
    if (after.attempts < MIN_TREND_ATTEMPTS || earlier.attempts < MIN_TREND_ATTEMPTS) {
      continue;
    }
    const was = earlier.misses / earlier.attempts;
    const is = after.misses / after.attempts;
    const change = is - was;
    const relative = was ? Math.abs(change) / was : Infinity;
    if (Math.abs(change) < MIN_POINTS || relative < MIN_RELATIVE) continue;
    trends[id] = { before: was, after: is, change };
  }
  return trends;
};

// A finger whose miss rate has at least halved: the "tamed finger"
// achievement
export const hasTamedFinger = (results, layout) =>
  Object.values(computeFingerTrends(results, layout) ?? {}).some(
    (trend) => trend.after <= trend.before / 2
  );
