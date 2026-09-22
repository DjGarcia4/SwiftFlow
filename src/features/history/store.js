import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getResults,
  saveResult,
  clearResults,
  replaceResults,
} from "@/features/history/resultsRepository";
import { mergeResults } from "@/features/history/utils/historyBackup";
import {
  computeBestWpm,
  computeAverageWpm,
  computeAverageAccuracy,
  computePersonalBests,
  computeDailyStreak,
  computeKeyErrorStats,
  toLocalDayKey,
  RECENT_INSIGHT_SESSIONS,
  isCurrentMetrics,
  METRICS_VERSION,
  INSIGHTS_VERSION,
} from "@/features/history/utils/historyStats";
import { computeAchievements } from "@/features/history/achievements";
import { suggestWeeklyGoal, computeWeekProgress } from "@/features/history/weeklyGoal";
import { loadWeeklyGoal, saveWeeklyGoal } from "@/features/history/weeklyGoalRepository";
import {
  loadKeyReview,
  saveKeyReview,
  clearKeyReview,
} from "@/features/history/keyReviewRepository";
import { computeDrillReadiness } from "@/features/history/utils/drillReadiness";
import {
  applyDrillSession,
  sessionKeyRates,
  reviewForDay,
  listReviewKeys,
} from "@/features/history/utils/keyReview";
import {
  buildDailyChallenges,
  computeChallengeStats,
} from "@/features/history/dailyChallenges";
import {
  loadPerfectRounds,
  savePerfectRounds,
  clearPerfectRounds,
} from "@/features/history/perfectRoundsRepository";
import {
  isPerfectRound,
  perfectRoundKey,
  tallyPerfectRounds,
  mergePerfectTallies,
} from "@/features/history/utils/perfectRounds";
import {
  loadExperience,
  saveExperience,
  clearExperience,
} from "@/features/history/experienceRepository";
import {
  sessionXp,
  computeHistoryXp,
  levelFromXp,
  CHALLENGE_XP,
  FULL_DAY_XP,
  WEEKLY_GOAL_XP,
  REVIEW_XP,
} from "@/features/history/utils/experience";

export const useHistoryStore = defineStore("history", () => {
  const results = ref(getResults());

  // Sessions measured with the current wpm/accuracy formula. Records,
  // averages and the trend use only these so old (inflated) numbers don't
  // mix in; counts, streaks and achievements still use the full history so
  // nothing already earned is lost.
  const currentResults = computed(() => results.value.filter(isCurrentMetrics));

  const sessionsCount = computed(() => results.value.length);
  const bestWpm = computed(() => computeBestWpm(currentResults.value));
  const averageWpm = computed(() => computeAverageWpm(currentResults.value));
  const averageAccuracy = computed(() => computeAverageAccuracy(currentResults.value));
  const personalBests = computed(() => computePersonalBests(currentResults.value));
  const dailyStreak = computed(() => computeDailyStreak(results.value));

  // Weekly goal: the chosen minutes (null = "Auto") and the weeks met
  const weeklyGoalState = ref(loadWeeklyGoal());

  const achievements = computed(() =>
    computeAchievements(results.value, {
      weeksCompleted: weeklyGoalState.value.completedWeeks.length,
    })
  );
  const unlockedAchievementsCount = computed(
    () => achievements.value.filter((a) => a.unlocked).length
  );

  // Perfect rounds per kind of session. Seeded from the history the first
  // time, then kept on its own so it outlives the history's size cap.
  const perfectRounds = ref(loadPerfectRounds() ?? tallyPerfectRounds(results.value));
  savePerfectRounds(perfectRounds.value);

  const perfectRoundsList = computed(() =>
    Object.values(perfectRounds.value).sort((a, b) => b.count - a.count)
  );
  const perfectRoundsTotal = computed(() =>
    perfectRoundsList.value.reduce((sum, entry) => sum + entry.count, 0)
  );

  // The day the challenges are for. Moved on by refreshDay, which the views
  // call when they come back into focus or the clock passes midnight.
  const challengeDay = ref(new Date());
  const dailyChallenges = computed(() =>
    buildDailyChallenges(results.value, challengeDay.value)
  );
  const challengeStats = computed(() => computeChallengeStats(results.value));

  const refreshDay = () => {
    const now = new Date();
    if (now.toDateString() !== challengeDay.value.toDateString()) {
      challengeDay.value = now;
    }
  };

  // "Auto" follows your recent weeks; it reads the same day the challenges
  // do, so both turn over together at midnight.
  const suggestedWeeklyGoal = computed(() =>
    suggestWeeklyGoal(results.value, challengeDay.value)
  );
  const weeklyGoal = computed(
    () => weeklyGoalState.value.goal ?? suggestedWeeklyGoal.value
  );
  const weeklyGoalIsAuto = computed(() => weeklyGoalState.value.goal === null);
  const weekProgress = computed(() =>
    computeWeekProgress(results.value, weeklyGoal.value, challengeDay.value)
  );
  const weeksCompleted = computed(() => weeklyGoalState.value.completedWeeks.length);

  const setWeeklyGoal = (minutes) => {
    weeklyGoalState.value = { ...weeklyGoalState.value, goal: minutes };
    saveWeeklyGoal(weeklyGoalState.value);
  };

  // Letters in spaced review: the schedule, what's due on the challenges'
  // day, and every letter with its next date.
  const keyReview = ref(loadKeyReview());
  const reviewToday = computed(() => reviewForDay(keyReview.value, challengeDay.value));
  const reviewKeys = computed(() => listReviewKeys(keyReview.value, challengeDay.value));

  // Whether a set of letters has been drilled enough for today: today's
  // drill rounds on them against where each letter stood before today.
  const drillReadinessFor = (keys) => {
    const start = new Date(challengeDay.value);
    start.setHours(0, 0, 0, 0);
    const dayKey = toLocalDayKey(start);
    const today = results.value.filter((r) => toLocalDayKey(r.date) === dayKey);
    const before = results.value.filter((r) => Date.parse(r.date) < start.getTime());
    const baselineRates = Object.fromEntries(
      computeKeyErrorStats(before.slice(0, RECENT_INSIGHT_SESSIONS)).map((stat) => [
        stat.key,
        stat.rate,
      ])
    );
    // Results are newest first; the rounds read oldest first
    return computeDrillReadiness({
      keys,
      sessions: [...today].reverse(),
      baselineRates,
    });
  };

  // Running experience total, seeded from the history the first time and
  // kept on its own after that, like the perfect rounds.
  const experience = ref(
    loadExperience() ?? computeHistoryXp(results.value, challengeStats.value)
  );
  saveExperience(experience.value);
  const level = computed(() => levelFromXp(experience.value));

  // Queue of achievements to celebrate with a toast — populated by
  // recordResult when a session crosses a new threshold. The toast
  // component shows newlyUnlocked[0] and calls dismissNewlyUnlocked to
  // advance to the next one.
  const newlyUnlocked = ref([]);

  // entry: { mode, wpm, accuracy, errors, timeElapsed, modeValue }
  // Returns what the results screen wants to know about the session it just
  // saved: whether it was a perfect round (and which one of its kind), and
  // the experience it earned.
  const recordResult = (entry) => {
    refreshDay();
    const levelBefore = level.value.level;
    const unlockedBefore = new Set(
      achievements.value.filter((a) => a.unlocked).map((a) => a.id)
    );
    const challengesDoneBefore = new Set(
      dailyChallenges.value.filter((c) => c.completed).map((c) => c.id)
    );
    const reviewDoneBefore = reviewToday.value.completed;
    // How the drilled letters were doing before this session, for a letter
    // that's being drilled for the first time
    const baselineRates =
      entry.mode === "drill"
        ? Object.fromEntries(
            computeKeyErrorStats(results.value.slice(0, RECENT_INSIGHT_SESSIONS)).map(
              (stat) => [stat.key, stat.rate]
            )
          )
        : {};

    const fullEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      metricsVersion: METRICS_VERSION,
      insightsVersion: INSIGHTS_VERSION,
      ...entry,
    };
    results.value = saveResult(fullEntry);

    let perfectCount = 0;
    if (isPerfectRound(fullEntry)) {
      const key = perfectRoundKey(fullEntry);
      const current = perfectRounds.value[key];
      perfectCount = (current?.count ?? 0) + 1;
      perfectRounds.value = {
        ...perfectRounds.value,
        [key]: {
          mode: fullEntry.mode,
          modeValue: fullEntry.modeValue ?? null,
          count: perfectCount,
        },
      };
      savePerfectRounds(perfectRounds.value);
    }

    // Challenges first: they're what the session was probably aiming at,
    // and an achievement they unlock should come after them, not before.
    const justCompleted = dailyChallenges.value
      .filter((c) => c.completed && !challengesDoneBefore.has(c.id))
      .map((c) => ({
        id: `challenge:${c.id}`,
        category: "challenge",
        icon: c.icon,
        title: c.title,
        kicker: "¡Reto cumplido!",
      }));
    // A drill moves its letters along the review schedule
    let reviewChanges = [];
    if (entry.mode === "drill" && entry.drillKeys?.length) {
      const applied = applyDrillSession(keyReview.value, {
        keys: entry.drillKeys,
        rates: sessionKeyRates(entry),
        baselineRates,
      });
      keyReview.value = applied.schedule;
      reviewChanges = applied.changes;
      saveKeyReview(keyReview.value);
    }
    const completedReview = !reviewDoneBefore && reviewToday.value.completed;
    const reviewToasts = completedReview
      ? [
          {
            id: `review:${challengeDay.value.toDateString()}`,
            category: "challenge",
            icon: "check-badge",
            title: `Repasaste ${reviewToday.value.keys.map((k) => k.toUpperCase()).join(", ")}`,
            kicker: "¡Repaso del día hecho!",
          },
        ]
      : [];

    // A week is written down the first time it reaches the goal, and never
    // again -- more sessions that week don't pay out twice.
    const week = weekProgress.value;
    const completedWeek =
      week.completed && !weeklyGoalState.value.completedWeeks.includes(week.key);
    if (completedWeek) {
      weeklyGoalState.value = {
        ...weeklyGoalState.value,
        completedWeeks: [...weeklyGoalState.value.completedWeeks, week.key],
      };
      saveWeeklyGoal(weeklyGoalState.value);
    }
    const weekToasts = completedWeek
      ? [
          {
            id: `week:${week.key}`,
            category: "time",
            icon: "calendar",
            title: `${week.goal} minutos esta semana`,
            kicker: "¡Meta semanal cumplida!",
          },
        ]
      : [];

    const justUnlocked = achievements.value.filter(
      (a) => a.unlocked && !unlockedBefore.has(a.id)
    );

    // The day turns "redondo" on the session that finishes its last challenge
    const completedFullDay =
      justCompleted.length > 0 && dailyChallenges.value.every((c) => c.completed);
    const xpGained =
      sessionXp(fullEntry) +
      justCompleted.length * CHALLENGE_XP +
      (completedFullDay ? FULL_DAY_XP : 0) +
      (completedWeek ? WEEKLY_GOAL_XP : 0) +
      (completedReview ? REVIEW_XP : 0);
    experience.value += xpGained;
    saveExperience(experience.value);

    // Only the level actually reached gets a toast, even when one session
    // somehow jumps several.
    const levelUps =
      level.value.level > levelBefore
        ? [
            {
              id: `level:${level.value.level}`,
              category: "level",
              icon: level.value.tier.icon,
              rgb: level.value.tier.rgb,
              title: `Nivel ${level.value.level} · ${level.value.title}`,
              kicker: "¡Subiste de nivel!",
            },
          ]
        : [];

    const toasts = [
      ...justCompleted,
      ...reviewToasts,
      ...weekToasts,
      ...levelUps,
      ...justUnlocked,
    ];
    if (toasts.length) newlyUnlocked.value = [...newlyUnlocked.value, ...toasts];

    return {
      perfect: perfectCount > 0,
      perfectCount,
      xpGained,
      leveledUp: levelUps.length > 0,
      reviewChanges,
    };
  };

  const dismissNewlyUnlocked = () => {
    newlyUnlocked.value = newlyUnlocked.value.slice(1);
  };

  // Merges an imported backup in and reports what actually landed, so the
  // view can say "12 sesiones nuevas" rather than a bare "listo".
  const importResults = (incoming) => {
    const before = results.value.length;
    results.value = replaceResults(mergeResults(results.value, incoming));
    perfectRounds.value = mergePerfectTallies(
      perfectRounds.value,
      tallyPerfectRounds(results.value)
    );
    savePerfectRounds(perfectRounds.value);
    // Whichever knows about more, same reasoning as the perfect rounds
    experience.value = Math.max(
      experience.value,
      computeHistoryXp(results.value, challengeStats.value)
    );
    saveExperience(experience.value);
    return { added: results.value.length - before };
  };

  const clearHistory = () => {
    clearResults();
    clearPerfectRounds();
    clearExperience();
    clearKeyReview();
    keyReview.value = {};
    // The goal itself is a preference and stays; the weeks met go with the
    // history they came from.
    weeklyGoalState.value = { ...weeklyGoalState.value, completedWeeks: [] };
    saveWeeklyGoal(weeklyGoalState.value);
    results.value = [];
    perfectRounds.value = {};
    experience.value = 0;
  };

  return {
    results,
    currentResults,
    sessionsCount,
    bestWpm,
    averageWpm,
    averageAccuracy,
    personalBests,
    dailyStreak,
    achievements,
    unlockedAchievementsCount,
    newlyUnlocked,
    experience,
    level,
    reviewToday,
    reviewKeys,
    drillReadinessFor,
    weeklyGoal,
    weeklyGoalIsAuto,
    suggestedWeeklyGoal,
    weekProgress,
    weeksCompleted,
    setWeeklyGoal,
    perfectRoundsList,
    perfectRoundsTotal,
    dailyChallenges,
    challengeStats,
    refreshDay,
    recordResult,
    importResults,
    dismissNewlyUnlocked,
    clearHistory,
  };
});
