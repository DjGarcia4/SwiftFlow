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
