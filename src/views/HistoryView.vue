<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-charcoal mb-6">
      Historial
    </h1>

    <div
      v-if="historyStore.sessionsCount === 0"
      class="bg-paper-white rounded-card p-8 border-2 border-faded-gray text-center text-pencil-gray"
    >
      Todavía no completaste ningún test.
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div
          class="bg-gradient-to-br from-primary-tint to-primary/10 rounded-card p-4 sm:p-6 border-2 border-primary text-center shadow-sm shadow-primary/20"
        >
          <div
            class="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-display font-extrabold text-primary-dark mb-1"
          >
            <FireIcon v-if="historyStore.dailyStreak > 0" class="w-5 h-5 sm:w-6 sm:h-6" />
            {{ historyStore.dailyStreak }}
          </div>
          <div
            class="text-xs sm:text-sm text-primary-dark font-bold uppercase tracking-wide"
          >
            Racha
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            {{ historyStore.sessionsCount }}
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Sesiones
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div class="text-2xl sm:text-3xl font-display font-extrabold text-success mb-1">
            {{ historyStore.bestWpm }}
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Mejor WPM
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            {{ historyStore.averageWpm }}
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            WPM promedio
          </div>
        </div>
        <div
          class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray text-center"
        >
          <div
            class="text-2xl sm:text-3xl font-display font-extrabold text-charcoal mb-1"
          >
            {{ historyStore.averageAccuracy }}%
          </div>
          <div
            class="text-xs sm:text-sm text-pencil-gray font-bold uppercase tracking-wide"
          >
            Precisión promedio
          </div>
        </div>
      </div>

      <!-- Trend -->
      <div
        v-if="trendValues.length >= 2"
        class="bg-paper-white rounded-card p-4 sm:p-6 border-2 border-faded-gray mb-6"
      >
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Tendencia de WPM
        </div>
        <TrendSparkline :values="trendValues" />
      </div>

      <!-- Personal bests -->
      <div v-if="historyStore.personalBests.length" class="mb-6">
        <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray mb-2">
          Récords personales
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="best in historyStore.personalBests"
            :key="`${best.mode}:${best.modeValue}`"
            class="bg-paper-white rounded-card px-4 py-3 border-2 border-faded-gray flex items-center gap-3"
          >
            <div class="font-display font-extrabold text-success text-lg">
              {{ best.wpm }}
            </div>
            <div class="text-xs text-pencil-gray font-bold">
              {{ formatModeLabel(best) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sessions list -->
      <div class="space-y-2 mb-6">
        <div
          v-for="result in historyStore.results"
          :key="result.id"
          class="bg-paper-white rounded-card p-3 sm:p-4 border-2 border-faded-gray flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <div class="font-bold text-charcoal truncate">
              {{ formatModeLabel(result) }}
            </div>
            <div class="text-xs text-pencil-gray">{{ formatDate(result.date) }}</div>
          </div>
          <div class="flex items-center gap-4 flex-shrink-0 text-right">
            <div>
              <div class="font-display font-extrabold text-success">{{ result.wpm }}</div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">wpm</div>
            </div>
            <div>
              <div class="font-display font-extrabold text-charcoal">
                {{ result.accuracy }}%
              </div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">
                precisión
              </div>
            </div>
            <div>
              <div class="font-display font-extrabold text-charcoal">
                {{ result.errors }}
              </div>
              <div class="text-[10px] text-pencil-gray uppercase font-bold">errores</div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <ButtonCustom
          :text="confirmingClear ? '¿Confirmar borrado?' : 'Borrar historial'"
          variant="secondary"
          size="sm"
          @click="handleClearClick"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { FireIcon } from "@heroicons/vue/24/outline";
import ButtonCustom from "@/shared/components/ButtonCustom.vue";
import TrendSparkline from "@/features/history/components/TrendSparkline.vue";
import { useHistoryStore } from "@/features/history/store";
import { formatModeLabel as formatModeLabelUtil } from "@/features/history/utils/historyStats";

const historyStore = useHistoryStore();

// Trend chart reads chronologically (oldest -> newest); results are stored
// most-recent-first, so reverse the last 30 sessions.
const TREND_SESSIONS = 30;
const trendValues = computed(() =>
  historyStore.results
    .slice(0, TREND_SESSIONS)
    .map((r) => r.wpm)
    .reverse()
);

const formatModeLabel = (result) => formatModeLabelUtil(result);

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });

// Two-step confirmation: the button asks to confirm, then reverts on its
// own after a few seconds if the user doesn't click again.
const confirmingClear = ref(false);
let confirmTimeout = null;

const handleClearClick = () => {
  if (!confirmingClear.value) {
    confirmingClear.value = true;
    confirmTimeout = setTimeout(() => {
      confirmingClear.value = false;
    }, 3000);
    return;
  }

  clearTimeout(confirmTimeout);
  confirmingClear.value = false;
  historyStore.clearHistory();
};

onUnmounted(() => {
  clearTimeout(confirmTimeout);
});
</script>
