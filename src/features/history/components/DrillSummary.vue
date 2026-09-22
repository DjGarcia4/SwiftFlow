<template>
  <!--
    After a drill round: whether to keep at these letters today, each one
    against its target for the day, and where it stands in review -- the
    answer to "¿paro o sigo?" that a drill otherwise never gives.
  -->
  <div class="rounded-card border-2 bg-paper-white px-4 py-3" :class="tone.border">
    <div class="mb-2.5 flex items-center gap-2">
      <component :is="tone.icon" class="w-5 h-5 flex-shrink-0" :class="tone.text" />
      <div class="min-w-0">
        <div class="text-sm font-extrabold" :class="tone.text">{{ headline }}</div>
        <div class="text-xs font-bold text-pencil-gray">{{ subline }}</div>
      </div>
    </div>

    <ul class="space-y-2">
      <li
        v-for="letter in readiness.letters"
        :key="letter.key"
        class="flex items-center gap-2.5"
      >
        <kbd
          class="w-8 flex-shrink-0 rounded-md border-2 py-0.5 text-center font-mono text-sm font-extrabold uppercase"
          :class="
            letter.ready
              ? 'border-success/40 bg-success-tint text-success-dark'
              : 'border-primary/30 bg-primary-tint text-primary'
          "
          >{{ letter.key }}</kbd
        >
        <div class="min-w-0 flex-1">
          <!-- The bar is the miss rate; the tick is the day's target -->
          <div class="relative h-2 rounded-full bg-faded-gray/40">
            <div
              class="h-full rounded-full transition-[width] duration-700 ease-smooth"
              :class="letter.ready ? 'bg-success' : 'bg-primary'"
              :style="{ width: `${barWidth(letter.latest)}%` }"
            ></div>
            <div
              class="absolute -top-1 h-4 w-0.5 rounded-full bg-charcoal"
              :style="{ left: `${barWidth(letter.target)}%` }"
              :title="`Meta de hoy: ${percent(letter.target)}`"
            ></div>
          </div>
          <div
            class="mt-1 flex justify-between gap-2 text-[11px] font-bold text-pencil-gray"
          >
            <span>
              <span
                class="tabular-nums"
                :class="letter.ready ? 'text-success-dark' : 'text-charcoal'"
              >
                {{ letter.latest === null ? "—" : percent(letter.latest) }}
              </span>
              de error · meta {{ percent(letter.target) }}
              <template v-if="letter.attempts < MIN_DAY_ATTEMPTS">
                · {{ letter.attempts }}/{{ MIN_DAY_ATTEMPTS }} intentos
              </template>
            </span>
            <span v-if="reviewLine(letter.key)" class="truncate">{{
              reviewLine(letter.key)
            }}</span>
          </div>
        </div>
      </li>
    </ul>

    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button
        v-if="readiness.verdict !== 'keep'"
        type="button"
        class="rounded-lg border-2 border-faded-gray px-3 py-1.5 text-xs font-extrabold text-pencil-gray transition-colors duration-200 hover:text-charcoal"
        @click="emit('again')"
      >
        Otra ronda igual
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white border-b-2 transition-[background-color,scale] duration-200 ease-spring active:scale-95"
        :class="
          readiness.verdict === 'keep'
            ? 'bg-primary border-primary-dark hover:bg-primary-dark'
            : 'bg-success border-success-dark hover:bg-success-dark'
        "
        @click="readiness.verdict === 'keep' ? emit('again') : emit('leave')"
      >
        {{ readiness.verdict === "keep" ? "Otra ronda" : `Volver a ${leaveLabel}` }}
        <ArrowRightIcon class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MoonIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import { MIN_DAY_ATTEMPTS } from "@/features/history/utils/drillReadiness";

const props = defineProps({
  // computeDrillReadiness
  readiness: { type: Object, required: true },
  // applyDrillSession's changes for the round just played
  reviewChanges: { type: Array, default: () => [] },
  // Name of the mode to go back to
  leaveLabel: { type: String, default: "Tiempo" },
});

const emit = defineEmits(["again", "leave"]);

const TONES = {
  keep: { icon: ArrowPathIcon, text: "text-primary", border: "border-primary/40" },
  ready: {
    icon: CheckCircleIcon,
    text: "text-success-dark",
    border: "border-success/50",
  },
  rest: { icon: MoonIcon, text: "text-charcoal", border: "border-faded-gray" },
};
const tone = computed(() => TONES[props.readiness.verdict] ?? TONES.keep);

const joinKeys = (keys) => {
  const labels = keys.map((key) => `la ${key.toUpperCase()}`);
  return labels.length === 1
    ? labels[0]
    : `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
};

const headline = computed(() => {
  switch (props.readiness.verdict) {
    case "ready":
      return "¡Listo por hoy con estas letras!";
    case "rest":
      return "Por hoy alcanza";
    default:
      return "Seguí: una ronda más";
  }
});

const subline = computed(() => {
  const { verdict, rounds, pending, restReason } = props.readiness;
  const roundText = `${rounds} ${rounds === 1 ? "ronda" : "rondas"} hoy`;
  if (verdict === "ready") return `${roundText} · el repaso te las trae de vuelta`;
  if (verdict === "rest") {
    return restReason === "stalled"
      ? `${roundText} sin mejorar · descansá, mañana rinde más`
      : `${roundText} ya es bastante · descansá, mañana rinde más`;
  }
  return `${roundText} · falta bajar ${joinKeys(pending)}`;
});

const percent = (rate) => `${Math.round(rate * 100)}%`;

// Rates are small numbers; half the bar is 30%, so the targets aren't all
// squashed against the left edge
const BAR_SCALE = 0.6;
const barWidth = (rate) => (rate === null ? 0 : Math.min(100, (rate / BAR_SCALE) * 100));

const inDays = (days) => (days === 1 ? "mañana" : days === 0 ? "hoy" : `en ${days} días`);

const reviewLine = (key) => {
  const change = props.reviewChanges.find((c) => c.key === key);
  if (!change) return "";
  if (change.mastered) return "dominada";
  return `repaso ${inDays(change.nextInDays)}`;
};
</script>
