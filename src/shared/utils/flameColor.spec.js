import { describe, it, expect } from "vitest";
import { getCharacterStreakColorRgb, getDailyStreakColorRgb } from "./flameColor";

describe("getCharacterStreakColorRgb", () => {
  it("is amber at the first stop", () => {
    expect(getCharacterStreakColorRgb(15)).toEqual([245, 158, 11]);
  });

  it("is orange at the middle stop", () => {
    expect(getCharacterStreakColorRgb(40)).toEqual([249, 115, 22]);
  });

  it("is red at the last stop", () => {
    expect(getCharacterStreakColorRgb(80)).toEqual([220, 38, 38]);
  });

  it("clamps to amber below the first stop", () => {
    expect(getCharacterStreakColorRgb(0)).toEqual([245, 158, 11]);
  });

  it("clamps to red above the last stop", () => {
    expect(getCharacterStreakColorRgb(200)).toEqual([220, 38, 38]);
  });

  it("interpolates between amber and orange", () => {
    const [r, g, b] = getCharacterStreakColorRgb(27); // roughly halfway between 15 and 40
    expect(r).toBeGreaterThan(245);
    expect(g).toBeLessThan(158);
    expect(b).toBeGreaterThan(11);
  });

  it("interpolates between orange and red", () => {
    const [r, g, b] = getCharacterStreakColorRgb(60); // roughly halfway between 40 and 80
    expect(r).toBeLessThan(249);
    expect(g).toBeLessThan(115);
    expect(b).toBeGreaterThan(22);
  });
});

describe("getDailyStreakColorRgb", () => {
  it("is amber on day one", () => {
    expect(getDailyStreakColorRgb(1)).toEqual([245, 158, 11]);
  });

  it("is orange at a week", () => {
    expect(getDailyStreakColorRgb(7)).toEqual([249, 115, 22]);
  });

  it("is red at a month", () => {
    expect(getDailyStreakColorRgb(30)).toEqual([220, 38, 38]);
  });

  it("clamps to amber at/below zero", () => {
    expect(getDailyStreakColorRgb(0)).toEqual([245, 158, 11]);
  });

  it("clamps to red beyond a month", () => {
    expect(getDailyStreakColorRgb(365)).toEqual([220, 38, 38]);
  });
});
