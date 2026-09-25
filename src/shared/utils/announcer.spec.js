import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { announce, announcements, sentences, spokenNumber } from "./announcer";

describe("announce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (fn) => setTimeout(fn, 16));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps each message until it's been read, then lets it go", () => {
    announce("Terminaste.");
    announce("¡Logro desbloqueado!");
    announce("Cuidado", { assertive: true });
    vi.advanceTimersByTime(20);
    expect(announcements.polite.map((line) => line.text)).toEqual([
      "Terminaste.",
      "¡Logro desbloqueado!",
    ]);
    expect(announcements.assertive.map((line) => line.text)).toEqual(["Cuidado"]);

    vi.advanceTimersByTime(10_000);
    expect(announcements.polite).toEqual([]);
    expect(announcements.assertive).toEqual([]);
  });
});

describe("sentences", () => {
  it("ends each piece once, and skips empty ones", () => {
    expect(sentences(["¡Reto cumplido!", "Veloz", null, "30 wpm"])).toBe(
      "¡Reto cumplido! Veloz. 30 wpm."
    );
  });
});

describe("spokenNumber", () => {
  it("uses a decimal comma", () => {
    expect(spokenNumber(64.46, 1)).toBe("64,5");
    expect(spokenNumber(97)).toBe("97");
  });
});
