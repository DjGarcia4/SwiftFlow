import { describe, it, expect } from "vitest";
import { buildChart, playableWords, stepsPerBeat } from "./chart";
import { TRACKS, trackById, trackTimeline } from "./tracks";
import { seededRandom } from "@/shared/utils/seededRandom";

const bank = ["sol", "casa", "mesa", "árbol", "Perro", "luz", "camino", "teclado", "sol"];

describe("playableWords", () => {
  it("keeps the words this difficulty takes, lowercased and once each", () => {
    expect(playableWords(bank, "easy", () => true)).toEqual([
      "sol",
      "casa",
      "mesa",
      "árbol",
      "perro",
      "luz",
    ]);
  });

  it("drops a word with a letter the keyboard can't make in one key", () => {
    const words = playableWords(bank, "normal", (char) => char !== "á");
    expect(words).not.toContain("árbol");
    expect(words).toContain("teclado");
  });
});

describe("stepsPerBeat", () => {
  it("goes to sixteenths only for expert on a slow song", () => {
    expect(stepsPerBeat("easy", 84)).toBe(1);
    expect(stepsPerBeat("hard", 84)).toBe(2);
    expect(stepsPerBeat("expert", 84)).toBe(4);
    expect(stepsPerBeat("expert", 148)).toBe(2);
  });
});

describe("buildChart", () => {
  const track = trackById("pulso");
  const chart = buildChart({
    track,
    difficulty: "normal",
    bank,
    random: seededRandom(7),
  });
  const { beatMs, playStartMs, playEndMs } = trackTimeline(track);

  it("lays every letter of its words on the grid, in order", () => {
    expect(chart.notes.length).toBeGreaterThan(20);
    for (const [i, note] of chart.notes.entries()) {
      expect(note.id).toBe(i);
      expect(note.char).toBe(chart.words[note.word].text[note.index]);
      if (i > 0) expect(note.time).toBeGreaterThan(chart.notes[i - 1].time);
    }
  });

  it("keeps every letter inside the song's playing part", () => {
    expect(chart.notes[0].time).toBe(Math.round(playStartMs));
    expect(chart.notes.at(-1).time).toBeLessThan(playEndMs);
  });

  it("starts each word on a beat, after a rest", () => {
    for (const word of chart.words) {
      const time = chart.notes[word.first].time - playStartMs;
      expect(Math.abs(time / beatMs - Math.round(time / beatMs))).toBeLessThan(0.01);
    }
    const second = chart.notes[chart.words[1].first];
    const lastOfFirst = chart.notes[chart.words[1].first - 1];
    expect(second.time - lastOfFirst.time).toBeGreaterThan(beatMs * 1.5);
  });

  it("comes out the same for the same seed", () => {
    const again = buildChart({
      track,
      difficulty: "normal",
      bank,
      random: seededRandom(7),
    });
    expect(again).toEqual(chart);
  });

  it("is empty when no word can be played", () => {
    expect(
      buildChart({ track, difficulty: "easy", bank: ["supercalifragilístico"] })
    ).toEqual({ notes: [], words: [] });
  });

  it("builds on every track and difficulty", () => {
    for (const each of TRACKS) {
      for (const difficulty of ["easy", "normal", "hard", "expert"]) {
        const { notes } = buildChart({
          track: each,
          difficulty,
          bank: [...bank, "teclados"],
        });
        expect(notes.length).toBeGreaterThan(0);
      }
    }
  });

  it("holds some last letters through the rest, let go before the next word", () => {
    const long = buildChart({
      track: trackById("calma"),
      difficulty: "easy",
      bank,
      random: seededRandom(3),
    });
    const holds = long.notes.filter((note) => note.hold);
    expect(holds.length).toBeGreaterThan(0);
    for (const note of holds) {
      const word = long.words[note.word];
      expect(note.index).toBe(word.text.length - 1);
      const next = long.notes[note.id + 1];
      if (next) expect(note.time + note.hold).toBeLessThan(next.time);
    }
  });
});
