import { describe, it, expect } from "vitest";
import {
  computeWpm,
  computeRawWpm,
  computeAccuracy,
  computeErrors,
  computeStreak,
  diffKeystrokes,
  isTransposition,
  computeConsistency,
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

describe("diffKeystrokes", () => {
  it("returns nothing when the input shrank or stayed the same", () => {
    expect(diffKeystrokes("hola", "hol", "hola")).toEqual([]);
    expect(diffKeystrokes("hola", "hola", "hola")).toEqual([]);
    expect(diffKeystrokes("", "", "hola")).toEqual([]);
  });

  it("returns nothing without a reference text", () => {
    expect(diffKeystrokes("", "h", "")).toEqual([]);
  });

  it("pairs each new character with the one it should have been", () => {
    expect(diffKeystrokes("ho", "hol", "hola")).toEqual([
      { index: 2, expected: "l", typed: "l", correct: true },
    ]);
    expect(diffKeystrokes("ho", "hox", "hola")).toEqual([
      { index: 2, expected: "l", typed: "x", correct: false },
    ]);
  });

  it("reports every character when several arrive at once", () => {
    expect(diffKeystrokes("h", "hoxa", "hola")).toEqual([
      { index: 1, expected: "o", typed: "o", correct: true },
      { index: 2, expected: "l", typed: "x", correct: false },
      { index: 3, expected: "a", typed: "a", correct: true },
    ]);
  });

  it("stops at the end of the reference text", () => {
    expect(diffKeystrokes("hola", "hola!!", "hola")).toEqual([]);
    expect(diffKeystrokes("hol", "hola!", "hola")).toEqual([
      { index: 3, expected: "a", typed: "a", correct: true },
    ]);
  });
});

describe("isTransposition", () => {
  // Reference "que" typed as "qeu": the e and the u swapped places.
  const swappedE = { index: 1, expected: "u", typed: "e", correct: false };
  const swappedU = { index: 2, expected: "e", typed: "u", correct: false };

  it("recognizes a confirmed swap", () => {
    expect(isTransposition(swappedE, swappedU)).toBe(true);
  });

  it("needs both halves, not just the first one", () => {
    // The u came early, but then something else entirely was typed
    const somethingElse = { index: 2, expected: "e", typed: "a", correct: false };
    expect(isTransposition(swappedE, somethingElse)).toBe(false);
  });

  it("needs the two mistakes to be next to each other", () => {
    expect(isTransposition(swappedE, { ...swappedU, index: 5 })).toBe(false);
  });

  it("ignores pairs where either keystroke was right", () => {
    expect(isTransposition({ ...swappedE, correct: true }, swappedU)).toBe(false);
    expect(isTransposition(swappedE, { ...swappedU, correct: true })).toBe(false);
  });

  it("is false without a previous keystroke", () => {
    expect(isTransposition(null, swappedU)).toBe(false);
  });

  it("does not fire on a doubled letter mistyped twice the same way", () => {
    // "ll" typed "kk": both wrong, adjacent, but nothing was swapped
    const first = { index: 4, expected: "l", typed: "k", correct: false };
    const second = { index: 5, expected: "l", typed: "k", correct: false };
    expect(isTransposition(first, second)).toBe(false);
  });
});

describe("computeConsistency", () => {
  // `perSecond[i]` keystrokes spread evenly through second i
  const timeline = (perSecond) => {
    const samples = [];
    let length = 0;
    perSecond.forEach((count, second) => {
      for (let k = 0; k < count; k++) {
        samples.push([second * 1000 + Math.floor((k * 1000) / count), ++length]);
      }
    });
    // One more keystroke to close the last whole second
    samples.push([perSecond.length * 1000, ++length]);
    return samples;
  };

  it("is 100 for a perfectly even pace", () => {
    expect(computeConsistency(timeline([5, 5, 5, 5, 5]))).toBe(100);
  });

  it("drops as the pace gets uneven", () => {
    const steady = computeConsistency(timeline([5, 6, 5, 4, 5]));
    const bumpy = computeConsistency(timeline([2, 9, 3, 8, 1]));
    expect(steady).toBeGreaterThan(80);
    expect(bumpy).toBeLessThan(60);
    expect(steady).toBeGreaterThan(bumpy);
  });

  it("doesn't count backspaces as pace", () => {
    const samples = timeline([5, 5, 5, 5]);
    // A backspace and a retype in the second second
    samples.splice(7, 0, [1500, samples[6][1] - 1], [1550, samples[6][1]]);
    expect(computeConsistency(samples)).toBe(100);
  });

  it("has nothing to say about a run under three seconds", () => {
    expect(computeConsistency(timeline([5, 5]))).toBeNull();
    expect(computeConsistency([])).toBeNull();
  });
});
