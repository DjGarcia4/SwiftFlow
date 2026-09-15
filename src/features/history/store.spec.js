import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useHistoryStore } from "./store";

describe("useHistoryStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("starts empty when there's nothing in storage", () => {
    const store = useHistoryStore();
    expect(store.results).toEqual([]);
    expect(store.sessionsCount).toBe(0);
    expect(store.bestWpm).toBe(0);
  });

  it("recordResult adds an entry to the front of results and persists it", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      wpm: 60,
      accuracy: 95,
      errors: 2,
      timeElapsed: 15,
      modeValue: 15,
    });

    expect(store.results).toHaveLength(1);
    expect(store.results[0]).toMatchObject({ mode: "time", wpm: 60 });
    expect(store.results[0].id).toBeTruthy();
    expect(store.results[0].date).toBeTruthy();

    // A fresh store instance should read the same persisted data back.
    setActivePinia(createPinia());
    const reloaded = useHistoryStore();
    expect(reloaded.results).toHaveLength(1);
  });

  it("keeps the most recent result first", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      wpm: 40,
      accuracy: 90,
      errors: 0,
      timeElapsed: 15,
    });
    store.recordResult({
      mode: "time",
      wpm: 80,
      accuracy: 90,
      errors: 0,
      timeElapsed: 15,
    });

    expect(store.results.map((r) => r.wpm)).toEqual([80, 40]);
  });

  it("derives sessionsCount/bestWpm/averageWpm/averageAccuracy from results", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      wpm: 40,
      accuracy: 80,
      errors: 0,
      timeElapsed: 15,
    });
    store.recordResult({
      mode: "time",
      wpm: 60,
      accuracy: 100,
      errors: 0,
      timeElapsed: 15,
    });

    expect(store.sessionsCount).toBe(2);
    expect(store.bestWpm).toBe(60);
    expect(store.averageWpm).toBe(50);
    expect(store.averageAccuracy).toBe(90);
  });

  it("derives personalBests from results, best wpm per mode/modeValue", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      modeValue: 15,
      wpm: 40,
      accuracy: 90,
      errors: 0,
      timeElapsed: 15,
    });
    store.recordResult({
      mode: "time",
      modeValue: 15,
      wpm: 70,
      accuracy: 95,
      errors: 0,
      timeElapsed: 15,
    });
    store.recordResult({
      mode: "words",
      modeValue: 50,
      wpm: 60,
      accuracy: 90,
      errors: 0,
      timeElapsed: 40,
    });

    expect(store.personalBests).toHaveLength(2);
    expect(store.personalBests[0]).toMatchObject({ mode: "time", wpm: 70 });
  });

  it("derives dailyStreak from results (a fresh recordResult counts as today)", () => {
    const store = useHistoryStore();
    expect(store.dailyStreak).toBe(0);

    store.recordResult({
      mode: "time",
      wpm: 40,
      accuracy: 80,
      errors: 0,
      timeElapsed: 15,
    });

    expect(store.dailyStreak).toBe(1);
  });

  it("derives achievements/unlockedAchievementsCount from results", () => {
    const store = useHistoryStore();
    expect(store.unlockedAchievementsCount).toBe(0);

    store.recordResult({
      mode: "time",
      wpm: 20, // below every wpm threshold
      accuracy: 80,
      errors: 0,
      timeElapsed: 15,
    });

    // Not asserting an exact count: recordResult stamps the real current
    // time, and a couple of achievements (night_owl/early_bird) depend on
    // the hour it happens to run at — asserting specific ids instead keeps
    // this from flaking depending on when/where the test runs.
    expect(store.unlockedAchievementsCount).toBeGreaterThanOrEqual(1);
    expect(store.achievements.find((a) => a.id === "first_session").unlocked).toBe(true);
    expect(store.achievements.find((a) => a.id === "sessions_10").unlocked).toBe(false);
    expect(store.achievements.find((a) => a.id === "wpm_40").unlocked).toBe(false);
  });

  describe("newlyUnlocked", () => {
    it("starts empty", () => {
      const store = useHistoryStore();
      expect(store.newlyUnlocked).toEqual([]);
    });

    it("recordResult queues achievements crossed by that session", () => {
      const store = useHistoryStore();
      store.recordResult({
        mode: "time",
        wpm: 20, // unlocks first_session, nothing wpm-related
        accuracy: 80,
        errors: 0,
        timeElapsed: 15,
      });

      expect(store.newlyUnlocked.map((a) => a.id)).toContain("first_session");
    });

    it("does not re-queue an achievement already unlocked by a previous session", () => {
      const store = useHistoryStore();
      store.recordResult({
        mode: "time",
        wpm: 20,
        accuracy: 80,
        errors: 0,
        timeElapsed: 15,
      });
      store.dismissNewlyUnlocked(); // clear the first_session toast

      store.recordResult({
        mode: "time",
        wpm: 20,
        accuracy: 80,
        errors: 0,
        timeElapsed: 15,
      });

      expect(store.newlyUnlocked.map((a) => a.id)).not.toContain("first_session");
    });

    it("dismissNewlyUnlocked removes only the front of the queue", () => {
      // Two calls that each cross a new threshold; not asserting the exact
      // array (real wall-clock time could also cross night_owl/early_bird
      // on either call) — first_session is always first since it's first
      // in the catalog, which is what dismiss should drop.
      const store = useHistoryStore();
      store.recordResult({
        mode: "time",
        wpm: 20, // unlocks first_session
        accuracy: 80,
        errors: 0,
        timeElapsed: 15,
      });
      store.recordResult({
        mode: "time",
        wpm: 45, // crosses wpm_40
        accuracy: 80,
        errors: 0,
        timeElapsed: 15,
      });

      const idsBefore = store.newlyUnlocked.map((a) => a.id);
      expect(idsBefore[0]).toBe("first_session");
      expect(idsBefore).toContain("wpm_40");

      store.dismissNewlyUnlocked();

      const idsAfter = store.newlyUnlocked.map((a) => a.id);
      expect(idsAfter).not.toContain("first_session");
      expect(idsAfter).toContain("wpm_40");
    });
  });

  it("clearHistory empties both state and storage", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      wpm: 40,
      accuracy: 80,
      errors: 0,
      timeElapsed: 15,
    });

    store.clearHistory();

    expect(store.results).toEqual([]);
    expect(localStorage.getItem("swiftflow_results")).toBeNull();
  });
});
