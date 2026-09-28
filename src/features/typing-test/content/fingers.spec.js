import { describe, it, expect } from "vitest";
import {
  FINGER_PRESETS,
  normalizeFingers,
  presetOf,
  fingerKeys,
  wordsForKeys,
  generateFingerText,
} from "./fingers";

const groupsOf = (text) => text.split(" ");

describe("normalizeFingers", () => {
  it("keeps known fingers once, in hand order", () => {
    expect(
      normalizeFingers(["right-index", "left-pinky", "left-pinky", "thumb"])
    ).toEqual(["left-pinky", "right-index"]);
    expect(normalizeFingers(null)).toEqual([]);
  });

  it("names the presets", () => {
    expect(presetOf(["right-index", "left-index"])).toBe("index");
    expect(presetOf(FINGER_PRESETS.left)).toBe("left");
    expect(presetOf(["left-index"])).toBeNull();
  });
});

describe("fingerKeys", () => {
  it("finds a finger's letters on the keyboard picked", () => {
    expect(fingerKeys(["left-index"], "latam").sort()).toEqual([..."bfgrtv"].sort());
    // The ñ is the right pinky's on a Spanish keyboard, not on a US one
    expect(fingerKeys(["right-pinky"], "latam")).toContain("ñ");
    expect(fingerKeys(["right-pinky"], "us")).not.toContain("ñ");
    // Dvorak moves the letters under the same fingers
    expect(fingerKeys(["left-index"], "dvorak")).toContain("u");
  });
});

describe("generateFingerText", () => {
  it("returns the requested number of groups", () => {
    expect(groupsOf(generateFingerText(["left-index"], 25, "latam"))).toHaveLength(25);
  });

  it("only uses the chosen fingers' letters", () => {
    for (const fingers of [["left-pinky"], FINGER_PRESETS.left, FINGER_PRESETS.index]) {
      const allowed = new Set([...fingerKeys(fingers, "latam"), " "]);
      const text = generateFingerText(fingers, 100, "latam");
      expect([...text].every((char) => allowed.has(char))).toBe(true);
    }
  });

  it("brings real words when a hand has them", () => {
    const words = new Set(wordsForKeys(fingerKeys(FINGER_PRESETS.left, "latam")));
    expect(words.size).toBeGreaterThan(12);
    const groups = groupsOf(generateFingerText(FINGER_PRESETS.left, 100, "latam"));
    expect(groups.filter((group) => words.has(group)).length).toBeGreaterThan(30);
  });

  it("gives every letter its turn, and never the same group twice in a row", () => {
    const keys = fingerKeys(["left-index"], "latam");
    const groups = groupsOf(generateFingerText(["left-index"], 60, "latam"));
    for (const key of keys) expect(groups.join("")).toContain(key);
    for (let i = 1; i < groups.length; i++) expect(groups[i]).not.toBe(groups[i - 1]);
  });

  it("falls back to ordinary words with no finger picked", () => {
    expect(groupsOf(generateFingerText([], 10, "latam"))).toHaveLength(10);
  });
});
