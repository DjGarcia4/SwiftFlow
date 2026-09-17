<template>
  <div>
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        Actividad
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{ activeDays }} {{ activeDays === 1 ? "día" : "días" }} de
        {{ activity.length }}
      </div>
    </div>

    <!-- Columns are weeks, rows are weekdays, same as every contribution
         grid: the eye reads down a week and across the months -->
    <div class="flex gap-1 overflow-x-auto pb-1">
      <div
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        class="flex flex-col gap-1"
      >
        <template v-for="(day, dayIndex) in week">
          <!-- The days before the window opened: blanks that hold the row
               alignment, so every row stays one weekday all the way across -->
          <div v-if="!day" :key="`pad-${dayIndex}`" class="h-3 w-3"></div>
          <div
            v-else
            :key="day.dayKey"
            class="group relative h-3 w-3 rounded-[0.25rem] animate-pop-in"
            :style="{
              ...dayStyle(day),
              ...staggerStyle(weekIndex, { step: 12, max: 600 }),
            }"
          >
            <div
              class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 rounded-xl bg-night-ink px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              {{ describe(day) }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-end gap-1.5">
      <span class="text-[0.65rem] font-bold text-pencil-gray/70">menos</span>
      <div
        v-for="level in [0, 1, 2, 3, 4]"
        :key="level"
        class="h-3 w-3 rounded-[0.25rem]"
        :style="levelStyle(level)"
      ></div>
      <span class="text-[0.65rem] font-bold text-pencil-gray/70">más</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { staggerStyle } from "@/shared/utils/motion";

const props = defineProps({
  // Output of computeDailyActivity, oldest first
  activity: { type: Array, required: true },
});

const WEEKDAYS = 7;
// Four filled steps plus "nothing", so a five-session day doesn't look the
// same as a one-session day but a twelve-session day doesn't need its own
// shade either.
const MAX_LEVEL = 4;

const activeDays = computed(() => props.activity.filter((d) => d.sessions > 0).length);

// The first column is padded so every row is the same weekday throughout
const weeks = computed(() => {
  const [first] = props.activity;
  const columns = [];
  let current = first ? Array(first.date.getDay()).fill(null) : [];

  for (const day of props.activity) {
    current.push(day);
    if (current.length === WEEKDAYS) {
      columns.push(current);
      current = [];
    }
  }
  if (current.length) columns.push(current);

  return columns;
});

const levelFor = (sessions) => Math.min(sessions, MAX_LEVEL);

const levelStyle = (level) =>
  level === 0
    ? { backgroundColor: "var(--color-faded-gray)" }
    : {
        // 30%..100% of the brand color, so even one session reads as "I was here"
        backgroundColor: `color-mix(in srgb, var(--color-primary) ${
          30 + ((level - 1) / (MAX_LEVEL - 1)) * 70
        }%, transparent)`,
      };

const dayStyle = (day) => levelStyle(levelFor(day.sessions));

const formatDay = (date) =>
  date.toLocaleDateString("es", { day: "numeric", month: "long" });

const describe = (day) =>
  day.sessions
    ? `${day.sessions} ${day.sessions === 1 ? "sesión" : "sesiones"} el ${formatDay(day.date)}`
    : `Nada el ${formatDay(day.date)}`;
</script>
