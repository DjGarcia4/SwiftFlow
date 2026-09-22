import { isPerfectRound, MIN_PERFECT_KEYSTROKES } from "./perfectRounds";

// Experience: one number that everything else feeds into -- showing up,
// typing a lot, typing cleanly, and doing the day's challenges -- and the
// levels it buys. Pure functions; the store keeps the running total.

// Showing up is worth something on its own, but not for a session too
// short to be one (a zen run ended after a word, say).
export const SESSION_XP = 10;
// Volume: one point per this many correct keystrokes
export const KEYSTROKES_PER_XP = 10;
export const PERFECT_ROUND_XP = 25;
export const CHALLENGE_XP = 30;
// On top of the three challenges' own XP
export const FULL_DAY_XP = 100;
export const WEEKLY_GOAL_XP = 150;

// What a single session earns by itself. Challenges are counted apart,
// since whether one got completed depends on the rest of the day.
export const sessionXp = (result) => {
  // Sessions from before per-keystroke tracking only get the flat part
  if (!Number.isFinite(result.keystrokes)) return SESSION_XP;
  if (result.keystrokes < MIN_PERFECT_KEYSTROKES) return 0;

  const correct = Math.max(0, result.keystrokes - (result.errorKeystrokes || 0));
  return (
    SESSION_XP +
    Math.floor(correct / KEYSTROKES_PER_XP) +
    (isPerfectRound(result) ? PERFECT_ROUND_XP : 0)
  );
};

// The whole history's worth, for seeding the stored total the first time
// and for reconciling it after an import. challengeStats: output of
// computeChallengeStats.
export const computeHistoryXp = (results, challengeStats) =>
  results.reduce((sum, result) => sum + sessionXp(result), 0) +
  challengeStats.completed * CHALLENGE_XP +
  challengeStats.fullDays * FULL_DAY_XP;

// Each level costs a bit more than the one before: level 2 is a handful of
// sessions away, level 10 a couple of weeks of steady practice, and the top
// one -- some 34,000 XP -- the better part of a year of it.
const BASE_LEVEL_XP = 100;
const LEVEL_XP_STEP = 25;
export const MAX_LEVEL = 50;

export const xpToNextLevel = (level) => BASE_LEVEL_XP + LEVEL_XP_STEP * (level - 1);

// Total experience it takes to reach a level from nothing
export const totalXpForLevel = (level) => {
  let total = 0;
  for (let n = 1; n < level; n++) total += xpToNextLevel(n);
  return total;
};

// The ranks the levels are grouped into, each with its own look. Pure data:
// `icon` is a string key and `rgb` a color the views turn into styles, the
// same split the achievements use. The ranks get longer as the levels get
// more expensive, and the last one is the top level alone.
export const LEVEL_TIERS = [
  { from: 1, to: 4, title: "Novato", icon: "sparkles", rgb: [100, 116, 139] },
  { from: 5, to: 9, title: "Aprendiz", icon: "academic-cap", rgb: [22, 163, 74] },
  { from: 10, to: 14, title: "Ágil", icon: "bolt", rgb: [8, 145, 178] },
  { from: 15, to: 19, title: "Veloz", icon: "rocket", rgb: [37, 99, 235] },
  { from: 20, to: 29, title: "Experto", icon: "shield", rgb: [124, 58, 237] },
  { from: 30, to: 39, title: "Maestro", icon: "trophy", rgb: [219, 39, 119] },
  { from: 40, to: 49, title: "Leyenda", icon: "fire", rgb: [234, 88, 12] },
  {
    from: MAX_LEVEL,
    to: MAX_LEVEL,
    title: "Dios del teclado",
    icon: "star",
    rgb: [202, 138, 4],
  },
];

export const levelTier = (level) =>
  LEVEL_TIERS.find((tier) => level >= tier.from && level <= tier.to) ??
  LEVEL_TIERS[LEVEL_TIERS.length - 1];

export const levelTitle = (level) => levelTier(level).title;

// Past the top level the experience keeps adding up, it just has nowhere
// left to go: xpForNextLevel is null and the bar stays full.
export const levelFromXp = (xp) => {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  while (level < MAX_LEVEL && remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level++;
  }
  const tier = levelTier(level);
  const isMax = level === MAX_LEVEL;
  const needed = isMax ? null : xpToNextLevel(level);
  return {
    level,
    title: tier.title,
    tier,
    isMax,
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    fraction: isMax ? 1 : remaining / needed,
  };
};

// Every rank with where the given experience stands against it: already
// passed, the one you're in (and how far through it), or still ahead.
export const computeLevelRoadmap = (xp) => {
  const { level } = levelFromXp(xp);
  return LEVEL_TIERS.map((tier) => {
    const xpToReach = totalXpForLevel(tier.from);
    const xpToFinish = tier.to === MAX_LEVEL ? xpToReach : totalXpForLevel(tier.to + 1);
    const state = level > tier.to ? "done" : level >= tier.from ? "current" : "locked";
    return {
      ...tier,
      xpToReach,
      state,
      fraction:
        state === "done"
          ? 1
          : state === "locked"
            ? 0
            : xpToFinish === xpToReach
              ? 1
              : (xp - xpToReach) / (xpToFinish - xpToReach),
    };
  });
};
