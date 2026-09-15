import { describe, it, expect, beforeEach } from "vitest";
import { loadSoundSettings, saveSoundSettings } from "./soundSettingsRepository";

describe("soundSettingsRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns all-enabled defaults when nothing is stored", () => {
    expect(loadSoundSettings()).toEqual({
      soundEnabled: true,
      keystrokeSound: true,
      errorSound: true,
      celebrationSound: true,
    });
  });

  it("returns what was previously saved", () => {
    saveSoundSettings({
      soundEnabled: true,
      keystrokeSound: false,
      errorSound: true,
      celebrationSound: true,
    });

    expect(loadSoundSettings()).toMatchObject({ keystrokeSound: false });
  });

  it("falls back to defaults on corrupted JSON", () => {
    localStorage.setItem("swiftflow_sound_settings", "{not valid json");
    expect(loadSoundSettings()).toEqual({
      soundEnabled: true,
      keystrokeSound: true,
      errorSound: true,
      celebrationSound: true,
    });
  });

  it("fills in missing keys with defaults (e.g. an older saved shape)", () => {
    localStorage.setItem(
      "swiftflow_sound_settings",
      JSON.stringify({ soundEnabled: false })
    );
    expect(loadSoundSettings()).toEqual({
      soundEnabled: false,
      keystrokeSound: true,
      errorSound: true,
      celebrationSound: true,
    });
  });
});
