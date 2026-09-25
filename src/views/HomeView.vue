<template>
  <div>
    <!--
      Desktop: full toolbar, fixed below the nav so it never affects the
      typing area's position (that area centers itself independently).
      Fades out while typing instead of unmounting, so nothing shifts.
    -->
    <div
      class="hidden sm:block fixed top-20 inset-x-0 mx-auto w-fit z-20 max-w-[95vw] transition-[opacity,translate] duration-500 ease-smooth"
      :class="
        hideConfig
          ? 'opacity-0 -translate-y-3 pointer-events-none select-none duration-300'
          : 'opacity-100 translate-y-0'
      "
      :aria-hidden="hideConfig"
    >
      <ToolBar />
    </div>

    <!-- Mobile: compact settings FAB, bottom-left, opens the config sheet -->
    <button
      type="button"
      class="sm:hidden fixed bottom-4 left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-faded-gray bg-paper-white text-primary shadow-sm transition-[opacity,scale,rotate] duration-500 ease-spring active:scale-90"
      :class="
        hideConfig
          ? 'opacity-0 scale-75 -rotate-45 pointer-events-none'
          : 'opacity-100 scale-100 rotate-0'
      "
      :aria-hidden="hideConfig"
      aria-label="Configurar"
      @click="configOpen = true"
    >
      <Cog6ToothIcon class="w-6 h-6" />
    </button>

    <!-- Mobile config sheet -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="configOpen"
        class="sm:hidden fixed inset-0 z-[60] flex items-end justify-center bg-night-ink/40 backdrop-blur-[2px] p-4"
        @click.self="configOpen = false"
      >
        <Transition
          appear
          enter-active-class="transition-all duration-500 ease-spring"
          enter-from-class="opacity-0 translate-y-10"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div
            ref="configSheet"
            role="dialog"
            aria-modal="true"
            aria-label="Configuración"
            class="w-full max-w-md max-h-[85vh] overflow-y-auto"
          >
            <div class="flex justify-end mb-2">
              <IconButton
                icon="close"
                variant="secondary"
                size="xs"
                tooltip="Cerrar"
                @click="configOpen = false"
              />
            </div>
            <ToolBar />
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Always dead-centered on screen, independent of everything above -->
    <ParagraphToType />

    <!-- Combo pushes live out here, not inside ParagraphToType: that box is
         transformed, which would make it the containing block for anything
         "fixed" inside it (and clip it). -->
    <ComboToast />

    <!-- Mid-session "what to work on", with a jump straight into a drill -->
    <LiveCoach />

    <ChallengesWidget />

    <CustomTextEditor v-if="configStore.customEditor" />

    <!-- Today still needs a session to keep the streak -->
    <StreakRiskBanner v-if="streakReminder.bannerVisible" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import ParagraphToType from "@/features/typing-test/components/ParagraphToType.vue";
import ToolBar from "@/features/typing-test/components/ToolBar.vue";
import ComboToast from "@/features/typing-test/components/ComboToast.vue";
import LiveCoach from "@/features/typing-test/components/LiveCoach.vue";
import ChallengesWidget from "@/features/history/components/ChallengesWidget.vue";
import CustomTextEditor from "@/features/typing-test/components/CustomTextEditor.vue";
import StreakRiskBanner from "@/features/history/components/StreakRiskBanner.vue";
import { useStreakReminderStore } from "@/features/history/streakReminder";
import IconButton from "@/shared/components/IconButton.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { useModalFocus } from "@/shared/composables/useModalFocus";

const configStore = useConfigStore();
const streakReminder = useStreakReminderStore();
const configOpen = ref(false);
const configSheet = ref(null);
useModalFocus({
  open: configOpen,
  container: configSheet,
  onClose: () => {
    configOpen.value = false;
  },
});

// Hide the ToolBar/FAB while actively typing (but show when paused) and
// while looking at the results screen — there's nothing to configure there.
const isTyping = computed(() => {
  return (
    configStore.userInput.length > 0 && !configStore.isCompleted && !configStore.isPaused
  );
});

const hideConfig = computed(() => isTyping.value || configStore.isCompleted);

// Close the mobile config sheet automatically if typing starts or finishes
watch(hideConfig, (hidden) => {
  if (hidden) configOpen.value = false;
});
</script>

<style scoped></style>
