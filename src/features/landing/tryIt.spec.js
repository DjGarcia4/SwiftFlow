import { describe, it, expect } from "vitest";
import { summarizeTry, TRY_SENTENCES } from "./tryIt";

// Strokes typing `text` at `msFor(i)` ms a character, with optional slips
const strokesFor = (text, { msFor = () => 150, slips = {} } = {}) => {
  const strokes = [];
  let ms = 0;
  for (let i = 0; i < text.length; i++) {
    if (i > 0) ms += msFor(i);
    if (slips[i]) {
      strokes.push({ index: i, expected: text[i], typed: slips[i], ms });
      ms += 200;
    }
    strokes.push({ index: i, expected: text[i], typed: text[i], ms });
  }
  return strokes;
};

describe("summarizeTry", () => {
  const text = "la casa rara";

  it("gives the wpm, accuracy and time", () => {
    const result = summarizeTry({ text, input: text, strokes: strokesFor(text) });
    expect(result.accuracy).toBe(100);
    expect(result.seconds).toBe(1.7);
    expect(result.wpm).toBeGreaterThan(0);
  });

  it("names a letter missed more than once", () => {
    const strokes = strokesFor(text, { slips: { 8: "t", 10: "t" } });
    const { insight, accuracy } = summarizeTry({ text, input: text, strokes });
    expect(insight.kind).toBe("missed");
    expect(insight.text).toBe("La R se te escapó 2 veces.");
    expect(accuracy).toBeLessThan(100);
  });

  it("otherwise names a letter that was clearly slow", () => {
    const strokes = strokesFor(text, { msFor: (i) => (i === 5 ? 600 : 150) });
    const { insight } = summarizeTry({ text, input: text, strokes });
    expect(insight.kind).toBe("slow");
    expect(insight.text).toContain("la S");
  });

  it("says so when it was clean and even", () => {
    const { insight } = summarizeTry({ text, input: text, strokes: strokesFor(text) });
    expect(insight.kind).toBe("clean");
    expect(insight.text).toBe("Sin un error y con ritmo parejo.");
  });

  it("has sentences with the letters the Spanish keyboard is about", () => {
    for (const sentence of TRY_SENTENCES) {
      expect(sentence).toMatch(/[ñáéíóúü]/);
      expect(sentence.length).toBeLessThan(70);
    }
  });
});
