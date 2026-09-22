<template>
  <!--
    Mid-session nudge: shows up once this session makes a weak letter plain,
    with a one-click jump into a drill aimed at it. Kept low on the screen,
    away from the line being typed.
  -->
  <div
    class="fixed bottom-4 left-4 right-4 z-30 flex justify-center sm:left-auto sm:right-6 sm:bottom-6 sm:w-[26rem]"
  >
    <Transition
      enter-active-class="transition-[opacity,translate] duration-500 ease-spring"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-[opacity,translate] duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <CoachCard
        v-if="visibleCoach"
        class="w-full"
        :coach="visibleCoach"
        dismissible
        @train="trainNow"
        @dismiss="dismissed = true"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import CoachCard from "./CoachCard.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { computeLiveCoach } from "@/features/typing-test/utils/liveCoach";
import { useTrainNow } from "@/features/typing-test/utils/useTrainNow";

const configStore = useConfigStore();
const trainNow = useTrainNow();

// Closed for the rest of this session only; the next one gets a fresh look
const dismissed = ref(false);
watch(
  () => configStore.userInput.length === 0,
  (empty) => {
    if (empty) dismissed.value = false;
  }
);

const coach = computed(() =>
  computeLiveCoach({
    keyAttempts: configStore.keyAttempts,
    missedKeys: configStore.missedKeys,
    confusions: configStore.confusions,
  })
);

const visibleCoach = computed(() => {
  // Already drilling: sending you to a drill from a drill says nothing new
  if (configStore.type === "drill" || dismissed.value) return null;
  // The results screen has its own, inline version
  if (configStore.isCompleted || configStore.userInput.length === 0) return null;
  return coach.value;
});
</script>
