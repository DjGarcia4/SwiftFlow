// The course's words, in both languages (see src/shared/i18n)
export default {
  es: {
    stages: {
      home: "Fila del medio",
      top: "Fila de arriba",
      bottom: "Fila de abajo",
      beyond: "Más allá de las letras",
    },
    fingers: {
      index: "los índices",
      middle: "los medios",
      ring: "los anulares",
      pinky: "los meñiques",
      stretch: "los índices, que se estiran",
    },
    rowTips: {
      home: "Es tu base: los dedos descansan acá y vuelven acá después de cada tecla. Buscá el relieve de la F y la J sin mirar.",
      top: "Subí solo el dedo que hace falta y volvé enseguida a la fila del medio: la mano no se mueve.",
      bottom:
        "Bajá el dedo curvado, sin arrastrar la muñeca, y volvé a la fila del medio.",
    },
    withFingers: (fingers, tip) => `Con ${fingers}. ${tip}`,
    reviewTip:
      "Toda la fila junta. Despacio y sin errores rinde más que rápido y corrigiendo.",
    review: "Repaso",
    keysTitle: (keys) =>
      keys.length > 1 ? `${keys.slice(0, -1).join(", ")} y ${keys.at(-1)}` : keys[0],
    lessons: {
      shift: {
        title: "Mayúsculas",
        tip: "Shift con el meñique de la mano contraria a la letra: para la A, el Shift derecho; para la L, el izquierdo.",
      },
      accents: {
        title: "Tildes",
        tip: "La tecla del acento primero, soltala, y después la vocal. El teclado en pantalla te muestra dónde está en el tuyo.",
      },
      "numbers-left": {
        title: "Números del 1 al 5",
        tip: "Cada número va con el mismo dedo que la letra de abajo: el 4 con el índice, igual que la R.",
      },
      "numbers-right": {
        title: "Números del 6 al 0",
        tip: "El 6 y el 7 con el índice derecho, y así hacia afuera hasta el 0 con el meñique.",
      },
      signs: {
        title: "Signos",
        tip: "En español las preguntas y exclamaciones se abren y se cierran: ¿así? ¡Y así!",
      },
      final: {
        title: "Examen final",
        tip: "Texto de verdad, con todo lo aprendido. Tomate tu tiempo: la meta es no mirar el teclado.",
      },
    },
    invite: {
      title: "¿Recién empezás?",
      detail: "Aprendé a escribir sin mirar, una fila por vez →",
      dismiss: "No, gracias",
    },
    chip: {
      label: (n, title) => `Lección ${n} · ${title}`,
      hint: (n, total) => `Lección ${n} de ${total}: ver el curso`,
    },
    panel: {
      of: (n, total) => `Lección ${n} de ${total}`,
      goal: (wpm, accuracy) => `· Meta: ${wpm} wpm y ${accuracy}% ·`,
      seeCourse: "ver el curso",
    },
    result: {
      stars: (n) => `${n} de 3 estrellas`,
      next: "Siguiente lección",
      seeCourse: "Ver el curso",
      notYet: "Todavía no: otra vuelta",
      courseDone: "¡Terminaste el curso!",
      passed: ["¡Pasaste!", "¡Muy bien!", "¡Perfecto!"],
      needAccuracy: (accuracy) =>
        `Necesitás ${accuracy}% de precisión: más despacio, sin errores, rinde más. Espacio para repetir.`,
      needSpeed: (wpm) =>
        `La precisión está; ahora a llegar a ${wpm} wpm. Espacio para repetir.`,
      forThree:
        "Con 98% de precisión y una vez y media la meta, sacás las tres estrellas.",
      three: "Tres estrellas: esta lección ya es tuya.",
    },
    page: {
      kicker: "Curso desde cero",
      title: "Aprendé a escribir sin mirar",
      intro: (accuracy) =>
        `Una fila por vez, un par de dedos por vez. Cada lección se pasa con su velocidad y un ${accuracy}% de precisión, y abre la siguiente.`,
      lessonsDone: (done, total) => `${done} de ${total} lecciones`,
      starsDone: (done, total) => `${done} de ${total} estrellas`,
      start: (n) => `Empezar: lección ${n}`,
      continue: (n) => `Seguir: lección ${n}`,
      passedLessons: "Lecciones pasadas",
      learned: "aprendidas",
      nextLesson: "la próxima lección",
      forYourKeyboard: "Para tu teclado:",
      lessonAria: (n, title, state) => `Lección ${n}: ${title}. ${state}`,
      locked: "Bloqueada",
      notDone: "Sin hacer",
    },
  },
  en: {
    stages: {
      home: "Home row",
      top: "Top row",
      bottom: "Bottom row",
      beyond: "Beyond the letters",
    },
    fingers: {
      index: "your index fingers",
      middle: "your middle fingers",
      ring: "your ring fingers",
      pinky: "your pinkies",
      stretch: "your index fingers, stretching in",
    },
    rowTips: {
      home: "It's your base: your fingers rest here and come back here after every key. Find the bumps on F and J without looking.",
      top: "Lift only the finger you need and come straight back to the home row: your hand stays put.",
      bottom:
        "Curl the finger down, without dragging your wrist, and come back to the home row.",
    },
    withFingers: (fingers, tip) => `With ${fingers}. ${tip}`,
    reviewTip:
      "The whole row together. Slow and clean pays off more than fast and fixing.",
    review: "Review",
    keysTitle: (keys) =>
      keys.length > 1 ? `${keys.slice(0, -1).join(", ")} and ${keys.at(-1)}` : keys[0],
    lessons: {
      shift: {
        title: "Capitals",
        tip: "Shift with the pinky of the other hand: for A, the right Shift; for L, the left one.",
      },
      accents: {
        title: "Accents",
        tip: "The accent key first, let go, then the vowel. The on-screen keyboard shows where it is on yours.",
      },
      "numbers-left": {
        title: "Numbers 1 to 5",
        tip: "Each number goes with the same finger as the letter below it: 4 with the index finger, like R.",
      },
      "numbers-right": {
        title: "Numbers 6 to 0",
        tip: "6 and 7 with the right index finger, and outward from there to 0 with the pinky.",
      },
      signs: {
        title: "Signs",
        tip: "Spanish questions and exclamations open as well as close: ¿like this? ¡And this!",
      },
      final: {
        title: "Final test",
        tip: "Real text, with everything you've learned. Take your time: the goal is not to look at the keyboard.",
      },
    },
    invite: {
      title: "Just starting out?",
      detail: "Learn to type without looking, one row at a time →",
      dismiss: "No, thanks",
    },
    chip: {
      label: (n, title) => `Lesson ${n} · ${title}`,
      hint: (n, total) => `Lesson ${n} of ${total}: see the course`,
    },
    panel: {
      of: (n, total) => `Lesson ${n} of ${total}`,
      goal: (wpm, accuracy) => `· Goal: ${wpm} wpm and ${accuracy}% ·`,
      seeCourse: "see the course",
    },
    result: {
      stars: (n) => `${n} of 3 stars`,
      next: "Next lesson",
      seeCourse: "See the course",
      notYet: "Not yet: another go",
      courseDone: "You finished the course!",
      passed: ["You passed!", "Very good!", "Perfect!"],
      needAccuracy: (accuracy) =>
        `You need ${accuracy}% accuracy: slower and clean pays off more. Space to try again.`,
      needSpeed: (wpm) =>
        `The accuracy is there; now get to ${wpm} wpm. Space to try again.`,
      forThree:
        "At 98% accuracy and one and a half times the goal, you get all three stars.",
      three: "Three stars: this lesson is yours.",
    },
    page: {
      kicker: "Course from scratch",
      title: "Learn to type without looking",
      intro: (accuracy) =>
        `One row at a time, one pair of fingers at a time. Each lesson is passed at its speed and ${accuracy}% accuracy, and opens the next.`,
      lessonsDone: (done, total) => `${done} of ${total} lessons`,
      starsDone: (done, total) => `${done} of ${total} stars`,
      start: (n) => `Start: lesson ${n}`,
      continue: (n) => `Continue: lesson ${n}`,
      passedLessons: "Lessons passed",
      learned: "learned",
      nextLesson: "the next lesson",
      forYourKeyboard: "For your keyboard:",
      lessonAria: (n, title, state) => `Lesson ${n}: ${title}. ${state}`,
      locked: "Locked",
      notDone: "Not done yet",
    },
  },
};
