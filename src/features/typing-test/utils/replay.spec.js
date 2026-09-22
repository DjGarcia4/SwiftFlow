import { describe, it, expect } from "vitest";
import { computeReplay } from "./replay";

// A timeline typing `text` one character after another, taking `msFor(i)`
// to reach character i
const timeline = (text, msFor) => {
  const samples = [];
  let ms = 0;
  for (let i = 0; i < text.length; i++) {
    ms += i === 0 ? 0 : msFor(i);
    samples.push([ms, i + 1]);
  }
  return samples;
};

describe("computeReplay", () => {
  it("times each word from the end of the one before it", () => {
    const text = "hola que tal";
    // 100ms a character, except "que", which takes 400ms a character
    const samples = timeline(text, (i) => (i >= 5 && i <= 7 ? 400 : 100));
    const { segments } = computeReplay({ text, input: text, samples });

    const words = segments.filter((s) => s.type === "word");
    expect(words.map((w) => [w.text, w.ms])).toEqual([
      ["hola", 300],
      ["que", 1200],
      ["tal", 300],
    ]);
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });

  it("rates words against the run's own pace, per character", () => {
    const text = "uno dos tres cuatro cinco seis";
    const slowWord = text.indexOf("cuatro");
    const samples = timeline(text, (i) =>
      i >= slowWord && i < slowWord + 6 ? 300 : 100
    );
    const { segments, slowest } = computeReplay({ text, input: text, samples });

    const tiers = Object.fromEntries(
      segments.filter((s) => s.type === "word").map((w) => [w.text, w.tier])
    );
    expect(tiers.cuatro).toBe("stuck");
    expect(tiers.dos).toBe("normal");
    expect(slowest.map((w) => w.text)).toEqual(["cuatro"]);
  });

  it("covers only what was typed", () => {
    const text = "hola que tal";
    const input = "hola q";
    const samples = timeline(input, () => 100);
    const { segments } = computeReplay({ text, input, samples });
    expect(segments.map((s) => s.text)).toEqual(["hola", " ", "q"]);
  });

  it("marks the words left with a mistake", () => {
    const text = "hola que tal";
    const input = "hola qeu tal";
    const { segments } = computeReplay({
      text,
      input,
      samples: timeline(input, () => 100),
    });
    const words = segments.filter((s) => s.type === "word");
    expect(words.map((w) => w.hadError)).toEqual([false, true, false]);
  });

  it("keeps line breaks and indentation as gaps, for code", () => {
    const text = "if (a) {\n  b();\n}";
    const { segments } = computeReplay({
      text,
      input: text,
      samples: timeline(text, () => 100),
    });
    expect(segments.map((s) => s.text).join("")).toBe(text);
    expect(segments.filter((s) => s.type === "gap").map((s) => s.text)).toContain("\n  ");
  });
});
