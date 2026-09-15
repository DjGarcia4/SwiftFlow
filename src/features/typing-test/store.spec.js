import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useConfigStore } from "./store";

describe("useConfigStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("resets the typing session when the mode changes", () => {
    const store = useConfigStore();
    store.setReferenceText("hola mundo");
    store.userInput = "hola";
    store.timeElapsed = 5;

    store.handleType("words");

    expect(store.userInput).toBe("");
    expect(store.timeElapsed).toBe(0);
    expect(store.type).toBe("words");
  });

  describe("isCompleted", () => {
    it("is false with no reference text", () => {
      const store = useConfigStore();
      expect(store.isCompleted).toBe(false);
    });

    it("time mode completes once the clock reaches the selected time", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.handleTime(15);
      store.setReferenceText("cualquier texto de referencia");

      store.timeElapsed = 10;
      expect(store.isCompleted).toBe(false);

      store.timeElapsed = 15;
      expect(store.isCompleted).toBe(true);
    });

    it("words mode completes once enough words are typed", () => {
      const store = useConfigStore();
      store.handleType("words");
      store.handleWords(2);
      store.setReferenceText("una dos tres cuatro cinco");

      store.userInput = "una";
      expect(store.isCompleted).toBe(false);

      store.userInput = "una dos";
      expect(store.isCompleted).toBe(true);
    });

    it("zen mode only completes when manually finished", () => {
      const store = useConfigStore();
      store.handleType("zen");
      store.setReferenceText("texto libre sin limite");

      store.userInput = "texto libre sin limite";
      expect(store.isCompleted).toBe(false);

      store.finishZen();
      expect(store.isCompleted).toBe(true);
    });

    it("quote/code/default modes complete when all text is typed", () => {
      const store = useConfigStore();
      store.handleType("quote");
      store.setReferenceText("cita corta");

      store.userInput = "cita cort";
      expect(store.isCompleted).toBe(false);

      store.userInput = "cita corta";
      expect(store.isCompleted).toBe(true);
    });
  });

  describe("progressPercentage", () => {
    it("is based on elapsed time in time mode", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.handleTime(20);
      store.setReferenceText("texto");
      store.timeElapsed = 10;

      expect(store.progressPercentage).toBe(50);
    });

    it("is 0 in zen mode regardless of progress", () => {
      const store = useConfigStore();
      store.handleType("zen");
      store.setReferenceText("texto");
      store.userInput = "tex";

      expect(store.progressPercentage).toBe(0);
    });

    it("never exceeds 100", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.handleTime(10);
      store.setReferenceText("texto");
      store.timeElapsed = 999;

      expect(store.progressPercentage).toBe(100);
    });
  });

  it("extendReferenceText appends text without resetting the session", () => {
    const store = useConfigStore();
    store.setReferenceText("hola");
    store.userInput = "hol";

    store.extendReferenceText("mundo");

    expect(store.referenceText).toBe("hola mundo");
    expect(store.userInput).toBe("hol");
  });

  describe("best WPM tracking", () => {
    it("isBeatingBest is false until a best has been recorded", () => {
      const store = useConfigStore();
      expect(store.isBeatingBest).toBe(false);
    });

    it("updateBestWpm only raises the record, never lowers it", () => {
      const store = useConfigStore();
      store.setReferenceText("una dos tres cuatro cinco seis siete ocho");
      store.userInput = "una dos tres cuatro cinco";
      store.startTime = Date.now();
      store.timeElapsed = 60; // 5 words in 60s => 5 wpm

      store.updateBestWpm();
      expect(store.bestWpm).toBe(5);

      store.timeElapsed = 600; // fewer wpm now
      store.updateBestWpm();
      expect(store.bestWpm).toBe(5);
    });
  });
});
