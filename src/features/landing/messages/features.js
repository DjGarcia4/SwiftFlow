// Landing: what it does (the feature grid) and the demos it shows, in both
// languages. The samples of what gets typed follow the page's language.
const MODE_COUNT_ES = { 9: "Nueve", 10: "Diez", 11: "Once", 12: "Doce" };
const MODE_COUNT_EN = { 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve" };

export default {
  es: {
    kicker: "Todo lo que hace",
    title: "Un test de velocidad que además te entrena",
    modes: {
      title: (n) => `${MODE_COUNT_ES[n] ?? n} maneras de practicar`,
      text: "De 15 segundos a sin límite, con tu texto o el de todos.",
      time: { name: "Tiempo", detail: "15 a 120 s" },
      words: { name: "Palabras", detail: "con ¿? y ¡!" },
      numbers: { name: "Números", detail: "decimales, horas, miles" },
      quote: { name: "Cita", detail: "frases con autor" },
      classics: { name: "Clásicos", detail: "Cervantes, Bécquer, Austen, Poe…" },
      dictation: { name: "Dictado", detail: "escuchás y escribís" },
      code: { name: "Código", detail: (n) => `${n} lenguajes` },
      zen: { name: "Zen", detail: "sin límite" },
      train: { name: "Entrenar", detail: "tus teclas y palabras flojas" },
      custom: { name: "Mi texto", detail: "pegá lo que escribís" },
      weekly: { name: "Semanal", detail: "el mismo texto para todos" },
    },
    course: {
      title: "Un curso para empezar de cero",
      text: (n) =>
        `${n} lecciones para aprender a escribir sin mirar: una fila por vez, un par de dedos por vez, hasta los números y los signos. Cada una se pasa con su velocidad y su precisión, y se adapta a tu teclado.`,
      see: "Ver el curso",
      stagesAria: "Las etapas del curso",
    },
    typing: {
      title: "Mientras escribís",
      text: "El combo como barra que se llena, un coach que te avisa qué letra se te escapa, y un teclado en pantalla con el dedo que va en cada tecla.",
      coach: "Se te escapa la R · 4 de 12",
      train: "Entrenar ahora",
    },
    race: {
      title: "Corré contra alguien",
      text: "Tu propio récord como fantasma, o un marcapasos a ritmo fijo.",
      you: "Vos",
      ghost: "Tu fantasma",
      pacer: (wpm) => `Marcapasos ${wpm} wpm`,
    },
    replay: {
      title: "¿Dónde te frenaste?",
      text: "Después de cada partida, tu texto palabra por palabra, coloreado por cuánto tardaste en cada una.",
      consistency: (n) => `${n}% consistencia`,
      raw: (n) => `${n} wpm bruto`,
      corrected: (n) => `${n} errores corregidos`,
    },
    training: {
      title: "Un entrenamiento que sabe cuándo parar",
      text: "Arma la práctica con tus teclas y palabras flojas, te dice si hace falta otra ronda, y te las vuelve a traer en el momento justo.",
      steps: [
        { title: "Detecta", detail: "teclas, dedos y palabras flojas" },
        { title: "Entrena", detail: "texto armado alrededor de eso" },
        { title: "Te frena", detail: "“listo por hoy” o “una ronda más”" },
        { title: "Repasa", detail: "a 1, 3, 7, 14 y 30 días" },
      ],
    },
    small: {
      english: {
        title: "En español o en inglés",
        text: "Elegí en qué idioma practicás, aparte del de la app: palabras, citas, clásicos, dictado y el curso.",
      },
      layouts: {
        title: "Tu teclado",
        text: (names, last) =>
          `${names.join(", ")} o ${last}: el teclado en pantalla, los dedos y los consejos siguen al tuyo.`,
      },
      appearance: {
        title: "Texto a tu gusto",
        text: "Tamaño, interlineado y fuente, con opciones pensadas para leer mejor como Atkinson Hyperlegible y OpenDyslexic.",
      },
      everyone: {
        title: "Para todos",
        text: "Alto contraste, todo usable con el teclado, y los resultados leídos en voz alta por tu lector de pantalla.",
      },
      blind: {
        title: "Sin red",
        text: "Escribí sin ver tus errores hasta el final: entrena la confianza en tus dedos.",
      },
      focus: {
        title: "Modo foco",
        text: "Solo la palabra que estás escribiendo y la siguiente, grandes y en el centro. Nada más que mirar.",
      },
      strict: {
        title: "Modos exigentes",
        text: "Muerte súbita, corregir para avanzar o una precisión mínima: si no llegás, no cuenta.",
      },
      noAccount: {
        title: "Sin cuenta",
        text: "Todo queda en tu navegador. Exportá tu historial cuando quieras.",
      },
      offline: {
        title: "Funciona sin internet",
        text: "Instalala como app y practicá donde sea.",
      },
    },
    // What the demos show: the hero's sentence typing itself, the replay's
    // words, and the problem words with why each one is there
    demo: {
      typed: "la práctica constante cambia tu forma de escribir",
      slipWord: "constante",
      replay: [
        "la",
        "práctica",
        "constante",
        "es",
        "lo",
        "que",
        "realmente",
        "cambia",
        "tu",
        "velocidad",
      ],
      problemWords: [
        { word: "desarrollo", reason: "5 de 7 con error" },
        { word: "exactamente", reason: "62% más lenta" },
        { word: "siguiente", reason: "4 de 6 con error" },
      ],
    },
  },
  en: {
    kicker: "Everything it does",
    title: "A speed test that also trains you",
    modes: {
      title: (n) => `${MODE_COUNT_EN[n] ?? n} ways to practice`,
      text: "From 15 seconds to no limit, with your own text or everyone's.",
      time: { name: "Time", detail: "15 to 120 s" },
      words: { name: "Words", detail: "Spanish or English" },
      numbers: { name: "Numbers", detail: "decimals, times, thousands" },
      quote: { name: "Quote", detail: "sentences with an author" },
      classics: { name: "Classics", detail: "Austen, Dickens, Poe, Cervantes…" },
      dictation: { name: "Dictation", detail: "listen and type" },
      code: { name: "Code", detail: (n) => `${n} languages` },
      zen: { name: "Zen", detail: "no limit" },
      train: { name: "Train", detail: "your weak keys and words" },
      custom: { name: "My text", detail: "paste what you write" },
      weekly: { name: "Weekly", detail: "the same text for everyone" },
    },
    course: {
      title: "A course to start from scratch",
      text: (n) =>
        `${n} lessons to learn to type without looking: one row at a time, a pair of fingers at a time, all the way to numbers and symbols. Each one is passed with its own speed and accuracy, and it fits your keyboard.`,
      see: "See the course",
      stagesAria: "The stages of the course",
    },
    typing: {
      title: "While you type",
      text: "The combo as a bar that fills up, a coach that tells you which letter keeps slipping, and an on-screen keyboard showing the finger for each key.",
      coach: "The R keeps slipping · 4 of 12",
      train: "Train now",
    },
    race: {
      title: "Race someone",
      text: "Your own record as a ghost, or a pacer at a steady pace.",
      you: "You",
      ghost: "Your ghost",
      pacer: (wpm) => `Pacer ${wpm} wpm`,
    },
    replay: {
      title: "Where did you slow down?",
      text: "After each run, your text word by word, colored by how long each one took you.",
      consistency: (n) => `${n}% consistency`,
      raw: (n) => `${n} raw wpm`,
      corrected: (n) => `${n} errors corrected`,
    },
    training: {
      title: "Training that knows when to stop",
      text: "It builds the practice around your weak keys and words, tells you whether another round is needed, and brings them back at just the right time.",
      steps: [
        { title: "Spots", detail: "weak keys, fingers and words" },
        { title: "Trains", detail: "text built around them" },
        { title: "Stops you", detail: "“done for today” or “one more round”" },
        { title: "Reviews", detail: "after 1, 3, 7, 14 and 30 days" },
      ],
    },
    small: {
      english: {
        title: "In Spanish or English",
        text: "Pick the language you practice in, apart from the app's: words, quotes, classics, dictation and the course.",
      },
      layouts: {
        title: "Your keyboard",
        text: (names, last) =>
          `${names.join(", ")} or ${last}: the on-screen keyboard, the fingers and the tips follow yours.`,
      },
      appearance: {
        title: "Text your way",
        text: "Size, line spacing and font, with options made for easier reading like Atkinson Hyperlegible and OpenDyslexic.",
      },
      everyone: {
        title: "For everyone",
        text: "High contrast, everything usable from the keyboard, and results read aloud by your screen reader.",
      },
      blind: {
        title: "No safety net",
        text: "Type without seeing your mistakes until the end: it builds trust in your fingers.",
      },
      focus: {
        title: "Focus mode",
        text: "Just the word you're typing and the next one, big and centered. Nothing else to look at.",
      },
      strict: {
        title: "Strict modes",
        text: "Sudden death, fix it to move on, or a minimum accuracy: if you don't make it, it doesn't count.",
      },
      noAccount: {
        title: "No account",
        text: "Everything stays in your browser. Export your history whenever you want.",
      },
      offline: {
        title: "Works offline",
        text: "Install it as an app and practice anywhere.",
      },
    },
    demo: {
      typed: "steady practice is what changes the way you type",
      slipWord: "practice",
      replay: [
        "practice",
        "every",
        "day",
        "is",
        "what",
        "will",
        "eventually",
        "change",
        "your",
        "speed",
      ],
      problemWords: [
        { word: "development", reason: "5 of 7 with errors" },
        { word: "exactly", reason: "62% slower" },
        { word: "following", reason: "4 of 6 with errors" },
      ],
    },
  },
};
