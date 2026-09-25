import { describe, it, expect } from "vitest";
import { punctuateWords } from "./punctuate";
import { seededRandom } from "@/shared/utils/seededRandom";
import { formatReferenceText } from "@/features/typing-test/utils/textFormat";
import { generateRandomWords } from "./words";

const LOOSE = "hola mundo que tal estas hoy aca todo bien por suerte gracias";

describe("punctuateWords", () => {
  it("keeps every word, in order, and the word count", () => {
    const text = punctuateWords(LOOSE, seededRandom(1));
    expect(text.split(" ")).toHaveLength(LOOSE.split(" ").length);
    expect(formatReferenceText(text)).toBe(LOOSE);
  });

  it("starts with a capital and ends a sentence", () => {
    for (let seed = 0; seed < 30; seed++) {
      const text = punctuateWords(LOOSE, seededRandom(seed + 1));
      expect(text).toMatch(/^[¿¡]?[A-ZÁÉÍÓÚÑ]/);
      expect(text).toMatch(/[.?!]$/);
    }
  });

  it("opens every question and exclamation it closes", () => {
    for (let seed = 0; seed < 50; seed++) {
      const text = punctuateWords(generateRandomWords(60), seededRandom(seed + 1));
      expect(text.split("¿").length).toBe(text.split("?").length);
      expect(text.split("¡").length).toBe(text.split("!").length);
      // Every sentence closes before the next one opens
      expect(text).not.toMatch(/¿[^?]*[.!¡¿]/);
    }
  });
});
