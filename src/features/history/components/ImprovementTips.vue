<template>
  <div class="mt-6 pt-5 border-t-2 border-faded-gray">
    <div class="flex items-center gap-2 mb-3">
      <LightBulbIcon class="w-4 h-4 text-primary" />
      <span class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
        Qué mejorar
      </span>
    </div>

    <p v-if="!result.enoughData" class="text-sm text-pencil-gray">
      Jugá un par de partidas más y te digo en qué enfocarte.
    </p>

    <p v-else-if="!result.tips.length" class="text-sm text-pencil-gray">
      ¡Vas muy parejo! No hay un patrón claro de errores por ahora.
    </p>

    <ul v-else class="space-y-2.5">
      <li
        v-for="(tip, index) in result.tips"
        :key="tip.id"
        class="flex items-start gap-3 rounded-xl bg-primary-tint/40 px-3 py-3 animate-rise"
        :style="staggerStyle(index, { step: 80, base: 700 })"
      >
        <div
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white"
        >
          <component :is="TIP_ICONS[tip.icon] ?? LightBulbIcon" class="w-4.5 h-4.5" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="text-sm font-extrabold text-charcoal">{{ tip.title }}</div>
          <div class="text-xs sm:text-sm text-pencil-gray mt-0.5">{{ tip.detail }}</div>
        </div>

        <button
          v-if="tip.action"
          type="button"
          class="flex-shrink-0 self-center inline-flex items-center gap-1 rounded-lg border-2 border-primary px-2.5 py-1 text-xs font-extrabold text-primary transition-[background-color,color,scale] duration-200 ease-spring hover:bg-primary hover:text-white active:scale-95"
          @click="practice(tip.action)"
        >
          {{ tip.action.label }}
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  LightBulbIcon,
  ViewfinderCircleIcon,
  ArrowsRightLeftIcon,
  ArrowsPointingInIcon,
  ArrowPathRoundedSquareIcon,
  HandRaisedIcon,
  QueueListIcon,
  HashtagIcon,
  LanguageIcon,
  ScaleIcon,
  ClockIcon,
  LinkIcon,
  BoltIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import { computeImprovementTips } from "@/features/history/utils/improvementTips";
import { useConfigStore } from "@/features/typing-test/store";
import { staggerStyle } from "@/shared/utils/motion";

const props = defineProps({
  // Output of computeKeyErrorStats
  stats: { type: Array, required: true },
  // Recent average accuracy, or null if there are no comparable sessions
  averageAccuracy: { type: Number, default: null },
  // Output of computeConfusionStats / computeTranspositionStats
  confusions: { type: Array, default: () => [] },
  transpositions: { type: Array, default: () => [] },
  // Output of computeKeyTimingStats / computeBigramTimingStats
  keyTiming: { type: Array, default: () => [] },
  bigramTiming: { type: Array, default: () => [] },
});

const TIP_ICONS = {
  target: ViewfinderCircleIcon,
  space: ArrowsRightLeftIcon,
  confusion: ArrowsPointingInIcon,
  swap: ArrowPathRoundedSquareIcon,
  hand: HandRaisedIcon,
  rows: QueueListIcon,
  hashtag: HashtagIcon,
  language: LanguageIcon,
  gauge: ScaleIcon,
  clock: ClockIcon,
  link: LinkIcon,
  bolt: BoltIcon,
};

const result = computed(() =>
  computeImprovementTips(props.stats, {
    averageAccuracy: props.averageAccuracy,
    confusions: props.confusions,
    transpositions: props.transpositions,
    keyTiming: props.keyTiming,
    bigramTiming: props.bigramTiming,
  })
);

const router = useRouter();
const configStore = useConfigStore();

// Jump straight into the suggested practice mode
const practice = (action) => {
  if (action.mode && configStore.type !== action.mode) {
    configStore.handleType(action.mode);
  }
  router.push("/");
};
</script>
