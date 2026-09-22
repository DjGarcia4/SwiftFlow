import { describe, it, expect } from "vitest";
import {
  ghostKey,
  ghostPositionAt,
  ghostFinishMs,
  buildGhostRun,
  ghostLead,
} from "./ghost";

describe("ghostKey", () => {
  it("keys a ghost by mode, value and punctuation", () => {
    expect(ghostKey({ mode: "time", modeValue: 30, punctuation: true })).toBe(
      "time:30:p"
    );
    expect(ghostKey({ mode: "words", modeValue: 25, punctuation: false })).toBe(
      "words:25:-"
    );
    expect(ghostKey({ mode: "quote", modeValue: null, punctuation: true })).toBe(
      "quote::p"
    );
  });

  it("always counts code as punctuated, since it's typed as-is", () => {
    expect(ghostKey({ mode: "code", modeValue: "Go", punctuation: false })).toBe(
      "code:Go:p"
    );
  });

  it("has no ghost for zen, the drill, or code across every language", () => {
    expect(ghostKey({ mode: "zen", modeValue: null })).toBeNull();
    expect(ghostKey({ mode: "drill", modeValue: 25 })).toBeNull();
    expect(ghostKey({ mode: "code", modeValue: null })).toBeNull();
  });
});

describe("ghostPositionAt", () => {
  const samples = [
    [0, 1],
    [200, 2],
    [450, 3],
    [500, 2], // a backspace
    [900, 3],
  ];

  it("is at the start before the first keystroke", () => {
    expect(ghostPositionAt([], 1000)).toBe(0);
    expect(ghostPositionAt([[100, 1]], 50)).toBe(0);
  });

  it("follows the timeline, backspaces included", () => {
    expect(ghostPositionAt(samples, 0)).toBe(1);
    expect(ghostPositionAt(samples, 300)).toBe(2);
    expect(ghostPositionAt(samples, 470)).toBe(3);
    expect(ghostPositionAt(samples, 600)).toBe(2);
    expect(ghostPositionAt(samples, 5000)).toBe(3);
  });

  it("knows when the ghost finished", () => {
    expect(ghostFinishMs(samples)).toBe(900);
    expect(ghostFinishMs([])).toBe(0);
  });
});

describe("buildGhostRun", () => {
  const text = "a".repeat(500);
  const samples = [
    [0, 1],
    [100, 50],
  ];

  it("keeps a timed run's text only as far as it got, plus a margin", () => {
    expect(buildGhostRun({ mode: "time", text, samples }).text).toHaveLength(150);
  });

  it("keeps the whole text of a run with a fixed one", () => {
    expect(buildGhostRun({ mode: "words", text, samples }).text).toHaveLength(500);
  });
});

describe("ghostLead", () => {
  it("is positive ahead and negative behind", () => {
    expect(ghostLead(40, 30)).toBe(10);
    expect(ghostLead(30, 40)).toBe(-10);
  });
});
