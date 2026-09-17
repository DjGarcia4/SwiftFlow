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

  // Queue of achievements to celebrate with a toast — populated by
  // recordResult when a session crosses a new threshold. The toast
  // component shows newlyUnlocked[0] and calls dismissNewlyUnlocked to
  // advance to the next one.
  const newlyUnlocked = ref([]);

  // entry: { mode, wpm, accuracy, errors, timeElapsed, modeValue }
  const recordResult = (entry) => {
    const unlockedBefore = new Set(
      achievements.value.filter((a) => a.unlocked).map((a) => a.id)
    );

    const fullEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      metricsVersion: METRICS_VERSION,
      insightsVersion: INSIGHTS_VERSION,
      ...entry,
    };
    results.value = saveResult(fullEntry);

    const justUnlocked = achievements.value.filter(
      (a) => a.unlocked && !unlockedBefore.has(a.id)
    );
    if (justUnlocked.length) {
      newlyUnlocked.value = [...newlyUnlocked.value, ...justUnlocked];
    }
  };

  const dismissNewlyUnlocked = () => {
    newlyUnlocked.value = newlyUnlocked.value.slice(1);
  };

  // Merges an imported backup in and reports what actually landed, so the
  // view can say "12 sesiones nuevas" rather than a bare "listo".
  const importResults = (incoming) => {
    const before = results.value.length;
    results.value = replaceResults(mergeResults(results.value, incoming));
    return { added: results.value.length - before };
  };

  const clearHistory = () => {
    clearResults();
    results.value = [];
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
    recordResult,
    importResults,
    dismissNewlyUnlocked,
    clearHistory,
  };
});
