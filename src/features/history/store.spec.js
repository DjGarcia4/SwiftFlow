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
      wpm: 10, // below every wpm threshold
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
        wpm: 10, // unlocks first_session, nothing wpm-related
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
        wpm: 10, // unlocks first_session
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

  describe("importResults", () => {
    const imported = (id, date) => ({ id, date, wpm: 55, accuracy: 90 });

    it("adds the sessions that weren't already here", () => {
      const store = useHistoryStore();
      store.recordResult({ mode: "time", wpm: 40, accuracy: 80, errors: 0 });
      const mine = store.results[0];

      const { added } = store.importResults([
        imported("from-elsewhere", "2020-01-01T10:00:00.000Z"),
      ]);

      expect(added).toBe(1);
      expect(store.results.map((r) => r.id)).toContain(mine.id);
    });

    it("keeps what's here when the same session arrives again", () => {
      const store = useHistoryStore();
      store.recordResult({ mode: "time", wpm: 40, accuracy: 80, errors: 0 });
      const mine = store.results[0];

      const { added } = store.importResults([{ ...mine, wpm: 999 }]);

      expect(added).toBe(0);
      expect(store.results[0].wpm).toBe(40);
    });

    it("persists, so the import survives a reload", () => {
      useHistoryStore().importResults([imported("a", "2026-03-10T10:00:00.000Z")]);

      setActivePinia(createPinia());
      expect(useHistoryStore().results.map((r) => r.id)).toEqual(["a"]);
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

  it("counts perfect rounds per kind and reports the count back", () => {
    const store = useHistoryStore();
    const perfect = {
      mode: "time",
      modeValue: 15,
      wpm: 60,
      accuracy: 100,
      errors: 0,
      timeElapsed: 15,
      keystrokes: 80,
      errorKeystrokes: 0,
    };

    expect(store.recordResult(perfect)).toMatchObject({ perfect: true, perfectCount: 1 });
    expect(store.recordResult(perfect)).toMatchObject({ perfect: true, perfectCount: 2 });
    expect(store.recordResult({ ...perfect, errorKeystrokes: 1 })).toMatchObject({
      perfect: false,
      perfectCount: 0,
    });
    expect(store.perfectRoundsTotal).toBe(2);
    expect(store.perfectRoundsList).toEqual([{ mode: "time", modeValue: 15, count: 2 }]);

    // Persisted on its own, so a reload keeps it
    setActivePinia(createPinia());
    expect(useHistoryStore().perfectRoundsTotal).toBe(2);
  });

  it("seeds the perfect-round count from an existing history", () => {
    localStorage.setItem(
      "swiftflow_results",
      JSON.stringify([
        {
          id: "a",
          date: new Date().toISOString(),
          mode: "quote",
          wpm: 50,
          accuracy: 100,
          keystrokes: 90,
          errorKeystrokes: 0,
        },
      ])
    );
    expect(useHistoryStore().perfectRoundsList).toEqual([
      { mode: "quote", modeValue: null, count: 1 },
    ]);
  });

  it("clearing the history clears the perfect rounds too", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "zen",
      wpm: 40,
      accuracy: 100,
      errors: 0,
      timeElapsed: 60,
      keystrokes: 200,
      errorKeystrokes: 0,
    });
    store.clearHistory();
    expect(store.perfectRoundsTotal).toBe(0);
  });

  it("celebrates a daily challenge the moment it's completed", () => {
    const store = useHistoryStore();
    const [challenge] = store.dailyChallenges;
    expect(challenge.completed).toBe(false);

    // Play until the first challenge is done, whatever it turned out to be
    for (let i = 0; i < 10 && !store.dailyChallenges[0].completed; i++) {
      store.recordResult({
        mode: challenge.action?.mode ?? "time",
        modeValue: 60,
        wpm: 300,
        accuracy: 100,
        errors: 0,
        timeElapsed: 60,
        maxStreak: 1000,
        keystrokes: 1500,
        errorKeystrokes: 0,
      });
    }

    expect(store.dailyChallenges[0].completed).toBe(true);
    const toasts = store.newlyUnlocked.filter((a) => a.category === "challenge");
    expect(toasts.map((t) => t.title)).toContain(challenge.title);
    expect(new Set(toasts.map((t) => t.id)).size).toBe(toasts.length);
  });

  it("earns experience per session and keeps it across reloads", () => {
    const store = useHistoryStore();
    const { xpGained } = store.recordResult({
      mode: "time",
      modeValue: 30,
      wpm: 50,
      accuracy: 96,
      errors: 1,
      timeElapsed: 30,
      keystrokes: 210,
      errorKeystrokes: 10,
    });

    // 10 for the session + 20 for 200 correct keystrokes, plus whatever
    // challenges it happened to complete
    expect(xpGained).toBeGreaterThanOrEqual(30);
    expect(store.experience).toBe(xpGained);

    setActivePinia(createPinia());
    expect(useHistoryStore().experience).toBe(xpGained);
  });

  it("announces a level up once, with the level reached", () => {
    const store = useHistoryStore();
    let leveledUp = false;
    for (let i = 0; i < 5 && !leveledUp; i++) {
      ({ leveledUp } = store.recordResult({
        mode: "zen",
        wpm: 50,
        accuracy: 99,
        errors: 0,
        timeElapsed: 120,
        keystrokes: 600,
        errorKeystrokes: 3,
      }));
    }

    expect(leveledUp).toBe(true);
    expect(store.level.level).toBeGreaterThanOrEqual(2);
    const toasts = store.newlyUnlocked.filter((t) => t.category === "level");
    expect(toasts).toHaveLength(1);
    expect(toasts[0].title).toBe(`Nivel ${store.level.level} · ${store.level.title}`);
  });

  it("seeds experience from an existing history", () => {
    localStorage.setItem(
      "swiftflow_results",
      JSON.stringify([
        {
          id: "a",
          date: "2020-01-01T12:00:00.000Z",
          mode: "time",
          wpm: 50,
          accuracy: 95,
          keystrokes: 100,
          errorKeystrokes: 5,
        },
      ])
    );
    expect(useHistoryStore().experience).toBeGreaterThan(0);
  });

  it("clearing the history resets experience", () => {
    const store = useHistoryStore();
    store.recordResult({
      mode: "time",
      wpm: 50,
      accuracy: 95,
      errors: 0,
      timeElapsed: 15,
      keystrokes: 100,
      errorKeystrokes: 5,
    });
    store.clearHistory();
    expect(store.experience).toBe(0);
    expect(store.level.level).toBe(1);
  });
});
