import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePaletteStore } from "./store";

describe("usePaletteStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("closes on running a command, and remembers it first", () => {
    const palette = usePaletteStore();
    palette.open();
    const run = vi.fn();
    palette.run({ id: "time:30", run });
    palette.run({ id: "words:50", run: vi.fn() });
    palette.run({ id: "time:30", run });

    expect(run).toHaveBeenCalledTimes(2);
    expect(palette.isOpen).toBe(false);
    expect(palette.recent).toEqual(["time:30", "words:50"]);
    // And after a reload
    setActivePinia(createPinia());
    expect(usePaletteStore().recent).toEqual(["time:30", "words:50"]);
  });

  it("stays open for a command that switches the view", () => {
    const palette = usePaletteStore();
    palette.open();
    palette.run({ id: "help", keepOpen: true, run: () => palette.open("shortcuts") });
    expect(palette.isOpen).toBe(true);
    expect(palette.view).toBe("shortcuts");
  });

  it("counts a run as keyboard-only until the mouse touches the page", () => {
    const palette = usePaletteStore();
    expect(palette.keyboardOnly).toBe(false);
    palette.run({ id: "time:30", run: () => {} });
    expect(palette.keyboardOnly).toBe(true);
    palette.touchedWithPointer();
    expect(palette.keyboardOnly).toBe(false);
  });

  it("toggles with the same keys", () => {
    const palette = usePaletteStore();
    palette.toggle();
    expect(palette.isOpen).toBe(true);
    palette.toggle();
    expect(palette.isOpen).toBe(false);
    // From the list of keys, the keys go to the commands
    palette.open("shortcuts");
    palette.toggle();
    expect(palette.isOpen).toBe(true);
    expect(palette.view).toBe("commands");
  });
});
