<template>
  <div>
    <div class="flex items-baseline justify-between gap-2 mb-2">
      <div
        class="flex items-center gap-1.5 text-sm font-extrabold"
        :class="week.completed ? 'text-success-dark' : 'text-charcoal'"
      >
        <CheckCircleIcon v-if="week.completed" class="w-4 h-4 animate-pop-in" />
        <CalendarDaysIcon v-else class="w-4 h-4 text-primary" />
        {{
          week.completed ? t("history.weeklyGoal.done") : t("history.weeklyGoal.thisWeek")
        }}
      </div>
      <div class="text-xs font-bold tabular-nums text-pencil-gray">
        <span class="font-extrabold text-charcoal">{{ week.minutes }}</span
        >/{{ week.goal }}
        min
      </div>
    </div>

    <div class="h-2.5 rounded-full bg-faded-gray/40 overflow-hidden mb-3">
      <div
        class="h-full rounded-full transition-[width] duration-700 ease-smooth"
        :class="week.completed ? 'bg-success' : 'bg-primary'"
        :style="{ width: `${week.fraction * 100}%` }"
      ></div>
    </div>

    <!-- One column per day, filled against the goal's daily share -->
    <div class="grid grid-cols-7 gap-1.5">
      <div
        v-for="(day, index) in week.days"
        :key="index"
        class="flex flex-col items-center gap-1"
        :title="`${day.minutes} min`"
      >
        <div
          class="relative w-full rounded-md bg-faded-gray/30 overflow-hidden"
          :class="compact ? 'h-6' : 'h-10'"
        >
          <div
            class="absolute inset-x-0 bottom-0 rounded-md transition-[height] duration-700 ease-smooth"
            :class="day.fraction >= 1 ? 'bg-success' : 'bg-primary/80'"
            :style="{ height: `${day.fraction * 100}%` }"
          ></div>
        </div>
        <span
          class="text-[10px] font-bold"
          :class="
            day.isToday
              ? 'text-primary'
              : day.isFuture
                ? 'text-pencil-gray/50'
                : 'text-pencil-gray'
          "
          >{{ t("history.weeklyGoal.days")[index] }}</span
        >
      </div>
    </div>

    <!-- Choosing the goal: Auto follows your recent weeks -->
    <div v-if="editable" class="mt-4 flex flex-wrap items-center gap-1.5">
      <span class="text-xs font-bold text-pencil-gray mr-1">{{
        t("history.weeklyGoal.goal")
      }}</span>
      <IconButton
        :variant="historyStore.weeklyGoalIsAuto ? 'primary' : 'secondary'"
        size="xs"
        :text="`Auto (${historyStore.suggestedWeeklyGoal})`"
        @click="historyStore.setWeeklyGoal(null)"
      />
      <IconButton
        v-for="option in WEEKLY_GOAL_OPTIONS"
        :key="option"
        :variant="
          !historyStore.weeklyGoalIsAuto && historyStore.weeklyGoal === option
            ? 'primary'
            : 'secondary'
        "
        size="xs"
        :text="`${option} min`"
        @click="historyStore.setWeeklyGoal(option)"
      />
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { CalendarDaysIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";
import IconButton from "@/shared/components/IconButton.vue";
import { useHistoryStore } from "@/features/history/store";
import { WEEKLY_GOAL_OPTIONS } from "@/features/history/weeklyGoal";

defineProps({
  // Shorter day bars, for the challenges popover
  compact: { type: Boolean, default: false },
  // Shows the goal picker
  editable: { type: Boolean, default: false },
});

const historyStore = useHistoryStore();
const week = computed(() => historyStore.weekProgress);
</script>
