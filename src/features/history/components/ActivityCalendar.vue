<template>
  <div>
    <div class="flex items-baseline justify-between gap-3 mb-3">
      <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.calendar.title") }}
      </div>
      <div class="text-[0.65rem] font-bold uppercase tracking-wide text-pencil-gray/70">
        {{ t("history.calendar.totals", totalSessions, activeDays) }}
      </div>
    </div>

    <!-- Columns are weeks, rows are weekdays, same as every contribution
         grid: the eye reads down a week and across the months.

         The weekday rail is a fixed box and the grid is the flex sibling that
         takes whatever is left (min-w-0, so it takes what is left rather than
         what its 53 columns would like). Inside it every week is a
         minmax(0, 1fr) track, which can shrink to nothing -- the year is
         always exactly as wide as the card, never a pixel more.

         Nothing here is a scroll container above `sm`. It used to be, and the
         tooltips -- absolutely positioned, far wider than the 10px cell they
         hang off -- pushed the scrollable width past the container on their
         own, so the grid could sit scrolled a hundred pixels to the left with
         the first months clipped off the edge. Phones still scroll, because a
         year across 320px is 53 slivers. -->
    <div class="overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0">
      <div class="min-w-[480px] sm:min-w-0">
        <!-- Month names sit above the week where that month begins, free to
             overflow their own column: a column is a few pixels wide and no
             month name fits in that. -->
        <div class="flex gap-2">
          <div class="w-7 shrink-0"></div>
          <div
            class="grid h-3 min-w-0 flex-1 gap-[2px]"
            :style="{ gridTemplateColumns: columnTracks }"
          >
            <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="relative">
              <span
                v-if="monthLabels[weekIndex]"
                class="absolute left-0 top-0 whitespace-nowrap text-[0.6rem] font-bold uppercase leading-3 text-pencil-gray/70"
              >
                {{ monthLabels[weekIndex] }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-1 flex gap-2">
          <!-- Every other weekday is labelled; naming all seven turns the
               left edge into a wall of text.
               The rail stretches to the grid's height and splits it seven
               ways, so the labels stay on their rows whatever size the cells
               end up. -->
          <div class="flex w-7 shrink-0 flex-col gap-[2px]">
            <div
              v-for="(label, dayIndex) in t('history.calendar.weekdays')"
              :key="dayIndex"
              class="flex flex-1 items-center justify-end text-[0.55rem] font-bold leading-none text-pencil-gray/70"
            >
              {{ label }}
            </div>
          </div>

          <!-- One flat list of cells poured down each column in turn, seven
               rows deep -- the same shape as the weeks, without a wrapper per
               week that the cells would have to size themselves against. -->
          <div
            class="grid min-w-0 flex-1 gap-[2px]"
            :style="{
              gridTemplateColumns: columnTracks,
              gridTemplateRows: `repeat(${WEEKDAYS}, minmax(0, 1fr))`,
              gridAutoFlow: 'column',
            }"
          >
            <template v-for="(day, index) in cells">
              <!-- The days before the window opened: blanks that hold the row
                   alignment, so every row stays one weekday all the way across -->
              <div v-if="!day" :key="`pad-${index}`" class="aspect-square w-full"></div>
              <div
                v-else
                :key="day.dayKey"
                class="group relative aspect-square w-full rounded-[2px] animate-pop-in"
                :style="{
                  ...dayStyle(day),
                  ...staggerStyle(Math.floor(index / WEEKDAYS), { step: 8, max: 600 }),
                }"
              >
                <!-- A tooltip is twenty times the width of the cell it hangs
                     off, so the ones near the ends anchor to their edge
                     instead of their middle and stay inside the card -->
                <div
                  class="pointer-events-none absolute bottom-full z-50 mb-2 w-max rounded-xl bg-night-ink px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  :class="tooltipAnchor(Math.floor(index / WEEKDAYS))"
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
      <span class="text-[0.65rem] font-bold text-pencil-gray/70">{{
        t("history.calendar.less")
      }}</span>
      <div
        v-for="level in [0, 1, 2, 3, 4]"
        :key="level"
        class="h-2.5 w-2.5 rounded-[3px]"
        :style="levelStyle(level)"
      ></div>
      <span class="text-[0.65rem] font-bold text-pencil-gray/70">{{
        t("history.calendar.more")
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { t, localeTag } from "@/shared/i18n";
import { computed } from "vue";
import { staggerStyle } from "@/shared/utils/motion";

const props = defineProps({
  // Output of computeDailyActivity, oldest first
  activity: { type: Array, required: true },
});

const WEEKDAYS = 7;
// Rows run Sunday to Saturday, so these land on Monday, Wednesday and
// Friday -- the same three GitHub labels.
// A month name over a first column of one or two days would point at a
// month the grid barely shows.
const MIN_FIRST_COLUMN_DAYS = 3;
// A name takes about this many columns to write out; a month that starts
// sooner than that after the one before would print over it ("sepoct")
const MIN_LABEL_COLUMNS = 3;
// Four filled steps plus "nothing", so a five-session day doesn't look the
// same as a one-session day but a twelve-session day doesn't need its own
// shade either.
const MAX_LEVEL = 4;
// How much of each end of the year anchors its tooltip to the edge
const TOOLTIP_EDGE_SHARE = 0.15;

// One collapsible track per week. minmax(0, 1fr) rather than 1fr: a plain 1fr
// floors at the content's own size, which would push the row wider than its
// container again.
const columnTracks = computed(() => `repeat(${weeks.value.length}, minmax(0, 1fr))`);

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

// The weeks poured out end to end, for a grid that flows down its columns
const cells = computed(() => weeks.value.flat());

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
    labels[index] =
      month !== lastMonth && !isStub ? t("history.calendar.months")[month] : "";
    lastMonth = month;
  });

  // Where two names would collide, the earlier month -- the sliver the
  // grid opens on -- gives way to the one after it
  labels.forEach((label, index) => {
    if (!label) return;
    const next = labels.findIndex((other, j) => j > index && other);
    if (next !== -1 && next - index < MIN_LABEL_COLUMNS) labels[index] = "";
  });

  return labels;
});

const tooltipAnchor = (weekIndex) => {
  const edge = weeks.value.length * TOOLTIP_EDGE_SHARE;
  if (weekIndex < edge) return "left-0";
  if (weekIndex >= weeks.value.length - edge) return "right-0";
  return "left-1/2 -translate-x-1/2";
};

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
  date.toLocaleDateString(localeTag(), { day: "numeric", month: "long" });

const describe = (day) =>
  day.sessions
    ? t("history.calendar.day", day.sessions, formatDay(day.date))
    : t("history.calendar.nothing", formatDay(day.date));
</script>
