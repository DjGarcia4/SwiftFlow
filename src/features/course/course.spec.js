import { describe, it, expect } from "vitest";
import {
  LESSONS,
  lessonById,
  lessonKeys,
  knownKeys,
  lessonTitle,
  gradeLesson,
  courseProgress,
} from "./course";
import { generateLessonText } from "./lessonText";
import { seededRandom } from "@/shared/utils/seededRandom";
import { KEYBOARD_LAYOUTS } from "@/features/typing-test/utils/keyboardLayouts";

describe("lessons", () => {
  it("give each lesson its own id", () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it("start from the index fingers on the home row, wherever that is", () => {
    expect(lessonKeys(LESSONS[0], "latam")).toEqual(["f", "j"]);
    expect(lessonKeys(LESSONS[0], "dvorak")).toEqual(["u", "h"]);
    expect(lessonTitle(LESSONS[0], "latam")).toBe("F y J");
    expect(lessonKeys(lessonById("home-4"), "latam")).toEqual(["a", "ñ"]);
    // The US keyboard has a semicolon there: not a letter lesson's business
    expect(lessonKeys(lessonById("home-4"), "us")).toEqual(["a"]);
  });

  it("bring in the comma and the period with the bottom row", () => {
    expect(lessonKeys(lessonById("bottom-2"), "latam")).toEqual(["c", ","]);
    expect(lessonKeys(lessonById("bottom-3"), "latam")).toEqual(["x", "."]);
  });

  it("teach every letter of the alphabet by the end of the rows", () => {
    for (const layout of ["latam", "es", "us", "dvorak", "colemak"]) {
      const known = knownKeys(lessonById("bottom-review"), layout);
      for (const letter of "abcdefghijklmnopqrstuvwxyz") {
        expect(known, `${layout}: ${letter}`).toContain(letter);
      }
    }
  });
});

describe("generateLessonText", () => {
  it("only asks for keys already taught", () => {
    for (const layout of KEYBOARD_LAYOUTS) {
      for (const lesson of LESSONS.filter((l) => l.kind === "keys")) {
        const allowed = new Set([...knownKeys(lesson, layout), " "]);
        for (let seed = 1; seed <= 5; seed++) {
          const text = generateLessonText(lesson, layout, seededRandom(seed));
          for (const char of text) {
            expect(
              allowed.has(char),
              `${layout.id} ${lesson.id}: «${char}» in ${text}`
            ).toBe(true);
          }
        }
      }
    }
  });

  it("uses real words once there are letters for them", () => {
    const text = generateLessonText(lessonById("home-review"), "latam", seededRandom(3));
    expect(
      text
        .split(" ")
        .some((word) => ["sala", "falda", "hada"].includes(word) || word.length > 3)
    ).toBe(true);
    const late = generateLessonText(lessonById("top-review"), "latam", seededRandom(3));
    expect(late.split(" ").length).toBe(20);
  });

  it("gives every other kind of lesson something to type", () => {
    for (const lesson of LESSONS.filter((l) => l.kind !== "keys")) {
      const text = generateLessonText(lesson, "latam", seededRandom(2));
      expect(text.length, lesson.id).toBeGreaterThan(20);
    }
    expect(generateLessonText(lessonById("shift"), "latam", seededRandom(2))).toMatch(
      /[A-ZÑ]/
    );
    expect(generateLessonText(lessonById("accents"), "latam", seededRandom(2))).toMatch(
      /[áéíóú]/
    );
    expect(
      generateLessonText(lessonById("numbers-left"), "latam", seededRandom(2))
    ).toMatch(/^[1-5 ]+$/);
  });
});

describe("gradeLesson", () => {
  const lesson = { goalWpm: 10 };
  it("passes at the goal speed and 94%, with stars for doing better", () => {
    expect(gradeLesson(lesson, { wpm: 9, accuracy: 100 })).toEqual({
      passed: false,
      stars: 0,
    });
    expect(gradeLesson(lesson, { wpm: 12, accuracy: 93 })).toEqual({
      passed: false,
      stars: 0,
    });
    expect(gradeLesson(lesson, { wpm: 10, accuracy: 94 })).toEqual({
      passed: true,
      stars: 1,
    });
    expect(gradeLesson(lesson, { wpm: 12, accuracy: 98 })).toEqual({
      passed: true,
      stars: 2,
    });
    expect(gradeLesson(lesson, { wpm: 15, accuracy: 99 })).toEqual({
      passed: true,
      stars: 3,
    });
    // Speed alone doesn't make up for accuracy
    expect(gradeLesson(lesson, { wpm: 30, accuracy: 95 })).toEqual({
      passed: true,
      stars: 1,
    });
  });
});

describe("courseProgress", () => {
  const lessonResult = (id, wpm, accuracy) => ({
    mode: "lesson",
    modeValue: id,
    wpm,
    accuracy,
  });

  it("opens the first lesson, and each next one once the last is passed", () => {
    const empty = courseProgress([]);
    expect(empty.next.id).toBe("home-1");
    expect(empty.unlocked["home-1"]).toBe(true);
    expect(empty.unlocked["home-2"]).toBe(false);

    const progress = courseProgress([
      lessonResult("home-1", 5, 90),
      lessonResult("home-1", 15, 99),
      { mode: "words", modeValue: 25, wpm: 80, accuracy: 100 },
    ]);
    expect(progress.stars["home-1"]).toBe(3);
    expect(progress.unlocked["home-2"]).toBe(true);
    expect(progress.next.id).toBe("home-2");
    expect(progress.passedCount).toBe(1);
  });

  it("knows when the whole course is done", () => {
    const all = LESSONS.map((l) => lessonResult(l.id, 60, 99));
    const progress = courseProgress(all);
    expect(progress.complete).toBe(true);
    expect(progress.next.id).toBe(LESSONS.at(-1).id);
  });
});
