<template>
  <div class="h-screen flex flex-col bg-paper-white">
    <SplashScreen v-if="showSplash" @done="showSplash = false" />
    <Nav />
    <div class="flex-1 overflow-y-auto">
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import Nav from "@/shared/layout/Nav.vue";
import SplashScreen from "@/shared/layout/SplashScreen.vue";
import AchievementToast from "@/features/history/components/AchievementToast.vue";
import { useCustomizationStore } from "@/shared/stores/customization";
import { useStreakReminderStore } from "@/features/history/streakReminder";

const showSplash = ref(true);

// Puts the unlocked accent color on before anything paints
useCustomizationStore();

// Keeps the streak warning's clock going, and the evening reminder with it
useStreakReminderStore().start();
</script>

<style scoped></style>
