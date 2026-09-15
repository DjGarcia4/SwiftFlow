import { describe, it, expect } from "vitest";
import { spanishWords, generateRandomWords } from "./words";

describe("generateRandomWords", () => {
  it("returns the requested number of words", () => {
    const text = generateRandomWords(10);
    expect(text.split(" ")).toHaveLength(10);
  });

  it("only uses words from the curated bank", () => {
    const text = generateRandomWords(25);
    for (const word of text.split(" ")) {
      expect(spanishWords).toContain(word);
    }
  });

  it("never repeats the same word twice in a row", () => {
    const text = generateRandomWords(100);
    const wordsList = text.split(" ");
    for (let i = 1; i < wordsList.length; i++) {
      expect(wordsList[i]).not.toBe(wordsList[i - 1]);
    }
  });

  it("returns an empty string for a count of 0", () => {
    expect(generateRandomWords(0)).toBe("");
  });
});
