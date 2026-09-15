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

export const useHistoryStore = defineStore("history", () => {
  const results = ref(getResults());

  const sessionsCount = computed(() => results.value.length);
  const bestWpm = computed(() => computeBestWpm(results.value));
  const averageWpm = computed(() => computeAverageWpm(results.value));
  const averageAccuracy = computed(() => computeAverageAccuracy(results.value));
  const personalBests = computed(() => computePersonalBests(results.value));
  const dailyStreak = computed(() => computeDailyStreak(results.value));

  // entry: { mode, wpm, accuracy, errors, timeElapsed, modeValue }
  const recordResult = (entry) => {
    const fullEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...entry,
    };
    results.value = saveResult(fullEntry);
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
    recordResult,
    clearHistory,
  };
});
