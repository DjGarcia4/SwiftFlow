// Landing: the hero, how it works, the comparison and the closing, in both
// languages
export default {
  es: {
    hero: {
      hello: "¡Hola de nuevo!",
      sessions: (n) => `${n} sesiones`,
      streak: (n) => `racha de ${n} ${n === 1 ? "día" : "días"}`,
      level: (n, title) => `nivel ${n} · ${title}`,
      weakKey: "tu tecla a mejorar:",
      badge: "Mecanografía en español e inglés",
      titleTop: "Escribí más rápido.",
      titleBottom: "Entendé por qué te equivocás.",
      intro:
        "SwiftFlow no solo te mide: te dice qué teclas, qué palabras y qué momentos te frenan, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.",
      continue: "Seguir practicando",
      start: "Empezar a escribir",
      install: "Instalar app",
      explore: "Ver qué tiene",
      orPress: "o apretá",
      space: "ESPACIO",
      toStart: "para empezar ya",
      stats: {
        modes: "modos",
        codeLanguages: "lenguajes de código",
        achievements: "logros",
        levels: "niveles",
        accounts: "cuentas que crear",
      },
    },
    narrative: {
      kicker: "Cómo funciona",
      title: "Tres pasos, y de nuevo",
      steps: [
        {
          title: "Escribí",
          text: "Elegí un modo y arrancá. Cada tecla queda anotada: cuál era, cuál apretaste y cuánto tardaste.",
        },
        {
          title: "Mirá qué te frena",
          text: "Al terminar ves dónde te trabaste, y con unas cuantas sesiones, tus teclas, dedos y palabras flojas.",
        },
        {
          title: "Entrená justo eso",
          text: "Un botón arma un entrenamiento con eso mismo, te dice cuándo alcanza por hoy y te lo repasa después.",
        },
      ],
      stuckOn: (word, time) => `Te trabaste en «${word}»: ${time}`,
      stuckTime: "1,9 s",
      slowestKey: (key) => `Tecla más lenta: ${key}`,
      consistency: (n) => `${n}% consistencia`,
      training: "Entrenando:",
      doneToday: (key) => `¡Listo por hoy con la ${key}!`,
      reviewIn: (n) => `Repaso en ${n} días`,
    },
    comparison: {
      kicker: "La diferencia",
      title: "Lo que un test de velocidad no te dice",
      after: "Qué sabés después",
      typical: "Un test típico",
      yes: "sí",
      no: "no",
      rows: [
        "Cuántas palabras por minuto escribiste",
        "Qué porcentaje de teclas acertaste",
        "Qué teclas fallás más, en proporción",
        "Qué teclas mejoraron y cuáles empeoraron",
        "Qué tecla apretás cuando errás otra",
        "Qué letras invertís por adelantarte",
        "Qué teclas y combinaciones te frenan sin que las erres",
        "Qué palabras enteras se te traban",
        "Qué dedo falla más",
        "En qué palabra de la partida te trabaste",
        "Qué tan parejo es tu ritmo",
        "Qué tan parejo sos de un día al otro",
        "Cuándo parar de entrenar, y cuándo repasar",
      ],
    },
    closing: {
      questions: "Preguntas",
      faqs: [
        {
          question: "¿Necesito crear una cuenta?",
          answer:
            "No. Abrís la página y escribís. Todo lo que SwiftFlow sabe de vos queda en tu navegador.",
        },
        {
          question: "¿Dónde se guardan mis datos?",
          answer:
            "En tu navegador, en este dispositivo, y en ningún otro lado. Desde el historial podés exportarlos a un archivo e importarlos en otro dispositivo.",
        },
        {
          question: "¿Funciona sin internet?",
          answer:
            "Sí. Es una app web instalable: una vez abierta, anda sin conexión, y la podés agregar a tu pantalla de inicio o a tu escritorio.",
        },
        {
          question: "¿Qué distribución de teclado usa?",
          answer:
            "La tuya: latinoamericano, español de España, inglés internacional, Dvorak o Colemak. El teclado en pantalla y los colores por dedo siguen la digitación estándar al tacto.",
        },
        {
          question: "¿Puedo practicar en inglés?",
          answer:
            "Sí. En el menú de sonido e idioma elegís los textos para practicar, aparte del idioma de la app: palabras, citas, clásicos, dictado y el curso vienen también en inglés.",
        },
        {
          question: "¿Cómo se calcula el WPM?",
          answer:
            "Como en Monkeytype: solo cuentan las palabras completas y correctas, a cinco caracteres por palabra. Aparte ves el WPM bruto, que cuenta todo lo que tecleaste.",
        },
        {
          question: "¿Es gratis?",
          answer: "Sí, completo. No hay versión paga ni publicidad.",
        },
      ],
      ctaTitle: "Tu primera partida tarda 15 segundos",
      ctaText: "Sin registrarte, sin instalar nada. Escribí y mirá qué te dice.",
      ctaButton: "Empezar ahora",
      tagline: "· mecanografía en español e inglés",
      footer: "Pie de página",
      write: "Escribir",
      history: "Historial",
      top: "Arriba",
    },
  },
  en: {
    hero: {
      hello: "Welcome back!",
      sessions: (n) => `${n} ${n === 1 ? "session" : "sessions"}`,
      streak: (n) => `${n}-day streak`,
      level: (n, title) => `level ${n} · ${title}`,
      weakKey: "your key to work on:",
      badge: "Typing practice in Spanish and English",
      titleTop: "Type faster.",
      titleBottom: "Understand why you slip.",
      intro:
        "SwiftFlow doesn't just measure you: it tells you which keys, which words and which moments slow you down, and builds the practice to fix them. No account, all in your browser.",
      continue: "Keep practicing",
      start: "Start typing",
      install: "Install app",
      explore: "See what's inside",
      orPress: "or press",
      space: "SPACE",
      toStart: "to start right away",
      stats: {
        modes: "modes",
        codeLanguages: "code languages",
        achievements: "achievements",
        levels: "levels",
        accounts: "accounts to create",
      },
    },
    narrative: {
      kicker: "How it works",
      title: "Three steps, then again",
      steps: [
        {
          title: "Type",
          text: "Pick a mode and go. Every key gets noted: which one it was, which one you pressed and how long it took.",
        },
        {
          title: "See what slows you down",
          text: "When you finish you see where you got stuck, and after a few sessions, your weak keys, fingers and words.",
        },
        {
          title: "Train exactly that",
          text: "One button builds a drill from just that, tells you when it's enough for today and brings it back for review later.",
        },
      ],
      stuckOn: (word, time) => `You got stuck on "${word}": ${time}`,
      stuckTime: "1.9 s",
      slowestKey: (key) => `Slowest key: ${key}`,
      consistency: (n) => `${n}% consistency`,
      training: "Training:",
      doneToday: (key) => `Done with ${key} for today!`,
      reviewIn: (n) => `Review in ${n} days`,
    },
    comparison: {
      kicker: "The difference",
      title: "What a speed test won't tell you",
      after: "What you know afterwards",
      typical: "A typical test",
      yes: "yes",
      no: "no",
      rows: [
        "How many words per minute you typed",
        "What percentage of keys you got right",
        "Which keys you miss most, proportionally",
        "Which keys got better and which got worse",
        "Which key you press when you miss another",
        "Which letters you swap by rushing ahead",
        "Which keys and combinations slow you down without a miss",
        "Which whole words trip you up",
        "Which finger misses most",
        "Which word of the run you got stuck on",
        "How even your rhythm is",
        "How steady you are from one day to the next",
        "When to stop training, and when to review",
      ],
    },
    closing: {
      questions: "Questions",
      faqs: [
        {
          question: "Do I need to create an account?",
          answer:
            "No. You open the page and type. Everything SwiftFlow knows about you stays in your browser.",
        },
        {
          question: "Where is my data stored?",
          answer:
            "In your browser, on this device, and nowhere else. From the history you can export it to a file and import it on another device.",
        },
        {
          question: "Does it work offline?",
          answer:
            "Yes. It's an installable web app: once opened, it works without a connection, and you can add it to your home screen or desktop.",
        },
        {
          question: "Which keyboard layout does it use?",
          answer:
            "Yours: Latin American, Spanish (Spain), US International, Dvorak or Colemak. The on-screen keyboard and finger colors follow standard touch-typing fingering.",
        },
        {
          question: "Can I practice in English?",
          answer:
            "Yes. In the sound and language menu you pick the practice texts, apart from the app's language: words, quotes, classics, dictation and the course all come in English too.",
        },
        {
          question: "How is WPM calculated?",
          answer:
            "Like Monkeytype: only complete, correct words count, at five characters per word. You also see raw WPM, which counts everything you typed.",
        },
        {
          question: "Is it free?",
          answer: "Yes, all of it. There's no paid version and no ads.",
        },
      ],
      ctaTitle: "Your first run takes 15 seconds",
      ctaText: "No sign-up, nothing to install. Type and see what it tells you.",
      ctaButton: "Start now",
      tagline: "· typing practice in Spanish and English",
      footer: "Footer",
      write: "Type",
      history: "History",
      top: "Top",
    },
  },
};
