import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCustomizationStore } from "./customization";
import { totalXpForLevel } from "@/features/history/utils/experience";

const atLevel = (level) => {
  localStorage.setItem("swiftflow_xp", String(totalXpForLevel(level)));
  setActivePinia(createPinia());
  return useCustomizationStore();
};

describe("useCustomizationStore", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.accent;
  });

  it("starts on the defaults", () => {
    const store = atLevel(1);
    expect([store.accent, store.caret, store.sound]).toEqual(["orange", "bar", "soft"]);
    expect(document.documentElement.dataset.accent).toBeUndefined();
  });

  it("uses what was chosen once it's unlocked, and themes the app with it", () => {
    const store = atLevel(8);
    store.choose("accent", "violet");
    store.choose("caret", "underline");
    expect(store.accent).toBe("violet");
    expect(store.caret).toBe("underline");
    expect(document.documentElement.dataset.accent).toBe("violet");
  });

  it("keeps a locked choice but uses the default until it's earned", () => {
    atLevel(20).choose("accent", "indigo");
    const store = atLevel(5);
    expect(store.chosen.accent).toBe("indigo");
    expect(store.accent).toBe("orange");
  });
});
