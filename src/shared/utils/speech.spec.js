import { describe, it, expect } from "vitest";
import { pickSpanishVoice, pickEnglishVoice, pickVoice } from "./speech";

const voice = (lang, extra = {}) => ({ lang, name: lang, localService: false, ...extra });

describe("pickSpanishVoice", () => {
  const voices = [voice("en-US"), voice("es-ES"), voice("es-MX"), voice("es-AR")];

  it("prefers your own variant", () => {
    expect(pickSpanishVoice(voices, ["es-AR"]).lang).toBe("es-AR");
    expect(pickSpanishVoice(voices, ["es-ES"]).lang).toBe("es-ES");
  });

  it("falls back within Latin America, then to Spain", () => {
    expect(pickSpanishVoice([voice("es-ES"), voice("es-MX")], ["es-CO"]).lang).toBe(
      "es-MX"
    );
    expect(pickSpanishVoice([voice("es-ES"), voice("es-MX")], ["es-ES"]).lang).toBe(
      "es-ES"
    );
    expect(pickSpanishVoice([voice("es-ES")], ["es-AR"]).lang).toBe("es-ES");
  });

  it("assumes Latin American Spanish when the browser isn't in Spanish", () => {
    expect(pickSpanishVoice(voices, ["en-US"]).lang).toMatch(/es-(MX|AR)/);
  });

  it("prefers a voice that works offline, and copes with es_ES spellings", () => {
    const pick = pickSpanishVoice(
      [voice("es_MX"), voice("es-MX", { localService: true, name: "local" })],
      ["es-MX"]
    );
    expect(pick.name).toBe("local");
  });

  it("has nothing to offer without a Spanish voice", () => {
    expect(pickSpanishVoice([voice("en-US")], ["es-AR"])).toBeNull();
  });
});

describe("pickEnglishVoice", () => {
  const voice = (lang) => ({ lang, name: lang, localService: false });

  it("prefers your own variant, then the US, then Britain", () => {
    const voices = [voice("es-AR"), voice("en-GB"), voice("en-US"), voice("en-AU")];
    expect(pickEnglishVoice(voices, ["en-AU"]).lang).toBe("en-AU");
    expect(pickEnglishVoice(voices, ["es-AR"]).lang).toBe("en-US");
    expect(pickEnglishVoice([voice("en-GB"), voice("en-IN")], []).lang).toBe("en-GB");
  });

  it("is null without an English voice", () => {
    expect(pickEnglishVoice([voice("es-ES")], ["en-US"])).toBeNull();
  });

  it("is what pickVoice picks for English, and the Spanish one otherwise", () => {
    const voices = [voice("es-ES"), voice("en-US")];
    expect(pickVoice("en", voices).lang).toBe("en-US");
    expect(pickVoice("es", voices).lang).toBe("es-ES");
  });
});
