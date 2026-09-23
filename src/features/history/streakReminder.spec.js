import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useStreakReminderStore } from "./streakReminder";

// Practiced yesterday and not yet today, at 21:30
const NOW = new Date(2026, 8, 22, 21, 30);
const yesterday = new Date(2026, 8, 21, 12).toISOString();

describe("useStreakReminderStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    localStorage.setItem(
      "swiftflow_results",
      JSON.stringify([{ id: "a", date: yesterday, wpm: 50 }])
    );
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
    delete globalThis.Notification;
  });

  it("warns while today hasn't been practiced, until dismissed for the day", () => {
    const store = useStreakReminderStore();
    expect(store.bannerVisible).toBe(true);
    expect(store.timeLeft).toBe("2 h");

    store.dismiss();
    expect(store.bannerVisible).toBe(false);

    // Dismissed stays dismissed across a reload, for today
    setActivePinia(createPinia());
    expect(useStreakReminderStore().bannerVisible).toBe(false);
  });

  it("sends the evening reminder once, when it's allowed and due", async () => {
    const shown = [];
    globalThis.Notification = class {
      static permission = "granted";
      static requestPermission = async () => "granted";
      constructor(title, options) {
        shown.push({ title, options });
      }
    };
    const store = useStreakReminderStore();
    expect(await store.setReminderHour(21)).toBe("ok");

    store.tick();
    store.tick();
    await Promise.resolve();
    expect(shown).toHaveLength(1);
    expect(shown[0].title).toBe("Tu racha de 1 día se corta hoy");
  });

  it("says so when the browser won't allow notifications", async () => {
    globalThis.Notification = class {
      static permission = "default";
      static requestPermission = async () => "denied";
    };
    const store = useStreakReminderStore();
    expect(await store.setReminderHour(20)).toBe("denied");
    expect(store.reminderHour).toBeNull();
  });
});
