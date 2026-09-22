import { describe, it, expect } from "vitest";
import {
  generateWordDrillText,
  normalizeDrillWords,
  generateDrillText,
  normalizeDrillKeys,
} from "./drill";
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

  it("gives every target its share, even next to a very common letter", () => {
    // The a is in almost every Spanish word: a single shared pool would be
    // all a-words and the f and the ñ would barely appear
    const text = generateDrillText(["a", "f", "m", "h", "ñ"], 30);

    for (const key of ["a", "f", "m", "h", "ñ"]) {
      expect(density(text, key)).toBeGreaterThan(0.02);
    }
  });

  it("covers every target within one pass, not on average", () => {
    // Five targets and five words: each one has to be in there
    const groups = groupsOf(generateDrillText(["q", "f", "j", "ñ", "z"], 5));

    for (const key of ["q", "f", "j", "ñ", "z"]) {
      expect(groups.some((group) => group.includes(key))).toBe(true);
    }
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

describe("generateWordDrillText", () => {
  it("drills just the given words, each several times", () => {
    const text = generateWordDrillText(["desarrollo", "exactamente"], 10).split(" ");
    expect(text).toHaveLength(10);
    expect(new Set(text)).toEqual(new Set(["desarrollo", "exactamente"]));
    expect(text.filter((w) => w === "desarrollo")).toHaveLength(5);
  });

  it("never repeats a word back to back", () => {
    const text = generateWordDrillText(["uno", "dos", "tres"], 60).split(" ");
    for (let i = 1; i < text.length; i++) expect(text[i]).not.toBe(text[i - 1]);
  });

  it("falls back to ordinary words with nothing to drill", () => {
    expect(generateWordDrillText([], 5).split(" ")).toHaveLength(5);
  });
});

describe("normalizeDrillWords", () => {
  it("keeps single lowercase words, once each, up to ten", () => {
    expect(normalizeDrillWords(["Hola", "hola", "dos palabras", "", 3, "chau"])).toEqual([
      "hola",
      "chau",
    ]);
    expect(
      normalizeDrillWords(Array.from({ length: 15 }, (_, i) => `p${i}`))
    ).toHaveLength(10);
  });
});
