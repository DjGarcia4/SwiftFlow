import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";
import { setActivePinia, createPinia } from "pinia";
import { useSoundStore } from "./sound";

describe("useSoundStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("starts with everything enabled by default", () => {
    const store = useSoundStore();
    expect(store.soundEnabled).toBe(true);
    expect(store.keystrokeSound).toBe(true);
    expect(store.errorSound).toBe(true);
    expect(store.celebrationSound).toBe(true);
  });

  it("toggle flips the given setting", () => {
    const store = useSoundStore();
    store.toggle("keystrokeSound");
    expect(store.keystrokeSound).toBe(false);

    store.toggle("keystrokeSound");
    expect(store.keystrokeSound).toBe(true);
  });

  it("toggling one setting doesn't affect the others", () => {
    const store = useSoundStore();
    store.toggle("errorSound");

    expect(store.errorSound).toBe(false);
    expect(store.soundEnabled).toBe(true);
    expect(store.keystrokeSound).toBe(true);
    expect(store.celebrationSound).toBe(true);
  });

  it("persists toggles across store instances", async () => {
    const store = useSoundStore();
    store.toggle("soundEnabled");
    store.toggle("celebrationSound");

    // The persistence watcher flushes asynchronously; let it settle.
    await nextTick();

    setActivePinia(createPinia());
    const reloaded = useSoundStore();
    expect(reloaded.soundEnabled).toBe(false);
    expect(reloaded.celebrationSound).toBe(false);
    expect(reloaded.keystrokeSound).toBe(true);
  });

  it("ignores an unknown key", () => {
    const store = useSoundStore();
    expect(() => store.toggle("notReal")).not.toThrow();
  });
});
