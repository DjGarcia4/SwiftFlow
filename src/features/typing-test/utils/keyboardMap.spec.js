import { describe, it, expect } from "vitest";
import { keyboardTarget, foldByKey } from "./keyboardMap";

describe("keyboardTarget", () => {
  it("maps plain letters, digits and the space bar", () => {
    expect(keyboardTarget("a")).toEqual({ key: "a", shift: false, accent: false });
    expect(keyboardTarget("ñ")).toEqual({ key: "ñ", shift: false, accent: false });
    expect(keyboardTarget("7")).toEqual({ key: "7", shift: false, accent: false });
    expect(keyboardTarget(" ")).toEqual({ key: " ", shift: false, accent: false });
  });

  it("asks for Shift on capitals", () => {
    expect(keyboardTarget("Ñ")).toEqual({ key: "ñ", shift: true, accent: false });
  });

  it("asks for the accent key on accented vowels", () => {
    expect(keyboardTarget("é")).toEqual({ key: "e", shift: false, accent: true });
    expect(keyboardTarget("Á")).toEqual({ key: "a", shift: true, accent: true });
  });

  it("finds the upper symbols under Shift", () => {
    expect(keyboardTarget(":")).toEqual({ key: ".", shift: true, accent: false });
    expect(keyboardTarget("(")).toEqual({ key: "8", shift: true, accent: false });
  });

  it("gives up on what the drawn keyboard has no key for", () => {
    expect(keyboardTarget("¿")).toBeNull();
    expect(keyboardTarget("\n")).toBeNull();
    expect(keyboardTarget("")).toBeNull();
  });
});

describe("foldByKey", () => {
  it("adds every character up on the key that makes it", () => {
    expect(foldByKey({ a: 3, A: 1, á: 2, "¿": 5, ":": 1 })).toEqual({ a: 6, ".": 1 });
  });
});
