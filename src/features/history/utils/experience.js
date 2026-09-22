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
// sessions away, level 10 a couple of weeks of steady practice.
const BASE_LEVEL_XP = 100;
const LEVEL_XP_STEP = 25;

export const xpToNextLevel = (level) => BASE_LEVEL_XP + LEVEL_XP_STEP * (level - 1);

const TITLES = [
  { from: 1, title: "Novato" },
  { from: 5, title: "Aprendiz" },
  { from: 10, title: "Ágil" },
  { from: 15, title: "Veloz" },
  { from: 20, title: "Experto" },
  { from: 30, title: "Maestro" },
  { from: 40, title: "Leyenda" },
];

export const levelTitle = (level) =>
  [...TITLES].reverse().find((tier) => level >= tier.from).title;

export const levelFromXp = (xp) => {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level++;
  }
  const needed = xpToNextLevel(level);
  return {
    level,
    title: levelTitle(level),
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    fraction: remaining / needed,
  };
};
