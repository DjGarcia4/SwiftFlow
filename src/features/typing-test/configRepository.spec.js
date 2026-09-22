import { describe, it, expect, beforeEach } from "vitest";
import { loadConfig, saveConfig, sanitizeConfig } from "./configRepository";

const options = {
  types: ["time", "words", "numbers", "quote", "code", "zen", "drill"],
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
      drillKeys: [],
      showKeyboard: null,
      pacerWpm: null,
      blindMode: false,
      selectedCustomTextId: null,
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
      drillKeys: [],
      showKeyboard: null,
      pacerWpm: null,
      blindMode: false,
      selectedCustomTextId: null,
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
      drillKeys: ["r", "t"],
      showKeyboard: true,
      pacerWpm: 60,
      blindMode: true,
      selectedCustomTextId: "abc",
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

  it("cleans up the drill keys and caps how many there can be", () => {
    const config = {
      type: "drill",
      selectedTime: 15,
      selectedWords: 100,
      selectedContentTypes: "punctuation",
      selectedCodeLanguage: null,
      drillKeys: ["R", "r", " ", "1", "ab", "t", "b", "c", "d", "f"],
    };
    expect(sanitizeConfig(config, options).drillKeys).toEqual(["r", "t", "b", "c", "d"]);
  });

  it("drops drill keys that aren't a usable list at all", () => {
    const config = { type: "drill", drillKeys: "rt" };
    expect(sanitizeConfig(config, options).drillKeys).toEqual([]);
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

  it("keeps the keyboard choice only when one was made", () => {
    expect(sanitizeConfig({ showKeyboard: false }, options).showKeyboard).toBe(false);
    expect(sanitizeConfig({ showKeyboard: "yes" }, options).showKeyboard).toBeNull();
    expect(sanitizeConfig({}, options).showKeyboard).toBeNull();
  });

  it("keeps a sensible pacer speed and falls back to Auto otherwise", () => {
    expect(sanitizeConfig({ pacerWpm: 70 }, options).pacerWpm).toBe(70);
    expect(sanitizeConfig({ pacerWpm: 9000 }, options).pacerWpm).toBeNull();
    expect(sanitizeConfig({ pacerWpm: "60" }, options).pacerWpm).toBeNull();
  });
});
