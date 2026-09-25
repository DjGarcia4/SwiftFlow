import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
      store.setReferenceText("una dos");

      store.userInput = "una";
      expect(store.isCompleted).toBe(false);

      // Starting the last word isn't enough — it has to be typed out
      store.userInput = "una d";
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
      store.elapsedMs = 60000; // 25 correct chars (5 words) in 60s => 5 wpm

      store.updateBestWpm();
      expect(store.bestWpm).toBe(5);

      store.elapsedMs = 600000; // fewer wpm now
      store.updateBestWpm();
      expect(store.bestWpm).toBe(5);
    });

    it("keeps a record apart for English texts", () => {
      const store = useConfigStore();
      store.setReferenceText("una dos tres cuatro cinco seis siete ocho");
      store.userInput = "una dos tres cuatro cinco";
      store.startTime = Date.now();
      store.elapsedMs = 60000;
      store.updateBestWpm();
      expect(store.bestWpm).toBe(5);

      store.setTextLanguage("en");
      expect(store.bestWpm).toBe(0);
      // Code has no language: it keeps the record it always had
      store.handleType("code");
      expect(store.bestWpm).toBe(5);
    });
  });

  describe("config persistence", () => {
    it("starts with the default configuration when nothing is saved", () => {
      const store = useConfigStore();
      expect(store.type).toBe("time");
      expect(store.selectedTime).toBe(15);
      expect(store.selectedContentTypes).toBe("punctuation");
      expect(store.selectedCodeLanguage).toBeNull();
    });

    it("restores the last selection in a fresh store instance", () => {
      const store = useConfigStore();
      store.handleType("words");
      store.handleWords(50);

      setActivePinia(createPinia());
      const reloaded = useConfigStore();

      expect(reloaded.type).toBe("words");
      expect(reloaded.selectedWords).toBe(50);
    });

    it("persists the code language selection", () => {
      const store = useConfigStore();
      store.handleType("code");
      store.handleCodeLanguage("Python");

      setActivePinia(createPinia());
      const reloaded = useConfigStore();

      expect(reloaded.type).toBe("code");
      expect(reloaded.selectedCodeLanguage).toBe("Python");
    });
  });

  describe("numbers mode", () => {
    it("completes once enough number groups are typed", () => {
      const store = useConfigStore();
      store.handleType("numbers");
      store.handleWords(2);
      store.setReferenceText("12 3.5");

      store.userInput = "12 3";
      expect(store.isCompleted).toBe(false);

      store.userInput = "12 3.5";
      expect(store.isCompleted).toBe(true);
    });
  });

  describe("keystroke tracking", () => {
    it("counts mistakes per expected key, even after they're corrected", () => {
      const store = useConfigStore();
      store.setReferenceText("hola");

      store.userInput = "h";
      store.userInput = "hx"; // wrong: expected "o"
      store.userInput = "h"; // backspace
      store.userInput = "ho";
      store.userInput = "hol";

      expect(store.keystrokes).toBe(4);
      expect(store.errorKeystrokes).toBe(1);
      expect(store.keyAttempts).toEqual({ h: 1, o: 2, l: 1 });
      expect(store.missedKeys).toEqual({ o: 1 });
      expect(store.errors).toBe(0);
    });

    it("records which key was pressed instead of the right one", () => {
      const store = useConfigStore();
      store.setReferenceText("hola");

      store.userInput = "h";
      store.userInput = "hp"; // wrong: expected "o", pressed "p"

      expect(store.confusions).toEqual({ op: 1 });
      expect(store.transpositions).toEqual({});
    });

    it("records nothing extra when everything is typed right", () => {
      const store = useConfigStore();
      store.setReferenceText("hola");

      store.userInput = "h";
      store.userInput = "ho";

      expect(store.confusions).toEqual({});
    });

    it("counts a confirmed swap in both tallies, keyed by the reference pair", () => {
      const store = useConfigStore();
      store.setReferenceText("que");

      store.userInput = "q";
      store.userInput = "qe"; // expected "u", pressed "e"
      store.userInput = "qeu"; // expected "e", pressed "u" -- the swap lands

      expect(store.transpositions).toEqual({ ue: 1 });
      expect(store.confusions).toEqual({ ue: 1, eu: 1 });
    });

    it("doesn't invent a swap out of a backspace and retype", () => {
      const store = useConfigStore();
      store.setReferenceText("que");

      store.userInput = "q";
      store.userInput = "qe"; // wrong
      store.userInput = "q"; // backspace
      store.userInput = "qu"; // fixed

      expect(store.transpositions).toEqual({});
      expect(store.confusions).toEqual({ ue: 1 });
    });

    it("remembers the longest combo reached during the session", () => {
      const store = useConfigStore();
      store.setReferenceText("abcdef");

      store.userInput = "abcd";
      store.userInput = "abcdx";

      expect(store.currentStreak).toBe(0);
      expect(store.maxStreak).toBe(4);
    });

    it("resets with the session", () => {
      const store = useConfigStore();
      store.setReferenceText("abc");
      store.userInput = "ax";

      store.resetTypingSession();

      expect(store.keystrokes).toBe(0);
      expect(store.errorKeystrokes).toBe(0);
      expect(store.maxStreak).toBe(0);
      expect(store.missedKeys).toEqual({});
      expect(store.confusions).toEqual({});
      expect(store.transpositions).toEqual({});
    });
  });

  describe("drill mode", () => {
    it("keeps the target keys, cleaned up and capped", () => {
      const store = useConfigStore();

      store.handleDrillKeys(["R", "r", " ", "ab", "t", "b", "c", "d", "f"]);

      expect(store.drillKeys).toEqual(["r", "t", "b", "c", "d"]);
    });

    it("survives a reload", () => {
      useConfigStore().handleDrillKeys(["ñ", "q"]);

      setActivePinia(createPinia());
      expect(useConfigStore().drillKeys).toEqual(["ñ", "q"]);
    });

    it("keeps its accents even with punctuation turned off", () => {
      const store = useConfigStore();
      store.handleContentTypes(null);
      store.handleType("drill");

      store.setReferenceText("el niño soñó un año");

      expect(store.referenceText).toBe("el niño soñó un año");
    });

    it("is a mode you can actually pick", () => {
      const store = useConfigStore();

      store.handleType("drill");

      expect(store.types).toContain("drill");
      expect(store.type).toBe("drill");
    });
  });

  describe("endSession", () => {
    it("does nothing before the session has started", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.setReferenceText("texto");

      store.endSession();

      expect(store.isCompleted).toBe(false);
      expect(store.endedEarly).toBe(false);
    });

    it("ends a timed session early and flags it", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.setReferenceText("texto");
      store.userInput = "te";
      store.startTime = Date.now();

      store.endSession();

      expect(store.isCompleted).toBe(true);
      expect(store.endedEarly).toBe(true);
    });

    it("finishes zen sessions normally", () => {
      const store = useConfigStore();
      store.handleType("zen");
      store.setReferenceText("texto");
      store.userInput = "te";
      store.startTime = Date.now();

      store.endSession();

      expect(store.isCompleted).toBe(true);
      expect(store.endedEarly).toBe(false);
    });
  });

  it("time spent paused doesn't count towards the clock", () => {
    vi.useFakeTimers();
    try {
      const store = useConfigStore();
      store.setReferenceText("texto");
      store.userInput = "t";
      store.startTime = Date.now();

      store.pause();
      vi.advanceTimersByTime(10_000);
      const startBefore = store.startTime;
      store.play();

      expect(store.startTime - startBefore).toBe(10_000);
      expect(store.isPaused).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("wpm timing", () => {
    const T0 = 1_700_000_000_000;
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(T0);
    });
    afterEach(() => vi.useRealTimers());

    const typeAt = (store, text, atMs) => {
      vi.setSystemTime(T0 + atMs);
      store.userInput = text;
      store.handleTyping();
    };

    describe("keystroke timing", () => {
      // "abcdef", typed one character at a time at the given moment
      const setup = () => {
        const store = useConfigStore();
        store.handleType("quote");
        store.setReferenceText("abcdef");
        return store;
      };

      it("records nothing for the first keystroke of a session", () => {
        const store = setup();

        typeAt(store, "a", 0);

        expect(store.keyTiming).toEqual({});
        expect(store.bigramTiming).toEqual({});
      });

      it("measures the gap between two consecutive correct keystrokes", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 200);

        expect(store.keyTiming).toEqual({ b: [200, 1] });
        expect(store.bigramTiming).toEqual({ ab: [200, 1] });
      });

      it("adds repeats of the same key together", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 200);
        typeAt(store, "abc", 500);

        expect(store.keyTiming).toEqual({ b: [200, 1], c: [300, 1] });
      });

      it("drops a gap too long to be about the key", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 2500);

        expect(store.keyTiming).toEqual({});
      });

      it("drops two characters landing in the same breath", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 5);

        expect(store.keyTiming).toEqual({});
      });

      it("ignores a pause entirely instead of blaming the next key for it", () => {
        const store = setup();

        typeAt(store, "a", 0);
        store.pause();
        vi.setSystemTime(T0 + 10_000);
        store.play();
        typeAt(store, "ab", 10_150);

        // The pause is out of the active clock, so this reads as ~150ms
        expect(store.keyTiming).toEqual({ b: [150, 1] });
      });

      it("records no timing when several characters arrive at once", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "abc", 200);

        expect(store.keyTiming).toEqual({});
        // ...but the run continues from there
        typeAt(store, "abcd", 400);
        expect(store.keyTiming).toEqual({ d: [200, 1] });
      });

      it("skips the interval into a mistake and the one out of it", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ax", 200); // wrong
        typeAt(store, "axc", 400); // right, but measured from a mistake

        expect(store.keyTiming).toEqual({});
      });

      it("skips a character that was backspaced and typed again", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 200);
        typeAt(store, "a", 300); // backspace
        typeAt(store, "ab", 500); // same index again

        expect(store.keyTiming).toEqual({ b: [200, 1] });
      });

      it("clears with the session", () => {
        const store = setup();

        typeAt(store, "a", 0);
        typeAt(store, "ab", 200);
        store.resetTypingSession();

        expect(store.keyTiming).toEqual({});
        expect(store.bigramTiming).toEqual({});
      });
    });

    it("uses the exact time of the last keystroke, not the last whole-second tick", () => {
      const store = useConfigStore();
      store.handleType("quote");
      store.setReferenceText("0123456789"); // 10 chars = 2 words

      typeAt(store, "0", 0);
      typeAt(store, "012345678", 5000);
      typeAt(store, "0123456789", 5900);

      expect(store.isCompleted).toBe(true);
      expect(store.elapsedMs).toBe(5900);
      // 9 chars (the first is free) in 5.9s => 18.3 wpm (a whole-second clock would say 5s)
      expect(store.wpm).toBe(18);
    });

    it("excludes the idle seconds before an inactivity pause", () => {
      const store = useConfigStore();
      store.handleType("zen");
      store.setReferenceText("0123456789 0123456789");

      typeAt(store, "0", 0);
      typeAt(store, "01234", 2000);
      vi.advanceTimersByTime(3000); // idle → auto-pause at 5000
      expect(store.isPaused).toBe(true);
      expect(store.elapsedMs).toBe(2000);

      vi.advanceTimersByTime(10000);
      typeAt(store, "012345", 15000); // resumes
      store.endSession();

      expect(store.elapsedMs).toBe(2000);
    });

    it("pins timed sessions to exactly their limit", () => {
      const store = useConfigStore();
      store.handleType("time");
      store.handleTime(15);
      store.setReferenceText("a".repeat(500));

      // Keep typing every 2s (idling 3s would auto-pause the clock)
      for (let i = 0; i < 8 && !store.isCompleted; i++) {
        typeAt(store, "a".repeat(i + 1), i * 2000);
        vi.advanceTimersByTime(1999);
      }

      expect(store.isCompleted).toBe(true);
      expect(store.elapsedMs).toBe(15000);
    });

    it("accuracy counts corrected mistakes, raw wpm counts every keystroke", () => {
      const store = useConfigStore();
      store.handleType("quote");
      store.setReferenceText("hola");

      typeAt(store, "h", 0);
      typeAt(store, "hx", 1000);
      typeAt(store, "h", 1500);
      typeAt(store, "ho", 2000);
      typeAt(store, "hol", 2500);
      typeAt(store, "hola", 3000);

      expect(store.errors).toBe(0);
      expect(store.accuracy).toBe(80); // 4 of 5 keystrokes right
      expect(store.rawWpm).toBeGreaterThan(store.wpm);
    });
  });

  describe("ghost", () => {
    afterEach(() => vi.useRealTimers());

    it("records how far into the text the run was at each moment", () => {
      vi.useFakeTimers();
      vi.setSystemTime(10_000);
      const store = useConfigStore();
      store.handleType("words");
      store.setReferenceText("hola mundo");

      store.userInput = "h";
      store.handleTyping();
      vi.setSystemTime(10_300);
      store.userInput = "ho";
      store.handleTyping();
      vi.setSystemTime(10_500);
      store.userInput = "h"; // backspace
      store.handleTyping();

      expect(store.progressSamples).toEqual([
        [0, 1],
        [300, 2],
        [500, 1],
      ]);

      store.resetTypingSession();
      expect(store.progressSamples).toEqual([]);
    });
  });

  it("remembers sin red across reloads", () => {
    const store = useConfigStore();
    expect(store.blindMode).toBe(false);
    store.toggleBlindMode();

    setActivePinia(createPinia());
    expect(useConfigStore().blindMode).toBe(true);
  });

  describe("Mi texto", () => {
    it("opens the editor when there's nothing to practice yet", () => {
      const store = useConfigStore();
      store.handleType("custom");
      expect(store.customEditor).toEqual({ id: null });
    });

    it("saves a text cleaned up, picks it, and remembers both", () => {
      const store = useConfigStore();
      expect(
        store.saveCustomText({
          name: " Mail ",
          text: "Estimado equipo,\r\n\tles escribo  ",
        })
      ).toBeNull();
      expect(store.selectedCustomText).toMatchObject({
        name: "Mail",
        text: "Estimado equipo,\n  les escribo",
      });
      expect(store.customEditor).toBeNull();

      setActivePinia(createPinia());
      expect(useConfigStore().selectedCustomText.name).toBe("Mail");
    });

    it("says what's wrong instead of saving", () => {
      const store = useConfigStore();
      expect(store.saveCustomText({ name: "", text: "un texto bastante largo" })).toBe(
        "Ponele un nombre."
      );
      expect(store.customTexts).toEqual([]);
    });

    it("edits a text in place and deletes it", () => {
      const store = useConfigStore();
      store.saveCustomText({ name: "Uno", text: "primer texto de prueba" });
      store.saveCustomText({ name: "Dos", text: "segundo texto de prueba" });
      const [first, second] = store.customTexts;

      store.saveCustomText({
        id: first.id,
        name: "Uno bis",
        text: "primer texto cambiado",
      });
      expect(store.customTexts.map((t) => t.name)).toEqual(["Uno bis", "Dos"]);
      expect(store.selectedCustomText.id).toBe(first.id);

      store.deleteCustomText(first.id);
      expect(store.customTexts.map((t) => t.name)).toEqual(["Dos"]);
      expect(store.selectedCustomText.id).toBe(second.id);
    });
  });
});
