import { describe, it, expect } from "vitest";
import { staggerStyle } from "./motion";

describe("staggerStyle", () => {
  it("delays each item by one step", () => {
    expect(staggerStyle(0)).toEqual({ animationDelay: "0ms" });
    expect(staggerStyle(3)).toEqual({ animationDelay: "180ms" });
  });

  it("adds the base delay and caps at max", () => {
    expect(staggerStyle(2, { step: 50, base: 100 })).toEqual({ animationDelay: "200ms" });
    expect(staggerStyle(100)).toEqual({ animationDelay: "600ms" });
  });
});
