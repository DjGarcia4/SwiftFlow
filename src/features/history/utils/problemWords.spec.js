import { describe, it, expect } from "vitest";
import { computeProblemWords } from "./problemWords";

// A session's per-word stats: [times, errors, msSum, timed]
const session = (wordStats) => ({ wordStats });
const steady = (times) => [times, 0, 100 * times, times];

describe("computeProblemWords", () => {
  it("names the words you keep getting wrong", () => {
    const words = computeProblemWords([
      session({ desarrollo: [2, 2, 200, 2], casa: steady(4), mesa: steady(4) }),
      session({ desarrollo: [2, 1, 200, 2], perro: steady(4) }),
    ]);
    expect(words.map((w) => w.word)).toEqual(["desarrollo"]);
    expect(words[0]).toMatchObject({ times: 4, errors: 3, errorRate: 0.75 });
  });

  it("and the ones that slow you down even when you get them right", () => {
    const words = computeProblemWords([
      session({ exactamente: [3, 0, 600, 3], casa: steady(4), mesa: steady(4) }),
    ]);
    expect(words.map((w) => w.word)).toEqual(["exactamente"]);
    expect(words[0].slowRatio).toBeCloseTo(2);
  });

  it("waits for a word to come up a few times", () => {
    expect(
      computeProblemWords([session({ desarrollo: [2, 2, 200, 2], casa: steady(5) })])
    ).toEqual([]);
  });

  it("puts the worst first", () => {
    const words = computeProblemWords([
      session({
        algo: [3, 2, 300, 3],
        nunca: [3, 3, 300, 3],
        casa: steady(6),
      }),
    ]);
    expect(words.map((w) => w.word)).toEqual(["nunca", "algo"]);
  });

  it("works with history recorded before words were tracked", () => {
    expect(computeProblemWords([{ wpm: 50 }])).toEqual([]);
  });
});
