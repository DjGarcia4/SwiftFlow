import { describe, it, expect } from "vitest";
import { buildBackup, parseBackup, mergeResults, backupFilename } from "./historyBackup";

const session = (id, date = "2026-03-10T10:00:00.000Z", extra = {}) => ({
  id,
  date,
  wpm: 70,
  accuracy: 95,
  ...extra,
});

describe("buildBackup / parseBackup", () => {
  it("survives a round trip", () => {
    const results = [session("a"), session("b")];
    const parsed = parseBackup(JSON.stringify(buildBackup(results)));

    expect(parsed.ok).toBe(true);
    expect(parsed.results).toEqual(results);
  });

  it("rejects something that isn't JSON at all", () => {
    expect(parseBackup("{not json").ok).toBe(false);
    expect(parseBackup("").error).toContain("JSON");
  });

  it("rejects a JSON file from somewhere else", () => {
    expect(parseBackup(JSON.stringify({ app: "other", results: [] })).error).toContain(
      "copia de SwiftFlow"
    );
    expect(parseBackup(JSON.stringify([1, 2, 3])).ok).toBe(false);
  });

  it("rejects a backup whose sessions aren't a list", () => {
    expect(parseBackup(JSON.stringify({ app: "swiftflow", results: {} })).ok).toBe(false);
  });

  it("drops the unreadable sessions and keeps the rest", () => {
    const backup = buildBackup([
      session("good"),
      { id: "no-date", wpm: 50 },
      { date: "2026-03-10T10:00:00.000Z", wpm: 50 },
      session("bad-date", "no soy una fecha"),
      session("no-wpm", "2026-03-10T10:00:00.000Z", { wpm: "rápido" }),
      null,
    ]);

    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.results.map((r) => r.id)).toEqual(["good"]);
    expect(parsed.skipped).toBe(5);
  });

  it("fails when nothing at all could be read", () => {
    const backup = buildBackup([{ nope: true }]);
    expect(parseBackup(JSON.stringify(backup)).ok).toBe(false);
  });
});

describe("mergeResults", () => {
  it("keeps both sides, newest first", () => {
    const merged = mergeResults(
      [session("here", "2026-03-11T10:00:00.000Z")],
      [session("there", "2026-03-12T10:00:00.000Z")]
    );

    expect(merged.map((r) => r.id)).toEqual(["there", "here"]);
  });

  it("doesn't duplicate a session that's on both sides", () => {
    const mine = session("same", "2026-03-11T10:00:00.000Z", { wpm: 99 });
    const theirs = session("same", "2026-03-11T10:00:00.000Z", { wpm: 1 });

    const merged = mergeResults([mine], [theirs]);

    expect(merged).toHaveLength(1);
    // This device's copy wins
    expect(merged[0].wpm).toBe(99);
  });

  it("copes with either side being empty", () => {
    expect(mergeResults([], [session("a")]).map((r) => r.id)).toEqual(["a"]);
    expect(mergeResults([session("a")], []).map((r) => r.id)).toEqual(["a"]);
  });
});

describe("backupFilename", () => {
  it("is dated and pads single digits", () => {
    expect(backupFilename(new Date(2026, 2, 5))).toBe("swiftflow-2026-03-05.json");
  });
});
