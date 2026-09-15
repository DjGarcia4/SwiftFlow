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
