// Landing: news, in both languages -- what's new, and "Probalo acá"
export default {
  es: {
    changelog: {
      kicker: "Novedades",
      title: "Lo último que llegó",
      new: "Nuevo",
      date: (month, year) => `${month} de ${year}`,
      entries: {
        recordsByLanguage: {
          title: "Récords por idioma",
          text: "Tus récords, promedios, rondas perfectas y el reto semanal, por separado en español y en inglés, con un filtro por idioma en el historial. Y los links en inglés ya se ven en inglés al compartirlos.",
        },
        practiceEnglish: {
          title: "Practicá en inglés",
          text: "Palabras, citas, textos, clásicos de Austen, Dickens y Poe, dictado con voz en inglés y el curso: elegí el idioma de los textos aparte del de la app. Con logros y retos nuevos.",
        },
        english: {
          title: "SwiftFlow en inglés",
          text: "Toda la interfaz también en inglés: la app, el historial, el curso, tu resumen y esta página. Se cambia desde el menú de sonido e idioma.",
        },
        summary: {
          title: "Tu resumen",
          text: "Tu mes y tu año contados: cuánto practicaste, tu récord, la tecla que domaste y los logros del camino, listos para compartir.",
        },
        consistency: {
          title: "Qué tan parejo sos",
          text: "Un puntaje de constancia de un día al otro, con cada día contra tu franja habitual.",
        },
        keyTrends: {
          title: "Cómo van tus teclas",
          text: "El historial te dice qué teclas mejoraron y cuáles empeoraron: tus últimas partidas contra las anteriores.",
        },
        course: {
          title: "Curso desde cero",
          text: "24 lecciones para aprender a escribir sin mirar: una fila por vez, hasta los números y los signos, con estrellas y en tu teclado.",
        },
        dictation: {
          title: "Dictado",
          text: "Una voz en español te dicta frases y las escribís sin verlas, con tildes y todo. El texto aparece al final, con lo que se te escapó marcado.",
        },
        classics: {
          title: "Clásicos, y más español",
          text: "Un modo con Cervantes, Bécquer, Machado, Martí y más, verso por verso. El modo Palabras ahora arma oraciones, con ¿? y ¡!. Y logros y retos nuevos para la lectura, el modo foco y los modos exigentes.",
        },
        focus: {
          title: "Modo foco",
          text: "Solo la palabra que estás escribiendo y la siguiente, grandes y en el centro.",
        },
        strict: {
          title: "Modos exigentes",
          text: "Muerte súbita, corregir para avanzar y precisión mínima, combinables con cualquier modo. Y tres logros nuevos para quien se anime.",
        },
        accessibility: {
          title: "Para todos",
          text: "Tema de alto contraste, diálogos que se manejan con el teclado, y resultados, logros y consejos anunciados al lector de pantalla.",
        },
        textAppearance: {
          title: "Texto a tu gusto",
          text: "Elegí la fuente, el tamaño y el interlineado del texto, y si el cursor se desliza o salta.",
        },
        layouts: {
          title: "Tu distribución de teclado",
          text: "Latinoamericano, España, EE. UU. internacional, Dvorak o Colemak: el teclado en pantalla, los dedos y los consejos siguen al tuyo.",
        },
        landing: {
          title: "La página de SwiftFlow",
          text: "Todo lo que hace, en un solo lugar, y una frase para probarlo ahí mismo.",
        },
        rewards: {
          title: "Recompensas por nivel",
          text: "Colores para toda la app, estilos de cursor y sonidos de teclado que se desbloquean subiendo de nivel.",
        },
        streakReminder: {
          title: "Recordatorio de racha",
          text: "Un aviso cuando hoy todavía no practicaste, y si querés, uno a la noche.",
        },
        fingerColors: {
          title: "Colores por dedo",
          text: "El teclado en pantalla te muestra qué dedo va en cada tecla.",
        },
        problemWords: {
          title: "Palabras que te cuestan",
          text: "Las palabras enteras que se te traban, y un entrenamiento con ellas.",
        },
        customText: {
          title: "Mi texto",
          text: "Pegá lo que escribís seguido y practicalo tal cual.",
        },
        blind: {
          title: "Sin red",
          text: "Escribí sin ver tus errores hasta el final.",
        },
        pacer: {
          title: "Marcapasos y fantasma",
          text: "Corré contra el ritmo de tu récord o contra una velocidad fija.",
        },
      },
    },
    tryIt: {
      kicker: "Probalo acá",
      title: "Una frase, y te decimos algo de tu forma de escribir",
      keepGoing: "Seguí hasta el final",
      start: "Tocá la frase y empezá a escribir",
      field: "Escribí la frase",
      continue: "Seguí en SwiftFlow",
      another: "Otra frase",
      notSaved: "Esta prueba no se guarda en tu historial.",
      accuracy: "precisión",
      seconds: "segundos",
      space: "el espacio",
      key: (key) => `la ${key}`,
      missed: (key, times) => `${key} se te escapó ${times} veces.`,
      missedDetail:
        "SwiftFlow junta esto partida a partida y te arma un entrenamiento con tus teclas flojas.",
      slow: (key, ms, typical) =>
        `Tu letra más lenta fue ${key}: ${ms} ms, contra los ${typical} ms del resto.`,
      slowDetail:
        "No la erraste, pero te hizo dudar. SwiftFlow mide cada tecla y te muestra las que te frenan.",
      almostClean: "Casi sin tropiezos y con ritmo parejo.",
      clean: "Sin un error y con ritmo parejo.",
      cleanDetail:
        "Con unas partidas más, SwiftFlow encuentra hasta lo que no se nota a simple vista.",
    },
  },
  en: {
    changelog: {
      kicker: "What's new",
      title: "The latest to arrive",
      new: "New",
      date: (month, year) => `${month} ${year}`,
      entries: {
        recordsByLanguage: {
          title: "Records per language",
          text: "Your records, averages, perfect rounds and the weekly challenge, kept apart for Spanish and English, with a language filter in the history. And links in English now look English when shared.",
        },
        practiceEnglish: {
          title: "Practice in English",
          text: "Words, quotes, texts, classics by Austen, Dickens and Poe, dictation with an English voice, and the course: pick the texts' language apart from the app's. With new achievements and challenges.",
        },
        english: {
          title: "SwiftFlow in English",
          text: "The whole interface in English too: the app, the history, the course, your summary and this page. Switch it from the sound and language menu.",
        },
        summary: {
          title: "Your summary",
          text: "Your month and your year, told: how much you practiced, your record, the key you tamed and the achievements along the way, ready to share.",
        },
        consistency: {
          title: "How steady you are",
          text: "A consistency score from one day to the next, with each day against your usual range.",
        },
        keyTrends: {
          title: "How your keys are going",
          text: "The history tells you which keys got better and which got worse: your latest runs against the ones before.",
        },
        course: {
          title: "Course from scratch",
          text: "24 lessons to learn to type without looking: one row at a time, all the way to numbers and symbols, with stars and on your keyboard.",
        },
        dictation: {
          title: "Dictation",
          text: "A Spanish voice reads you sentences and you type them without seeing them, accents and all. The text shows up at the end, with what you missed marked.",
        },
        classics: {
          title: "Classics, and more Spanish",
          text: "A mode with Cervantes, Bécquer, Machado, Martí and more, line by line. Words mode now builds sentences, with ¿? and ¡!. And new achievements and challenges for reading, focus mode and the strict modes.",
        },
        focus: {
          title: "Focus mode",
          text: "Just the word you're typing and the next one, big and centered.",
        },
        strict: {
          title: "Strict modes",
          text: "Sudden death, fix to move on and minimum accuracy, combinable with any mode. And three new achievements for the brave.",
        },
        accessibility: {
          title: "For everyone",
          text: "A high-contrast theme, dialogs you can drive with the keyboard, and results, achievements and tips announced to screen readers.",
        },
        textAppearance: {
          title: "Text your way",
          text: "Pick the font, size and line spacing of the text, and whether the caret glides or jumps.",
        },
        layouts: {
          title: "Your keyboard layout",
          text: "Latin American, Spain, US International, Dvorak or Colemak: the on-screen keyboard, the fingers and the tips follow yours.",
        },
        landing: {
          title: "The SwiftFlow page",
          text: "Everything it does, in one place, and a sentence to try it right there.",
        },
        rewards: {
          title: "Level rewards",
          text: "Colors for the whole app, caret styles and keyboard sounds that unlock as you level up.",
        },
        streakReminder: {
          title: "Streak reminder",
          text: "A heads-up when you haven't practiced today, and if you want, one at night.",
        },
        fingerColors: {
          title: "Colors by finger",
          text: "The on-screen keyboard shows you which finger goes on each key.",
        },
        problemWords: {
          title: "Words that trip you up",
          text: "The whole words you stumble on, and training with them.",
        },
        customText: {
          title: "My text",
          text: "Paste what you type often and practice it as is.",
        },
        blind: {
          title: "No safety net",
          text: "Type without seeing your mistakes until the end.",
        },
        pacer: {
          title: "Pacer and ghost",
          text: "Race against your record's pace or a fixed speed.",
        },
      },
    },
    tryIt: {
      kicker: "Try it here",
      title: "One sentence, and we'll tell you something about how you type",
      keepGoing: "Keep going to the end",
      start: "Tap the sentence and start typing",
      field: "Type the sentence",
      continue: "Keep going on SwiftFlow",
      another: "Another sentence",
      notSaved: "This try isn't saved to your history.",
      accuracy: "accuracy",
      seconds: "seconds",
      space: "the space",
      key: (key) => key,
      missed: (key, times) => `${key} slipped past you ${times} times.`,
      missedDetail:
        "SwiftFlow gathers this run by run and builds you training with your weak keys.",
      slow: (key, ms, typical) =>
        `Your slowest letter was ${key}: ${ms} ms, against ${typical} ms for the rest.`,
      slowDetail:
        "You didn't miss it, but it made you hesitate. SwiftFlow times every key and shows you the ones slowing you down.",
      almostClean: "Hardly a stumble, and an even rhythm.",
      clean: "Not a single error, and an even rhythm.",
      cleanDetail:
        "With a few more runs, SwiftFlow finds even what doesn't show at first glance.",
    },
  },
};
