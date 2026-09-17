import { describe, it, expect, beforeEach } from "vitest";
import { getResults, saveResult, clearResults } from "./resultsRepository";

describe("resultsRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when nothing is stored", () => {
    expect(getResults()).toEqual([]);
  });

  it("saves a result and reads it back", () => {
    saveResult({ id: "1", wpm: 50 });
    expect(getResults()).toEqual([{ id: "1", wpm: 50 }]);
  });

  it("prepends new results, most recent first", () => {
    saveResult({ id: "1" });
    saveResult({ id: "2" });
    expect(getResults().map((r) => r.id)).toEqual(["2", "1"]);
  });

  it("caps stored results at 200, dropping the oldest", () => {
    for (let i = 0; i < 205; i++) {
      saveResult({ id: `${i}` });
    }
    const results = getResults();
    expect(results).toHaveLength(200);
    expect(results[0].id).toBe("204");
    expect(results[results.length - 1].id).toBe("5");
  });

  describe("timing retention", () => {
    const withTiming = (id) => ({
      id,
      wpm: 70,
      keyAttempts: { a: 10 },
      confusions: { rt: 2 },
      keyTiming: { a: [200, 1] },
      bigramTiming: { ab: [200, 1] },
    });

    it("keeps timing on the newest sessions", () => {
      for (let i = 0; i < 40; i++) saveResult(withTiming(`${i}`));

      expect(getResults().every((r) => r.keyTiming)).toBe(true);
    });

    it("drops timing past the retention window, keeping everything else", () => {
      for (let i = 0; i < 41; i++) saveResult(withTiming(`${i}`));

      const oldest = getResults().at(-1);
      expect(oldest.keyTiming).toBeUndefined();
      expect(oldest.bigramTiming).toBeUndefined();
      expect(oldest.wpm).toBe(70);
      expect(oldest.keyAttempts).toEqual({ a: 10 });
      expect(oldest.confusions).toEqual({ rt: 2 });
    });

    it("stays put once trimmed, however many times it is saved again", () => {
      for (let i = 0; i < 45; i++) saveResult(withTiming(`${i}`));
      const before = getResults().at(-1);
      saveResult(withTiming("new"));

      expect(getResults().at(-1)).toEqual(before);
    });

    it("gives up on the timing rather than throwing when storage is full", () => {
      saveResult(withTiming("1"));
      const setItem = Storage.prototype.setItem;
      let attempt = 0;
      Storage.prototype.setItem = function (...args) {
        // Only the first write is too big
        if (++attempt === 1) throw new DOMException("quota", "QuotaExceededError");
        return setItem.apply(this, args);
      };

      try {
        expect(() => saveResult(withTiming("2"))).not.toThrow();
        expect(getResults().every((r) => !r.keyTiming)).toBe(true);
      } finally {
        Storage.prototype.setItem = setItem;
      }
    });
  });

  it("clearResults empties the stored list", () => {
    saveResult({ id: "1" });
    clearResults();
    expect(getResults()).toEqual([]);
  });

  it("tolerates corrupted JSON in storage", () => {
    localStorage.setItem("swiftflow_results", "{not valid json");
    expect(getResults()).toEqual([]);
  });

  it("tolerates a non-array value in storage", () => {
    localStorage.setItem("swiftflow_results", JSON.stringify({ oops: true }));
    expect(getResults()).toEqual([]);
  });
});
