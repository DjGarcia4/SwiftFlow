// The history's words, in both languages (see src/shared/i18n)
const list = (items, and) =>
  items.length === 1
    ? items[0]
    : `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;

export default {
  es: {
    calendar: {
      title: "Actividad",
      totals: (sessions, days) =>
        `${sessions} ${sessions === 1 ? "sesión" : "sesiones"} en ${days} ${days === 1 ? "día" : "días"}`,
      less: "menos",
      more: "más",
      weekdays: ["", "lun", "", "mié", "", "vie", ""],
      months: [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ],
      day: (sessions, date) =>
        `${sessions} ${sessions === 1 ? "sesión" : "sesiones"} el ${date}`,
      nothing: (date) => `Nada el ${date}`,
    },
    challengesWidget: {
      title: "Retos de hoy",
      total: (n) => `${n} ${n === 1 ? "cumplido" : "cumplidos"} en total`,
      fullDay: "¡Día redondo! Mañana hay retos nuevos.",
      short: "Retos",
      play: "Jugar",
      aria: (done, total) => `Retos de hoy: ${done} de ${total}`,
    },
    customize: {
      nextUnlock: "Próximo desbloqueo:",
      level: (n) => `Nivel ${n}`,
      unlocksAt: (n) => `Se desbloquea en el nivel ${n}`,
    },
    consistency: {
      title: "Qué tan parejo sos",
      scope: (label) => `de un día al otro · ${label}`,
      range: (min, max, mean) =>
        `Tus días van de ${min} a ${max} wpm, ${mean} de promedio`,
      chart: (n) => `WPM promedio de cada uno de tus últimos ${n} días de práctica`,
      tableCaption: "WPM promedio por día",
      day: "Día",
      sessions: "Partidas",
      describe: (date, wpm, sessions) =>
        `${date}: ${wpm} wpm en ${sessions} ${sessions === 1 ? "partida" : "partidas"}`,
    },
    improve: {
      title: "Qué mejorar",
      notEnough: "Jugá un par de partidas más y te digo en qué enfocarte.",
      allEven: "¡Vas muy parejo! No hay un patrón claro de errores por ahora.",
    },
    heatmap: {
      key: "tecla",
      totalMisses: "errores en total",
      missesAndRate: "errores · % fallado",
      none: "Ningún error registrado todavía. ¡Impecable!",
      describe: (misses, attempts, rate, before) =>
        `${misses} errores en ${attempts} intentos — fallás ${rate}% de las veces${before}`,
      before: (rate) => ` (antes ${rate}%)`,
    },
    trends: {
      title: "Cómo van tus teclas",
      scope: (n) => `últimas ${n} contra las ${n} anteriores`,
      nothing:
        "Ninguna tecla cambió lo suficiente como para decir algo todavía: seguís parejo.",
      ofError: "de error",
      to: "a",
      improved: "Mejoraste",
      worsened: "Ojo con",
      noneImproved: "Ninguna bajó lo suficiente todavía.",
      noneWorsened: "Ninguna empeoró. Bien ahí.",
    },
    levelBadge: {
      max: (extra) => `Nivel máximo · ${extra} XP de más`,
      toNext: (xp, needed, next) => `${xp}/${needed} XP para el nivel ${next}`,
    },
    roadmap: {
      here: "Estás acá",
      levels: (from, to) => (from === to ? `Nivel ${from}` : `Niveles ${from}–${to}`),
      done: "Completado",
      from: (xp) => `desde ${xp} XP`,
    },
    problemWords: {
      title: "Palabras que te cuestan",
      train: "Entrenar estas",
      errors: (errors, times) => `${errors} de ${times} con error`,
      slower: (pct) => `${pct}% más lenta`,
    },
    review: {
      ofError: "de error",
      mastered: "Dominada",
      today: "Hoy",
      due: (days) => (days === 1 ? "Mañana" : `En ${days} días`),
      doneToday: "Repaso de hoy hecho",
      dueToday: "Hoy toca repasar",
      start: "Repasar",
    },
    streakBanner: {
      title: (n) => `Tu racha de ${n} ${n === 1 ? "día" : "días"} se corta a medianoche`,
      left: (time) => `Te quedan ${time}. Una partida alcanza.`,
      remindAt: "Avisarme a las",
      hour: (h) => `${h} h`,
      noReminder: "no avisar",
      hideToday: "Ocultar por hoy",
    },
    timeOfDay: {
      title: "Tu mejor momento",
      sessions: (n) => `${n} ${n === 1 ? "sesión" : "sesiones"}`,
      notYet: "Todavía no sé a qué hora rendís más",
      faster: (pct, part) => `Escribís un ${pct}% más rápido a la ${part}`,
      even: "Rendís parejo a cualquier hora",
      onlyOne: (n, part, min) =>
        `Ya tenés ${n} a la ${part}: jugá ${min} en otro momento del día para comparar.`,
      needMore: (min) =>
        `Necesito ${min} sesiones en al menos dos momentos del día para comparar.`,
      slower: (part, pct) =>
        `A la ${part} bajás un ${pct}% · comparado con tu promedio en cada modo`,
    },
    timing: {
      key: "tecla",
      slowerThanUsual: "más lento que tu ritmo habitual",
    },
    weeklyCard: {
      title: (label) => `Reto semanal · ${label}`,
      yourBest: "Tu mejor:",
      attempts: (n) => `${n} ${n === 1 ? "intento" : "intentos"}`,
      sameText: "El mismo texto para todos esta semana",
      improve: "Mejorar",
      play: "Jugar",
    },
    weeklyGoal: {
      done: "¡Meta semanal cumplida!",
      thisWeek: "Esta semana",
      goal: "Meta:",
      days: ["L", "M", "M", "J", "V", "S", "D"],
    },
    view: {
      title: "Historial",
      space: "ESPACIO",
      backToTyping: "para volver a escribir",
      empty: "Todavía no completaste ningún test.",
      monthSummary: (month) => `Tu resumen de ${month}`,
      showLevels: "Ver todos los niveles",
      hideLevels: "Ocultar niveles",
      customize: "Personalizar",
      hide: "Ocultar",
      allModes: "Todos",
      streak: "Racha",
      sessions: "Sesiones",
      bestWpm: "Mejor WPM",
      averageWpm: "WPM promedio",
      averageAccuracy: "Precisión promedio",
      todaysChallenges: "Retos de hoy",
      challengeCounts: (done, fullDays) =>
        `${done} ${done === 1 ? "cumplido" : "cumplidos"} · ${fullDays} ${fullDays === 1 ? "día redondo" : "días redondos"}`,
      pastWeeks: "Semanas anteriores",
      weeklyGoal: "Meta semanal",
      weeksDone: (n) => `${n} ${n === 1 ? "semana cumplida" : "semanas cumplidas"}`,
      wpmTrend: "Tendencia de WPM",
      mostMissed: "Teclas más falladas",
      lastSessions: (n) => `últimas ${n} ${n === 1 ? "sesión" : "sesiones"}`,
      slowestKeys: "Tus teclas más lentas",
      slowestPairs: "Tus combinaciones más lentas",
      comboUnit: "combo",
      inReview: "Letras en repaso",
      reviewSteps: "1 · 3 · 7 · 14 · 30 días",
      personalBests: "Récords personales",
      perfectRounds: (n) => `Rondas perfectas (${n})`,
      achievements: (done, total) => `Logros (${done}/${total})`,
      showLess: "Ver menos",
      showMore: (n) => `Ver más (${n})`,
      yourSessions: "Tus partidas",
      blindBadge: "sin red",
      blindHint: "Jugada sin red: los errores no se veían mientras escribías",
      minAccuracyHint: (min) => `Jugada con una precisión mínima del ${min} %`,
      oldMetricsHint:
        "Medida con la fórmula anterior de WPM: no cuenta para récords ni promedios",
      wpm: "wpm",
      accuracy: "precisión",
      errors: "errores",
      export: "Exportar",
      import: "Importar",
      clear: "Borrar historial",
      confirmClear: "¿Confirmar borrado?",
      exported: (n) => `Exportaste ${n} ${n === 1 ? "sesión" : "sesiones"}.`,
      imported: (n, skipped) =>
        `Importaste ${n} ${n === 1 ? "sesión nueva" : "sesiones nuevas"}.${skipped}`,
      nothingNew: (skipped) => `Ya tenías todas esas sesiones.${skipped}`,
      skipped: (n) => ` Se saltearon ${n} sin leer.`,
      bestCombo: "Mejor combo",
      consistency: "Consistencia",
      totalTime: "Tiempo total",
      keystrokes: "Teclas pulsadas",
      corrected: "Errores corregidos",
      firstTime: "¿Primera vez por acá?",
      seeLanding: "Mirá todo lo que hace SwiftFlow",
    },
    challenges: {
      sessions: (n) => `Completá ${n} sesiones`,
      minutes: (n) => `Practicá ${n} minutos`,
      accuracy: (bar) => `Terminá una sesión con ${bar}% de precisión o más`,
      speed: (wpm) => `Llegá a ${wpm} wpm en una sesión`,
      combo: (n) => `Hacé un combo de ${n} sin errores`,
      perfect: "Hacé una ronda perfecta, sin un solo error",
      mode: (mode) => `Completá una partida de ${mode}`,
      suddenDeath: "Completá una partida con muerte súbita",
      minAccuracy: "Completá una partida exigiéndote un 95% de precisión o más",
      focus: "Completá una partida en modo foco",
      english: "Completá una partida con textos en inglés",
      bilingual: "Jugá una partida en español y otra en inglés",
    },
    tiers: {
      1: "Novato",
      5: "Aprendiz",
      10: "Ágil",
      15: "Veloz",
      20: "Experto",
      30: "Maestro",
      40: "Leyenda",
      50: "Dios del teclado",
    },
    rewards: {
      kinds: { accent: "Color", caret: "Cursor", sound: "Sonido" },
      labels: {
        orange: "Naranja",
        bar: "Barra",
        soft: "Suave",
        sky: "Cielo",
        block: "Bloque",
        mechanical: "Mecánico",
        violet: "Violeta",
        underline: "Subrayado",
        typewriter: "Máquina de escribir",
        rose: "Rosa",
        glow: "Brillo",
        bubble: "Burbuja",
        indigo: "Índigo",
        wood: "Madera",
        amber: "Ámbar",
        fuchsia: "Fucsia",
        rainbow: "Arcoíris",
      },
      unlocked: (items) => `Desbloqueaste: ${items.join(", ")}`,
    },
    modeLabels: {
      code: (language) => `Código · ${language}`,
      classics: (work) => `Clásicos · ${work}`,
      dictation: (n) => `Dictado · ${n} ${n === 1 ? "frase" : "frases"}`,
      lesson: (n) => `Curso · Lección ${n}`,
      time: (s) => `${s}s`,
      words: (n) => `${n} palabras`,
      numbers: (n) => `${n} números`,
      drill: (n) => `Entrenar · ${n} palabras`,
      weekly: (label) => `Semanal · ${label}`,
      custom: (name) => `Mi texto · ${name}`,
    },
    keyLabels: { space: "espacio", enter: "enter", tab: "tab" },
    weekLabel: (week, year) => `S${week}·${year}`,
    backup: {
      notJson: "El archivo no es un JSON válido.",
      notOurs: "Ese archivo no es una copia de SwiftFlow.",
      empty: "La copia no tiene sesiones adentro.",
      unreadable: "No se pudo leer ninguna sesión de la copia.",
    },
    summary: {
      period: (month, year) => `${month} de ${year}`,
      cardTitle: (label) => `Mi ${label}`,
      sessions: (n) => (n === 1 ? "partida" : "partidas"),
      minutes: "minutos",
      days: (n) => (n === 1 ? "día" : "días"),
      record: (wpm, label) => `🏆 Récord: ${wpm} WPM · ${label}`,
      best: (wpm, label) => `Mejor: ${wpm} WPM · ${label}`,
      average: (wpm, change, accuracy) =>
        `Promedio: ${wpm} WPM${change} · ${accuracy}% precisión`,
      tamed: (key, before, after) => `Tecla domada: ${key} ${before} → ${after}`,
      newAchievements: (n) => `${n} ${n === 1 ? "logro" : "logros"} nuevos`,
      footer: "Tu resumen en SwiftFlow",
      page: {
        empty: "Todavía no hay nada que resumir: jugá tu primera partida y volvé.",
        kicker: "Tu resumen",
        title: (label) => `Tu ${label}`,
        noSessions: "Sin partidas",
        period: "Período",
        months: "Meses",
        years: "Años",
        nothingIn: (label) => `No jugaste en ${label}.`,
        of: (n) => `de ${n}`,
        newAchievements: (n) => (n === 1 ? "logro nuevo" : "logros nuevos"),
        share: "Compartir mi resumen",
        shareTitle: "Compartir resumen",
        record: "Récord",
        best: "Tu mejor partida",
        newRecordIn: (label) => `Tu nuevo récord, en ${label}`,
        inMode: (label) => `En ${label}`,
        periodAverage: "Tu promedio del período",
        faster: (n) => `${n}% más rápido que el período anterior`,
        slower: (n) => `${n}% más lento que el período anterior`,
        same: "Igual que el período anterior",
        averageSpeed: "Velocidad promedio",
        accuracy: "Precisión",
        accuracyDetail: "De promedio, contando cada tecla",
        tamedKey: "La tecla que domaste",
        tamedDetail: (before, after) => `De ${before} a ${after} de error`,
        favoriteMode: "Tu modo favorito",
        longestStreak: "Tu racha más larga",
        streakDetail: "Seguidos, en este período",
        busiestDay: "Tu día con más partidas",
        fileName: "swiftflow-resumen.png",
        shareText: (label, sessions, minutes) =>
          `Mi ${label} en SwiftFlow: ${sessions} partidas, ${minutes} minutos ⚡`,
      },
    },
    consistencyLevels: {
      veryEven: "Muy parejo",
      even: "Parejo",
      bumpy: "Con altibajos",
      irregular: "Irregular",
    },
    toasts: {
      challengeDone: "¡Reto cumplido!",
      reviewed: (keys) => `Repasaste ${keys.join(", ")}`,
      reviewDone: "¡Repaso del día hecho!",
      weekGoal: (minutes) => `${minutes} minutos esta semana`,
      weekGoalDone: "¡Meta semanal cumplida!",
      level: (n, title) => `Nivel ${n} · ${title}`,
      levelUp: "¡Subiste de nivel!",
      achievement: "¡Logro desbloqueado!",
    },
    streakNotice: {
      title: (n) => `Tu racha de ${n} ${n === 1 ? "día" : "días"} se corta hoy`,
      body: (left) => `Te quedan ${left}. Una partida alcanza para mantenerla.`,
    },
    timeLeft: { hours: (n) => `${n} h`, minutes: (n) => `${n} min` },
    dayParts: {
      dawn: "madrugada",
      morning: "mañana",
      afternoon: "tarde",
      night: "noche",
    },
    tips: {
      oneIn: (n) => `1 de cada ${n}`,
      outOfTen: (n) => `${n} de cada 10`,
      train: "Entrenar estas",
      weakKeys: {
        title: (keys) => `Practicá la ${list(keys, "y")}`,
        detail: (count, worst, oneIn, misses, average, contrast, merged) =>
          `${count === 1 ? "Es la tecla" : "Son las teclas"} que más se te escapan en proporción: la ${worst} te sale mal ${oneIn} veces (${misses} errores) contra tu promedio de ${average}.${contrast}${merged}`,
        contrast: (key) =>
          ` La ${key} suma más errores, pero solo porque la tecleás mucho más seguido.`,
        merged: (outOfTen, key) =>
          ` Cuando la errás, ${outOfTen} veces apretás la ${key}.`,
      },
      confusion: {
        title: (from, to) => `Confundís la ${from} con la ${to}`,
        detail: (outOfTen, from, to, neighbours) =>
          `${outOfTen} veces que errás la ${from} terminás apretando la ${to}. ${
            neighbours
              ? "Son teclas vecinas: el dedo se te corre a la de al lado. Bajá un cambio en esa zona hasta que la posición se acomode sola."
              : "Fijate en esa mano: es un error de posición, no de velocidad."
          }`,
      },
      transposition: {
        title: "Se te adelantan los dedos",
        detail: (total, pair, typedAs) =>
          `Cambiás el orden de dos letras seguido: ${total} veces, y la que más se te da vuelta es «${pair}» (te sale «${typedAs}»). No es puntería sino ritmo entre las manos: practicá esa combinación despacio y pareja.`,
      },
      space: {
        title: "Cuidá los espacios",
        detail: (misses) =>
          `Es donde más errores acumulás (${misses}). Suele pasar por adelantarte a la siguiente palabra: terminá cada palabra antes de pegar el espacio.`,
      },
      hand: {
        names: { left: "izquierda", right: "derecha" },
        title: (name) => `Tu mano ${name} falla más`,
        detail: (worse, better) =>
          `Errás el ${worse} de sus teclas contra el ${better} de la otra. Vale la pena ejercitarla aparte.`,
      },
      row: {
        names: { top: "de arriba", home: "del medio", bottom: "de abajo" },
        title: (name) => `La fila ${name} te cuesta más`,
        detail: (worst, best, bestName) =>
          `Fallás el ${worst} ahí contra el ${best} en la fila ${bestName}. Practicá llegar a esas teclas sin mirar.`,
      },
      finger: {
        title: (finger) => `Tu ${finger} falla más`,
        detail: (rate, keys, typical) =>
          `Errás el ${rate} de las teclas que le tocan (${list(keys, "y")}) contra el ${typical} de un dedo típico tuyo. Con los colores por dedo del teclado en pantalla vas a ver cuáles son.`,
      },
      slowKeys: {
        title: (keys) =>
          `Te ${keys.length === 1 ? "frena" : "frenan"} ${list(
            keys.map((k) => `la ${k}`),
            "y"
          )}`,
        detail: (single, extra, ms, baseline) =>
          `No ${single ? "la errás" : "las errás"} casi nunca, pero te ${single ? "lleva" : "llevan"} un ${extra} más de tiempo que el resto de tus teclas: ${ms} ms contra tus ${baseline} ms habituales. ${single ? "Repetila suelta" : "Repetilas sueltas"}, sin apuro, hasta que ${single ? "salga" : "salgan"} sin pensar.`,
      },
      slowPairs: {
        title: (pairs) => `Tus combinaciones más lentas: ${list(pairs, "y")}`,
        detail: (pair, ms, baseline, extra) =>
          `Pasar de una letra a la otra en «${pair}» te lleva ${ms} ms contra tus ${baseline} ms de siempre, un ${extra} más. No son teclas difíciles sino transiciones entre dedos: practicá esas combinaciones sueltas antes de acelerar.`,
      },
      problemWords: {
        title: (words) =>
          `Se te ${words.length === 1 ? "traba" : "traban"} ${list(words, "y")}`,
        detail:
          "Son palabras enteras, no letras sueltas: las errás o te frenan cada vez que aparecen. Repetirlas solas hasta que salgan de corrido las vuelve automáticas.",
      },
      digits: {
        title: "Los números te cuestan",
        detail: (rate) =>
          `Fallás el ${rate} de los dígitos. El modo Números es ideal para eso.`,
        action: "Practicar números",
      },
      accents: {
        title: "Ojo con las tildes",
        detail: (rate) =>
          `Fallás el ${rate} de las letras con tilde. Practicá la combinación de la tecla de acento con la vocal.`,
      },
      slowDown: {
        title: "Bajá un poco la velocidad",
        detail: (accuracy) =>
          `Tu precisión reciente es ${accuracy}%. Con más de 95% cada error cuesta menos y la velocidad sube sola.`,
      },
      speedUp: {
        title: "Podés apretar el ritmo",
        detail: (accuracy) =>
          `Tu precisión reciente es ${accuracy}%: está excelente. Es buen momento para empujar la velocidad.`,
      },
    },
    achievements: {
      first_session: { title: "Primer paso", description: "Completá tu primera sesión" },
      sessions_10: { title: "Constancia", description: "Completá 10 sesiones" },
      sessions_25: { title: "Dedicado", description: "Completá 25 sesiones" },
      sessions_50: { title: "Veterano", description: "Completá 50 sesiones" },
      sessions_100: { title: "Centurión", description: "Completá 100 sesiones" },
      sessions_250: { title: "Imparable", description: "Completá 250 sesiones" },
      sessions_500: { title: "Maestro", description: "Completá 500 sesiones" },
      wpm_20: { title: "Arrancando", description: "Alcanzá 20 palabras por minuto" },
      wpm_40: { title: "40 WPM", description: "Alcanzá 40 palabras por minuto" },
      wpm_60: { title: "60 WPM", description: "Alcanzá 60 palabras por minuto" },
      wpm_80: { title: "80 WPM", description: "Alcanzá 80 palabras por minuto" },
      wpm_100: {
        title: "Club de los 100",
        description: "Alcanzá 100 palabras por minuto",
      },
      wpm_120: { title: "Velocista", description: "Alcanzá 120 palabras por minuto" },
      wpm_140: { title: "Sobrehumano", description: "Alcanzá 140 palabras por minuto" },
      wpm_160: { title: "Imposible", description: "Alcanzá 160 palabras por minuto" },
      accuracy_100: {
        title: "Precisión perfecta",
        description: "Completá una sesión con 100% de precisión",
      },
      accuracy_100_x5: {
        title: "Cirujano",
        description: "Completá 5 sesiones con 100% de precisión",
      },
      accuracy_100_x20: {
        title: "Robot",
        description: "Completá 20 sesiones con 100% de precisión",
      },
      tamed_key: {
        title: "Tecla domada",
        description: "Bajá a la mitad los errores de una tecla que te costaba",
      },
      steady_days: {
        title: "Constante",
        description:
          "Mantené 90 de parejo de un día al otro, en al menos 7 días de práctica",
      },
      accuracy_avg_95: {
        title: "Consistente",
        description: "Mantené un 95% de precisión promedio",
      },
      sudden_death_1: {
        title: "Una sola vida",
        description: "Completá una partida con muerte súbita",
      },
      sudden_death_long: {
        title: "Intocable",
        description: "Aguantá 60 segundos o 50 palabras con muerte súbita",
      },
      must_correct_5: {
        title: "Paciencia",
        description: "Completá 5 partidas con corregir para avanzar",
      },
      min_accuracy_98: {
        title: "Pulso firme",
        description: "Completá una partida exigiéndote un 98% de precisión",
      },
      month_20_days: {
        title: "Mes de hierro",
        description: "Practicá 20 días distintos en un mismo mes",
      },
      classics_1: { title: "Buen lector", description: "Completá un clásico" },
      classics_5: {
        title: "Alma de poeta",
        description: "Completá 5 clásicos distintos",
      },
      classics_all: {
        title: "Biblioteca completa",
        description: "Completá todos los clásicos",
      },
      dictation_1: { title: "Buen oído", description: "Completá un dictado" },
      dictation_10: { title: "Taquígrafo", description: "Completá 10 dictados" },
      dictation_clean: {
        title: "Oído fino",
        description: "Completá un dictado de 5 frases con 98% de precisión o más",
      },
      punctuated_words_100: {
        title: "Signos en su lugar",
        description: "Completá 100 palabras con puntuación: mayúsculas, comas, ¿? y ¡!",
      },
      focus_10: { title: "En la zona", description: "Completá 10 partidas en modo foco" },
      course_1: {
        title: "Primera lección",
        description: "Pasá tu primera lección del curso",
      },
      course_home_row: {
        title: "Fila del medio",
        description: "Pasá todas las lecciones de la fila del medio",
      },
      course_stars: {
        title: "Tres estrellas",
        description: "Sacá tres estrellas en una lección",
      },
      course_complete: {
        title: "Sin mirar",
        description: "Pasá todas las lecciones del curso",
      },
      english_1: {
        title: "Hello, world",
        description: "Completá tu primera partida con textos en inglés",
      },
      english_25: {
        title: "Fluent",
        description: "Completá 25 partidas con textos en inglés",
      },
      bilingual_day: {
        title: "Bilingüe",
        description: "Jugá en español y en inglés el mismo día",
      },
      english_classics_all: {
        title: "Biblioteca inglesa",
        description: "Leé todos los clásicos en inglés",
      },
      combo_50: {
        title: "Combo x50",
        description: "Escribí 50 caracteres seguidos sin errores",
      },
      combo_150: {
        title: "Combo x150",
        description: "Escribí 150 caracteres seguidos sin errores",
      },
      combo_300: {
        title: "Combo x300",
        description: "Escribí 300 caracteres seguidos sin errores",
      },
      combo_500: {
        title: "Intocable",
        description: "Escribí 500 caracteres seguidos sin errores",
      },
      streak_3: { title: "Racha de 3 días", description: "Practicá 3 días seguidos" },
      streak_7: { title: "Una semana entera", description: "Practicá 7 días seguidos" },
      streak_14: { title: "Dos semanas", description: "Practicá 14 días seguidos" },
      streak_30: { title: "Un mes completo", description: "Practicá 30 días seguidos" },
      streak_100: { title: "Leyenda", description: "Practicá 100 días seguidos" },
      streak_365: { title: "Un año entero", description: "Practicá 365 días seguidos" },
      explorer: {
        title: "Explorador",
        description: "Completá una sesión en 5 modos distintos",
      },
      polyglot: {
        title: "Políglota",
        description: "Probá 3 lenguajes distintos del modo código",
      },
      quote_lover: {
        title: "Bibliófilo",
        description: "Completá 15 sesiones en modo cita",
      },
      words_lover: {
        title: "Amante de las palabras",
        description: "Completá 20 sesiones en modo palabras",
      },
      time_lover: {
        title: "Cronometrista",
        description: "Completá 20 sesiones en modo tiempo",
      },
      numbers_lover: {
        title: "Contador",
        description: "Completá 10 sesiones en modo números",
      },
      all_time_options: {
        title: "Todos los tiempos",
        description: "Jugá los 4 tiempos disponibles (15s, 30s, 60s, 120s)",
      },
      all_word_options: {
        title: "Todos los tamaños",
        description: "Jugá las 4 cantidades de palabras disponibles",
      },
      time_10min: {
        title: "Calentando motores",
        description: "Practicá 10 minutos en total",
      },
      time_1h: { title: "Una hora de práctica", description: "Practicá 1 hora en total" },
      time_5h: { title: "Maratonista", description: "Practicá 5 horas en total" },
      time_10h: { title: "Dedicación total", description: "Practicá 10 horas en total" },
      time_24h: { title: "Un día completo", description: "Practicá 24 horas en total" },
      week_goal_1: {
        title: "Semana cumplida",
        description: "Cumplí tu meta semanal de práctica",
      },
      week_goal_4: {
        title: "Un mes de metas",
        description: "Cumplí tu meta semanal 4 veces",
      },
      week_goal_12: {
        title: "Tres meses de metas",
        description: "Cumplí tu meta semanal 12 veces",
      },
      zen_marathon: {
        title: "Meditación activa",
        description: "Completá 3 minutos seguidos en modo zen",
      },
      zen_marathon_10: {
        title: "Trance",
        description: "Completá 10 minutos seguidos en modo zen",
      },
      zen_sessions_10: {
        title: "Alma zen",
        description: "Completá 10 sesiones en modo zen",
      },
      challenge_1: { title: "Primer reto", description: "Cumplí tu primer reto diario" },
      challenge_25: { title: "Retador", description: "Cumplí 25 retos diarios" },
      challenge_100: { title: "Sin excusas", description: "Cumplí 100 retos diarios" },
      challenge_full_day: {
        title: "Día redondo",
        description: "Cumplí los 3 retos de un mismo día",
      },
      challenge_full_day_7: {
        title: "Siete días redondos",
        description: "Cumplí los 3 retos del día en 7 días distintos",
      },
      weekly_challenge_1: {
        title: "Reto semanal",
        description: "Jugá el reto semanal, el mismo texto para todos",
      },
      weekly_challenge_4: {
        title: "Habitué del reto",
        description: "Jugá el reto semanal en 4 semanas distintas",
      },
      night_owl: {
        title: "Búho nocturno",
        description: "Completá una sesión entre medianoche y las 5am",
      },
      early_bird: {
        title: "Madrugador",
        description: "Completá una sesión entre las 5am y las 7am",
      },
      weekend_warrior: {
        title: "Guerrero de fin de semana",
        description: "Completá una sesión un sábado o domingo",
      },
      double_session_day: {
        title: "Doble sesión",
        description: "Completá 2 sesiones el mismo día",
      },
      daily_marathon: {
        title: "Maratón diario",
        description: "Completá 5 sesiones el mismo día",
      },
      comeback: {
        title: "El regreso",
        description: "Volvé a practicar tras una semana de ausencia",
      },
      comeback_month: {
        title: "El gran regreso",
        description: "Volvé a practicar tras un mes de ausencia",
      },
      first_week_anniversary: {
        title: "Una semana con nosotros",
        description: "Tu primera sesión fue hace 7 días o más",
      },
      one_month_anniversary: {
        title: "Un mes con nosotros",
        description: "Tu primera sesión fue hace 30 días o más",
      },
      one_year_anniversary: {
        title: "Aniversario",
        description: "Tu primera sesión fue hace 365 días o más",
      },
    },
  },
  en: {
    calendar: {
      title: "Activity",
      totals: (sessions, days) =>
        `${sessions} ${sessions === 1 ? "session" : "sessions"} on ${days} ${days === 1 ? "day" : "days"}`,
      less: "less",
      more: "more",
      weekdays: ["", "Mon", "", "Wed", "", "Fri", ""],
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      day: (sessions, date) =>
        `${sessions} ${sessions === 1 ? "session" : "sessions"} on ${date}`,
      nothing: (date) => `Nothing on ${date}`,
    },
    challengesWidget: {
      title: "Today's challenges",
      total: (n) => `${n} done in total`,
      fullDay: "A full day! New challenges tomorrow.",
      short: "Challenges",
      play: "Play",
      aria: (done, total) => `Today's challenges: ${done} of ${total}`,
    },
    customize: {
      nextUnlock: "Next unlock:",
      level: (n) => `Level ${n}`,
      unlocksAt: (n) => `Unlocks at level ${n}`,
    },
    consistency: {
      title: "How steady you are",
      scope: (label) => `from one day to the next · ${label}`,
      range: (min, max, mean) =>
        `Your days range from ${min} to ${max} wpm, ${mean} on average`,
      chart: (n) => `Average WPM on each of your last ${n} days of practice`,
      tableCaption: "Average WPM per day",
      day: "Day",
      sessions: "Sessions",
      describe: (date, wpm, sessions) =>
        `${date}: ${wpm} wpm over ${sessions} ${sessions === 1 ? "session" : "sessions"}`,
    },
    improve: {
      title: "What to improve",
      notEnough: "Play a couple more runs and I'll tell you what to focus on.",
      allEven: "You're very even! No clear pattern of mistakes for now.",
    },
    heatmap: {
      key: "key",
      totalMisses: "total mistakes",
      missesAndRate: "mistakes · %",
      none: "No mistakes recorded yet. Flawless!",
      describe: (misses, attempts, rate, before) =>
        `${misses} mistakes in ${attempts} tries — you miss it ${rate}% of the time${before}`,
      before: (rate) => ` (was ${rate}%)`,
    },
    trends: {
      title: "How your keys are going",
      scope: (n) => `last ${n} against the ${n} before`,
      nothing: "No key has changed enough to say anything yet: you're holding steady.",
      ofError: "missed",
      to: "to",
      improved: "Improved",
      worsened: "Watch out",
      noneImproved: "None has dropped enough yet.",
      noneWorsened: "None got worse. Nice.",
    },
    levelBadge: {
      max: (extra) => `Max level · ${extra} XP beyond`,
      toNext: (xp, needed, next) => `${xp}/${needed} XP to level ${next}`,
    },
    roadmap: {
      here: "You're here",
      levels: (from, to) => (from === to ? `Level ${from}` : `Levels ${from}–${to}`),
      done: "Done",
      from: (xp) => `from ${xp} XP`,
    },
    problemWords: {
      title: "Words that trip you up",
      train: "Train these",
      errors: (errors, times) => `${errors} of ${times} with a mistake`,
      slower: (pct) => `${pct}% slower`,
    },
    review: {
      ofError: "missed",
      mastered: "Mastered",
      today: "Today",
      due: (days) => (days === 1 ? "Tomorrow" : `In ${days} days`),
      doneToday: "Today's review done",
      dueToday: "Review due today",
      start: "Review",
    },
    streakBanner: {
      title: (n) => `Your ${n}-day streak ends at midnight`,
      left: (time) => `${time} left. One run is enough.`,
      remindAt: "Remind me at",
      hour: (h) => `${h}:00`,
      noReminder: "don't remind",
      hideToday: "Hide for today",
    },
    timeOfDay: {
      title: "Your best time",
      sessions: (n) => `${n} ${n === 1 ? "session" : "sessions"}`,
      notYet: "I don't know yet when you type best",
      faster: (pct, part) => `You type ${pct}% faster in the ${part}`,
      even: "You type evenly at any hour",
      onlyOne: (n, part, min) =>
        `You have ${n} in the ${part}: play ${min} at another time of day to compare.`,
      needMore: (min) =>
        `I need ${min} sessions in at least two parts of the day to compare.`,
      slower: (part, pct) =>
        `In the ${part} you drop ${pct}% · against your average in each mode`,
    },
    timing: {
      key: "key",
      slowerThanUsual: "slower than your usual pace",
    },
    weeklyCard: {
      title: (label) => `Weekly challenge · ${label}`,
      yourBest: "Your best:",
      attempts: (n) => `${n} ${n === 1 ? "try" : "tries"}`,
      sameText: "The same text for everyone this week",
      improve: "Improve",
      play: "Play",
    },
    weeklyGoal: {
      done: "Weekly goal met!",
      thisWeek: "This week",
      goal: "Goal:",
      days: ["M", "T", "W", "T", "F", "S", "S"],
    },
    view: {
      title: "History",
      space: "SPACE",
      backToTyping: "to get back to typing",
      empty: "You haven't finished a test yet.",
      monthSummary: (month) => `Your ${month} summary`,
      showLevels: "See all levels",
      hideLevels: "Hide levels",
      customize: "Customize",
      hide: "Hide",
      allModes: "All",
      streak: "Streak",
      sessions: "Sessions",
      bestWpm: "Best WPM",
      averageWpm: "Average WPM",
      averageAccuracy: "Average accuracy",
      todaysChallenges: "Today's challenges",
      challengeCounts: (done, fullDays) =>
        `${done} done · ${fullDays} full ${fullDays === 1 ? "day" : "days"}`,
      pastWeeks: "Past weeks",
      weeklyGoal: "Weekly goal",
      weeksDone: (n) => `${n} ${n === 1 ? "week" : "weeks"} met`,
      wpmTrend: "WPM trend",
      mostMissed: "Most missed keys",
      lastSessions: (n) => `last ${n} ${n === 1 ? "session" : "sessions"}`,
      slowestKeys: "Your slowest keys",
      slowestPairs: "Your slowest pairs",
      comboUnit: "pair",
      inReview: "Letters in review",
      reviewSteps: "1 · 3 · 7 · 14 · 30 days",
      personalBests: "Personal bests",
      perfectRounds: (n) => `Perfect rounds (${n})`,
      achievements: (done, total) => `Achievements (${done}/${total})`,
      showLess: "Show less",
      showMore: (n) => `Show more (${n})`,
      yourSessions: "Your sessions",
      blindBadge: "no net",
      blindHint: "Played with no net: mistakes weren't shown while typing",
      minAccuracyHint: (min) => `Played with a ${min}% minimum accuracy`,
      oldMetricsHint:
        "Measured with the old WPM formula: doesn't count toward records or averages",
      wpm: "wpm",
      accuracy: "accuracy",
      errors: "mistakes",
      export: "Export",
      import: "Import",
      clear: "Clear history",
      confirmClear: "Confirm clearing?",
      exported: (n) => `You exported ${n} ${n === 1 ? "session" : "sessions"}.`,
      imported: (n, skipped) =>
        `You imported ${n} new ${n === 1 ? "session" : "sessions"}.${skipped}`,
      nothingNew: (skipped) => `You already had all those sessions.${skipped}`,
      skipped: (n) => ` ${n} couldn't be read and were skipped.`,
      bestCombo: "Best combo",
      consistency: "Consistency",
      totalTime: "Total time",
      keystrokes: "Keys pressed",
      corrected: "Mistakes fixed",
      firstTime: "First time here?",
      seeLanding: "See everything SwiftFlow does",
    },
    challenges: {
      sessions: (n) => `Finish ${n} sessions`,
      minutes: (n) => `Practice ${n} minutes`,
      accuracy: (bar) => `Finish a session at ${bar}% accuracy or more`,
      speed: (wpm) => `Reach ${wpm} wpm in a session`,
      combo: (n) => `Hit a combo of ${n} without a mistake`,
      perfect: "Play a perfect round, not a single mistake",
      mode: (mode) => `Finish a ${mode} run`,
      suddenDeath: "Finish a run in sudden death",
      minAccuracy: "Finish a run holding yourself to 95% accuracy or more",
      focus: "Finish a run in focus mode",
      english: "Finish a run with English texts",
      bilingual: "Play one run in Spanish and another in English",
    },
    tiers: {
      1: "Rookie",
      5: "Apprentice",
      10: "Nimble",
      15: "Swift",
      20: "Expert",
      30: "Master",
      40: "Legend",
      50: "Keyboard god",
    },
    rewards: {
      kinds: { accent: "Color", caret: "Caret", sound: "Sound" },
      labels: {
        orange: "Orange",
        bar: "Bar",
        soft: "Soft",
        sky: "Sky",
        block: "Block",
        mechanical: "Mechanical",
        violet: "Violet",
        underline: "Underline",
        typewriter: "Typewriter",
        rose: "Rose",
        glow: "Glow",
        bubble: "Bubble",
        indigo: "Indigo",
        wood: "Wood",
        amber: "Amber",
        fuchsia: "Fuchsia",
        rainbow: "Rainbow",
      },
      unlocked: (items) => `Unlocked: ${items.join(", ")}`,
    },
    modeLabels: {
      code: (language) => `Code · ${language}`,
      classics: (work) => `Classics · ${work}`,
      dictation: (n) => `Dictation · ${n} ${n === 1 ? "sentence" : "sentences"}`,
      lesson: (n) => `Course · Lesson ${n}`,
      time: (s) => `${s}s`,
      words: (n) => `${n} words`,
      numbers: (n) => `${n} numbers`,
      drill: (n) => `Train · ${n} words`,
      weekly: (label) => `Weekly · ${label}`,
      custom: (name) => `My text · ${name}`,
    },
    keyLabels: { space: "space", enter: "enter", tab: "tab" },
    weekLabel: (week, year) => `W${week}·${year}`,
    backup: {
      notJson: "The file isn't valid JSON.",
      notOurs: "That file isn't a SwiftFlow backup.",
      empty: "The backup has no sessions in it.",
      unreadable: "No session in the backup could be read.",
    },
    summary: {
      period: (month, year) => `${month} ${year}`,
      cardTitle: (label) => `My ${label}`,
      sessions: (n) => (n === 1 ? "session" : "sessions"),
      minutes: "minutes",
      days: (n) => (n === 1 ? "day" : "days"),
      record: (wpm, label) => `🏆 Record: ${wpm} WPM · ${label}`,
      best: (wpm, label) => `Best: ${wpm} WPM · ${label}`,
      average: (wpm, change, accuracy) =>
        `Average: ${wpm} WPM${change} · ${accuracy}% accuracy`,
      tamed: (key, before, after) => `Tamed key: ${key} ${before} → ${after}`,
      newAchievements: (n) => `${n} new ${n === 1 ? "achievement" : "achievements"}`,
      footer: "Your summary on SwiftFlow",
      page: {
        empty: "Nothing to sum up yet: play your first run and come back.",
        kicker: "Your summary",
        title: (label) => `Your ${label}`,
        noSessions: "No runs",
        period: "Period",
        months: "Months",
        years: "Years",
        nothingIn: (label) => `You didn't play in ${label}.`,
        of: (n) => `of ${n}`,
        newAchievements: (n) => (n === 1 ? "new achievement" : "new achievements"),
        share: "Share my summary",
        shareTitle: "Share summary",
        record: "Record",
        best: "Your best run",
        newRecordIn: (label) => `Your new record, in ${label}`,
        inMode: (label) => `In ${label}`,
        periodAverage: "Your average for the period",
        faster: (n) => `${n}% faster than the period before`,
        slower: (n) => `${n}% slower than the period before`,
        same: "Same as the period before",
        averageSpeed: "Average speed",
        accuracy: "Accuracy",
        accuracyDetail: "On average, counting every key",
        tamedKey: "The key you tamed",
        tamedDetail: (before, after) => `From ${before} to ${after} errors`,
        favoriteMode: "Your favorite mode",
        longestStreak: "Your longest streak",
        streakDetail: "In a row, in this period",
        busiestDay: "Your busiest day",
        fileName: "swiftflow-summary.png",
        shareText: (label, sessions, minutes) =>
          `My ${label} on SwiftFlow: ${sessions} runs, ${minutes} minutes ⚡`,
      },
    },
    consistencyLevels: {
      veryEven: "Very steady",
      even: "Steady",
      bumpy: "Up and down",
      irregular: "Uneven",
    },
    toasts: {
      challengeDone: "Challenge done!",
      reviewed: (keys) => `You reviewed ${keys.join(", ")}`,
      reviewDone: "Today's review done!",
      weekGoal: (minutes) => `${minutes} minutes this week`,
      weekGoalDone: "Weekly goal met!",
      level: (n, title) => `Level ${n} · ${title}`,
      levelUp: "You leveled up!",
      achievement: "Achievement unlocked!",
    },
    streakNotice: {
      title: (n) => `Your ${n}-day streak ends today`,
      body: (left) => `${left} left. One run is enough to keep it.`,
    },
    timeLeft: { hours: (n) => `${n} h`, minutes: (n) => `${n} min` },
    dayParts: {
      dawn: "early hours",
      morning: "morning",
      afternoon: "afternoon",
      night: "night",
    },
    tips: {
      oneIn: (n) => `1 in ${n}`,
      outOfTen: (n) => `${n} out of 10`,
      train: "Train these",
      weakKeys: {
        title: (keys) => `Practice ${list(keys, "and")}`,
        detail: (count, worst, oneIn, misses, average, contrast, merged) =>
          `${count === 1 ? "It's the key" : "They're the keys"} that slip the most for how often you type them: you miss the ${worst} ${oneIn} times (${misses} mistakes) against your average of ${average}.${contrast}${merged}`,
        contrast: (key) =>
          ` The ${key} adds up more mistakes, but only because you type it far more often.`,
        merged: (outOfTen, key) =>
          ` When you miss it, ${outOfTen} times you hit the ${key}.`,
      },
      confusion: {
        title: (from, to) => `You mix up ${from} and ${to}`,
        detail: (outOfTen, from, to, neighbours) =>
          `${outOfTen} times you miss the ${from}, you end up hitting the ${to}. ${
            neighbours
              ? "They're neighbors: your finger drifts to the key next door. Slow down in that area until the position settles on its own."
              : "Watch that hand: it's a position mistake, not a speed one."
          }`,
      },
      transposition: {
        title: "Your fingers get ahead of you",
        detail: (total, pair, typedAs) =>
          `You swap the order of two letters often: ${total} times, and the one that flips the most is «${pair}» (it comes out «${typedAs}»). It's not aim but the rhythm between your hands: practice that pair slowly and evenly.`,
      },
      space: {
        title: "Watch your spaces",
        detail: (misses) =>
          `It's where your mistakes pile up the most (${misses}). It usually comes from jumping ahead to the next word: finish each word before hitting space.`,
      },
      hand: {
        names: { left: "left", right: "right" },
        title: (name) => `Your ${name} hand misses more`,
        detail: (worse, better) =>
          `You miss ${worse} of its keys against ${better} on the other one. It's worth training it on its own.`,
      },
      row: {
        names: { top: "top", home: "home", bottom: "bottom" },
        title: (name) => `The ${name} row is harder for you`,
        detail: (worst, best, bestName) =>
          `You miss ${worst} there against ${best} on the ${bestName} row. Practice reaching those keys without looking.`,
      },
      finger: {
        title: (finger) => `Your ${finger} misses more`,
        detail: (rate, keys, typical) =>
          `You miss ${rate} of the keys it covers (${list(keys, "and")}) against ${typical} for a typical finger of yours. With finger colors on the on-screen keyboard you'll see which ones they are.`,
      },
      slowKeys: {
        title: (keys) =>
          `${list(keys, "and")} ${keys.length === 1 ? "slows" : "slow"} you down`,
        detail: (single, extra, ms, baseline) =>
          `You almost never miss ${single ? "it" : "them"}, but ${single ? "it takes" : "they take"} ${extra} longer than the rest of your keys: ${ms} ms against your usual ${baseline} ms. Repeat ${single ? "it" : "them"} on ${single ? "its" : "their"} own, unhurried, until ${single ? "it comes" : "they come"} without thinking.`,
      },
      slowPairs: {
        title: (pairs) => `Your slowest pairs: ${list(pairs, "and")}`,
        detail: (pair, ms, baseline, extra) =>
          `Going from one letter to the other in «${pair}» takes you ${ms} ms against your usual ${baseline} ms, ${extra} more. They're not hard keys but moves between fingers: practice those pairs on their own before speeding up.`,
      },
      problemWords: {
        title: (words) =>
          `${list(words, "and")} ${words.length === 1 ? "trips" : "trip"} you up`,
        detail:
          "They're whole words, not single letters: you miss them or slow down every time they show up. Repeating them on their own until they flow makes them automatic.",
      },
      digits: {
        title: "Numbers are hard for you",
        detail: (rate) => `You miss ${rate} of digits. Numbers mode is made for that.`,
        action: "Practice numbers",
      },
      accents: {
        title: "Watch your accents",
        detail: (rate) =>
          `You miss ${rate} of accented letters. Practice the accent key followed by the vowel.`,
      },
      slowDown: {
        title: "Slow down a little",
        detail: (accuracy) =>
          `Your recent accuracy is ${accuracy}%. Above 95% every mistake costs less and speed rises on its own.`,
      },
      speedUp: {
        title: "You can push the pace",
        detail: (accuracy) =>
          `Your recent accuracy is ${accuracy}%: excellent. It's a good time to push your speed.`,
      },
    },
    achievements: {
      first_session: { title: "First step", description: "Finish your first session" },
      sessions_10: { title: "Steady", description: "Finish 10 sessions" },
      sessions_25: { title: "Dedicated", description: "Finish 25 sessions" },
      sessions_50: { title: "Veteran", description: "Finish 50 sessions" },
      sessions_100: { title: "Centurion", description: "Finish 100 sessions" },
      sessions_250: { title: "Unstoppable", description: "Finish 250 sessions" },
      sessions_500: { title: "Master", description: "Finish 500 sessions" },
      wpm_20: { title: "Getting going", description: "Reach 20 words per minute" },
      wpm_40: { title: "40 WPM", description: "Reach 40 words per minute" },
      wpm_60: { title: "60 WPM", description: "Reach 60 words per minute" },
      wpm_80: { title: "80 WPM", description: "Reach 80 words per minute" },
      wpm_100: { title: "The 100 club", description: "Reach 100 words per minute" },
      wpm_120: { title: "Sprinter", description: "Reach 120 words per minute" },
      wpm_140: { title: "Superhuman", description: "Reach 140 words per minute" },
      wpm_160: { title: "Impossible", description: "Reach 160 words per minute" },
      accuracy_100: {
        title: "Perfect accuracy",
        description: "Finish a session at 100% accuracy",
      },
      accuracy_100_x5: {
        title: "Surgeon",
        description: "Finish 5 sessions at 100% accuracy",
      },
      accuracy_100_x20: {
        title: "Robot",
        description: "Finish 20 sessions at 100% accuracy",
      },
      tamed_key: {
        title: "Tamed key",
        description: "Halve the mistakes on a key that used to trip you up",
      },
      steady_days: {
        title: "Consistent",
        description:
          "Keep a 90 in day-to-day steadiness over at least 7 days of practice",
      },
      accuracy_avg_95: { title: "Reliable", description: "Keep a 95% average accuracy" },
      sudden_death_1: {
        title: "Just one life",
        description: "Finish a run in sudden death",
      },
      sudden_death_long: {
        title: "Untouchable",
        description: "Last 60 seconds or 50 words in sudden death",
      },
      must_correct_5: {
        title: "Patience",
        description: "Finish 5 runs with fix to move on",
      },
      min_accuracy_98: {
        title: "Steady hand",
        description: "Finish a run holding yourself to 98% accuracy",
      },
      month_20_days: {
        title: "Iron month",
        description: "Practice on 20 different days in one month",
      },
      classics_1: { title: "Good reader", description: "Finish a classic" },
      classics_5: { title: "Poet at heart", description: "Finish 5 different classics" },
      classics_all: { title: "Full library", description: "Finish every classic" },
      dictation_1: { title: "Good ear", description: "Finish a dictation" },
      dictation_10: { title: "Stenographer", description: "Finish 10 dictations" },
      dictation_clean: {
        title: "Sharp ear",
        description: "Finish a 5-sentence dictation at 98% accuracy or more",
      },
      punctuated_words_100: {
        title: "Signs in their place",
        description: "Finish 100 words with punctuation: capitals, commas, ¿? and ¡!",
      },
      focus_10: { title: "In the zone", description: "Finish 10 runs in focus mode" },
      course_1: { title: "First lesson", description: "Pass your first course lesson" },
      course_home_row: { title: "Home row", description: "Pass every home row lesson" },
      course_stars: { title: "Three stars", description: "Earn three stars on a lesson" },
      course_complete: {
        title: "No looking",
        description: "Pass every lesson in the course",
      },
      english_1: {
        title: "Hello, world",
        description: "Finish your first run with English texts",
      },
      english_25: {
        title: "Fluent",
        description: "Finish 25 runs with English texts",
      },
      bilingual_day: {
        title: "Bilingual",
        description: "Play in Spanish and in English on the same day",
      },
      english_classics_all: {
        title: "English library",
        description: "Read every English classic",
      },
      combo_50: {
        title: "Combo x50",
        description: "Type 50 characters in a row without a mistake",
      },
      combo_150: {
        title: "Combo x150",
        description: "Type 150 characters in a row without a mistake",
      },
      combo_300: {
        title: "Combo x300",
        description: "Type 300 characters in a row without a mistake",
      },
      combo_500: {
        title: "Untouchable",
        description: "Type 500 characters in a row without a mistake",
      },
      streak_3: { title: "3-day streak", description: "Practice 3 days in a row" },
      streak_7: { title: "A whole week", description: "Practice 7 days in a row" },
      streak_14: { title: "Two weeks", description: "Practice 14 days in a row" },
      streak_30: { title: "A full month", description: "Practice 30 days in a row" },
      streak_100: { title: "Legend", description: "Practice 100 days in a row" },
      streak_365: { title: "A whole year", description: "Practice 365 days in a row" },
      explorer: {
        title: "Explorer",
        description: "Finish a session in 5 different modes",
      },
      polyglot: {
        title: "Polyglot",
        description: "Try 3 different languages in code mode",
      },
      quote_lover: { title: "Bookworm", description: "Finish 15 sessions in quote mode" },
      words_lover: {
        title: "Word lover",
        description: "Finish 20 sessions in words mode",
      },
      time_lover: { title: "Timekeeper", description: "Finish 20 sessions in time mode" },
      numbers_lover: {
        title: "Counter",
        description: "Finish 10 sessions in numbers mode",
      },
      all_time_options: {
        title: "Every time",
        description: "Play all 4 durations (15s, 30s, 60s, 120s)",
      },
      all_word_options: { title: "Every size", description: "Play all 4 word counts" },
      time_10min: { title: "Warming up", description: "Practice 10 minutes in total" },
      time_1h: { title: "An hour of practice", description: "Practice 1 hour in total" },
      time_5h: { title: "Marathoner", description: "Practice 5 hours in total" },
      time_10h: { title: "All in", description: "Practice 10 hours in total" },
      time_24h: { title: "A whole day", description: "Practice 24 hours in total" },
      week_goal_1: { title: "Week done", description: "Meet your weekly practice goal" },
      week_goal_4: {
        title: "A month of goals",
        description: "Meet your weekly goal 4 times",
      },
      week_goal_12: {
        title: "Three months of goals",
        description: "Meet your weekly goal 12 times",
      },
      zen_marathon: {
        title: "Active meditation",
        description: "Go 3 minutes straight in zen mode",
      },
      zen_marathon_10: {
        title: "Trance",
        description: "Go 10 minutes straight in zen mode",
      },
      zen_sessions_10: {
        title: "Zen soul",
        description: "Finish 10 sessions in zen mode",
      },
      challenge_1: {
        title: "First challenge",
        description: "Complete your first daily challenge",
      },
      challenge_25: { title: "Challenger", description: "Complete 25 daily challenges" },
      challenge_100: {
        title: "No excuses",
        description: "Complete 100 daily challenges",
      },
      challenge_full_day: {
        title: "Full day",
        description: "Complete all 3 challenges of a day",
      },
      challenge_full_day_7: {
        title: "Seven full days",
        description: "Complete all 3 of the day's challenges on 7 different days",
      },
      weekly_challenge_1: {
        title: "Weekly challenge",
        description: "Play the weekly challenge, the same text for everyone",
      },
      weekly_challenge_4: {
        title: "Challenge regular",
        description: "Play the weekly challenge in 4 different weeks",
      },
      night_owl: {
        title: "Night owl",
        description: "Finish a session between midnight and 5am",
      },
      early_bird: {
        title: "Early bird",
        description: "Finish a session between 5am and 7am",
      },
      weekend_warrior: {
        title: "Weekend warrior",
        description: "Finish a session on a Saturday or Sunday",
      },
      double_session_day: {
        title: "Double session",
        description: "Finish 2 sessions on the same day",
      },
      daily_marathon: {
        title: "Daily marathon",
        description: "Finish 5 sessions on the same day",
      },
      comeback: {
        title: "The comeback",
        description: "Practice again after a week away",
      },
      comeback_month: {
        title: "The big comeback",
        description: "Practice again after a month away",
      },
      first_week_anniversary: {
        title: "A week with us",
        description: "Your first session was 7 or more days ago",
      },
      one_month_anniversary: {
        title: "A month with us",
        description: "Your first session was 30 or more days ago",
      },
      one_year_anniversary: {
        title: "Anniversary",
        description: "Your first session was 365 or more days ago",
      },
    },
  },
};
