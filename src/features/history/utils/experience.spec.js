import { describe, it, expect } from "vitest";
import {
  sessionXp,
  computeHistoryXp,
  levelFromXp,
  levelTitle,
  xpToNextLevel,
  SESSION_XP,
  PERFECT_ROUND_XP,
  CHALLENGE_XP,
  FULL_DAY_XP,
} from "./experience";

describe("sessionXp", () => {
  it("pays for showing up plus every ten correct keystrokes", () => {
    expect(sessionXp({ keystrokes: 260, errorKeystrokes: 10 })).toBe(SESSION_XP + 25);
  });

  it("adds a bonus for a perfect round", () => {
    expect(sessionXp({ keystrokes: 100, errorKeystrokes: 0 })).toBe(
      SESSION_XP + 10 + PERFECT_ROUND_XP
    );
  });

  it("pays nothing for a session too short to be one", () => {
    expect(sessionXp({ keystrokes: 5, errorKeystrokes: 0 })).toBe(0);
  });

  it("gives old sessions without keystroke data the flat part", () => {
    expect(sessionXp({ wpm: 50, accuracy: 100, errors: 0 })).toBe(SESSION_XP);
  });
});

describe("computeHistoryXp", () => {
  it("adds sessions, challenges and full days", () => {
    const results = [
      { keystrokes: 100, errorKeystrokes: 5 },
      { keystrokes: 200, errorKeystrokes: 0 },
    ];
    expect(computeHistoryXp(results, { completed: 4, fullDays: 1 })).toBe(
      sessionXp(results[0]) + sessionXp(results[1]) + 4 * CHALLENGE_XP + FULL_DAY_XP
    );
  });
});

describe("levelFromXp", () => {
  it("starts at level 1", () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      title: "Novato",
      xpIntoLevel: 0,
      xpForNextLevel: xpToNextLevel(1),
      fraction: 0,
    });
  });

  it("carries the leftover into the next level", () => {
    const xp = xpToNextLevel(1) + xpToNextLevel(2) + 10;
    expect(levelFromXp(xp)).toMatchObject({ level: 3, xpIntoLevel: 10 });
  });

  it("makes each level cost more than the last", () => {
    expect(xpToNextLevel(10)).toBeGreaterThan(xpToNextLevel(9));
  });
});

describe("levelTitle", () => {
  it("changes name every few levels", () => {
    expect(levelTitle(4)).toBe("Novato");
    expect(levelTitle(5)).toBe("Aprendiz");
    expect(levelTitle(99)).toBe("Leyenda");
  });
});
