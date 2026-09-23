import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useHistoryStore } from "@/features/history/store";
import { toLocalDayKey } from "@/features/history/utils/historyStats";
import {
  computeStreakRisk,
  formatTimeLeft,
  shouldRemind,
} from "@/features/history/utils/streakRisk";

// Keeping the practice streak alive: a warning in the app when today
// hasn't been practiced yet, and an optional evening notification.
//
// The notification only works with the app open (a background tab is
// enough). Reminding with it closed needs a push server or scheduled
// notifications, and browsers offer neither without a backend -- see
// docs/ideas.md. The interface says so rather than promise otherwise.

const STORAGE_KEY = "swiftflow_streak_reminder";
const TICK_MS = 60 * 1000;

const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      hour: Number.isInteger(parsed.hour) ? parsed.hour : null,
      lastRemindedDay:
        typeof parsed.lastRemindedDay === "string" ? parsed.lastRemindedDay : null,
      dismissedDay: typeof parsed.dismissedDay === "string" ? parsed.dismissedDay : null,
    };
  } catch {
    return { hour: null, lastRemindedDay: null, dismissedDay: null };
  }
};

export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const useStreakReminderStore = defineStore("streakReminder", () => {
  const historyStore = useHistoryStore();
  const state = ref(load());
  const now = ref(new Date());

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch {
      // Storage blocked: it holds for this visit
    }
  };

  const risk = computed(() => computeStreakRisk(historyStore.results, now.value));
  const timeLeft = computed(() => formatTimeLeft(risk.value));
  const today = computed(() => toLocalDayKey(now.value));
  const bannerVisible = computed(
    () => risk.value.atRisk && state.value.dismissedDay !== today.value
  );
  const reminderHour = computed(() => state.value.hour);

  const dismiss = () => {
    state.value = { ...state.value, dismissedDay: today.value };
    save();
  };

  // Turning it on asks for permission first; says "denied" when the
  // browser won't allow notifications, so the view can explain.
  const setReminderHour = async (hour) => {
    if (
      hour !== null &&
      notificationsSupported() &&
      Notification.permission !== "granted"
    ) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return "denied";
    }
    state.value = { ...state.value, hour };
    save();
    return "ok";
  };

  const notify = async () => {
    const title = `Tu racha de ${risk.value.streak} ${risk.value.streak === 1 ? "día" : "días"} se corta hoy`;
    const options = {
      body: `Te quedan ${timeLeft.value}. Una partida alcanza para mantenerla.`,
      icon: "/pwa-192x192.png",
      tag: "swiftflow-streak",
    };
    // Through the service worker where there is one: it's what shows it
    // properly on Android, where a page can't create notifications itself
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // Fall through to a plain one
    }
    new Notification(title, options);
  };

  const tick = () => {
    now.value = new Date();
    if (!notificationsSupported() || Notification.permission !== "granted") return;
    if (
      shouldRemind({
        hour: state.value.hour,
        lastRemindedDay: state.value.lastRemindedDay,
        risk: risk.value,
        now: now.value,
      })
    ) {
      state.value = { ...state.value, lastRemindedDay: today.value };
      save();
      notify();
    }
  };

  let interval = null;
  const start = () => {
    if (interval) return;
    tick();
    interval = setInterval(tick, TICK_MS);
  };

  return {
    risk,
    timeLeft,
    bannerVisible,
    reminderHour,
    dismiss,
    setReminderHour,
    start,
    tick,
  };
});
