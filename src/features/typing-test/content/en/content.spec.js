import { describe, it, expect } from "vitest";
import { englishWords, englishAccentedWords } from "./words";
import { englishParagraphs } from "./paragraphs";

describe("englishWords", () => {
  it("lists plenty of words, each once, in plain letters", () => {
    expect(englishWords.length).toBeGreaterThanOrEqual(700);
    expect(new Set(englishWords).size).toBe(englishWords.length);
    for (const word of englishWords) expect(word).toMatch(/^[a-z]+$/);
  });

  it("has words enough for drills on the rare letters", () => {
    for (const letter of "jqxz") {
      const count = englishWords.filter((word) => word.includes(letter)).length;
      expect(count, letter).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("englishAccentedWords", () => {
  it("each has an accent or an ñ, and nothing a keyboard can't type", () => {
    expect(new Set(englishAccentedWords).size).toBe(englishAccentedWords.length);
    for (const word of englishAccentedWords) {
      expect(word).toMatch(/^[a-záéíóúüñ]+$/);
      expect(word).toMatch(/[áéíóúüñ]/);
    }
  });
});

describe("englishParagraphs", () => {
  it("has twenty paragraphs of at least six sentences", () => {
    expect(englishParagraphs.length).toBeGreaterThanOrEqual(20);
    for (const paragraph of englishParagraphs) {
      expect(paragraph.split(/(?<=[.!?])\s+/).length).toBeGreaterThanOrEqual(6);
    }
  });

  it("only uses plain punctuation", () => {
    for (const paragraph of englishParagraphs) {
      expect(paragraph).toMatch(/^[A-Za-z0-9 .,;:!?'"()-]+$/);
    }
  });
});
