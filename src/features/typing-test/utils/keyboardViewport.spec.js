import { describe, it, expect } from "vitest";
import { computeKeyboardViewportStyle } from "./keyboardViewport";

describe("computeKeyboardViewportStyle", () => {
  it("returns no override when the visual viewport matches the full height", () => {
    const style = computeKeyboardViewportStyle({
      innerHeight: 800,
      visualViewport: { offsetTop: 0, height: 800 },
    });
    expect(style).toEqual({});
  });

  it("ignores small deltas (browser chrome show/hide, not a keyboard)", () => {
    const style = computeKeyboardViewportStyle({
      innerHeight: 800,
      visualViewport: { offsetTop: 0, height: 760 }, // 40px delta
    });
    expect(style).toEqual({});
  });

  it("recenters and shrinks max-height once the keyboard covers enough of the screen", () => {
    const style = computeKeyboardViewportStyle({
      innerHeight: 800,
      visualViewport: { offsetTop: 0, height: 500 }, // 300px keyboard inset
    });
    expect(style).toEqual({
      top: "250px", // offsetTop(0) + height/2 (250)
      maxHeight: "425px", // height * 0.85
    });
  });

  it("accounts for a non-zero visualViewport offsetTop (page scrolled while keyboard is open)", () => {
    const style = computeKeyboardViewportStyle({
      innerHeight: 800,
      visualViewport: { offsetTop: 40, height: 500 },
    });
    expect(style.top).toBe("290px"); // 40 + 500/2
  });
});
