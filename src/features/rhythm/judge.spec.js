import { describe, it, expect } from "vitest";
import { createRun, gradeFor, multiplierFor, STAR_COMBO, STAR_MS } from "./judge";

const notesAt = (chars, every = 500) =>
  [...chars].map((char, id) => ({
    id,
    time: 1000 + id * every,
    char,
    word: 0,
    index: id,
  }));

describe("gradeFor", () => {
  it("grades by how far off the beat, either way", () => {
    expect(gradeFor(0)).toBe("perfect");
    expect(gradeFor(-45)).toBe("perfect");
    expect(gradeFor(80)).toBe("good");
    expect(gradeFor(-140)).toBe("early");
    expect(gradeFor(140)).toBe("late");
    expect(gradeFor(200)).toBeNull();
  });
});

describe("multiplierFor", () => {
  it("climbs every ten in a row, up to eight", () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(9)).toBe(1);
    expect(multiplierFor(10)).toBe(2);
    expect(multiplierFor(500)).toBe(8);
  });
});

describe("createRun", () => {
  it("scores the right letter near its beat", () => {
    const run = createRun(notesAt("ab"));
    const hit = run.press("a", 1010);
    expect(hit).toMatchObject({ grade: "perfect", delta: 10, combo: 1, points: 100 });
    expect(run.press("b", 1360)).toMatchObject({ grade: "early", delta: -140, combo: 2 });
  });

  it("ignores a key with no letter near", () => {
    const run = createRun(notesAt("ab"));
    expect(run.press("a", 600)).toBeNull();
    expect(run.state().judgedCount).toBe(0);
  });

  it("charges a wrong key to the nearest letter and breaks the combo", () => {
    const run = createRun(notesAt("abc"));
    run.press("a", 1000);
    const wrong = run.press("x", 1500);
    expect(wrong).toMatchObject({ grade: "miss", typed: "x", combo: 0 });
    expect(run.state().combo).toBe(0);
  });

  it("misses the letters that pass by", () => {
    const run = createRun(notesAt("abc"));
    run.press("a", 1000);
    expect(run.sweep(1600)).toHaveLength(0);
    const missed = run.sweep(2700);
    expect(missed.map((m) => m.note.char)).toEqual(["b", "c"]);
    expect(run.done).toBe(true);
  });

  it("lights the star mode on a long combo, doubling the points", () => {
    const chars = "a".repeat(STAR_COMBO + 2);
    const notes = notesAt(chars, 200);
    const run = createRun(notes);
    let last;
    for (const note of notes) last = run.press("a", note.time);
    expect(run.state(notes.at(-1).time).star).toBe(true);
    expect(last.star).toBe(true);
    expect(last.points).toBe(100 * 6 * 2);
    expect(run.state(notes.at(-1).time + STAR_MS).star).toBe(false);
  });

  it("sums up a finished run", () => {
    const run = createRun(notesAt("abcd"));
    run.press("a", 1020);
    run.press("b", 1560);
    run.press("c", 1930);
    run.sweep(5000);
    const summary = run.summary();
    expect(summary.counts).toMatchObject({
      perfect: 1,
      good: 2,
      early: 0,
      late: 0,
      miss: 1,
    });
    expect(summary.hits).toBe(3);
    expect(summary.accuracy).toBe(75);
    expect(summary.offset).toBe(Math.round((20 + 60 - 70) / 3));
    expect(summary.spread).toBe(50);
    expect(summary.maxCombo).toBe(3);
    expect(summary.fullCombo).toBe(false);
  });

  describe("held letters", () => {
    const held = () => [
      { id: 0, time: 1000, char: "a", word: 0, index: 0, hold: 800 },
      { id: 1, time: 3000, char: "b", word: 1, index: 0 },
    ];

    it("pays the whole hold when the key stays down to the end", () => {
      const run = createRun(held());
      const hit = run.press("a", 1000);
      expect(hit.hold).toBe("holding");
      expect(run.state().holding).toBe(1);
      expect(run.sweep(1500)).toEqual([]);
      const [end] = run.sweep(1800);
      expect(end).toMatchObject({ kind: "hold", held: true, points: 160 });
      expect(run.judgmentOf(0).hold).toBe("held");
      expect(run.state().score).toBe(100 + 160);
    });

    it("counts a release just short of the end as held", () => {
      const run = createRun(held());
      run.press("a", 1000);
      expect(run.release("a", 1750)).toMatchObject([{ held: true, points: 160 }]);
    });

    it("pays only the part held when let go early, and keeps the combo", () => {
      const run = createRun(held());
      run.press("a", 1000);
      const [end] = run.release("a", 1400);
      expect(end).toMatchObject({ held: false, points: 80 });
      expect(run.judgmentOf(0).hold).toBe("dropped");
      expect(run.state().combo).toBe(1);
      run.press("b", 3000);
      run.sweep(5000);
      expect(run.summary().holds).toEqual({ total: 1, held: 0, dropped: 1 });
    });

    it("lets go of everything at once", () => {
      const run = createRun(held());
      run.press("a", 1000);
      expect(run.releaseAll(1200)).toHaveLength(1);
      expect(run.state().holding).toBe(0);
    });

    it("isn't held at all when it was missed", () => {
      const run = createRun(held());
      run.sweep(2000);
      expect(run.judgmentOf(0).hold).toBeUndefined();
      expect(run.release("a", 2100)).toEqual([]);
    });
  });
});
