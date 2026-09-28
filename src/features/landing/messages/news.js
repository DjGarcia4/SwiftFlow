// Landing: news, in both languages -- what's new, and "Probalo acá"
export default {
  es: {
    changelog: {
      kicker: "Novedades",
      title: "Lo último que llegó",
      new: "Nuevo",
      date: (month, year) => `${month} de ${year}`,
      entries: {
        historyChapters: {
          title: "Un historial que se recorre",
          text: "El historial, en nueve capítulos, cada uno con una línea de qué muestra, y una guía al costado que marca por dónde vas (los números del 1 al 9 te llevan a cualquiera). Tus récords tienen el suyo: tu mejor marca en grande, cada categoría con su récord para retarlo con el marcapasos, y las que todavía no tienen, listas para estrenar.",
        },
        yourFingers: {
          title: "Tus dedos",
          text: "En el historial, tus dos manos: cuánto falla y cuánto tarda cada dedo, y cómo viene contra antes. El que se queda atrás aparece marcado, con un botón que lo pone a practicar solo en el modo Dedos. Los consejos de dedo y de mano también te llevan ahí. Con un logro nuevo: Dedo domado.",
        },
        simplerBar: {
          title: "Una barra más simple",
          text: "El modo es un solo botón que abre todos, agrupados y con una línea de qué es cada uno; puntuación, sin red y los modos exigentes van juntos en Opciones. Todo con su tecla, también adentro de cada menú. Al terminar, 2 segundos en los que ninguna tecla te saca del resumen. Y la tendencia del historial ahora dice hacia dónde vas.",
        },
        fingers: {
          title: "Entrenar por dedos",
          text: "Un modo nuevo, Dedos: elegí el meñique izquierdo, los dos índices o una mano entera, y el texto sale solo de sus letras en tu teclado, con palabras reales cuando las hay. El teclado en pantalla apaga el resto. Con logros y un reto diario.",
        },
        keyHints: {
          title: "Cada botón con su tecla",
          text: "Al lado de cada botón está la tecla que lo presiona: L abre los retos, F muestra dónde te frenaste, C comparte, H va al historial. En el test van con Alt (⌥ en Mac). Y el curso se hace entero sin mouse: S sigue a la próxima lección, R la repite.",
        },
        commandPalette: {
          title: "Todo con el teclado",
          text: "Ctrl/⌘ K abre los comandos: cambiá el tiempo, el modo, el tema, el idioma, el teclado o la fuente escribiendo, sin soltar las manos. Tab empieza de nuevo a mitad de una partida. Con un logro y un reto nuevos.",
        },
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
        historyChapters: {
          title: "A history you can find your way in",
          text: "The history in nine chapters, each with a line on what it shows, and a guide at the side marking where you are (the numbers 1 to 9 take you to any of them). Your records got their own: your best mark up big, every category with its record to race with the pacer, and the ones without one yet, ready to try.",
        },
        yourFingers: {
          title: "Your fingers",
          text: "In the history, your two hands: how much each finger misses and how long it takes, and how it's going against before. The one lagging behind is marked, with a button that has it practice alone in Fingers mode. The finger and hand tips take you there too. With a new achievement: Tamed finger.",
        },
        simplerBar: {
          title: "A simpler bar",
          text: "The mode is one button opening them all, grouped, with a line on what each one is; punctuation, no net and the demanding modes sit together under Options. Everything has its key, inside every menu too. When a run ends, 2 seconds where no key takes you away from the summary. And the history's trend now says where you're heading.",
        },
        fingers: {
          title: "Train by finger",
          text: "A new mode, Fingers: pick the left pinky, both index fingers or a whole hand, and the text comes from their letters only on your keyboard, with real words when there are any. The on-screen keyboard dims the rest. With achievements and a daily challenge.",
        },
        keyHints: {
          title: "Every button, its key",
          text: "Beside each button is the key that presses it: L opens the challenges, F shows where you slowed down, C shares, H goes to the history. On the test they take Alt (⌥ on a Mac). And the course needs no mouse at all: S moves on to the next lesson, R repeats it.",
        },
        commandPalette: {
          title: "All from the keyboard",
          text: "Ctrl/⌘ K opens the commands: change the time, mode, theme, language, keyboard or font by typing, hands never leaving the keys. Tab starts over mid-run. With a new achievement and challenge.",
        },
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
