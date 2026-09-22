import {
  toLocalDayKey,
  isCurrentMetrics,
  computeAverageWpm,
  computeAverageAccuracy,
  formatModeName,
} from "@/features/history/utils/historyStats";
import { isPerfectRound } from "@/features/history/utils/perfectRounds";
import { hashString, seededRandom } from "@/shared/utils/seededRandom";

// Three small goals a day, derived entirely from the history the same way
// the achievements are: nothing extra to store, and nothing to get out of
// sync. The day's date seeds which three come up, and the sessions from
// *before* that day set how hard they are -- so the list doesn't reshuffle
// or move its targets while you play, and it grows with you.

export const DAILY_CHALLENGES_COUNT = 3;

// How far back "your level" looks when setting a target
const BASELINE_SESSIONS = 20;

const pick = (random, items) => items[Math.floor(random() * items.length)];

const shuffled = (random, items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const computeBaseline = (before) => {
  const recent = before.slice(0, BASELINE_SESSIONS);
  const comparable = recent.filter(isCurrentMetrics);
  const combos = recent.map((r) => r.maxStreak).filter(Number.isFinite);
  return {
    averageWpm: comparable.length ? computeAverageWpm(comparable) : null,
    averageAccuracy: comparable.length ? computeAverageAccuracy(comparable) : null,
    typicalCombo: combos.length ? median(combos) : null,
  };
};

const best = (results, field) =>
  results.reduce((top, r) => Math.max(top, r[field] || 0), 0);

// The modes a "play this one" challenge can send you to. Time is left out:
// it's where most people already spend their sessions.
const CHALLENGE_MODES = ["words", "quote", "code", "numbers", "zen", "drill"];

// Each template turns the baseline into a concrete goal plus a measure of
// how far the day's sessions got toward it. `icon` is a string key, mapped
// to a component by the view, same as the achievements.
const TEMPLATES = [
  {
    kind: "sessions",
    icon: "trophy",
    build: (baseline, random) => {
      const target = pick(random, [3, 4, 5]);
      return {
        title: `Completá ${target} sesiones`,
        target,
        measure: (day) => day.length,
      };
    },
  },
  {
    kind: "minutes",
    icon: "clock",
    build: (baseline, random) => {
      const target = pick(random, [5, 8, 10]);
      return {
        title: `Practicá ${target} minutos`,
        target,
        unit: "min",
        measure: (day) =>
          Math.floor(day.reduce((sum, r) => sum + (r.timeElapsed || 0), 0) / 60),
      };
    },
  },
  {
    kind: "accuracy",
    icon: "check-badge",
    build: ({ averageAccuracy }) => {
      // A step above where you usually land, never an impossible 100
      const bar = averageAccuracy === null ? 95 : clamp(averageAccuracy + 2, 92, 99);
      return {
        title: `Terminá una sesión con ${bar}% de precisión o más`,
        target: 1,
        measure: (day) => (day.some((r) => r.accuracy >= bar) ? 1 : 0),
      };
    },
  },
  {
    kind: "speed",
    icon: "bolt",
    build: ({ averageWpm }, random) => {
      const target = averageWpm
        ? Math.max(15, Math.round(averageWpm * pick(random, [1.05, 1.1])))
        : 30;
      return {
        title: `Llegá a ${target} wpm en una sesión`,
        target,
        unit: "wpm",
        measure: (day) => best(day.filter(isCurrentMetrics), "wpm"),
      };
    },
  },
  {
    kind: "combo",
    icon: "fire",
    build: ({ typicalCombo }) => {
      const target = typicalCombo
        ? clamp(Math.round((typicalCombo * 1.25) / 10) * 10, 30, 400)
        : 50;
      return {
        title: `Hacé un combo de ${target} sin errores`,
        target,
        unit: "combo",
        measure: (day) => best(day, "maxStreak"),
      };
    },
  },
  {
    kind: "perfect",
    icon: "star",
    build: () => ({
      title: "Hacé una ronda perfecta, sin un solo error",
      target: 1,
      measure: (day) => (day.some(isPerfectRound) ? 1 : 0),
    }),
  },
  {
    kind: "mode",
    icon: "map",
    build: (baseline, random) => {
      const mode = pick(random, CHALLENGE_MODES);
      return {
        title: `Completá una partida de ${formatModeName(mode)}`,
        target: 1,
        measure: (day) => (day.some((r) => r.mode === mode) ? 1 : 0),
        action: { mode },
      };
    },
  },
];

const startOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// results: the history, most recent first. day: any moment of the day the
// challenges are for.
export const buildDailyChallenges = (results, day = new Date()) => {
  const start = startOfDay(day).getTime();
  const dayKey = toLocalDayKey(start);
  const played = results.filter((r) => toLocalDayKey(r.date) === dayKey);
  const before = results.filter((r) => Date.parse(r.date) < start);

  const baseline = computeBaseline(before);
  const random = seededRandom(hashString(dayKey));

  return shuffled(random, TEMPLATES)
    .slice(0, DAILY_CHALLENGES_COUNT)
    .map((template) => {
      const { measure, ...challenge } = template.build(baseline, random);
      const value = measure(played);
      return {
        id: `${dayKey}:${template.kind}`,
        kind: template.kind,
        icon: template.icon,
        unit: null,
        action: null,
        ...challenge,
        progress: Math.min(value, challenge.target),
        completed: value >= challenge.target,
      };
    });
};

// Every challenge ever completed, recomputed day by day from the history.
// A "full day" is one where all of that day's challenges got done.
export const computeChallengeStats = (results) => {
  const days = new Map();
  for (const result of results) days.set(toLocalDayKey(result.date), result.date);

  let completed = 0;
  let fullDays = 0;
  for (const date of days.values()) {
    const done = buildDailyChallenges(results, new Date(date)).filter(
      (c) => c.completed
    ).length;
    completed += done;
    if (done === DAILY_CHALLENGES_COUNT) fullDays++;
  }
  return { completed, fullDays };
};

// When the current day's list turns over, for a view that stays open
// through midnight.
export const msUntilNextDay = (now = new Date()) => {
  // setDate rather than adding 24h: a day with a DST change isn't 24h long
  const next = startOfDay(now);
  next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
};
