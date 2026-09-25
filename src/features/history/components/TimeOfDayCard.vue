<template>
  <div>
    <div class="flex items-center gap-2 mb-1">
      <ClockIcon class="w-4 h-4 text-primary" />
      <span class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ t("history.timeOfDay.title") }}
      </span>
    </div>
    <p class="text-sm font-extrabold text-charcoal">{{ headline }}</p>
    <p v-if="footnote" class="text-xs font-bold text-pencil-gray">{{ footnote }}</p>

    <!-- One column per part of the day: above the line is faster than your
         usual in those modes, below it slower -->
    <div class="mt-4 grid grid-cols-4 gap-2">
      <div v-for="part in data.parts" :key="part.id" class="flex flex-col items-center">
        <div class="relative h-20 w-full max-w-16">
          <div class="absolute inset-x-0 top-1/2 h-px bg-faded-gray"></div>
          <div
            v-if="part.enough && data.enoughData"
            class="absolute inset-x-2 rounded-md transition-[height] duration-700 ease-smooth"
            :class="barClass(part)"
            :style="barStyle(part)"
          ></div>
        </div>
        <div
          class="mt-1 text-xs font-extrabold tabular-nums"
          :class="
            part.enough && data.enoughData ? deltaClass(part) : 'text-pencil-gray/50'
          "
        >
          <!-- A lone part can only be compared with itself -->
          {{ part.enough && data.enoughData ? delta(part.relative) : "—" }}
        </div>
        <div class="text-[11px] font-bold capitalize text-pencil-gray">
          {{ part.label }}
        </div>
        <div class="text-[10px] font-bold text-pencil-gray/70">
          {{ t("history.timeOfDay.sessions", part.sessions) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { ClockIcon } from "@heroicons/vue/24/outline";
import { MIN_PART_SESSIONS } from "@/features/history/utils/timeOfDay";

const props = defineProps({
  // computeTimeOfDay
  data: { type: Object, required: true },
});

// Enough in one part of the day, or none yet: which is still missing
const played = computed(() => props.data.parts.filter((part) => part.enough));

const percent = (relative) => Math.round(Math.abs(relative - 1) * 100);
const delta = (relative) => {
  const value = percent(relative);
  if (!value) return "±0%";
  return relative > 1 ? `+${value}%` : `−${value}%`;
};

const headline = computed(() => {
  const { best, enoughData } = props.data;
  if (!enoughData) return t("history.timeOfDay.notYet");
  return best
    ? t("history.timeOfDay.faster", percent(best.relative), best.label)
    : t("history.timeOfDay.even");
});

const footnote = computed(() => {
  const { best, worst, enoughData } = props.data;
  if (!enoughData) {
    // Say what there is and what's missing, in whole sessions
    const [only] = played.value;
    return only
      ? t("history.timeOfDay.onlyOne", only.sessions, only.label, MIN_PART_SESSIONS)
      : t("history.timeOfDay.needMore", MIN_PART_SESSIONS);
  }
  if (!worst || worst === best) return "";
  return t("history.timeOfDay.slower", worst.label, percent(worst.relative));
});

// ±20% fills half the column
const SCALE = 0.2;
const barStyle = (part) => {
  const height = Math.min(50, (Math.abs(part.relative - 1) / SCALE) * 50);
  return part.relative >= 1
    ? { bottom: "50%", height: `${Math.max(2, height)}%` }
    : { top: "50%", height: `${Math.max(2, height)}%` };
};

const barClass = (part) =>
  part === props.data.best
    ? "bg-success"
    : part === props.data.worst
      ? "bg-danger/70"
      : "bg-primary/60";

const deltaClass = (part) =>
  part === props.data.best
    ? "text-success"
    : part === props.data.worst
      ? "text-danger"
      : "text-charcoal";
</script>
