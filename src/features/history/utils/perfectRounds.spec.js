import { describe, it, expect } from "vitest";
import {
  isPerfectRound,
  tallyPerfectRounds,
  mergePerfectTallies,
  MIN_PERFECT_KEYSTROKES,
} from "./perfectRounds";

describe("isPerfectRound", () => {
  it("needs zero wrong keystrokes, corrected ones included", () => {
    expect(isPerfectRound({ keystrokes: 80, errorKeystrokes: 0, accuracy: 100 })).toBe(
      true
    );
    // 1 in 300 still rounds to 100% accuracy
    expect(isPerfectRound({ keystrokes: 300, errorKeystrokes: 1, accuracy: 100 })).toBe(
      false
    );
  });

  it("doesn't count sessions too short to matter", () => {
    expect(
      isPerfectRound({ keystrokes: MIN_PERFECT_KEYSTROKES - 1, errorKeystrokes: 0 })
    ).toBe(false);
  });

  it("falls back to accuracy and errors for sessions without keystroke data", () => {
    expect(isPerfectRound({ accuracy: 100, errors: 0 })).toBe(true);
    expect(isPerfectRound({ accuracy: 100, errors: 1 })).toBe(false);
    expect(isPerfectRound({ accuracy: 98, errors: 0 })).toBe(false);
  });
});

describe("tallyPerfectRounds", () => {
  it("counts perfect rounds per mode and value", () => {
    const perfect = { keystrokes: 50, errorKeystrokes: 0 };
    expect(
      tallyPerfectRounds([
        { mode: "time", modeValue: 15, ...perfect },
        { mode: "time", modeValue: 15, ...perfect },
        { mode: "time", modeValue: 30, ...perfect },
        { mode: "time", modeValue: 30, keystrokes: 50, errorKeystrokes: 2 },
        { mode: "quote", modeValue: null, ...perfect },
      ])
    ).toEqual({
      "time:15": { mode: "time", modeValue: 15, count: 2 },
      "time:30": { mode: "time", modeValue: 30, count: 1 },
      "quote:": { mode: "quote", modeValue: null, count: 1 },
    });
  });
});

describe("mergePerfectTallies", () => {
  it("keeps the higher count for each kind", () => {
    expect(
      mergePerfectTallies(
        {
          "time:15": { mode: "time", modeValue: 15, count: 5 },
          "zen:": { mode: "zen", modeValue: null, count: 1 },
        },
        {
          "time:15": { mode: "time", modeValue: 15, count: 3 },
          "zen:": { mode: "zen", modeValue: null, count: 2 },
          "quote:": { mode: "quote", modeValue: null, count: 1 },
        }
      )
    ).toEqual({
      "time:15": { mode: "time", modeValue: 15, count: 5 },
      "zen:": { mode: "zen", modeValue: null, count: 2 },
      "quote:": { mode: "quote", modeValue: null, count: 1 },
    });
  });
});
