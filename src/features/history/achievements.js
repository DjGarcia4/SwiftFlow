import {
  computeBestWpm,
  computeLongestDailyStreak,
  computeAverageAccuracy,
  computeBestStreak,
  toLocalDayKey,
} from "@/features/history/utils/historyStats";
import { computeChallengeStats } from "@/features/history/dailyChallenges";
import { classics } from "@/features/typing-test/content/classics";
import { courseProgress, LESSONS } from "@/features/course/course";
import { hasTamedKey } from "@/features/history/utils/keyTrends";

// MODES_COUNT stays at 5 even though there are now 6 modes (numbers was
// added later), so nobody loses "Explorador" after having earned it.
// TIME_OPTIONS_COUNT/WORD_OPTIONS_COUNT mirror the store config
// (all typing modes, all time/word-count choices) — hardcoded rather than
// imported, so if those option lists grow these should grow with them.
// CODE_LANGUAGES_COUNT is different: it's a fixed "try N languages" bar for
// the polyglot achievement, deliberately NOT tied to the code content
// bank's actual language count (which can keep growing independently).
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
    id: "tamed_key",
    category: "accuracy",
    icon: "check-badge",
    title: "Tecla domada",
    description: "Bajá a la mitad los errores de una tecla que te costaba",
    check: (ctx) => ctx.hasTamedKey,
  },
  {
    id: "accuracy_avg_95",
    category: "accuracy",
    icon: "check-badge",
    title: "Consistente",
    description: "Mantené un 95% de precisión promedio",
    check: (ctx) => ctx.averageAccuracy >= 95,
  },
  // The demanding modes (strictModes.js): only runs that made it are saved
  {
    id: "sudden_death_1",
    category: "accuracy",
    icon: "heart",
    title: "Una sola vida",
    description: "Completá una partida con muerte súbita",
    check: (ctx) => ctx.suddenDeathCount >= 1,
  },
  {
    id: "sudden_death_long",
    category: "accuracy",
    icon: "heart",
    title: "Intocable",
    description: "Aguantá 60 segundos o 50 palabras con muerte súbita",
    check: (ctx) => ctx.hasLongSuddenDeath,
  },
  {
    id: "must_correct_5",
    category: "accuracy",
    icon: "shield",
    title: "Paciencia",
    description: "Completá 5 partidas con corregir para avanzar",
    check: (ctx) => ctx.mustCorrectCount >= 5,
  },
  {
    id: "min_accuracy_98",
    category: "accuracy",
    icon: "shield",
    title: "Pulso firme",
    description: "Completá una partida exigiéndote un 98% de precisión",
    check: (ctx) => ctx.hasStrictAccuracy98,
  },

  // Reading — the classics, and the rest of the Spanish that isn't loose words
  {
    id: "classics_1",
    category: "reading",
    icon: "book",
    title: "Buen lector",
    description: "Completá un clásico",
    check: (ctx) => ctx.classicsRead >= 1,
  },
  {
    id: "classics_5",
    category: "reading",
    icon: "book",
    title: "Alma de poeta",
    description: "Completá 5 clásicos distintos",
    check: (ctx) => ctx.classicsRead >= 5,
  },
  {
    id: "classics_all",
    category: "reading",
    icon: "book",
    title: "Biblioteca completa",
    description: "Completá todos los clásicos",
    check: (ctx) => ctx.classicsRead >= classics.length,
  },
  {
    id: "dictation_1",
    category: "reading",
    icon: "speaker",
    title: "Buen oído",
    description: "Completá un dictado",
    check: (ctx) => ctx.dictationCount >= 1,
  },
  {
    id: "dictation_10",
    category: "reading",
    icon: "speaker",
    title: "Taquígrafo",
    description: "Completá 10 dictados",
    check: (ctx) => ctx.dictationCount >= 10,
  },
  {
    id: "dictation_clean",
    category: "reading",
    icon: "speaker",
    title: "Oído fino",
    description: "Completá un dictado de 5 frases con 98% de precisión o más",
    check: (ctx) => ctx.hasCleanLongDictation,
  },
  {
    id: "punctuated_words_100",
    category: "reading",
    icon: "document",
    title: "Signos en su lugar",
    description: "Completá 100 palabras con puntuación: mayúsculas, comas, ¿? y ¡!",
    check: (ctx) => ctx.hasPunctuated100,
  },
  {
    id: "focus_10",
    category: "reading",
    icon: "eye",
    title: "En la zona",
    description: "Completá 10 partidas en modo foco",
    check: (ctx) => ctx.focusCount >= 10,
  },

  // Course — learning to type without looking, from zero
  {
    id: "course_1",
    category: "course",
    icon: "academic-cap",
    title: "Primera lección",
    description: "Pasá tu primera lección del curso",
    check: (ctx) => ctx.course.passedCount >= 1,
  },
  {
    id: "course_home_row",
    category: "course",
    icon: "academic-cap",
    title: "Fila del medio",
    description: "Pasá todas las lecciones de la fila del medio",
    check: (ctx) =>
      LESSONS.filter((lesson) => lesson.stage === "home").every(
        (lesson) => ctx.course.stars[lesson.id] > 0
      ),
  },
  {
    id: "course_stars",
    category: "course",
    icon: "star",
    title: "Tres estrellas",
    description: "Sacá tres estrellas en una lección",
    check: (ctx) => Object.values(ctx.course.stars).some((stars) => stars === 3),
  },
  {
    id: "course_complete",
    category: "course",
    icon: "academic-cap",
    title: "Sin mirar",
    description: "Pasá todas las lecciones del curso",
    check: (ctx) => ctx.course.complete,
  },

  // Combo — longest run of correct characters in a single session
  {
    id: "combo_50",
    category: "combo",
    icon: "fire",
    title: "Combo x50",
    description: "Escribí 50 caracteres seguidos sin errores",
    check: (ctx) => ctx.bestStreak >= 50,
  },
  {
    id: "combo_150",
    category: "combo",
    icon: "fire",
    title: "Combo x150",
    description: "Escribí 150 caracteres seguidos sin errores",
    check: (ctx) => ctx.bestStreak >= 150,
  },
  {
    id: "combo_300",
    category: "combo",
    icon: "fire",
    title: "Combo x300",
    description: "Escribí 300 caracteres seguidos sin errores",
    check: (ctx) => ctx.bestStreak >= 300,
  },
  {
    id: "combo_500",
    category: "combo",
    icon: "fire",
    title: "Intocable",
    description: "Escribí 500 caracteres seguidos sin errores",
    check: (ctx) => ctx.bestStreak >= 500,
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
    description: "Completá una sesión en 5 modos distintos",
    check: (ctx) => ctx.modesPlayed >= MODES_COUNT,
  },
  {
    id: "polyglot",
    category: "explorer",
    icon: "code",
    title: "Políglota",
    description: "Probá 3 lenguajes distintos del modo código",
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
    id: "numbers_lover",
    category: "explorer",
    icon: "hashtag",
    title: "Contador",
    description: "Completá 10 sesiones en modo números",
    check: (ctx) => ctx.numbersSessionsCount >= 10,
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

  // Weekly goal — weeks that reached it, whatever the goal was then
  {
    id: "week_goal_1",
    category: "time",
    icon: "calendar",
    title: "Semana cumplida",
    description: "Cumplí tu meta semanal de práctica",
    check: (ctx) => ctx.weeksCompleted >= 1,
  },
  {
    id: "week_goal_4",
    category: "time",
    icon: "calendar",
    title: "Un mes de metas",
    description: "Cumplí tu meta semanal 4 veces",
    check: (ctx) => ctx.weeksCompleted >= 4,
  },
  {
    id: "week_goal_12",
    category: "time",
    icon: "calendar",
    title: "Tres meses de metas",
    description: "Cumplí tu meta semanal 12 veces",
    check: (ctx) => ctx.weeksCompleted >= 12,
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

  // Challenges — the daily ones
  {
    id: "challenge_1",
    category: "challenge",
    icon: "flag",
    title: "Primer reto",
    description: "Cumplí tu primer reto diario",
    check: (ctx) => ctx.completedChallenges >= 1,
  },
  {
    id: "challenge_25",
    category: "challenge",
    icon: "flag",
    title: "Retador",
    description: "Cumplí 25 retos diarios",
    check: (ctx) => ctx.completedChallenges >= 25,
  },
  {
    id: "challenge_100",
    category: "challenge",
    icon: "flag",
    title: "Sin excusas",
    description: "Cumplí 100 retos diarios",
    check: (ctx) => ctx.completedChallenges >= 100,
  },
  {
    id: "challenge_full_day",
    category: "challenge",
    icon: "flag",
    title: "Día redondo",
    description: "Cumplí los 3 retos de un mismo día",
    check: (ctx) => ctx.fullChallengeDays >= 1,
  },
  {
    id: "challenge_full_day_7",
    category: "challenge",
    icon: "flag",
    title: "Siete días redondos",
    description: "Cumplí los 3 retos del día en 7 días distintos",
    check: (ctx) => ctx.fullChallengeDays >= 7,
  },

  // The shared weekly text
  {
    id: "weekly_challenge_1",
    category: "challenge",
    icon: "trophy",
    title: "Reto semanal",
    description: "Jugá el reto semanal, el mismo texto para todos",
    check: (ctx) => ctx.weeklyChallengeWeeks >= 1,
  },
  {
    id: "weekly_challenge_4",
    category: "challenge",
    icon: "trophy",
    title: "Habitué del reto",
    description: "Jugá el reto semanal en 4 semanas distintas",
    check: (ctx) => ctx.weeklyChallengeWeeks >= 4,
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

// extras: stats kept outside the history (see the weekly goal), which the
// results alone can't tell.
export const computeAchievements = (results, { weeksCompleted = 0 } = {}) => {
  const codeResults = results.filter((r) => r.mode === "code");
  const timeResults = results.filter((r) => r.mode === "time");
  const wordsResults = results.filter((r) => r.mode === "words");

  const challengeStats = computeChallengeStats(results);
  const suddenDeathResults = results.filter((r) => r.strict === "sudden-death");

  const context = {
    sessionsCount: results.length,
    completedChallenges: challengeStats.completed,
    fullChallengeDays: challengeStats.fullDays,
    weeksCompleted,
    weeklyChallengeWeeks: new Set(
      results.filter((r) => r.mode === "weekly" && r.modeValue).map((r) => r.modeValue)
    ).size,
    bestWpm: computeBestWpm(results),
    averageAccuracy: computeAverageAccuracy(results),
    bestStreak: computeBestStreak(results),
    numbersSessionsCount: results.filter((r) => r.mode === "numbers").length,
    perfectAccuracyCount: results.filter((r) => r.accuracy === 100).length,
    suddenDeathCount: suddenDeathResults.length,
    hasLongSuddenDeath: suddenDeathResults.some(
      (r) =>
        (r.mode === "time" && r.modeValue >= 60) ||
        (r.mode === "words" && r.modeValue >= 50)
    ),
    hasStrictAccuracy98: results.some((r) => r.minAccuracy >= 98),
    mustCorrectCount: results.filter((r) => r.strict === "must-correct").length,
    // Passages still in the bank: one taken out later doesn't count twice
    classicsRead: new Set(
      results
        .filter(
          (r) => r.mode === "classics" && classics.some((c) => c.id === r.modeValue)
        )
        .map((r) => r.modeValue)
    ).size,
    hasPunctuated100: results.some(
      (r) => r.mode === "words" && r.modeValue >= 100 && r.punctuation
    ),
    focusCount: results.filter((r) => r.focus).length,
    course: courseProgress(results),
    hasTamedKey: hasTamedKey(results),
    dictationCount: results.filter((r) => r.mode === "dictation").length,
    hasCleanLongDictation: results.some(
      (r) => r.mode === "dictation" && r.modeValue >= 5 && r.accuracy >= 98
    ),
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
