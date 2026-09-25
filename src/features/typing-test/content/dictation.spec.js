import { describe, it, expect } from "vitest";
import {
  toDictation,
  dictationSentences,
  buildDictation,
  sentenceIndexAt,
} from "./dictation";
import { seededRandom } from "@/shared/utils/seededRandom";

describe("toDictation", () => {
  it("keeps what a voice says, drops what it doesn't", () => {
    expect(
      toDictation("Desde los primeros telégrafos, la evolución: ¿extraordinaria?")
    ).toBe("desde los primeros telégrafos la evolución extraordinaria");
    expect(toDictation("El Año - Ñandú")).toBe("el año ñandú");
  });
});

describe("dictationSentences", () => {
  it("has plenty of sentences, each plain and of a speakable length", () => {
    expect(dictationSentences.length).toBeGreaterThan(200);
    for (const sentence of dictationSentences) {
      expect(sentence).toMatch(/^[\p{Ll}\p{N}]+( [\p{Ll}\p{N}]+)*$/u);
      const words = sentence.split(" ").length;
      expect(words).toBeGreaterThanOrEqual(6);
      expect(words).toBeLessThanOrEqual(16);
    }
  });
});

describe("buildDictation", () => {
  it("joins different sentences and knows where each starts", () => {
    const { sentences, starts, text } = buildDictation(3, seededRandom(4));
    expect(new Set(sentences).size).toBe(3);
    expect(text).toBe(sentences.join(" "));
    starts.forEach((start, i) => expect(text.startsWith(sentences[i], start)).toBe(true));
  });
});

describe("sentenceIndexAt", () => {
  it("counts the space after a sentence as part of it", () => {
    const starts = [0, 10, 25];
    expect(sentenceIndexAt(starts, 0)).toBe(0);
    expect(sentenceIndexAt(starts, 9)).toBe(0);
    expect(sentenceIndexAt(starts, 10)).toBe(1);
    expect(sentenceIndexAt(starts, 40)).toBe(2);
  });
});
