import { describe, it, expect } from "vitest";
import { rhythmResult, bestRhythmScore, rhythmRank } from "./results";
import { trackById, trackTimeline } from "./tracks";

const track = trackById("pulso");
const { beatMs } = trackTimeline(track);

const summary = {
  total: 50,
  hits: 45,
  counts: { perfect: 30, good: 10, early: 3, late: 2, miss: 5 },
  score: 12345,
  maxCombo: 21,
  stars: 0,
  accuracy: 90,
  timing: 78.4,
  offset: 12,
  spread: 40,
  fullCombo: false,
};

describe("rhythmResult", () => {
  // Fifty letters over a minute, less the beat added after the last
  const notes = Array.from({ length: 50 }, (_, id) => ({
    id,
    time: (id / 49) * (60000 - beatMs),
    char: "a",
  }));

  it("stores a run like any other mode, with its own part under rhythm", () => {
    const entry = rhythmResult({
      summary,
      notes,
      track,
      difficulty: "hard",
      keyStats: { attempts: { a: 50 }, missed: { a: 5 }, confusions: { as: 2 } },
    });
    expect(entry).toMatchObject({
      mode: "rhythm",
      modeValue: "pulso",
      wpm: 9,
      rawWpm: 10,
      accuracy: 90,
      errors: 5,
      maxStreak: 21,
      keystrokes: 50,
      errorKeystrokes: 5,
      keyAttempts: { a: 50 },
      missedKeys: { a: 5 },
      confusions: { as: 2 },
      rhythm: { difficulty: "hard", score: 12345, offset: 12, fullCombo: false },
    });
    expect(entry).not.toHaveProperty("textLanguage");
  });

  it("says the language only when it isn't Spanish", () => {
    const entry = rhythmResult({
      summary,
      notes,
      track,
      difficulty: "easy",
      textLanguage: "en",
    });
    expect(entry.textLanguage).toBe("en");
  });
});

describe("bestRhythmScore", () => {
  it("is the best on that track and difficulty", () => {
    const results = [
      { mode: "rhythm", modeValue: "pulso", rhythm: { difficulty: "hard", score: 900 } },
      { mode: "rhythm", modeValue: "pulso", rhythm: { difficulty: "hard", score: 1200 } },
      { mode: "rhythm", modeValue: "pulso", rhythm: { difficulty: "easy", score: 5000 } },
      { mode: "rhythm", modeValue: "neon", rhythm: { difficulty: "hard", score: 7000 } },
      { mode: "words", modeValue: 25 },
    ];
    expect(bestRhythmScore(results, "pulso", "hard")).toBe(1200);
    expect(bestRhythmScore(results, "calma", "hard")).toBe(0);
  });
});

describe("rhythmRank", () => {
  it("gives an S only to a flawless run on the beat", () => {
    expect(rhythmRank({ timing: 97, fullCombo: true })).toBe("S");
    expect(rhythmRank({ timing: 97, fullCombo: false })).toBe("A");
    expect(rhythmRank({ timing: 85, fullCombo: true })).toBe("B");
    expect(rhythmRank({ timing: 70, fullCombo: false })).toBe("C");
    expect(rhythmRank({ timing: 40, fullCombo: false })).toBe("D");
  });
});
