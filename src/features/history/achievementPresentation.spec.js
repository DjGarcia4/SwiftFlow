import { describe, it, expect } from "vitest";
import { achievementTintStyle, achievementSolidStyle } from "./achievementPresentation";

describe("achievementTintStyle", () => {
  it("returns a translucent background and solid border/text for the category", () => {
    const style = achievementTintStyle({ category: "speed" });
    expect(style).toEqual({
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      borderColor: "rgb(37 99 235)",
      color: "rgb(37 99 235)",
    });
  });

  it("falls back to a neutral color for an unknown category", () => {
    const style = achievementTintStyle({ category: "unknown" });
    expect(style.borderColor).toBe("rgb(100 116 139)");
  });
});

describe("achievementSolidStyle", () => {
  it("returns a solid category-colored background with white text", () => {
    const style = achievementSolidStyle({ category: "speed" });
    expect(style.backgroundColor).toBe("rgb(37 99 235)");
    expect(style.color).toBe("white");
  });

  it("darkens the base color for the border", () => {
    const style = achievementSolidStyle({ category: "speed" });
    // 75% of [37, 99, 235] rounded
    expect(style.borderColor).toBe("rgb(28 74 176)");
  });
});
