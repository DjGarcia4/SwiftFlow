<template>
  <!--
    When the streak needs today's session: how long is left, and an optional
    evening notification -- honest about only working with the app open.
  -->
  <div
    class="fixed bottom-20 left-4 right-4 z-30 flex justify-center sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 transition-[opacity,translate] duration-500 ease-smooth"
    :class="
      hidden
        ? 'opacity-0 translate-y-3 pointer-events-none select-none duration-300'
        : 'opacity-100 translate-y-0'
    "
    :aria-hidden="hidden"
  >
    <div
      class="w-full max-w-md rounded-card border-2 border-primary/50 bg-paper-white px-4 py-3 shadow-xl animate-pop-in"
      role="status"
    >
      <div class="flex items-start gap-3">
        <FireIcon class="mt-0.5 w-6 h-6 flex-shrink-0 text-primary animate-badge-glow" />
        <div class="min-w-0 flex-1">
          <div class="text-sm font-extrabold text-charcoal">
            Tu racha de {{ reminder.risk.streak }}
            {{ reminder.risk.streak === 1 ? "día" : "días" }} se corta a medianoche
          </div>
          <div class="text-xs font-bold text-pencil-gray">
            Te quedan {{ reminder.timeLeft }}. Una partida alcanza.
          </div>
        </div>
        <button
          type="button"
          aria-label="Ocultar por hoy"
          class="-mr-1 rounded-md p-1 text-pencil-gray hover:text-charcoal"
          @click="reminder.dismiss()"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- The optional evening notification -->
      <div v-if="supported" class="mt-2.5 border-t-2 border-faded-gray/60 pt-2.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <BellIcon class="w-4 h-4 text-pencil-gray" />
          <span class="text-xs font-bold text-pencil-gray">Avisarme a las</span>
          <button
            v-for="hour in REMINDER_HOURS"
            :key="hour"
            type="button"
            class="rounded-lg border-2 px-2 py-0.5 text-xs font-extrabold transition-colors duration-150"
            :class="
              reminder.reminderHour === hour
                ? 'border-primary bg-primary text-white'
                : 'border-faded-gray text-charcoal hover:border-primary/50'
            "
            @click="setHour(hour)"
          >
            {{ hour }} h
          </button>
          <button
            v-if="reminder.reminderHour !== null"
            type="button"
            class="text-xs font-bold text-pencil-gray underline underline-offset-2 hover:text-charcoal"
            @click="setHour(null)"
          >
            no avisar
          </button>
        </div>
        <p class="mt-1 text-[11px] font-bold text-pencil-gray/80">
          {{
            denied
              ? "El navegador bloqueó las notificaciones de SwiftFlow: habilitalas en la configuración del sitio."
              : "Solo llega si SwiftFlow está abierto, aunque sea en otra pestaña."
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { FireIcon, BellIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { useConfigStore } from "@/features/typing-test/store";
import {
  useStreakReminderStore,
  notificationsSupported,
} from "@/features/history/streakReminder";
import { REMINDER_HOURS } from "@/features/history/utils/streakRisk";

const reminder = useStreakReminderStore();
const configStore = useConfigStore();
const supported = notificationsSupported();
const denied = ref(false);

// Out of the way while typing and on the results -- it's about starting
// a session, so the start screen is where it belongs
const hidden = computed(() => configStore.userInput.length > 0 && !configStore.isPaused);

const setHour = async (hour) => {
  denied.value = (await reminder.setReminderHour(hour)) === "denied";
};
</script>

<style scoped>
@keyframes badge-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

.animate-badge-glow {
  animation: badge-glow 1.6s ease-in-out infinite;
}
</style>
