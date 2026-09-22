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
  isCurrentMetrics,
  METRICS_VERSION,
  INSIGHTS_VERSION,
} from "@/features/history/utils/historyStats";
import { computeAchievements } from "@/features/history/achievements";
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
  const achievements = computed(() => computeAchievements(results.value));
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
    const justUnlocked = achievements.value.filter(
      (a) => a.unlocked && !unlockedBefore.has(a.id)
    );

    // The day turns "redondo" on the session that finishes its last challenge
    const completedFullDay =
      justCompleted.length > 0 && dailyChallenges.value.every((c) => c.completed);
    const xpGained =
      sessionXp(fullEntry) +
      justCompleted.length * CHALLENGE_XP +
      (completedFullDay ? FULL_DAY_XP : 0);
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
              icon: "level-up",
              title: `Nivel ${level.value.level} · ${level.value.title}`,
              kicker: "¡Subiste de nivel!",
            },
          ]
        : [];

    const toasts = [...justCompleted, ...levelUps, ...justUnlocked];
    if (toasts.length) newlyUnlocked.value = [...newlyUnlocked.value, ...toasts];

    return {
      perfect: perfectCount > 0,
      perfectCount,
      xpGained,
      leveledUp: levelUps.length > 0,
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
