import { describe, it, expect } from "vitest";
import { englishQuotes } from "./quotes";

describe("englishQuotes", () => {
  it("has no repeated quotes", () => {
    const texts = englishQuotes.map((quote) => quote.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("gives every quote its author", () => {
    for (const quote of englishQuotes) expect(quote.author, quote.text).toBeTruthy();
  });

  it("only asks for plain ASCII in the text, typeable on any keyboard", () => {
    for (const { text } of englishQuotes) {
      expect(text, text).toMatch(/^[\x20-\x7e]+$/);
    }
  });

  it("keeps each one between 8 and 40 words", () => {
    for (const { text } of englishQuotes) {
      const words = text.split(" ").length;
      expect(words, text).toBeGreaterThanOrEqual(8);
      expect(words, text).toBeLessThanOrEqual(40);
    }
  });
});
