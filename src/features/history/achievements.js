import {
  computeBestWpm,
  computeLongestDailyStreak,
  computeAverageAccuracy,
  toLocalDayKey,
} from "@/features/history/utils/historyStats";

// How many distinct code languages / typing-test modes / time-mode options /
// words-mode options exist right now — mirrors the content bank / store
// config. Hardcoded like this rather than imported, same pragmatic tradeoff
// as elsewhere in this feature: if the content bank grows, these
// thresholds should grow with it.
const CODE_LANGUAGES_COUNT = 3;
const MODES_COUNT = 5;
const TIME_OPTIONS_COUNT = 4;
const WORD_OPTIONS_COUNT = 4;

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
    id: "sessions_25",
    category: "sessions",
    icon: "trophy",
    title: "Dedicado",
    description: "Completá 25 sesiones",
    check: (ctx) => ctx.sessionsCount >= 25,
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
  {
    id: "sessions_250",
    category: "sessions",
    icon: "trophy",
    title: "Imparable",
    description: "Completá 250 sesiones",
    check: (ctx) => ctx.sessionsCount >= 250,
  },
  {
    id: "sessions_500",
    category: "sessions",
    icon: "trophy",
    title: "Maestro",
    description: "Completá 500 sesiones",
    check: (ctx) => ctx.sessionsCount >= 500,
  },

  // Speed — raw wpm
  {
    id: "wpm_20",
    category: "speed",
    icon: "bolt",
    title: "Arrancando",
    description: "Alcanzá 20 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 20,
  },
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
  {
    id: "wpm_140",
    category: "speed",
    icon: "rocket",
    title: "Sobrehumano",
    description: "Alcanzá 140 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 140,
  },
  {
    id: "wpm_160",
    category: "speed",
    icon: "rocket",
    title: "Imposible",
    description: "Alcanzá 160 palabras por minuto",
    check: (ctx) => ctx.bestWpm >= 160,
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
  {
    id: "accuracy_100_x20",
    category: "accuracy",
    icon: "check-badge",
    title: "Robot",
    description: "Completá 20 sesiones con 100% de precisión",
    check: (ctx) => ctx.perfectAccuracyCount >= 20,
  },
  {
    id: "accuracy_avg_95",
    category: "accuracy",
    icon: "check-badge",
    title: "Consistente",
    description: "Mantené un 95% de precisión promedio",
    check: (ctx) => ctx.averageAccuracy >= 95,
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
    id: "streak_14",
    category: "streak",
    icon: "fire",
    title: "Dos semanas",
    description: "Practicá 14 días seguidos",
    check: (ctx) => ctx.longestStreak >= 14,
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
  {
    id: "streak_365",
    category: "streak",
    icon: "fire",
    title: "Un año entero",
    description: "Practicá 365 días seguidos",
    check: (ctx) => ctx.longestStreak >= 365,
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
  {
    id: "words_lover",
    category: "explorer",
    icon: "document",
    title: "Amante de las palabras",
    description: "Completá 20 sesiones en modo palabras",
    check: (ctx) => ctx.wordsSessionsCount >= 20,
  },
  {
    id: "time_lover",
    category: "explorer",
    icon: "clock",
    title: "Cronometrista",
    description: "Completá 20 sesiones en modo tiempo",
    check: (ctx) => ctx.timeSessionsCount >= 20,
  },
  {
    id: "all_time_options",
    category: "explorer",
    icon: "clock",
    title: "Todos los tiempos",
    description: "Jugá los 4 tiempos disponibles (15s, 30s, 60s, 120s)",
    check: (ctx) => ctx.timeValuesPlayed >= TIME_OPTIONS_COUNT,
  },
  {
    id: "all_word_options",
    category: "explorer",
    icon: "document",
    title: "Todos los tamaños",
    description: "Jugá las 4 cantidades de palabras disponibles",
    check: (ctx) => ctx.wordValuesPlayed >= WORD_OPTIONS_COUNT,
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
  {
    id: "time_10h",
    category: "time",
    icon: "clock",
    title: "Dedicación total",
    description: "Practicá 10 horas en total",
    check: (ctx) => ctx.totalTimeElapsed >= 10 * 60 * 60,
  },
  {
    id: "time_24h",
    category: "time",
    icon: "clock",
    title: "Un día completo",
    description: "Practicá 24 horas en total",
    check: (ctx) => ctx.totalTimeElapsed >= 24 * 60 * 60,
  },

  // Zen — a single long, uninterrupted session, or just showing up for it
  {
    id: "zen_marathon",
    category: "zen",
    icon: "sparkles",
    title: "Meditación activa",
    description: "Completá 3 minutos seguidos en modo zen",
    check: (ctx) => ctx.hasZenMarathon,
  },
  {
    id: "zen_marathon_10",
    category: "zen",
    icon: "sparkles",
    title: "Trance",
    description: "Completá 10 minutos seguidos en modo zen",
    check: (ctx) => ctx.hasLongZenMarathon,
  },
  {
    id: "zen_sessions_10",
    category: "zen",
    icon: "sparkles",
    title: "Alma zen",
    description: "Completá 10 sesiones en modo zen",
    check: (ctx) => ctx.zenSessionsCount >= 10,
  },

  // Special — playful, tied to when and how you show up
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
    id: "weekend_warrior",
    category: "special",
    icon: "calendar",
    title: "Guerrero de fin de semana",
    description: "Completá una sesión un sábado o domingo",
    check: (ctx) => ctx.hasWeekendSession,
  },
  {
    id: "double_session_day",
    category: "special",
    icon: "bolt",
    title: "Doble sesión",
    description: "Completá 2 sesiones el mismo día",
    check: (ctx) => ctx.maxSessionsPerDay >= 2,
  },
  {
    id: "daily_marathon",
    category: "special",
    icon: "star",
    title: "Maratón diario",
    description: "Completá 5 sesiones el mismo día",
    check: (ctx) => ctx.maxSessionsPerDay >= 5,
  },
  {
    id: "comeback",
    category: "special",
    icon: "star",
    title: "El regreso",
    description: "Volvé a practicar tras una semana de ausencia",
    check: (ctx) => ctx.hasComeback,
  },
  {
    id: "comeback_month",
    category: "special",
    icon: "star",
    title: "El gran regreso",
    description: "Volvé a practicar tras un mes de ausencia",
    check: (ctx) => ctx.hasComebackMonth,
  },
  {
    id: "first_week_anniversary",
    category: "special",
    icon: "gift",
    title: "Una semana con nosotros",
    description: "Tu primera sesión fue hace 7 días o más",
    check: (ctx) => ctx.accountAgeDays >= 7,
  },
  {
    id: "one_month_anniversary",
    category: "special",
    icon: "gift",
    title: "Un mes con nosotros",
    description: "Tu primera sesión fue hace 30 días o más",
    check: (ctx) => ctx.accountAgeDays >= 30,
  },
  {
    id: "one_year_anniversary",
    category: "special",
    icon: "gift",
    title: "Aniversario",
    description: "Tu primera sesión fue hace 365 días o más",
    check: (ctx) => ctx.accountAgeDays >= 365,
  },
];

const hasGapOfAtLeast = (results, minGapDays) => {
  if (results.length < 2) return false;

  const sorted = [...results].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 1; i < sorted.length; i++) {
    const gapMs = new Date(sorted[i].date) - new Date(sorted[i - 1].date);
    if (gapMs >= minGapDays * MS_PER_DAY) return true;
  }
  return false;
};

const maxSessionsPerDay = (results) => {
  if (!results.length) return 0;

  const counts = new Map();
  for (const result of results) {
    const key = toLocalDayKey(result.date);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Math.max(...counts.values());
};

const hourOf = (isoDate) => new Date(isoDate).getHours();

export const computeAchievements = (results) => {
  const codeResults = results.filter((r) => r.mode === "code");
  const timeResults = results.filter((r) => r.mode === "time");
  const wordsResults = results.filter((r) => r.mode === "words");

  const context = {
    sessionsCount: results.length,
    bestWpm: computeBestWpm(results),
    averageAccuracy: computeAverageAccuracy(results),
    perfectAccuracyCount: results.filter((r) => r.accuracy === 100).length,
    longestStreak: computeLongestDailyStreak(results),
    modesPlayed: new Set(results.map((r) => r.mode)).size,
    codeLanguagesPlayed: new Set(
      codeResults.filter((r) => r.modeValue).map((r) => r.modeValue)
    ).size,
    quoteSessionsCount: results.filter((r) => r.mode === "quote").length,
    wordsSessionsCount: wordsResults.length,
    timeSessionsCount: timeResults.length,
    timeValuesPlayed: new Set(timeResults.map((r) => r.modeValue)).size,
    wordValuesPlayed: new Set(wordsResults.map((r) => r.modeValue)).size,
    totalTimeElapsed: results.reduce((sum, r) => sum + (r.timeElapsed || 0), 0),
    hasZenMarathon: results.some((r) => r.mode === "zen" && r.timeElapsed >= 180),
    hasLongZenMarathon: results.some((r) => r.mode === "zen" && r.timeElapsed >= 600),
    zenSessionsCount: results.filter((r) => r.mode === "zen").length,
    hasNightSession: results.some((r) => hourOf(r.date) >= 0 && hourOf(r.date) < 5),
    hasEarlyBirdSession: results.some((r) => hourOf(r.date) >= 5 && hourOf(r.date) < 7),
    hasWeekendSession: results.some((r) => {
      const day = new Date(r.date).getDay();
      return day === 0 || day === 6;
    }),
    maxSessionsPerDay: maxSessionsPerDay(results),
    hasComeback: hasGapOfAtLeast(results, 7),
    hasComebackMonth: hasGapOfAtLeast(results, 30),
    accountAgeDays: results.length
      ? (Date.now() - Math.min(...results.map((r) => new Date(r.date).getTime()))) /
        MS_PER_DAY
      : 0,
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
