import { describe, it, expect } from "vitest";
import { generateDrillText, normalizeDrillKeys } from "./drill";
import { spanishWords } from "./words";

const groupsOf = (text) => text.split(" ");

// How often a letter shows up per character of text
const density = (text, key) =>
  [...text].filter((char) => char === key).length / text.length;

describe("normalizeDrillKeys", () => {
  it("keeps single letters, lowercased and deduplicated", () => {
    expect(normalizeDrillKeys(["R", "r", "ñ"])).toEqual(["r", "ñ"]);
  });

  it("drops anything that isn't a single letter", () => {
    expect(normalizeDrillKeys([" ", "1", "ab", "", null, undefined, 7])).toEqual([]);
  });

  it("copes with junk instead of an array", () => {
    expect(normalizeDrillKeys(null)).toEqual([]);
    expect(normalizeDrillKeys("rt")).toEqual([]);
  });
});

describe("generateDrillText", () => {
  it("returns the requested number of groups", () => {
    expect(groupsOf(generateDrillText(["r"], 25))).toHaveLength(25);
  });

  it("never repeats the same group twice in a row", () => {
    const groups = groupsOf(generateDrillText(["r", "t"], 100));
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]).not.toBe(groups[i - 1]);
    }
  });

  it("drills the target far harder than ordinary Spanish does", () => {
    // The ñ is rare enough in Spanish to be under 0.5% of a normal text
    const text = generateDrillText(["ñ"], 120);
    expect(density(text, "ñ")).toBeGreaterThan(0.1);
  });

  it("mixes real words in with the made-up syllables", () => {
    const groups = groupsOf(generateDrillText(["r"], 120));
    const real = groups.filter((group) => spanishWords.includes(group));

    expect(real.length).toBeGreaterThan(groups.length / 2);
    expect(real.length).toBeLessThan(groups.length);
  });

  it("builds syllables around the target either way round", () => {
    // A consonant target gets vowels around it, a vowel target consonants
    for (const key of ["ñ", "a"]) {
      const invented = groupsOf(generateDrillText([key], 200)).filter(
        (group) => !spanishWords.includes(group)
      );
      expect(invented.length).toBeGreaterThan(0);
      for (const group of invented) {
        expect(group).toContain(key);
        expect(group).toMatch(/^\p{L}{4}$/u);
      }
    }
  });

  it("falls back to an ordinary word test when there's nothing to aim at", () => {
    const text = generateDrillText([], 20);
    const groups = groupsOf(text);

    expect(groups).toHaveLength(20);
    for (const word of groups) expect(spanishWords).toContain(word);
  });

  it("returns an empty string for a count of 0", () => {
    expect(generateDrillText(["r"], 0)).toBe("");
  });
});
