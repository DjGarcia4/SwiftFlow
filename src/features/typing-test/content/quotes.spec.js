import { describe, it, expect } from "vitest";
import { quotes, getRandomQuote } from "./quotes";

describe("getRandomQuote", () => {
  it("returns a quote from the bank", () => {
    const quote = getRandomQuote(null);
    expect(quotes).toContainEqual(quote);
  });

  it("never returns the same text as lastText when more than one quote exists", () => {
    expect(quotes.length).toBeGreaterThan(1);
    for (let i = 0; i < 50; i++) {
      const lastText = quotes[i % quotes.length].text;
      const quote = getRandomQuote(lastText);
      expect(quote.text).not.toBe(lastText);
    }
  });

  it("returns a quote with its author", () => {
    const quote = getRandomQuote(null);
    expect(quote).toHaveProperty("text");
    expect(quote).toHaveProperty("author");
  });
});
