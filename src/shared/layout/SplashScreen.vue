<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-400 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-paper-white"
    >
      <div
        class="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary border-2 border-b-4 border-primary-dark animate-splash-pop"
      >
        <BoltIcon class="w-9 h-9 text-white" />
      </div>

      <div
        class="flex items-center gap-2 font-mono text-2xl font-extrabold text-charcoal"
      >
        <span>{{ typedText }}</span>
        <span class="inline-block w-[3px] h-6 bg-primary animate-caret-blink"></span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { BoltIcon } from "@heroicons/vue/24/solid";
import { useSoundStore } from "@/shared/stores/sound";
import { playKeystrokeSound } from "@/shared/utils/sound";

const APP_NAME = "SwiftFlow";
const LETTER_INTERVAL_MS = 90;
const HOLD_MS = 450;

const emit = defineEmits(["done"]);

const soundStore = useSoundStore();
const visible = ref(true);
const typedText = ref("");

const timers = [];
const schedule = (fn, delay) => timers.push(setTimeout(fn, delay));

const finish = () => {
  visible.value = false;
  emit("done");
};

onMounted(() => {
  // Respect the OS-level motion preference: skip the letter-by-letter
  // stagger and just show the full name briefly instead of animating it in.
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    typedText.value = APP_NAME;
    schedule(finish, 500);
    return;
  }

  APP_NAME.split("").forEach((_, i) => {
    schedule(
      () => {
        typedText.value = APP_NAME.slice(0, i + 1);
        // Same gating as the real typing test's keystroke feedback — and note
        // browsers block audio until a user gesture, so on a cold load this
        // may stay silent until the user has interacted with the page once.
        if (soundStore.soundEnabled && soundStore.keystrokeSound) {
          playKeystrokeSound();
        }
      },
      LETTER_INTERVAL_MS * (i + 1)
    );
  });

  schedule(finish, LETTER_INTERVAL_MS * APP_NAME.length + HOLD_MS);
});

onUnmounted(() => timers.forEach(clearTimeout));
</script>

<style scoped>
@keyframes splash-pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-splash-pop {
  animation: splash-pop 400ms ease-out;
}

@keyframes caret-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.animate-caret-blink {
  animation: caret-blink 800ms step-end infinite;
}
</style>
