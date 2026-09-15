import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getResults,
  saveResult,
  clearResults,
} from "@/features/history/resultsRepository";
import {
  computeBestWpm,
  computeAverageWpm,
  computeAverageAccuracy,
  computePersonalBests,
  computeDailyStreak,
} from "@/features/history/utils/historyStats";
import { computeAchievements } from "@/features/history/achievements";

export const useHistoryStore = defineStore("history", () => {
  const results = ref(getResults());

  const sessionsCount = computed(() => results.value.length);
  const bestWpm = computed(() => computeBestWpm(results.value));
  const averageWpm = computed(() => computeAverageWpm(results.value));
  const averageAccuracy = computed(() => computeAverageAccuracy(results.value));
  const personalBests = computed(() => computePersonalBests(results.value));
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

  const clearHistory = () => {
    clearResults();
    results.value = [];
  };

  return {
    results,
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
    dismissNewlyUnlocked,
    clearHistory,
  };
});
