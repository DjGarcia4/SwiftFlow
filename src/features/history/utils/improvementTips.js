import { formatPairLabel } from "./historyStats";
import { t } from "@/shared/i18n";
import { ERROR_RATE_BAR, SLOW_RATIO_BAR } from "./problemWords";
import {
  FINGERS,
  fingerOfChar,
  fingerOfKey,
  keyPosition,
  layoutRows,
} from "@/features/typing-test/utils/keyboardMap";

// Turns the per-key error stats into a short list of concrete, readable
// "work on this" tips. Pure data in, pure data out (icons are string keys),
// so it's easy to test and the view decides how to render it.

// Below this many keystrokes overall, patterns are mostly noise.
export const MIN_TOTAL_ATTEMPTS = 200;
// A key needs this many attempts before its miss rate means anything. In
// Spanish the rare letters (x, q, k, w) only show up a handful of times per
// session, so a low bar here lets "3 de 12" noise hijack every tip.
const MIN_KEY_ATTEMPTS = 60;
// ...and it has to have actually cost something: both in absolute misses and
// as a slice of every mistake made, so a technically-weak key that accounts
// for 1% of the errors doesn't become the headline advice.
const MIN_KEY_MISSES = 8;
const MIN_MISS_SHARE = 0.03;
// Digits are judged as a group, so they clear the bar with fewer attempts.
const MIN_DIGIT_ATTEMPTS = 30;
// "Clearly worse than your average" — not just a hair above it.
const WEAK_FACTOR = 1.25;
// A group (hand/row) only stands out when it's this much worse than the best.
const GROUP_GAP = 1.3;
const MIN_GROUP_ATTEMPTS = 50;
const MAX_TIPS = 4;
// A confusion is a habit, not a spread: the same wrong key has to come up
// again and again, and account for a good slice of that key's mistakes.
// Together these mean the key was missed ~17 times with 6 landing on the
// same neighbour.
const MIN_CONFUSION_SLIPS = 6;
const MIN_CONFUSION_SHARE = 0.35;
// Swapped letters run 10-20% of mistakes for someone who has the habit.
const MIN_TRANSPOSITIONS = 10;
const MIN_TRANSPOSITION_SHARE = 0.1;
// Enough measured intervals overall before saying anything about speed at
// all -- the counterpart of MIN_TOTAL_ATTEMPTS for accuracy.
const MIN_TIMING_TOTAL_SAMPLES = 500;
// 30% over your own middle key. Set above the spread that keyboard geometry
// alone produces (the bottom row runs ~10-15% slower than the home row for
// everyone), so the tip names a personal weakness and not the keyboard.
const SLOW_KEY_FACTOR = 1.3;
// Pairs are measured on fewer samples, so they have to stand out further.
const SLOW_BIGRAM_FACTOR = 1.5;
const MAX_SLOW_KEYS = 2;

const ROW_IDS = ["top", "home", "bottom"];
const isLetterOrDigit = (key) => /^[\p{L}\d]$/u.test(key);

// The keyboard's letter and digit keys by hand, and its three letter rows
// (the numbers row aside), for the layout being typed on
const keyGroups = (layout) => {
  const hands = { left: new Set(), right: new Set() };
  const rows = layoutRows(layout);
  for (const key of rows.flat()) {
    const hand = FINGERS[fingerOfKey(key, layout)]?.hand;
    if (hand && isLetterOrDigit(key)) hands[hand].add(key);
  }
  return {
    hands,
    rows: rows.slice(1).map((keys, index) => ({
      name: t(`history.tips.row.names.${ROW_IDS[index]}`),
      keys: new Set(keys.filter((key) => /^\p{L}$/u.test(key))),
    })),
  };
};
const DIGITS = new Set([..."0123456789"]);
const ACCENTED = new Set([..."áéíóúü"]);

const percent = (rate) => `${Math.round(rate * 100)}%`;

// "1 de cada 5" reads better than "20%" for a single key
const oneIn = (rate) => t("history.tips.oneIn", Math.max(2, Math.round(1 / rate)));

// ...but it reads backwards once the share passes a third, where the clamp
// in oneIn turns 70% into "1 de cada 2".
const outOfTen = (share) => t("history.tips.outOfTen", Math.round(share * 10));

// Whether two keys sit side by side on the same row -- the difference
// between "your finger slid" and "your hand was in the wrong place".
const areNeighbours = (first, second, layout) => {
  const a = keyPosition(first.toLowerCase(), layout);
  const b = keyPosition(second.toLowerCase(), layout);
  return Boolean(a && b) && a.row === b.row && Math.abs(a.column - b.column) === 1;
};

// Misses this key costs above the typist's own average rate. Mixes rate and
// volume: a 25%-rate key typed 60 times (+9 misses) outranks a 30%-rate key
// typed 20 times (+5), which is what "worth practicing" actually means.
const excessMisses = (stat, overallRate) => stat.misses - stat.attempts * overallRate;

// The letters worth practicing: clearly worse than the typist's own average,
// on enough attempts to mean something, ranked by the misses they actually
// cost. Exported because the training mode builds its text from exactly
// these -- one definition, so the advice and the drill can't disagree.
export const selectWeakKeys = (keyStats, { limit = 3 } = {}) => {
  const totalAttempts = keyStats.reduce((sum, s) => sum + s.attempts, 0);
  const totalMisses = keyStats.reduce((sum, s) => sum + s.misses, 0);
  if (!totalAttempts || !totalMisses) return [];
  const overallRate = totalMisses / totalAttempts;

  return keyStats
    .filter(
      (s) =>
        /^\p{L}$/u.test(s.key) &&
        s.attempts >= MIN_KEY_ATTEMPTS &&
        s.misses >= MIN_KEY_MISSES &&
        s.misses / totalMisses >= MIN_MISS_SHARE &&
        s.rate >= overallRate * WEAK_FACTOR
    )
    .sort((a, b) => excessMisses(b, overallRate) - excessMisses(a, overallRate))
    .slice(0, limit);
};

const groupRate = (stats, keySet) => {
  let attempts = 0;
  let misses = 0;
  for (const stat of stats) {
    if (keySet.has(stat.key)) {
      attempts += stat.attempts;
      misses += stat.misses;
    }
  }
  return { attempts, misses, rate: attempts ? misses / attempts : 0 };
};

// keyStats: output of computeKeyErrorStats. averageAccuracy: recent average
// (null when unknown). confusions/transpositions: output of the matching
// historyStats helpers, empty for history recorded before they existed.
export const computeImprovementTips = (
  keyStats,
  {
    averageAccuracy = null,
    confusions = [],
    transpositions = [],
    keyTiming = [],
    bigramTiming = [],
    problemWords = [],
    // The keyboard layout id; the default one when left out
    layout = null,
  } = {}
) => {
  const totalAttempts = keyStats.reduce((sum, s) => sum + s.attempts, 0);
  if (totalAttempts < MIN_TOTAL_ATTEMPTS) return { enoughData: false, tips: [] };

  const totalMisses = keyStats.reduce((sum, s) => sum + s.misses, 0);
  const overallRate = totalMisses / totalAttempts;
  const tips = [];

  // The ranking shown above these tips is sorted by raw misses, which in
  // Spanish mostly means "the letter you type most" (the R). Kept here so the
  // tips can explain that difference instead of seeming to contradict it.
  const topByMisses = [...keyStats].sort((a, b) => b.misses - a.misses)[0];
  const label = (stat) => stat.key.toUpperCase();

  // 1. The specific letters worth practicing. Digits, space and symbols get
  //    their own tips below.
  const weakKeys = selectWeakKeys(keyStats);

  // The strongest confusion, whether or not it ends up with its own tip.
  const topConfusion = confusions.find(
    (c) => c.slips >= MIN_CONFUSION_SLIPS && c.shareOfKeyMisses >= MIN_CONFUSION_SHARE
  );

  if (weakKeys.length) {
    const worst = weakKeys[0];
    // Name the most-missed key when it isn't one of these, so "practicá la X"
    // sitting under a ranking led by the R reads as an explanation rather than
    // a contradiction.
    const contrast =
      topByMisses && !weakKeys.includes(topByMisses) && /^\p{L}$/u.test(topByMisses.key)
        ? t("history.tips.weakKeys.contrast", label(topByMisses))
        : "";

    // A key you confuse is usually a key you miss, so the two tips would
    // sit on top of each other. Folding the confusion into this one costs
    // no slot and reads as one thought instead of two.
    const merged =
      topConfusion && weakKeys.some((s) => s.key === topConfusion.expected)
        ? t(
            "history.tips.weakKeys.merged",
            outOfTen(topConfusion.shareOfKeyMisses),
            topConfusion.typed.toUpperCase()
          )
        : "";

    tips.push({
      id: "weak-keys",
      icon: "target",
      severity: worst.rate / (overallRate * WEAK_FACTOR),
      title: t("history.tips.weakKeys.title", weakKeys.map(label)),
      detail: t(
        "history.tips.weakKeys.detail",
        weakKeys.length,
        label(worst),
        oneIn(worst.rate),
        worst.misses,
        percent(overallRate),
        contrast,
        merged
      ),
      keys: weakKeys.map((s) => s.key),
      action: {
        label: t("history.tips.train"),
        mode: "drill",
        keys: weakKeys.map((s) => s.key),
      },
    });
  }

  // 1b. Accuracy patterns that aren't about a single key: which wrong key
  //     you reach for, and letters coming out in the wrong order. They tell
  //     the same kind of story, so they share one slot.
  const patternCandidates = [];

  if (topConfusion && !weakKeys.some((s) => s.key === topConfusion.expected)) {
    const [from, to] = [
      topConfusion.expected.toUpperCase(),
      topConfusion.typed.toUpperCase(),
    ];
    patternCandidates.push({
      id: "key-confusion",
      icon: "confusion",
      severity: topConfusion.shareOfKeyMisses / MIN_CONFUSION_SHARE,
      title: t("history.tips.confusion.title", from, to),
      detail: t(
        "history.tips.confusion.detail",
        outOfTen(topConfusion.shareOfKeyMisses),
        from,
        to,
        areNeighbours(topConfusion.expected, topConfusion.typed, layout)
      ),
      keys: [topConfusion.expected, topConfusion.typed],
      action: {
        label: t("history.tips.train"),
        mode: "drill",
        keys: [topConfusion.expected, topConfusion.typed],
      },
    });
  }

  const swappedTotal = transpositions.reduce((sum, t) => sum + t.count, 0);
  const swappedShare = totalMisses ? swappedTotal / totalMisses : 0;
  if (swappedTotal >= MIN_TRANSPOSITIONS && swappedShare >= MIN_TRANSPOSITION_SHARE) {
    const worstPair = transpositions[0];
    patternCandidates.push({
      id: "transposition",
      icon: "swap",
      severity: swappedShare / MIN_TRANSPOSITION_SHARE,
      title: t("history.tips.transposition.title"),
      detail: t(
        "history.tips.transposition.detail",
        swappedTotal,
        worstPair.pair,
        worstPair.typedAs
      ),
    });
  }

  if (patternCandidates.length) {
    tips.push(patternCandidates.sort((a, b) => b.severity - a.severity)[0]);
  }

  // 2. Space as the #1 source of mistakes
  const space = keyStats.find((s) => s.key === " ");
  if (space && topByMisses === space && space.misses >= 5) {
    tips.push({
      id: "space",
      icon: "space",
      severity: overallRate ? space.rate / overallRate : 1,
      title: t("history.tips.space.title"),
      detail: t("history.tips.space.detail", space.misses),
      keys: [" "],
    });
  }

  // 3. A hand or a keyboard row that's noticeably weaker — whichever gap is
  //    bigger, so the two don't repeat the same story.
  const groupCandidates = [];

  const groups = keyGroups(layout);
  const left = groupRate(keyStats, groups.hands.left);
  const right = groupRate(keyStats, groups.hands.right);
  if (left.attempts >= MIN_GROUP_ATTEMPTS && right.attempts >= MIN_GROUP_ATTEMPTS) {
    const [worse, better, name] =
      left.rate >= right.rate ? [left, right, "left"] : [right, left, "right"];
    if (better.rate > 0 && worse.rate / better.rate >= GROUP_GAP) {
      groupCandidates.push({
        gap: worse.rate / better.rate,
        tip: {
          id: "hand",
          icon: "hand",
          severity: worse.rate / better.rate / GROUP_GAP,
          title: t("history.tips.hand.title", t(`history.tips.hand.names.${name}`)),
          detail: t(
            "history.tips.hand.detail",
            percent(worse.rate),
            percent(better.rate)
          ),
        },
      });
    }
  }

  const rows = groups.rows
    .map((row) => ({ ...row, ...groupRate(keyStats, row.keys) }))
    .filter((row) => row.attempts >= MIN_GROUP_ATTEMPTS);
  if (rows.length >= 2) {
    const sorted = [...rows].sort((a, b) => b.rate - a.rate);
    const [worst, best] = [sorted[0], sorted[sorted.length - 1]];
    if (best.rate > 0 && worst.rate / best.rate >= GROUP_GAP) {
      groupCandidates.push({
        gap: worst.rate / best.rate,
        tip: {
          id: "row",
          icon: "rows",
          severity: worst.rate / best.rate / GROUP_GAP,
          title: t("history.tips.row.title", worst.name),
          detail: t(
            "history.tips.row.detail",
            percent(worst.rate),
            percent(best.rate),
            best.name
          ),
        },
      });
    }
  }

  // The finger: narrower than a hand or a row, so when one finger is the
  // whole story it names the one to watch. Compared with your middle
  // finger rather than your best, which is often a finger that barely
  // types anything hard.
  const fingers = new Map();
  for (const stat of keyStats) {
    const finger = fingerOfChar(stat.key, layout);
    if (!finger || finger === "thumb") continue;
    const group = fingers.get(finger) ?? {
      finger,
      attempts: 0,
      misses: 0,
      keys: new Set(),
    };
    group.attempts += stat.attempts;
    group.misses += stat.misses;
    if (/^\p{L}$/u.test(stat.key)) group.keys.add(stat.key.toUpperCase());
    fingers.set(finger, group);
  }
  const measuredFingers = [...fingers.values()]
    .filter((group) => group.attempts >= MIN_GROUP_ATTEMPTS)
    .map((group) => ({ ...group, rate: group.misses / group.attempts }));
  if (measuredFingers.length >= 4) {
    const sorted = [...measuredFingers].sort((a, b) => b.rate - a.rate);
    const worst = sorted[0];
    const middle = sorted[Math.floor(sorted.length / 2)];
    if (middle.rate > 0 && worst.rate / middle.rate >= GROUP_GAP) {
      const keys = [...worst.keys].sort((a, b) => a.localeCompare(b, "es")).slice(0, 6);
      groupCandidates.push({
        gap: worst.rate / middle.rate,
        tip: {
          id: "finger",
          icon: "hand",
          severity: worst.rate / middle.rate / GROUP_GAP,
          title: t("history.tips.finger.title", FINGERS[worst.finger].name),
          detail: t(
            "history.tips.finger.detail",
            percent(worst.rate),
            keys,
            percent(middle.rate)
          ),
        },
      });
    }
  }

  if (groupCandidates.length) {
    tips.push(groupCandidates.sort((a, b) => b.gap - a.gap)[0].tip);
  }

  // 3b. Speed patterns: the keys and transitions you hesitate on. These are
  //     invisible to everything above -- hesitating isn't missing -- so they
  //     share a slot of their own.
  const timingSamples = keyTiming.reduce((sum, stat) => sum + stat.samples, 0);
  const speedCandidates = [];

  if (timingSamples >= MIN_TIMING_TOTAL_SAMPLES) {
    // A key that's both slow and error-prone is already covered above, and
    // billing it twice would make "no las errás casi nunca" false. Leaving
    // them out is also what gives this tip its own job: reporting what the
    // accuracy stats can't see.
    const missRateByKey = new Map(keyStats.map((stat) => [stat.key, stat.rate]));
    const slowKeys = keyTiming
      .filter(
        (stat) =>
          stat.ratio >= SLOW_KEY_FACTOR &&
          /^\p{L}$/u.test(stat.key) &&
          (missRateByKey.get(stat.key) ?? 0) < overallRate * WEAK_FACTOR
      )
      .slice(0, MAX_SLOW_KEYS);

    if (slowKeys.length) {
      const worst = slowKeys[0];
      const baseline = Math.round(worst.meanMs / worst.ratio);
      const single = slowKeys.length === 1;
      speedCandidates.push({
        id: "slow-keys",
        icon: "clock",
        severity: worst.ratio / SLOW_KEY_FACTOR,
        title: t(
          "history.tips.slowKeys.title",
          slowKeys.map((s) => s.key.toUpperCase())
        ),
        detail: t(
          "history.tips.slowKeys.detail",
          single,
          percent(worst.ratio - 1),
          worst.meanMs,
          baseline
        ),
        keys: slowKeys.map((stat) => stat.key),
      });
    }

    const slowPairs = bigramTiming
      .filter((stat) => stat.ratio >= SLOW_BIGRAM_FACTOR)
      .slice(0, MAX_SLOW_KEYS);

    if (slowPairs.length) {
      const worst = slowPairs[0];
      const baseline = Math.round(worst.meanMs / worst.ratio);
      speedCandidates.push({
        id: "slow-bigrams",
        icon: "link",
        severity: worst.ratio / SLOW_BIGRAM_FACTOR,
        title: t(
          "history.tips.slowPairs.title",
          slowPairs.map((s) => formatPairLabel(s.pair))
        ),
        detail: t(
          "history.tips.slowPairs.detail",
          formatPairLabel(worst.pair),
          worst.meanMs,
          baseline,
          percent(worst.ratio - 1)
        ),
      });
    }
  }

  if (speedCandidates.length) {
    tips.push(speedCandidates.sort((a, b) => b.severity - a.severity)[0]);
  }

  // 3c. Whole words you stumble on: the fix there is the word itself, not
  //     any one of its letters
  if (problemWords.length) {
    const named = problemWords.slice(0, 3).map((w) => `«${w.word}»`);
    const worst = problemWords[0];
    tips.push({
      id: "problem-words",
      icon: "document",
      severity: Math.max(
        worst.errorRate / ERROR_RATE_BAR,
        worst.slowRatio / SLOW_RATIO_BAR
      ),
      title: t("history.tips.problemWords.title", named),
      detail: t("history.tips.problemWords.detail"),
      action: {
        label: t("history.tips.train"),
        mode: "drill",
        words: problemWords.map((w) => w.word),
      },
    });
  }

  // 4. Numbers and accents: whole skills with their own practice path
  const digits = groupRate(keyStats, DIGITS);
  if (digits.attempts >= MIN_DIGIT_ATTEMPTS && digits.rate >= overallRate * WEAK_FACTOR) {
    tips.push({
      id: "digits",
      icon: "hashtag",
      severity: digits.rate / (overallRate * WEAK_FACTOR),
      title: t("history.tips.digits.title"),
      detail: t("history.tips.digits.detail", percent(digits.rate)),
      action: { label: t("history.tips.digits.action"), mode: "numbers" },
    });
  }

  const accents = groupRate(keyStats, ACCENTED);
  if (accents.attempts >= 10 && accents.rate >= overallRate * WEAK_FACTOR) {
    tips.push({
      id: "accents",
      icon: "language",
      severity: accents.rate / (overallRate * WEAK_FACTOR),
      title: t("history.tips.accents.title"),
      detail: t("history.tips.accents.detail", percent(accents.rate)),
    });
  }

  // 5. The speed/accuracy balance, from recent sessions
  if (averageAccuracy !== null && averageAccuracy < 92) {
    tips.push({
      id: "slow-down",
      icon: "gauge",
      severity: 92 / averageAccuracy,
      title: t("history.tips.slowDown.title"),
      detail: t("history.tips.slowDown.detail", averageAccuracy),
    });
  } else if (averageAccuracy !== null && averageAccuracy >= 97) {
    tips.push({
      id: "speed-up",
      icon: "bolt",
      severity: averageAccuracy / 97,
      title: t("history.tips.speedUp.title"),
      detail: t("history.tips.speedUp.detail", averageAccuracy),
    });
  }

  // More candidates than slots, so keep the ones that hurt most. Every tip
  // scores itself as "how many times over its own threshold am I", which
  // puts things on one scale: a tip that barely qualified never pushes out
  // one that blew past its bar. Ties keep the order they were pushed in,
  // which runs from the most specific advice to the most general.
  const ranked = tips
    .map((tip, index) => ({ tip, index }))
    .sort((a, b) => b.tip.severity - a.tip.severity || a.index - b.index)
    .slice(0, MAX_TIPS)
    .sort((a, b) => a.index - b.index)
    .map(({ tip }) => tip);

  return { enoughData: true, tips: ranked };
};
