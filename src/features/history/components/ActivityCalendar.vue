<template>
  <div>
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        Actividad
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{ totalSessions }} {{ totalSessions === 1 ? "sesión" : "sesiones" }} en
        {{ activeDays }} {{ activeDays === 1 ? "día" : "días" }}
      </div>
    </div>

    <!-- Columns are weeks, rows are weekdays, same as every contribution
         grid: the eye reads down a week and across the months.
         
         The week columns are grid tracks of minmax(0, 1fr), which is the
         part that matters: a 1fr track can shrink to nothing, so the row is
         exactly its container's width no matter how many weeks it holds.
         Hand-computing a cell size against a container that nests a page
         width, its padding, a border and the card's padding is how this
         ended up scrolling sideways and clipping the first months off the
         left. The only fixed track is the one holding the weekday labels.
         The minimum width below is for phones, where the grid gives up and
         scrolls rather than rendering a year as slivers. -->
    <div class="overflow-x-auto pb-1">
      <div class="w-full min-w-[560px]">
        <!-- Month names sit above the week where that month begins, free to
             overflow their own column: a column is a few pixels wide and no
             month name fits in that. -->
        <div class="grid h-3 gap-[3px]" :style="{ gridTemplateColumns: columnTracks }">
          <div></div>
          <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="relative">
            <span
              v-if="monthLabels[weekIndex]"
              class="absolute left-0 top-0 whitespace-nowrap text-[0.6rem] font-bold uppercase leading-3 text-pencil-gray/70"
            >
              {{ monthLabels[weekIndex] }}
            </span>
          </div>
        </div>

        <div class="mt-1 grid gap-[3px]" :style="{ gridTemplateColumns: columnTracks }">
          <!-- Every other weekday is labelled; naming all seven turns the
               left edge into a wall of text -->
          <!-- Stretches to the grid's height and splits it seven ways, so the
               labels stay on their rows whatever size the cells end up -->
          <div class="flex flex-col gap-[3px] pr-1">
            <div
              v-for="(label, dayIndex) in WEEKDAY_LABELS"
              :key="dayIndex"
              class="flex flex-1 items-center justify-end text-[0.55rem] font-bold leading-none text-pencil-gray/70"
            >
              {{ label }}
            </div>
          </div>

          <div
            v-for="(week, weekIndex) in weeks"
            :key="weekIndex"
            class="flex flex-col gap-[3px]"
          >
            <template v-for="(day, dayIndex) in week">
              <!-- The days before the window opened: blanks that hold the row
                   alignment, so every row stays one weekday all the way across -->
              <div
                v-if="!day"
                :key="`pad-${dayIndex}`"
                class="aspect-square w-full"
              ></div>
              <div
                v-else
                :key="day.dayKey"
                class="group relative aspect-square w-full rounded-[2px] animate-pop-in"
                :style="{
                  ...dayStyle(day),
                  ...staggerStyle(weekIndex, { step: 8, max: 600 }),
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
      </div>
    </div>

    <div class="mt-3 flex items-center justify-end gap-1.5">
      <span class="text-[0.65rem] font-bold text-pencil-gray/70">menos</span>
      <div
        v-for="level in [0, 1, 2, 3, 4]"
        :key="level"
        class="h-2.5 w-2.5 rounded-[3px]"
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
// Rows run Sunday to Saturday, so these land on Monday, Wednesday and
// Friday -- the same three GitHub labels.
const WEEKDAY_LABELS = ["", "lun", "", "mié", "", "vie", ""];
const MONTH_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
// A month name over a first column of one or two days would point at a
// month the grid barely shows.
const MIN_FIRST_COLUMN_DAYS = 3;
// Four filled steps plus "nothing", so a five-session day doesn't look the
// same as a one-session day but a twelve-session day doesn't need its own
// shade either.
const MAX_LEVEL = 4;

// A fixed track for the weekday labels, then one collapsible track per
// week. minmax(0, 1fr) rather than 1fr: a plain 1fr floors at the content's
// own size, which would push the row wider than its container again.
const columnTracks = computed(
  () => `1.75rem repeat(${weeks.value.length}, minmax(0, 1fr))`
);

const activeDays = computed(() => props.activity.filter((d) => d.sessions > 0).length);
const totalSessions = computed(() =>
  props.activity.reduce((sum, day) => sum + day.sessions, 0)
);

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

// One entry per week column, empty except where a new month begins.
const monthLabels = computed(() => {
  const labels = [];
  let lastMonth = null;

  weeks.value.forEach((week, index) => {
    const firstDay = week.find(Boolean);
    if (!firstDay) {
      labels[index] = "";
      return;
    }

    const month = firstDay.date.getMonth();
    const isStub = index === 0 && week.filter(Boolean).length < MIN_FIRST_COLUMN_DAYS;
    labels[index] = month !== lastMonth && !isStub ? MONTH_NAMES[month] : "";
    lastMonth = month;
  });

  return labels;
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
