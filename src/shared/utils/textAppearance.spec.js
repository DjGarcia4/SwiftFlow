import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTextAppearance,
  saveTextAppearance,
  sanitizeTextAppearance,
  textStyleFor,
  TEXT_APPEARANCE_DEFAULTS,
} from "./textAppearance";

describe("text appearance", () => {
  beforeEach(() => localStorage.clear());

  it("starts as the text has always looked", () => {
    expect(loadTextAppearance()).toEqual(TEXT_APPEARANCE_DEFAULTS);
    expect(textStyleFor(TEXT_APPEARANCE_DEFAULTS, { wide: true })).toEqual({
      fontFamily: "var(--font-mono)",
      fontSize: "30px",
      lineHeight: 1.9,
    });
  });

  it("keeps what was picked", () => {
    const picked = {
      font: "opendyslexic",
      size: "xl",
      lineHeight: "loose",
      caretMotion: "instant",
      focus: "on",
    };
    saveTextAppearance(picked);
    expect(loadTextAppearance()).toEqual(picked);
    expect(textStyleFor(picked, { wide: false })).toMatchObject({
      fontSize: "32px",
      lineHeight: 2.3,
    });
  });

  it("drops anything that's no longer an option", () => {
    expect(sanitizeTextAppearance({ font: "comic-sans", size: "l", extra: 1 })).toEqual({
      ...TEXT_APPEARANCE_DEFAULTS,
      size: "l",
    });
    expect(sanitizeTextAppearance(null)).toEqual(TEXT_APPEARANCE_DEFAULTS);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("swiftflow_text_appearance", "{nope");
    expect(loadTextAppearance()).toEqual(TEXT_APPEARANCE_DEFAULTS);
  });
});
