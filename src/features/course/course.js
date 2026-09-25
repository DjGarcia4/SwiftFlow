// The course for starting from zero: the keyboard a row at a time, a pair
// of fingers at a time, then capitals, accents, numbers and signs. Letter
// lessons name their keys by where they sit -- row and column, as in
// keyboardLayouts.js -- so the course follows whatever keyboard is picked:
// the home row is A S D F on one and A O E U on another.
//
// Progress is never stored: like the achievements, it's read off the
// history, from the lessons' own results.
import { layoutById } from "@/features/typing-test/utils/keyboardLayouts";
import { t } from "@/shared/i18n";

// Rows as keyboardLayouts.js counts them
const TOP = 1;
const HOME = 2;
const BOTTOM = 3;

// The same order on every row: index fingers first, outward to the
// pinkies, then the index fingers' stretch toward the middle
const PAIRS = [
  { columns: [3, 6], fingers: "index" },
  { columns: [2, 7], fingers: "middle" },
  { columns: [1, 8], fingers: "ring" },
  { columns: [0, 9], fingers: "pinky" },
  { columns: [4, 5], fingers: "stretch" },
];
const WHOLE_ROW = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const ROW_IDS = { [HOME]: "home", [TOP]: "top", [BOTTOM]: "bottom" };
const rowTip = (row) => t(`course.rowTips.${ROW_IDS[row]}`);

const rowLessons = (stage, row, idPrefix, wpm) => [
  ...PAIRS.map((pair, index) => ({
    id: `${idPrefix}-${index + 1}`,
    stage,
    kind: "keys",
    row,
    columns: pair.columns,
    fingers: pair.fingers,
    // Read when shown, so it's in the current language
    get tip() {
      return index === 0
        ? rowTip(row)
        : t("course.withFingers", t(`course.fingers.${pair.fingers}`), rowTip(row));
    },
    goalWpm: wpm,
  })),
  {
    id: `${idPrefix}-review`,
    stage,
    kind: "keys",
    row,
    columns: WHOLE_ROW,
    review: true,
    get tip() {
      return t("course.reviewTip");
    },
    goalWpm: wpm + 2,
  },
];

export const STAGES = [
  {
    id: "home",
    get title() {
      return t("course.stages.home");
    },
  },
  {
    id: "top",
    get title() {
      return t("course.stages.top");
    },
  },
  {
    id: "bottom",
    get title() {
      return t("course.stages.bottom");
    },
  },
  {
    id: "beyond",
    get title() {
      return t("course.stages.beyond");
    },
  },
];

export const LESSONS = [
  ...rowLessons("home", HOME, "home", 8),
  ...rowLessons("top", TOP, "top", 12),
  ...rowLessons("bottom", BOTTOM, "bottom", 14),
  {
    id: "shift",
    stage: "beyond",
    kind: "shift",
    get title() {
      return t("course.lessons.shift.title");
    },
    get tip() {
      return t("course.lessons.shift.tip");
    },
    goalWpm: 14,
  },
  {
    id: "accents",
    stage: "beyond",
    kind: "accents",
    get title() {
      return t("course.lessons.accents.title");
    },
    get tip() {
      return t("course.lessons.accents.tip");
    },
    goalWpm: 14,
  },
  {
    id: "numbers-left",
    stage: "beyond",
    kind: "numbers",
    columns: [0, 1, 2, 3, 4],
    get title() {
      return t("course.lessons.numbers-left.title");
    },
    get tip() {
      return t("course.lessons.numbers-left.tip");
    },
    goalWpm: 10,
  },
  {
    id: "numbers-right",
    stage: "beyond",
    kind: "numbers",
    columns: [5, 6, 7, 8, 9],
    get title() {
      return t("course.lessons.numbers-right.title");
    },
    get tip() {
      return t("course.lessons.numbers-right.tip");
    },
    goalWpm: 10,
  },
  {
    id: "signs",
    stage: "beyond",
    kind: "signs",
    get title() {
      return t("course.lessons.signs.title");
    },
    get tip() {
      return t("course.lessons.signs.tip");
    },
    goalWpm: 14,
  },
  {
    id: "final",
    stage: "beyond",
    kind: "final",
    get title() {
      return t("course.lessons.final.title");
    },
    get tip() {
      return t("course.lessons.final.tip");
    },
    goalWpm: 20,
  },
];

// Every lesson has to be passed at this accuracy, whatever its speed
export const PASS_ACCURACY = 94;
const TWO_STAR_ACCURACY = 98;
const THREE_STAR_SPEED = 1.5;

export const lessonById = (id) => LESSONS.find((lesson) => lesson.id === id) ?? null;
export const lessonIndex = (id) => LESSONS.findIndex((lesson) => lesson.id === id);

const isLetter = (key) => /^\p{L}$/u.test(key);
// The comma and the period come with the bottom row; other signs wait for
// their own lesson
const isBottomRowSign = (key) => key === "," || key === ".";

// The keys a lesson brings in, on a given keyboard
export const lessonKeys = (lesson, layout) => {
  if (lesson.kind === "numbers") {
    return lesson.columns.map((column) => String((column + 1) % 10));
  }
  if (lesson.kind !== "keys") return [];
  const { rows } = layoutById(typeof layout === "string" ? layout : layout?.id);
  const row = rows[lesson.row];
  return lesson.columns
    .map((column) => row.keys[column - row.start])
    .filter((key) => key && (isLetter(key) || isBottomRowSign(key)));
};

// Every letter (and , .) taught up to and including this lesson
export const knownKeys = (lesson, layout) => {
  const upTo = lessonIndex(lesson.id);
  return [
    ...new Set(
      LESSONS.slice(0, upTo + 1)
        .filter((l) => l.kind === "keys")
        .flatMap((l) => lessonKeys(l, layout))
    ),
  ];
};

export const lessonTitle = (lesson, layout) => {
  if (lesson.title) return lesson.title;
  if (lesson.review) return t("course.review");
  return t(
    "course.keysTitle",
    lessonKeys(lesson, layout).map((key) => key.toUpperCase())
  );
};

// How a result did on its lesson: passed or not, and 0 to 3 stars
export const gradeLesson = (lesson, { wpm, accuracy }) => {
  const passed = accuracy >= PASS_ACCURACY && wpm >= lesson.goalWpm;
  if (!passed) return { passed, stars: 0 };
  let stars = 1;
  if (accuracy >= TWO_STAR_ACCURACY) {
    stars++;
    if (wpm >= lesson.goalWpm * THREE_STAR_SPEED) stars++;
  }
  return { passed, stars };
};

// The course as the history leaves it: each lesson's best stars, which
// are open, and the one to do next. results: the history, any order.
export const courseProgress = (results) => {
  const stars = Object.fromEntries(LESSONS.map((lesson) => [lesson.id, 0]));
  for (const result of results) {
    if (result.mode !== "lesson") continue;
    const lesson = lessonById(result.modeValue);
    if (!lesson) continue;
    stars[lesson.id] = Math.max(stars[lesson.id], gradeLesson(lesson, result).stars);
  }
  // Open: the first, and any whose previous lesson is passed
  const unlocked = LESSONS.map((lesson, i) => i === 0 || stars[LESSONS[i - 1].id] > 0);
  const passedCount = LESSONS.filter((lesson) => stars[lesson.id] > 0).length;
  const next =
    LESSONS.find((lesson, i) => unlocked[i] && stars[lesson.id] === 0) ?? LESSONS.at(-1);
  return {
    stars,
    unlocked: Object.fromEntries(LESSONS.map((lesson, i) => [lesson.id, unlocked[i]])),
    passedCount,
    total: LESSONS.length,
    next,
    complete: passedCount === LESSONS.length,
  };
};
