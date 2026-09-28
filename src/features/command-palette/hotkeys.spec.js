import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useHotkeysStore } from "./hotkeys";

const press = (key, extra = {}) => ({
  key,
  code: /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  target: document.body,
  ...extra,
});

// With ⌥ held, a Mac types another character: the key is found by its code
const altPress = (letter) =>
  press("©", { code: `Key${letter.toUpperCase()}`, altKey: true });

describe("useHotkeysStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("finds a button by its letter, and only while it can be pressed", () => {
    const hotkeys = useHotkeysStore();
    let shown = true;
    const share = { key: "c", run: vi.fn(), enabled: () => shown };
    hotkeys.register("share", share);

    expect(hotkeys.match(press("c"))).toBe(share);
    expect(hotkeys.match(press("C"))).toBe(share);
    expect(hotkeys.comboFor("share")).toBe("C");

    shown = false;
    expect(hotkeys.match(press("c"))).toBeNull();
    expect(hotkeys.comboFor("share")).toBeNull();
  });

  it("takes Alt while letters are typing, and the chip says so", () => {
    const hotkeys = useHotkeysStore();
    const challenges = { key: "l", run: vi.fn() };
    const history = { key: "h", run: vi.fn(), plainOnly: true };
    hotkeys.register("challenges", challenges);
    hotkeys.register("history", history);
    hotkeys.captured = true;

    expect(hotkeys.match(press("l"))).toBeNull();
    expect(hotkeys.match(altPress("l"))).toBe(challenges);
    expect(hotkeys.comboFor("challenges")).toMatch(/^(⌥|Alt )L$/);
    // Letters only: it has no Alt version
    expect(hotkeys.match(altPress("h"))).toBeNull();
    expect(hotkeys.comboFor("history")).toBeNull();
  });

  it("leaves Ctrl, ⌘ and Shift combinations, and text fields, alone", () => {
    const hotkeys = useHotkeysStore();
    hotkeys.register("restart", { key: "r", run: vi.fn() });
    expect(hotkeys.match(press("r", { ctrlKey: true }))).toBeNull();
    expect(hotkeys.match(press("r", { metaKey: true }))).toBeNull();
    expect(hotkeys.match(press("R", { shiftKey: true }))).toBeNull();

    const input = document.createElement("input");
    document.body.append(input);
    expect(hotkeys.match(press("r", { target: input }))).toBeNull();
    input.remove();
  });

  it("gives the letter to the newest button, and forgets one taken away", () => {
    const hotkeys = useHotkeysStore();
    const older = { key: "s", run: vi.fn() };
    const newer = { key: "s", run: vi.fn() };
    hotkeys.register("continueCourse", older);
    hotkeys.register("nextLesson", newer);
    expect(hotkeys.match(press("s"))).toBe(newer);

    hotkeys.unregister("nextLesson", newer);
    expect(hotkeys.match(press("s"))).toBe(older);
    // Someone else's copy under the same id stays
    hotkeys.unregister("continueCourse", { key: "s" });
    expect(hotkeys.match(press("s"))).toBe(older);
  });

  it("offers the ones with a label in the palette", () => {
    const hotkeys = useHotkeysStore();
    hotkeys.register("share", {
      key: "c",
      label: "palette.commands.share",
      run: vi.fn(),
    });
    hotkeys.register("restart", { key: "r", run: vi.fn() });
    hotkeys.register("hidden", {
      key: "g",
      label: "palette.commands.ghost",
      inPalette: false,
      run: vi.fn(),
    });
    expect(hotkeys.paletteEntries.map((entry) => entry.id)).toEqual(["share"]);
  });
});
