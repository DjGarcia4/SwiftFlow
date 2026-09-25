import { describe, it, expect, afterEach } from "vitest";
import { summarizeTry, TRY_SENTENCES, TRY_SENTENCES_EN, trySentences } from "./tryIt";
import { setLocale } from "@/shared/i18n";
import { CHANGELOG, formatChangelogDate } from "./changelog";

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

describe("in English", () => {
  afterEach(() => setLocale("es"));

  it("uses English sentences and says it in English", () => {
    setLocale("en");
    expect(trySentences()).toBe(TRY_SENTENCES_EN);
    for (const sentence of TRY_SENTENCES_EN) expect(sentence.length).toBeLessThan(70);
    const text = "la casa rara";
    const strokes = strokesFor(text, { slips: { 8: "t", 10: "t" } });
    expect(summarizeTry({ text, input: text, strokes }).insight.text).toBe(
      "R slipped past you 2 times."
    );
  });

  it("tells what's new, dated the English way", () => {
    expect(CHANGELOG[0].title).toBe("Récords por idioma");
    expect(formatChangelogDate("2026-09")).toBe("septiembre de 2026");
    setLocale("en");
    expect(CHANGELOG[0].title).toBe("Records per language");
    expect(formatChangelogDate("2026-09")).toBe("September 2026");
    expect(CHANGELOG.every((entry) => !entry.text.startsWith("landing."))).toBe(true);
  });
});
