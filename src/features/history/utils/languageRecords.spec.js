import { describe, it, expect } from "vitest";
import {
  computePersonalBests,
  formatModeLabel,
  sessionKind,
  languageOf,
} from "./historyStats";
import { tallyPerfectRounds } from "./perfectRounds";
import { computeSummary } from "./summary";
import { setLocale } from "@/shared/i18n";

// English texts and Spanish ones are different exercises: each keeps its
// own records, and says which it is
describe("records per language", () => {
  const spanish = { mode: "words", modeValue: 25, wpm: 60 };
  const english = { mode: "words", modeValue: 25, wpm: 70, textLanguage: "en" };

  it("keeps the kinds from before, and gives English its own", () => {
    expect(sessionKind(spanish)).toBe("words:25");
    expect(sessionKind(english)).toBe("words:25:en");
    expect(languageOf(spanish)).toBe("es");
    expect(languageOf(english)).toBe("en");
  });

  it("keeps a best for each language", () => {
    const bests = computePersonalBests([
      spanish,
      english,
      { ...spanish, wpm: 50 },
      { ...english, wpm: 40 },
    ]);
    expect(bests.map((best) => best.wpm)).toEqual([70, 60]);
  });

  it("says when a run was on English texts", () => {
    expect(formatModeLabel(spanish)).toBe("25 palabras");
    expect(formatModeLabel(english)).toBe("25 palabras · inglés");
    setLocale("en");
    expect(formatModeLabel(english)).toBe("25 words · English");
    setLocale("es");
  });

  it("tallies perfect rounds apart", () => {
    const perfect = { keystrokes: 100, errorKeystrokes: 0 };
    const tally = tallyPerfectRounds([
      { ...spanish, ...perfect },
      { ...english, ...perfect },
      { ...english, ...perfect },
    ]);
    expect(tally["words:25"].count).toBe(1);
    expect(tally["words:25:en"]).toEqual({
      mode: "words",
      modeValue: 25,
      textLanguage: "en",
      count: 2,
    });
  });

  it("only calls a month's best a record against the same language", () => {
    const run = (date, wpm, extra = {}) => ({
      date: new Date(date).toISOString(),
      metricsVersion: 3,
      mode: "time",
      modeValue: 30,
      wpm,
      accuracy: 95,
      timeElapsed: 30,
      ...extra,
    });
    const period = { kind: "month", year: 2026, month: 8 };
    const now = new Date(2026, 8, 30);
    // 80 in Spanish in August; 60 in English in September
    const results = [
      run("2026-09-10T12:00:00", 60, { textLanguage: "en" }),
      run("2026-08-10T12:00:00", 80),
    ];
    expect(computeSummary(results, period, now).best.record).toBe(true);
    const faster = [run("2026-08-12T12:00:00", 90, { textLanguage: "en" }), ...results];
    expect(computeSummary(faster, period, now).best.record).toBe(false);
  });
});
