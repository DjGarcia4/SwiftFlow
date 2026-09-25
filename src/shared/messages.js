// Words shared across the app, in both languages (see src/shared/i18n)
export default {
  es: {
    close: "Cerrar",
    language: "Idioma",
    practiceLanguage: "Textos para practicar",
    level: (n) => `Nivel ${n}`,
    levelUp: (n) => `¡Nivel ${n}!`,
    maxLevel: "nivel máximo",
    pages: {
      default:
        "Practicá mecanografía en español: tus teclas débiles, tus palabras difíciles y un entrenamiento hecho para vos.",
      history: {
        title: "Historial",
        description:
          "Tu progreso en SwiftFlow: velocidad, precisión, teclas débiles, logros y retos.",
      },
      course: {
        title: "Curso desde cero",
        description:
          "Aprendé a escribir sin mirar el teclado, en español: una fila por vez, con lecciones que se adaptan a tu teclado.",
      },
      summary: {
        title: "Tu resumen",
        description:
          "Tu mes o tu año de práctica en SwiftFlow: cuánto, qué tan rápido, qué mejoraste.",
      },
      about: {
        title: "Qué es SwiftFlow",
        description:
          "Un test de mecanografía en español que te dice en qué fallás, por qué, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.",
      },
    },
    nav: {
      streak: (n) => `Racha de ${n} días`,
      streakAtRisk: (left) => `Tu racha se corta en ${left}: todavía no practicaste hoy`,
      course: "Curso desde cero",
      history: "Ver historial",
      about: "Qué es SwiftFlow",
      lightMode: "Activar modo claro",
      darkMode: "Activar modo oscuro",
    },
    settings: {
      button: "Sonido e idioma",
      buttonMuted: "Sonido silenciado — sonido e idioma",
      sound: "Sonido",
      all: "Sonido general",
      keystrokes: "Tecleo",
      errors: "Errores",
      celebrations: "Logros y récords",
      on: "activado",
      off: "desactivado",
    },
    modes: {
      time: "Tiempo",
      words: "Palabras",
      numbers: "Números",
      quote: "Cita",
      classics: "Clásicos",
      dictation: "Dictado",
      lesson: "Curso",
      code: "Código",
      zen: "Zen",
      drill: "Entrenar",
      custom: "Mi texto",
      weekly: "Semanal",
    },
  },
  en: {
    close: "Close",
    language: "Language",
    practiceLanguage: "Practice texts",
    level: (n) => `Level ${n}`,
    levelUp: (n) => `Level ${n}!`,
    maxLevel: "max level",
    pages: {
      default:
        "Practice touch typing: your weak keys, your hard words and training made for you.",
      history: {
        title: "History",
        description:
          "Your progress on SwiftFlow: speed, accuracy, weak keys, achievements and challenges.",
      },
      course: {
        title: "Course from scratch",
        description:
          "Learn to type without looking at the keyboard: one row at a time, with lessons that fit your keyboard.",
      },
      summary: {
        title: "Your summary",
        description:
          "Your month or year of practice on SwiftFlow: how much, how fast, what got better.",
      },
      about: {
        title: "What is SwiftFlow",
        description:
          "A typing test that tells you what you miss, why, and builds the practice to fix it. No account, all in your browser.",
      },
    },
    nav: {
      streak: (n) => `${n}-day streak`,
      streakAtRisk: (left) => `Your streak ends in ${left}: you haven't practiced today`,
      course: "Course from scratch",
      history: "See history",
      about: "What SwiftFlow is",
      lightMode: "Switch to light mode",
      darkMode: "Switch to dark mode",
    },
    settings: {
      button: "Sound and language",
      buttonMuted: "Sound muted — sound and language",
      sound: "Sound",
      all: "All sound",
      keystrokes: "Keystrokes",
      errors: "Mistakes",
      celebrations: "Achievements and records",
      on: "on",
      off: "off",
    },
    modes: {
      time: "Time",
      words: "Words",
      numbers: "Numbers",
      quote: "Quote",
      classics: "Classics",
      dictation: "Dictation",
      lesson: "Course",
      code: "Code",
      zen: "Zen",
      drill: "Train",
      custom: "My text",
      weekly: "Weekly",
    },
  },
};
