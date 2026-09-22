import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeCustomText,
  validateCustomText,
  countWords,
  loadCustomTexts,
  saveCustomTexts,
  MAX_CUSTOM_TEXT_LENGTH,
} from "./customTexts";

describe("normalizeCustomText", () => {
  it("straightens out what can't be typed as it looks", () => {
    expect(normalizeCustomText("Hola\r\n\tmundo   \n\n\n\nChau  ")).toBe(
      "Hola\n  mundo\n\nChau"
    );
  });

  it("turns curly quotes, long dashes and ellipses into keyboard characters", () => {
    expect(normalizeCustomText("“Sí” — dijo… ‘no’")).toBe(`"Sí" - dijo... 'no'`);
  });

  it("leaves capitals, accents and punctuation alone", () => {
    expect(normalizeCustomText("¿Qué Pasó? ¡Ñandú!")).toBe("¿Qué Pasó? ¡Ñandú!");
  });

  it("caps the length", () => {
    expect(normalizeCustomText("a".repeat(MAX_CUSTOM_TEXT_LENGTH + 50))).toHaveLength(
      MAX_CUSTOM_TEXT_LENGTH
    );
  });
});

describe("validateCustomText", () => {
  it("needs a name and some text", () => {
    expect(validateCustomText({ name: " ", text: "un texto largo" })).toBe(
      "Ponele un nombre."
    );
    expect(validateCustomText({ name: "Mail", text: "  hola  " })).toMatch(/al menos/);
    expect(
      validateCustomText({ name: "Mail", text: "Estimado equipo, les escribo" })
    ).toBeNull();
  });
});

describe("countWords", () => {
  it("counts words across lines", () => {
    expect(countWords("hola que\ntal")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });
});

describe("custom text storage", () => {
  beforeEach(() => localStorage.clear());

  it("reads back what was saved", () => {
    const texts = [{ id: "a", name: "Mail", text: "Estimado equipo" }];
    expect(saveCustomTexts(texts)).toBe(true);
    expect(loadCustomTexts()).toEqual(texts);
  });

  it("drops anything stored that isn't a text", () => {
    localStorage.setItem(
      "swiftflow_custom_texts",
      JSON.stringify([{ id: "a", name: "Ok", text: "bien" }, { id: 3 }, null, "x"])
    );
    expect(loadCustomTexts()).toEqual([{ id: "a", name: "Ok", text: "bien" }]);
  });

  it("starts empty on anything unreadable", () => {
    localStorage.setItem("swiftflow_custom_texts", "{nope");
    expect(loadCustomTexts()).toEqual([]);
  });
});
