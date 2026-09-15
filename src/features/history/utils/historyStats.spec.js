import { describe, it, expect } from "vitest";
import {
  computeBestWpm,
  computeAverageWpm,
  computeAverageAccuracy,
  formatModeLabel,
} from "./historyStats";

const results = [
  { wpm: 60, accuracy: 95 },
  { wpm: 40, accuracy: 85 },
  { wpm: 80, accuracy: 100 },
];

describe("computeBestWpm", () => {
  it("is 0 for an empty list", () => {
    expect(computeBestWpm([])).toBe(0);
  });

  it("returns the highest wpm in the list", () => {
    expect(computeBestWpm(results)).toBe(80);
  });
});

describe("computeAverageWpm", () => {
  it("is 0 for an empty list", () => {
    expect(computeAverageWpm([])).toBe(0);
  });

  it("averages and rounds the wpm values", () => {
    expect(computeAverageWpm(results)).toBe(60);
  });
});

describe("computeAverageAccuracy", () => {
  it("is 0 for an empty list", () => {
    expect(computeAverageAccuracy([])).toBe(0);
  });

  it("averages and rounds the accuracy values", () => {
    expect(computeAverageAccuracy(results)).toBe(93);
  });
});

describe("formatModeLabel", () => {
  it("formats time mode with seconds", () => {
    expect(formatModeLabel({ mode: "time", modeValue: 15 })).toBe("15s");
  });

  it("formats words mode with the word count", () => {
    expect(formatModeLabel({ mode: "words", modeValue: 50 })).toBe("50 palabras");
  });

  it("formats code mode with a language", () => {
    expect(formatModeLabel({ mode: "code", modeValue: "JavaScript" })).toBe(
      "Código · JavaScript"
    );
  });

  it("formats code mode without a language", () => {
    expect(formatModeLabel({ mode: "code", modeValue: null })).toBe("Código");
  });

  it("formats quote mode", () => {
    expect(formatModeLabel({ mode: "quote", modeValue: null })).toBe("Cita");
  });

  it("formats zen mode", () => {
    expect(formatModeLabel({ mode: "zen", modeValue: null })).toBe("Zen");
  });
});
