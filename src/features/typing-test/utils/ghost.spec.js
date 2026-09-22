import { describe, it, expect } from "vitest";
import {
  ghostKey,
  ghostPositionAt,
  ghostFinishMs,
  ghostPositionOnText,
  ghostFinishOnText,
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

describe("the ghost on a fresh text", () => {
  // 100 characters in 10 seconds: 10 a second
  const samples = [
    [0, 1],
    [5000, 50],
    [10000, 100],
  ];

  it("follows its own run while it lasts", () => {
    expect(ghostPositionOnText(samples, 5000, 300)).toBe(50);
  });

  it("keeps its average pace past the end of its own run", () => {
    expect(ghostPositionOnText(samples, 12000, 300)).toBe(120);
  });

  it("stops at the end of a shorter text", () => {
    expect(ghostPositionOnText(samples, 10000, 80)).toBe(80);
  });

  it("finishes a text when its run reaches that length, or its pace would", () => {
    expect(ghostFinishOnText(samples, 50)).toBe(5000);
    expect(ghostFinishOnText(samples, 150)).toBe(15000);
  });
});

describe("ghostLead", () => {
  it("is positive ahead and negative behind", () => {
    expect(ghostLead(40, 30)).toBe(10);
    expect(ghostLead(30, 40)).toBe(-10);
  });
});
