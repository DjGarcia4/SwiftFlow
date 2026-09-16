import { describe, it, expect } from "vitest";
import {
  computeWpm,
  computeRawWpm,
  computeAccuracy,
  computeErrors,
  computeStreak,
} from "./typingMetrics";

describe("computeWpm", () => {
  it("returns 0 when no time has elapsed", () => {
    expect(computeWpm("hola mundo", "hola mundo", 0)).toBe(0);
  });

  it("counts 5 characters as one word", () => {
    // 25 correct chars (24 after the first) in 30s => 4.8 words / 0.5 min => 10 wpm
    expect(
      computeWpm("uno dos tres cuatro cinco", "uno dos tres cuatro cinco", 30000)
    ).toBe(10);
  });

  it("doesn't depend on how long the words are", () => {
    const short = "a b c d e f g h i j";
    const long = "extraordinariamente";
    expect(computeWpm(short.slice(0, 19), short, 6000)).toBe(
      computeWpm(long.slice(0, 19), long, 6000)
    );
  });

  it("only counts words typed completely and correctly", () => {
    const ref = "la disciplina es el puente";
    // "disciplina" has a typo, "puen" is unfinished: only "la ", "es ", "el " count
    // => 9 chars, minus the free first keystroke = 8 => 1.6 words in 1 min
    expect(computeWpm("la disciplxna es el puen", ref, 60000)).toBe(2);
    // all correct: 26 chars - 1 = 25 => 5 wpm
    expect(computeWpm(ref, ref, 60000)).toBe(5);
  });

  it("doesn't give the first keystroke for free", () => {
    // 11 chars span 10 intervals: 10 chars in 60s => 2 wpm
    expect(computeWpm("hola mundo!", "hola mundo!", 60000)).toBe(2);
  });

  it("ignores characters that don't match the reference", () => {
    expect(computeWpm("xxxxxxxxxx", "hola mundo", 60000)).toBe(0);
    expect(computeWpm("holaxmundo", "hola mundo", 60000)).toBe(2);
  });

  it("is 0 for empty input", () => {
    expect(computeWpm("", "hola", 30000)).toBe(0);
  });
});

describe("computeRawWpm", () => {
  it("counts every keystroke, right or wrong", () => {
    expect(computeRawWpm(100, 60000)).toBe(20);
    expect(computeRawWpm(100, 0)).toBe(0);
  });
});

describe("computeAccuracy", () => {
  it("is 100 when nothing has been typed yet", () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });

  it("counts mistakes even if they were corrected later", () => {
    expect(computeAccuracy(20, 5)).toBe(75);
  });

  it("is 0 when every keystroke was wrong", () => {
    expect(computeAccuracy(4, 4)).toBe(0);
  });
});

describe("computeErrors", () => {
  it("is 0 with no reference text", () => {
    expect(computeErrors("algo", "")).toBe(0);
  });

  it("counts mismatched characters", () => {
    expect(computeErrors("hxla", "hola")).toBe(1);
  });

  it("counts every character wrong when nothing matches", () => {
    expect(computeErrors("xxxx", "hola")).toBe(4);
  });
});

describe("computeStreak", () => {
  it("is 0 with no input", () => {
    expect(computeStreak("", "hola")).toBe(0);
  });

  it("counts the trailing run of correct characters", () => {
    // "hxla" vs "hola": last char 'a' matches, then 'l' matches, then 'x' breaks it
    expect(computeStreak("hxla", "hola")).toBe(2);
  });

  it("counts the whole input when it's all correct", () => {
    expect(computeStreak("hola", "hola")).toBe(4);
  });

  it("is 0 when the very last character is wrong", () => {
    expect(computeStreak("holx", "hola")).toBe(0);
  });
});
