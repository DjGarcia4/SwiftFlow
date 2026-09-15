import { describe, it, expect, beforeEach } from "vitest";
import { loadConfig, saveConfig, sanitizeConfig } from "./configRepository";

const options = {
  types: ["time", "words", "quote", "code", "zen"],
  times: [15, 30, 60, 120],
  words: [10, 25, 50, 100],
  languages: ["JavaScript", "Python", "Java"],
};

describe("loadConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the defaults when nothing is stored", () => {
    expect(loadConfig()).toEqual({
      type: "time",
      selectedTime: 15,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: null,
    });
  });

  it("returns what was previously saved", () => {
    saveConfig({ type: "words", selectedWords: 50 });
    expect(loadConfig()).toMatchObject({ type: "words", selectedWords: 50 });
  });

  it("falls back to defaults on corrupted JSON", () => {
    localStorage.setItem("swiftflow_config", "{not valid json");
    expect(loadConfig()).toEqual({
      type: "time",
      selectedTime: 15,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: null,
    });
  });
});

describe("sanitizeConfig", () => {
  it("keeps values that are still valid options", () => {
    const config = {
      type: "code",
      selectedTime: 30,
      selectedWords: 50,
      selectedContentTypes: null,
      selectedCodeLanguage: "Python",
    };
    expect(sanitizeConfig(config, options)).toEqual(config);
  });

  it("falls back to defaults for a mode that no longer exists", () => {
    const config = {
      type: "marathon",
      selectedTime: 15,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: null,
    };
    expect(sanitizeConfig(config, options).type).toBe("time");
  });

  it("falls back to defaults for a time that no longer exists", () => {
    const config = {
      type: "time",
      selectedTime: 45,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: null,
    };
    expect(sanitizeConfig(config, options).selectedTime).toBe(15);
  });

  it("falls back to null for a code language no longer in the content bank", () => {
    const config = {
      type: "code",
      selectedTime: 15,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: "Cobol",
    };
    expect(sanitizeConfig(config, options).selectedCodeLanguage).toBeNull();
  });
});
