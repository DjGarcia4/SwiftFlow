import { describe, it, expect, afterEach } from "vitest";
import {
  practiceLanguage,
  setPracticeLanguage,
  resultLanguage,
} from "./practiceLanguage";
import { generateRandomWords } from "./words";
import { englishWords, englishAccentedWords } from "./en/words";
import { englishQuotes } from "./en/quotes";
import { englishClassics } from "./en/classics";
import { punctuateWords } from "./punctuate";
import { buildDictation, toDictation } from "./dictation";
import { generateWeeklyText } from "./weekly";
import { generateDrillText } from "./drill";
import { getRandomQuote } from "./quotes";
import { getRandomClassic, classicById } from "./classics";
import { generateLessonText } from "@/features/course/lessonText";
import { lessonById } from "@/features/course/course";
import { ghostKey } from "@/features/typing-test/utils/ghost";
import { keyboardTarget } from "@/features/typing-test/utils/keyboardMap";
import { KEYBOARD_LAYOUTS } from "@/features/typing-test/utils/keyboardLayouts";

afterEach(() => setPracticeLanguage("es"));

describe("the practice language", () => {
  it("is Spanish unless it's set to one it knows", () => {
    expect(practiceLanguage.value).toBe("es");
    setPracticeLanguage("fr");
    expect(practiceLanguage.value).toBe("es");
    setPracticeLanguage("en");
    expect(practiceLanguage.value).toBe("en");
  });

  it("is stored on a result only when it isn't Spanish, and only for text modes", () => {
    expect(resultLanguage("words", "es")).toBeUndefined();
    expect(resultLanguage("words", "en")).toBe("en");
    expect(resultLanguage("code", "en")).toBeUndefined();
    expect(resultLanguage("numbers", "en")).toBeUndefined();
    expect(resultLanguage("custom", "en")).toBeUndefined();
  });

  it("keeps the ghosts from before apart from the English ones", () => {
    const base = { mode: "words", modeValue: 25, punctuation: false };
    expect(ghostKey(base)).toBe("words:25:-");
    expect(ghostKey({ ...base, language: "en" })).toBe("words:25:-:en");
  });
});

describe("practicing English", () => {
  it("draws the words from the English bank", () => {
    setPracticeLanguage("en");
    for (const word of generateRandomWords(50).split(" ")) {
      expect(englishWords).toContain(word);
    }
  });

  it("punctuates without the opening ¿ and ¡", () => {
    setPracticeLanguage("en");
    const text = punctuateWords(generateRandomWords(400));
    expect(text).not.toMatch(/[¿¡]/);
    expect(text).toMatch(/[?!]/);
  });

  it("dictates English sentences, keeping the apostrophes inside words", () => {
    expect(toDictation("Don't stop, 'please' - now.")).toBe("don't stop please now");
    setPracticeLanguage("en");
    const { sentences } = buildDictation(5);
    expect(sentences).toHaveLength(5);
    for (const sentence of sentences) expect(sentence).toMatch(/^[a-z0-9' ]+$/);
  });

  it("gives the weekly text in English, the same for everyone, and Spanish's stays", () => {
    const spanish = generateWeeklyText("2026-W39");
    setPracticeLanguage("en");
    const english = generateWeeklyText("2026-W39");
    expect(english).toBe(generateWeeklyText("2026-W39"));
    expect(english).not.toBe(spanish);
    for (const word of english.split(" ")) expect(englishWords).toContain(word);
  });

  it("drills a letter with English words", () => {
    setPracticeLanguage("en");
    const words = generateDrillText(["k"], 40).split(" ");
    expect(words.some((word) => englishWords.includes(word) && word.includes("k"))).toBe(
      true
    );
  });

  it("picks quotes and classics in English, and still names any classic", () => {
    setPracticeLanguage("en");
    expect(englishQuotes).toContainEqual(getRandomQuote(null));
    expect(englishClassics).toContainEqual(getRandomClassic(null));
    setPracticeLanguage("es");
    expect(classicById("moby-dick").work).toBe("Moby-Dick");
  });

  it("only asks for characters every keyboard can type in its classics", () => {
    for (const { id, text } of englishClassics) {
      for (const char of text) {
        if (char === "\n") continue;
        for (const layout of KEYBOARD_LAYOUTS) {
          expect(
            keyboardTarget(char, layout),
            `${id}: «${char}» on ${layout.id}`
          ).not.toBeNull();
        }
      }
    }
  });

  it("gives the course English words, and English's own accented ones", () => {
    setPracticeLanguage("en");
    const random = () => 0.42;
    const accents = generateLessonText(lessonById("accents"), "us");
    expect(accents.split(" ").some((word) => englishAccentedWords.includes(word))).toBe(
      true
    );
    const signs = generateLessonText(lessonById("signs"), "us");
    expect(signs).not.toMatch(/[¿¡]/);
    const final = generateLessonText(lessonById("final"), "us", random);
    expect(final).toMatch(/^[A-Z]/);
  });
});
