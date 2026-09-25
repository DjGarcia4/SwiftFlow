// The course for starting from zero: the keyboard a row at a time, a pair
// of fingers at a time, then capitals, accents, numbers and signs. Letter
// lessons name their keys by where they sit -- row and column, as in
// keyboardLayouts.js -- so the course follows whatever keyboard is picked:
// the home row is A S D F on one and A O E U on another.
//
// Progress is never stored: like the achievements, it's read off the
// history, from the lessons' own results.
import { layoutById } from "@/features/typing-test/utils/keyboardLayouts";

// Rows as keyboardLayouts.js counts them
const TOP = 1;
const HOME = 2;
const BOTTOM = 3;

// The same order on every row: index fingers first, outward to the
// pinkies, then the index fingers' stretch toward the middle
const PAIRS = [
  { columns: [3, 6], fingers: "los índices" },
  { columns: [2, 7], fingers: "los medios" },
  { columns: [1, 8], fingers: "los anulares" },
  { columns: [0, 9], fingers: "los meñiques" },
  { columns: [4, 5], fingers: "los índices, que se estiran" },
];
const WHOLE_ROW = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const ROW_TIPS = {
  [HOME]:
    "Es tu base: los dedos descansan acá y vuelven acá después de cada tecla. Buscá el relieve de la F y la J sin mirar.",
  [TOP]:
    "Subí solo el dedo que hace falta y volvé enseguida a la fila del medio: la mano no se mueve.",
  [BOTTOM]: "Bajá el dedo curvado, sin arrastrar la muñeca, y volvé a la fila del medio.",
};

const rowLessons = (stage, row, idPrefix, wpm) => [
  ...PAIRS.map((pair, index) => ({
    id: `${idPrefix}-${index + 1}`,
    stage,
    kind: "keys",
    row,
    columns: pair.columns,
    fingers: pair.fingers,
    tip: index === 0 ? ROW_TIPS[row] : `Con ${pair.fingers}. ${ROW_TIPS[row]}`,
    goalWpm: wpm,
  })),
  {
    id: `${idPrefix}-review`,
    stage,
    kind: "keys",
    row,
    columns: WHOLE_ROW,
    review: true,
    tip: "Toda la fila junta. Despacio y sin errores rinde más que rápido y corrigiendo.",
    goalWpm: wpm + 2,
  },
];

export const STAGES = [
  { id: "home", title: "Fila del medio" },
  { id: "top", title: "Fila de arriba" },
  { id: "bottom", title: "Fila de abajo" },
  { id: "beyond", title: "Más allá de las letras" },
];

export const LESSONS = [
  ...rowLessons("home", HOME, "home", 8),
  ...rowLessons("top", TOP, "top", 12),
  ...rowLessons("bottom", BOTTOM, "bottom", 14),
  {
    id: "shift",
    stage: "beyond",
    kind: "shift",
    title: "Mayúsculas",
    tip: "Shift con el meñique de la mano contraria a la letra: para la A, el Shift derecho; para la L, el izquierdo.",
    goalWpm: 14,
  },
  {
    id: "accents",
    stage: "beyond",
    kind: "accents",
    title: "Tildes",
    tip: "La tecla del acento primero, soltala, y después la vocal. El teclado en pantalla te muestra dónde está en el tuyo.",
    goalWpm: 14,
  },
  {
    id: "numbers-left",
    stage: "beyond",
    kind: "numbers",
    columns: [0, 1, 2, 3, 4],
    title: "Números del 1 al 5",
    tip: "Cada número va con el mismo dedo que la letra de abajo: el 4 con el índice, igual que la R.",
    goalWpm: 10,
  },
  {
    id: "numbers-right",
    stage: "beyond",
    kind: "numbers",
    columns: [5, 6, 7, 8, 9],
    title: "Números del 6 al 0",
    tip: "El 6 y el 7 con el índice derecho, y así hacia afuera hasta el 0 con el meñique.",
    goalWpm: 10,
  },
  {
    id: "signs",
    stage: "beyond",
    kind: "signs",
    title: "Signos",
    tip: "En español las preguntas y exclamaciones se abren y se cierran: ¿así? ¡Y así!",
    goalWpm: 14,
  },
  {
    id: "final",
    stage: "beyond",
    kind: "final",
    title: "Examen final",
    tip: "Texto de verdad, con todo lo aprendido. Tomate tu tiempo: la meta es no mirar el teclado.",
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
  if (lesson.review) return "Repaso";
  const keys = lessonKeys(lesson, layout).map((key) => key.toUpperCase());
  return keys.length > 1 ? `${keys.slice(0, -1).join(", ")} y ${keys.at(-1)}` : keys[0];
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
