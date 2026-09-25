<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-night-ink/40 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <Transition
        appear
        enter-active-class="transition-all duration-500 ease-spring"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div
          ref="dialog"
          class="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-card border-2 border-faded-gray bg-paper-white p-5 sm:p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="replay-title"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="replay-title"
                class="font-display text-xl font-extrabold text-charcoal"
              >
                Dónde te frenaste
              </h2>
              <p class="text-xs font-bold text-pencil-gray">
                Cada palabra, comparada con tu propio ritmo en esta partida. Pasá el mouse
                para ver cuánto tardaste.
              </p>
            </div>
            <!-- No tooltip: this box scrolls, and would clip one above it -->
            <button
              type="button"
              aria-label="Cerrar"
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-faded-gray text-pencil-gray transition-[color,background-color,scale] duration-200 ease-spring hover:bg-primary-tint/60 hover:text-primary active:scale-90"
              @click="emit('close')"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Legend -->
          <div class="mb-4 flex flex-wrap gap-3 text-xs font-bold text-pencil-gray">
            <span
              v-for="tier in LEGEND"
              :key="tier.id"
              class="inline-flex items-center gap-1.5"
            >
              <span class="inline-block h-3 w-3 rounded-sm" :class="tier.swatch"></span>
              {{ tier.label }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="underline decoration-wavy decoration-danger underline-offset-2"
                >abc</span
              >
              con error
            </span>
          </div>

          <!-- The text, word by word -->
          <div
            class="rounded-xl bg-faded-gray/10 p-4 font-mono text-lg leading-loose whitespace-pre-wrap break-words"
          >
            <template v-for="(segment, index) in replay.segments" :key="index">
              <span v-if="segment.type === 'gap'">{{ segment.text }}</span>
              <span
                v-else
                class="group relative rounded px-0.5"
                :class="[
                  TIER_CLASSES[segment.tier] ?? '',
                  segment.hadError
                    ? 'underline decoration-wavy decoration-danger underline-offset-4'
                    : '',
                ]"
                >{{ segment.text
                }}<span
                  v-if="segment.ms !== null"
                  class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max -translate-x-1/2 rounded-lg bg-night-ink px-2 py-1 font-sans text-xs font-bold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  >{{ seconds(segment.ms) }} s<template v-if="segment.wpm">
                    · {{ segment.wpm }} wpm</template
                  ></span
                ></span
              >
            </template>
          </div>

          <!-- The ones worth a second look -->
          <div v-if="replay.slowest.length" class="mt-4">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div class="text-xs font-bold uppercase tracking-wide text-pencil-gray">
                Tus palabras más lentas
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg border-2 border-primary px-2.5 py-1 text-xs font-extrabold text-primary transition-[background-color,color,scale] duration-200 ease-spring hover:bg-primary hover:text-white active:scale-95"
                @click="emit('train', slowestWords)"
              >
                Entrenar estas
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="word in replay.slowest"
                :key="word.start"
                class="inline-flex items-center gap-1.5 rounded-lg border-2 border-danger/30 bg-danger-tint px-2.5 py-1 text-sm"
              >
                <span class="font-mono font-extrabold text-danger">{{ word.text }}</span>
                <span class="text-xs font-bold text-pencil-gray"
                  >{{ seconds(word.ms) }} s</span
                >
              </span>
            </div>
          </div>
          <p v-else class="mt-4 text-sm font-bold text-success-dark">
            Ninguna palabra se te trabó: ritmo parejo de punta a punta.
          </p>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from "vue";
import { useModalFocus } from "@/shared/composables/useModalFocus";
import { normalizeWord } from "@/features/typing-test/utils/wordStats";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  // computeReplay
  replay: { type: Object, required: true },
});

const emit = defineEmits(["close", "train"]);

// The slow words as a drill takes them: once each, without punctuation
const slowestWords = computed(() => [
  ...new Set(
    props.replay.slowest.map((word) => normalizeWord(word.text)).filter(Boolean)
  ),
]);

const TIER_CLASSES = {
  fast: "text-success",
  normal: "text-charcoal",
  slow: "bg-primary/15 text-primary-dark",
  stuck: "bg-danger/15 text-danger font-bold",
};

const LEGEND = [
  { id: "fast", label: "rápida", swatch: "bg-success" },
  { id: "normal", label: "a tu ritmo", swatch: "bg-charcoal" },
  { id: "slow", label: "lenta", swatch: "bg-primary/40" },
  { id: "stuck", label: "te trabaste", swatch: "bg-danger/60" },
];

const seconds = (ms) => (ms / 1000).toFixed(1).replace(".", ",");

const dialog = ref(null);
useModalFocus({
  open: () => props.open,
  container: dialog,
  onClose: () => emit("close"),
});
</script>
