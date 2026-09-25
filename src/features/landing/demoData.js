// Made-up but believable data for the landing's demos: the app's own
// components, fed what a few weeks of practice would give them. Seeded,
// so the page looks the same on every visit.
import { randomFrom } from "@/shared/utils/seededRandom";
import { computeDailyActivity } from "@/features/history/utils/historyStats";
import { DAY_PARTS } from "@/features/history/utils/timeOfDay";

// Per-key error rates for the keyboard heatmap: a typist who slips on
// the R, the Ñ and the Q, and is solid on the home row
const MISS_RATES = {
  r: 0.14,
  ñ: 0.22,
  q: 0.18,
  t: 0.08,
  p: 0.07,
  z: 0.12,
  x: 0.1,
  b: 0.06,
  v: 0.05,
  m: 0.04,
};
export const demoKeyStats = [..."1234567890qwertyuiopasdfghjklñzxcvbnm,.-"]
  .map((key) => {
    const attempts = 120;
    const rate = MISS_RATES[key] ?? 0.02;
    return { key, attempts, misses: Math.round(attempts * rate), rate };
  })
  .sort((a, b) => b.misses - a.misses);

// The slowest keys and transitions, in the shape of computeKeyTimingStats
export const demoKeyTiming = [
  { key: "ñ", meanMs: 268, samples: 90, ratio: 1.72 },
  { key: "q", meanMs: 241, samples: 80, ratio: 1.55 },
  { key: "z", meanMs: 219, samples: 75, ratio: 1.41 },
  { key: "x", meanMs: 205, samples: 60, ratio: 1.32 },
  { key: "p", meanMs: 188, samples: 140, ratio: 1.21 },
];
export const demoBigramTiming = [
  { pair: "ue", meanMs: 244, samples: 60, ratio: 1.8 },
  { pair: "ct", meanMs: 226, samples: 40, ratio: 1.66 },
  { pair: "ñ ", meanMs: 214, samples: 35, ratio: 1.57 },
  { pair: "rr", meanMs: 198, samples: 45, ratio: 1.45 },
];

// A 30-second session climbing to its pace, with a couple of mistakes
export const demoWpmHistory = [
  18, 31, 38, 44, 47, 49, 46, 51, 53, 55, 54, 57, 56, 58, 60, 59, 61, 60, 62, 61, 63, 62,
  64, 63, 62, 64, 65, 64, 66, 65,
].map((wpm, i) => ({
  time: i + 1,
  wpm,
  errors: [6, 17].filter((e) => e <= i + 1).length,
}));

// A year of practice: most days in the last few months, fewer before
export const demoActivity = (() => {
  const random = randomFrom("landing:activity");
  const results = [];
  const now = Date.now();
  for (let day = 0; day < 365; day++) {
    const odds = day < 90 ? 0.8 : day < 200 ? 0.45 : 0.2;
    if (random() > odds) continue;
    const sessions = 1 + Math.floor(random() * 5);
    for (let i = 0; i < sessions; i++) {
      results.push({ date: new Date(now - day * 86400e3).toISOString() });
    }
  }
  return computeDailyActivity(results, { days: 365 });
})();

// Faster in the morning, slower at night, in computeTimeOfDay's shape
const RELATIVE = { dawn: null, morning: 1.11, afternoon: 1.01, night: 0.92 };
const parts = DAY_PARTS.map((part) => ({
  ...part,
  sessions: RELATIVE[part.id] ? 12 : 0,
  relative: RELATIVE[part.id],
  enough: Boolean(RELATIVE[part.id]),
}));
export const demoTimeOfDay = {
  enoughData: true,
  parts,
  best: parts.find((p) => p.id === "morning"),
  worst: parts.find((p) => p.id === "night"),
};

// "¿Dónde te frenaste?": a sentence, word by word, by how long each took
export const demoReplay = [
  ["la", "normal"],
  ["práctica", "slow"],
  ["constante", "normal"],
  ["es", "fast"],
  ["lo", "fast"],
  ["que", "normal"],
  ["realmente", "stuck"],
  ["cambia", "normal"],
  ["tu", "fast"],
  ["velocidad", "slow"],
];

export const demoProblemWords = [
  { word: "desarrollo", reason: "5 de 7 con error" },
  { word: "exactamente", reason: "62% más lenta" },
  { word: "siguiente", reason: "4 de 6 con error" },
];

// "Cómo van tus teclas": a few keys that clearly moved, both ways
export const demoKeyTrends = {
  sessions: 30,
  improved: [
    { key: "ñ", before: 0.12, after: 0.04, change: -0.08 },
    { key: "q", before: 0.09, after: 0.05, change: -0.04 },
    { key: "b", before: 0.07, after: 0.03, change: -0.04 },
  ],
  worsened: [{ key: "v", before: 0.03, after: 0.06, change: 0.03 }],
  all: [],
};
