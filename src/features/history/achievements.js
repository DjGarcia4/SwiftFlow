import {
  computeBestWpm,
  computeLongestDailyStreak,
} from "@/features/history/utils/historyStats";

// How many distinct code languages / typing-test modes exist right now —
// mirrors the content bank / store config. Hardcoded like this rather than
// imported, same pragmatic tradeoff as elsewhere in this feature: if the
// content bank grows, these thresholds should grow with it.
const CODE_LANGUAGES_COUNT = 3;
const MODES_COUNT = 5;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The full catalog: each entry is pure data plus a check() against a
// derived-stats context, so unlock status is always computed fresh from
// history — no separate "unlocked" state to persist or get out of sync.
// `category` groups achievements for a shared color; `icon` is a string key
// (mapped to an actual icon component in the view) so this file stays
// framework-agnostic.
export const ACHIEVEMENTS = [
  // Sessions — sticking with it
  {
    id: "first_session",
    category: "sessions",
    icon: "trophy",
    title: "Primer paso",
    description: "Completá tu primera sesión",
    check: (ctx) => ctx.sessionsCount >= 1,
  },
  {
    id: "sessions_10",
    category: "sessions",
    icon: "trophy",
    title: "Constancia",
    description: "Completá 10 sesiones",
    check: (ctx) => ctx.sessionsCount >= 10,
  },
  {
    id: "sessions_50",
    category: "sessions",
    icon: "trophy",
    title: "Veterano",
    description: "Completá 50 sesiones",
    check: (ctx) => ctx.sessionsCount >= 50,
  },
  {
    id: "sessions_100",
    category: "sessions",
    icon: "trophy",
    title: "Centurión",
    description: "Completá 100 sesiones",
    check: (ctx) => ctx.sessionsCount >= 100,
  },

  // Speed — raw wpm
  {
    id: "wpm_40",
    category: "speed",
    icon: "bolt",
    title: "40 WPM",
    description: "Alcanzá 40 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 40,
  },
  {
    id: "wpm_60",
    category: "speed",
    icon: "bolt",
    title: "60 WPM",
    description: "Alcanzá 60 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 60,
  },
  {
    id: "wpm_80",
    category: "speed",
    icon: "bolt",
    title: "80 WPM",
    description: "Alcanzá 80 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 80,
  },
  {
    id: "wpm_100",
    category: "speed",
    icon: "bolt",
    title: "Club de los 100",
    description: "Alcanzá 100 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 100,
  },
  {
    id: "wpm_120",
    category: "speed",
    icon: "rocket",
    title: "Velocista",
    description: "Alcanzá 120 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 120,
  },

  // Accuracy — clean sessions
  {
    id: "accuracy_100",
    category: "accuracy",
    icon: "check-badge",
    title: "Precisión perfecta",
    description: "Completá una sesión con 100% de precisión",
    check: (ctx) => ctx.perfectAccuracyCount >= 1,
  },
  {
    id: "accuracy_100_x5",
    category: "accuracy",
    icon: "check-badge",
    title: "Cirujano",
    description: "Completá 5 sesiones con 100% de precisión",
    check: (ctx) => ctx.perfectAccuracyCount >= 5,
  },

  // Streak — the longest run ever, not just the current one
  {
    id: "streak_3",
    category: "streak",
    icon: "fire",
    title: "Racha de 3 días",
    description: "Practicá 3 días seguidos",
    check: (ctx) => ctx.longestStreak >= 3,
  },
  {
    id: "streak_7",
    category: "streak",
    icon: "fire",
    title: "Una semana entera",
    description: "Practicá 7 días seguidos",
    check: (ctx) => ctx.longestStreak >= 7,
  },
  {
    id: "streak_30",
    category: "streak",
    icon: "fire",
    title: "Un mes completo",
    description: "Practicá 30 días seguidos",
    check: (ctx) => ctx.longestStreak >= 30,
  },
  {
    id: "streak_100",
    category: "streak",
    icon: "fire",
    title: "Leyenda",
    description: "Practicá 100 días seguidos",
    check: (ctx) => ctx.longestStreak >= 100,
  },

  // Explorer — trying everything the app offers
  {
    id: "explorer",
    category: "explorer",
    icon: "map",
    title: "Explorador",
    description: "Completá una sesión en cada modo",
    check: (ctx) => ctx.modesPlayed >= MODES_COUNT,
  },
  {
    id: "polyglot",
    category: "explorer",
    icon: "code",
    title: "Políglota",
    description: "Probá los tres lenguajes del modo código",
    check: (ctx) => ctx.codeLanguagesPlayed >= CODE_LANGUAGES_COUNT,
  },
  {
    id: "quote_lover",
    category: "explorer",
    icon: "chat",
    title: "Bibliófilo",
    description: "Completá 15 sesiones en modo cita",
    check: (ctx) => ctx.quoteSessionsCount >= 15,
  },

  // Time — total practice time across every session
  {
    id: "time_10min",
    category: "time",
    icon: "clock",
    title: "Calentando motores",
    description: "Practicá 10 minutos en total",
    check: (ctx) => ctx.totalTimeElapsed >= 10 * 60,
  },
  {
    id: "time_1h",
    category: "time",
    icon: "clock",
    title: "Una hora de práctica",
    description: "Practicá 1 hora en total",
    check: (ctx) => ctx.totalTimeElapsed >= 60 * 60,
  },
  {
    id: "time_5h",
    category: "time",
    icon: "clock",
    title: "Maratonista",
    description: "Practicá 5 horas en total",
    check: (ctx) => ctx.totalTimeElapsed >= 5 * 60 * 60,
  },

  // Zen — a single long, uninterrupted session
  {
    id: "zen_marathon",
    category: "zen",
    icon: "sparkles",
    title: "Meditación activa",
    description: "Completá 3 minutos seguidos en modo zen",
    check: (ctx) => ctx.hasZenMarathon,
  },

  // Special — playful, tied to when you show up
  {
    id: "night_owl",
    category: "special",
    icon: "moon",
    title: "Búho nocturno",
    description: "Completá una sesión entre medianoche y las 5am",
    check: (ctx) => ctx.hasNightSession,
  },
  {
    id: "early_bird",
    category: "special",
    icon: "sun",
    title: "Madrugador",
    description: "Completá una sesión entre las 5am y las 7am",
    check: (ctx) => ctx.hasEarlyBirdSession,
  },
  {
    id: "comeback",
    category: "special",
    icon: "star",
    title: "El regreso",
    description: "Volvé a practicar tras una semana de ausencia",
    check: (ctx) => ctx.hasComeback,
  },
];

const hasComebackGap = (results, minGapDays = 7) => {
  if (results.length < 2) return false;

  const sorted = [...results].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 1; i < sorted.length; i++) {
    const gapMs = new Date(sorted[i].date) - new Date(sorted[i - 1].date);
    if (gapMs >= minGapDays * MS_PER_DAY) return true;
  }
  return false;
};

const hourOf = (isoDate) => new Date(isoDate).getHours();

export const computeAchievements = (results) => {
  const context = {
    sessionsCount: results.length,
    bestWpm: computeBestWpm(results),
    perfectAccuracyCount: results.filter((r) => r.accuracy === 100).length,
    longestStreak: computeLongestDailyStreak(results),
    modesPlayed: new Set(results.map((r) => r.mode)).size,
    codeLanguagesPlayed: new Set(
      results.filter((r) => r.mode === "code" && r.modeValue).map((r) => r.modeValue)
    ).size,
    quoteSessionsCount: results.filter((r) => r.mode === "quote").length,
    totalTimeElapsed: results.reduce((sum, r) => sum + (r.timeElapsed || 0), 0),
    hasZenMarathon: results.some((r) => r.mode === "zen" && r.timeElapsed >= 180),
    hasNightSession: results.some((r) => hourOf(r.date) >= 0 && hourOf(r.date) < 5),
    hasEarlyBirdSession: results.some((r) => hourOf(r.date) >= 5 && hourOf(r.date) < 7),
    hasComeback: hasComebackGap(results),
  };

  return ACHIEVEMENTS.map((achievement) => ({
    id: achievement.id,
    category: achievement.category,
    icon: achievement.icon,
    title: achievement.title,
    description: achievement.description,
    unlocked: achievement.check(context),
  }));
};
