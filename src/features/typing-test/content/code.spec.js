import { describe, it, expect } from "vitest";
import { getRandomCodeSnippet, codeLanguages } from "./code";

describe("getRandomCodeSnippet", () => {
  it("respects the language filter", () => {
    for (const language of codeLanguages) {
      for (let i = 0; i < 10; i++) {
        const snippet = getRandomCodeSnippet(null, language);
        expect(snippet.language).toBe(language);
      }
    }
  });

  it("mixes languages when no filter is passed", () => {
    const snippet = getRandomCodeSnippet(null, null);
    expect(codeLanguages).toContain(snippet.language);
  });

  it("avoids repeating the same snippet twice in a row", () => {
    for (let i = 0; i < 30; i++) {
      const first = getRandomCodeSnippet(null);
      const second = getRandomCodeSnippet(first.code);
      expect(second.code).not.toBe(first.code);
    }
  });

  it("falls back to the full pool for an unknown language", () => {
    const snippet = getRandomCodeSnippet(null, "Cobol");
    expect(codeLanguages).toContain(snippet.language);
  });
});
