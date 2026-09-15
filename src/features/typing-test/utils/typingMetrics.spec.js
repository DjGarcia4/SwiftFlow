import { describe, it, expect } from "vitest";
import {
  computeWpm,
  computeAccuracy,
  computeErrors,
  computeStreak,
} from "./typingMetrics";

describe("computeWpm", () => {
  it("returns 0 when no time has elapsed", () => {
    expect(computeWpm("hola mundo", 0)).toBe(0);
  });

  it("computes words per minute from elapsed seconds", () => {
    // 5 words typed in 30s => 10 wpm
    expect(computeWpm("uno dos tres cuatro cinco", 30)).toBe(10);
  });

  it("counts a single partial word as one word", () => {
    expect(computeWpm("h", 60)).toBe(1);
  });
});

describe("computeAccuracy", () => {
  it("is 100 when nothing has been typed yet", () => {
    expect(computeAccuracy("", "referencia")).toBe(100);
  });

  it("is 100 when there is no reference text", () => {
    expect(computeAccuracy("algo", "")).toBe(100);
  });

  it("computes the percentage of correct characters", () => {
    // "hxla" vs "hola" -> 3/4 correct
    expect(computeAccuracy("hxla", "hola")).toBe(75);
  });

  it("is 0 when every typed character is wrong", () => {
    expect(computeAccuracy("xxxx", "hola")).toBe(0);
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
