<template>
  <div class="h-screen flex flex-col bg-paper-white">
    <SplashScreen v-if="showSplash" @done="showSplash = false" />
    <Nav />
    <!-- The page scrolls in here, not the window -->
    <div ref="scroller" class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="max-w-[1200px] mx-auto w-full">
        <RouterView v-slot="{ Component }">
          <!--
            Fade-only (no translate): HomeView positions its children with
            `fixed`, and a `transform` on this wrapper would make it a new
            containing block for them, breaking their viewport-relative
            positioning mid-transition.
          -->
          <Transition
            mode="out-in"
            enter-active-class="transition-opacity duration-300 ease-smooth"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
    <AchievementToast />
    <LiveAnnouncer />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import Nav from "@/shared/layout/Nav.vue";
import SplashScreen from "@/shared/layout/SplashScreen.vue";
import AchievementToast from "@/features/history/components/AchievementToast.vue";
import LiveAnnouncer from "@/shared/components/LiveAnnouncer.vue";
import { useCustomizationStore } from "@/shared/stores/customization";
import { useContrastStore } from "@/shared/stores/contrast";
import { useStreakReminderStore } from "@/features/history/streakReminder";

const showSplash = ref(true);

// A new page starts at its top -- the landing is long, and arriving at it
// halfway down from wherever the last page was scrolled makes no sense
const scroller = ref(null);
const route = useRoute();
watch(
  () => route.path,
  () => scroller.value?.scrollTo({ top: 0 })
);

// Puts the unlocked accent color on before anything paints, and high
// contrast if it's wanted
useCustomizationStore();
useContrastStore();

// Keeps the streak warning's clock going, and the evening reminder with it
useStreakReminderStore().start();
</script>

<style scoped></style>
