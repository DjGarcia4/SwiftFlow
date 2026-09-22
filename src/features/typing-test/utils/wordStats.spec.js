import { describe, it, expect } from "vitest";
import { sessionWordStats, normalizeWord } from "./wordStats";

const timeline = (text, msFor = () => 100) => {
  const samples = [];
  let ms = 0;
  for (let i = 0; i < text.length; i++) {
    ms += i === 0 ? 0 : msFor(i);
    samples.push([ms, i + 1]);
  }
  return samples;
};

describe("normalizeWord", () => {
  it("drops case and the punctuation around a word", () => {
    expect(normalizeWord("¿Cómo?")).toBe("cómo");
    expect(normalizeWord("Hola,")).toBe("hola");
    expect(normalizeWord("don't")).toBe("don't");
  });
});

describe("sessionWordStats", () => {
  const text = "Hola equipo, hola otra vez";

  it("counts each word's times, mistakes and pace", () => {
    const stats = sessionWordStats({
      mode: "words",
      text,
      input: text,
      samples: timeline(text),
      // A mistake inside "equipo" that got fixed
      errorIndexes: [7],
    });
    expect(stats.hola[0]).toBe(2);
    expect(stats.equipo).toEqual([1, 1, expect.any(Number), 1]);
    expect(stats.otra[1]).toBe(0);
    expect(stats.vez).toEqual([1, 0, expect.any(Number), 1]);
    expect(stats.de).toBeUndefined();
  });

  it("leaves out the first word's time, which also carries finding the keyboard", () => {
    const stats = sessionWordStats({
      mode: "words",
      text,
      input: text,
      samples: timeline(text),
      errorIndexes: [],
    });
    // "hola" twice, but only the second one timed
    expect(stats.hola[3]).toBe(1);
  });

  it("ignores a word the session was cut off in", () => {
    const input = "Hola equ";
    const stats = sessionWordStats({
      mode: "time",
      text,
      input,
      samples: timeline(input),
      errorIndexes: [],
    });
    expect(Object.keys(stats)).toEqual(["hola"]);
  });

  it("has nothing to say about code", () => {
    expect(
      sessionWordStats({ mode: "code", text, input: text, samples: [], errorIndexes: [] })
    ).toEqual({});
  });
});
