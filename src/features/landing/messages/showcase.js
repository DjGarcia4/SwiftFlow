// Landing: the stats and progress showcases, in both languages
export default {
  es: {
    stats: {
      kicker: "Las estadísticas",
      title: "No te dice solo cuánto. Te dice por qué.",
      intro:
        "Cada tecla que apretás queda anotada: cuál era, cuál apretaste, cuánto tardaste. Con eso SwiftFlow encuentra lo que un número de WPM nunca te va a mostrar.",
      slowKeys: "Tus teclas más lentas",
      slowCombos: "Tus combinaciones más lentas",
      comboUnit: "combo",
      rows: {
        keys: {
          kicker: "Teclas",
          title: "Dónde se te escapan los dedos",
          text: "Un mapa del teclado con cada tecla teñida según cuánto la errás, y la lista ordenada por lo que de verdad te cuesta: no la tecla que más usás, sino la que más fallás en proporción.",
          points: [
            "Tasa de error de cada tecla, sobre tus últimas 30 sesiones",
            "Errores corregidos con borrar también cuentan",
            "Qué dedo y qué mano fallan más",
          ],
        },
        trends: {
          kicker: "Evolución",
          title: "Cómo van tus teclas",
          text: "Tus últimas 30 partidas contra las 30 anteriores, tecla por tecla: cuáles mejoraron y cuáles se te están escapando más que antes. Solo cambios claros, no una mala tarde.",
          points: [
            "Qué teclas bajaron sus errores, y cuánto",
            "Cuáles empeoraron, antes de que se vuelvan un hábito",
            "El «antes» de cada tecla en el mapa del teclado",
          ],
        },
        slow: {
          kicker: "Velocidad",
          title: "Lo que te frena aunque no lo erres",
          text: "Hay teclas que nunca fallás pero te hacen dudar. SwiftFlow mide el tiempo entre cada tecla y te muestra las que te llevan más que tu ritmo habitual, y las combinaciones que se te traban.",
          points: [
            "Milisegundos por tecla, contra tu propia mediana",
            "Combinaciones lentas: «ue», «ct», «rr»",
            "Sin confundirlo con errores: son problemas distintos",
          ],
        },
        session: {
          kicker: "Cada partida",
          title: "La partida, segundo a segundo",
          text: "El gráfico de tu velocidad durante toda la partida con cada error marcado, tu WPM bruto, la precisión contando cada pulsación, y qué tan parejo fue tu ritmo.",
          points: [
            "WPM neto (palabras correctas) y bruto (todas)",
            "Consistencia: qué tan parejo fue tu ritmo",
            "Combo máximo y errores corregidos",
          ],
        },
        patterns: {
          kicker: "Patrones",
          title: "Los errores tienen forma",
          text: "No es lo mismo errar una letra que apretar siempre la de al lado, o invertir dos letras por adelantarte. SwiftFlow distingue cada patrón y te dice cómo arreglarlo.",
          points: [
            "Qué tecla apretás cuando errás otra",
            "Letras invertidas: «qeu» por «que»",
            "Palabras enteras que se te traban",
          ],
        },
        steady: {
          kicker: "Constancia",
          title: "Qué tan parejo sos",
          text: "No alcanza con un buen día. SwiftFlow promedia cada día que practicás y te dice si tu velocidad se sostiene de uno al otro, o si hay días que se te van.",
          points: [
            "Un puntaje de 0 a 100, y entre qué velocidades se mueven tus días",
            "Cada día contra tu franja habitual",
            "Solo con partidas comparables: tu modo más jugado",
          ],
        },
        habits: {
          kicker: "Hábitos",
          title: "Cuándo y cuánto practicás",
          text: "Un año de práctica de un vistazo, tu racha de días, y a qué hora del día escribís mejor comparado con tu propio promedio en cada modo.",
          points: [
            "Calendario de actividad del año",
            "Tu mejor momento del día",
            "Tendencia de velocidad sesión a sesión",
          ],
        },
      },
      sessionChips: ["65 WPM", "97% precisión", "91% consistencia", "58 combo máx."],
      patterns: [
        {
          title: "Confundís la R con la T",
          detail:
            "7 de cada 10 veces que errás la R apretás la T: el dedo se te corre a la de al lado.",
        },
        {
          title: "Se te adelantan los dedos",
          detail:
            "Invertís «ue» y te sale «eu». No es puntería sino ritmo entre las manos.",
        },
        {
          title: "Tu anular izquierdo falla más",
          detail:
            "Errás el 11% de las teclas que le tocan (S, W y X) contra el 4% de un dedo típico tuyo.",
        },
      ],
    },
    progress: {
      kicker: "Para volver mañana",
      title: "Cada partida te lleva a algún lado",
      ranks: (levels, tiers) => `${levels} niveles en ${tiers} rangos`,
      level: (n) => `Nivel ${n}`,
      rewardsTitle: "Los niveles desbloquean cosas",
      rewardsText:
        "Colores para toda la app, estilos de cursor y sonidos de teclado. Tocá un color para probarlo en esta página.",
      tryColor: (name) => `Probar el color ${name}`,
      trying: "Probando",
      unlocksAt: (n) => `· se desbloquea en el nivel ${n}`,
      restore: "volver a mi color",
      caret: (name) => `Cursor ${name}`,
      sound: (name) => `Sonido ${name}`,
      levelShort: (n) => `· nv ${n}`,
      listen: (name) => `Escuchar el sonido ${name}`,
      achievementsTitle: (n) => `${n} logros para desbloquear`,
      achievementsText:
        "Velocidad, precisión, rachas, combos, horarios raros y alguno escondido.",
      dailyTitle: "Retos diarios",
      dailyText: "Tres por día, a tu medida: un poco más allá de tu promedio.",
      challenges: [
        "Llegá a 62 wpm en una sesión",
        "Hacé un combo de 80 sin errores",
        "Completá una partida de Código",
      ],
      weeklyGoalTitle: "Meta semanal",
      weeklyGoalText: "Minutos por semana, que se ajustan solos a tu costumbre.",
      weeklyTitle: (week) => `Reto semanal · ${week}`,
      weeklyText:
        "El mismo texto para todos durante la semana. Jugalo y pasale tu marca a alguien:",
      beatMe: "«¿Me ganás?»",
      streakTitle: "Una racha que no querés cortar",
      streakText:
        "Cada día que practicás suma. Si todavía no jugaste hoy, SwiftFlow te avisa cuántas horas te quedan, y si querés, te recuerda a la noche.",
      days: "días",
      summaryTitle: "Tu mes, contado",
      summaryText:
        "Cada mes y cada año, un resumen: cuánto practicaste, tu récord, cuánto más rápido vas que antes, la tecla que domaste y los logros del camino. Listo para compartir como imagen.",
      summaryDemo: "Mi septiembre",
    },
  },
  en: {
    stats: {
      kicker: "The stats",
      title: "It doesn't just say how much. It says why.",
      intro:
        "Every key you press gets noted: which one it was, which one you hit, how long it took. With that, SwiftFlow finds what a WPM number will never show you.",
      slowKeys: "Your slowest keys",
      slowCombos: "Your slowest combinations",
      comboUnit: "combo",
      rows: {
        keys: {
          kicker: "Keys",
          title: "Where your fingers slip",
          text: "A map of the keyboard with each key shaded by how often you miss it, and the list sorted by what really costs you: not the key you use most, but the one you miss most, proportionally.",
          points: [
            "Error rate for every key, over your last 30 sessions",
            "Errors fixed with backspace count too",
            "Which finger and which hand miss the most",
          ],
        },
        trends: {
          kicker: "Progress",
          title: "How your keys are going",
          text: "Your last 30 runs against the 30 before, key by key: which got better and which are slipping more than before. Only clear changes, not one bad afternoon.",
          points: [
            "Which keys cut their errors, and by how much",
            "Which got worse, before they turn into a habit",
            "Each key's “before” on the keyboard map",
          ],
        },
        slow: {
          kicker: "Speed",
          title: "What slows you down even when you don't miss",
          text: "Some keys you never miss but still make you hesitate. SwiftFlow times every keystroke and shows you the ones that take longer than your usual pace, and the combinations you stumble on.",
          points: [
            "Milliseconds per key, against your own median",
            "Slow combinations: “th”, “ck”, “ou”",
            "Not mixed up with errors: they're different problems",
          ],
        },
        session: {
          kicker: "Every run",
          title: "The run, second by second",
          text: "A chart of your speed through the whole run with every error marked, your raw WPM, accuracy counting every keystroke, and how steady your pace was.",
          points: [
            "Net WPM (correct words) and raw (all of them)",
            "Consistency: how steady your pace was",
            "Best combo and corrected errors",
          ],
        },
        patterns: {
          kicker: "Patterns",
          title: "Mistakes have a shape",
          text: "Missing a letter isn't the same as always hitting the one next to it, or swapping two letters because you rushed. SwiftFlow tells each pattern apart and tells you how to fix it.",
          points: [
            "Which key you hit when you miss another",
            "Swapped letters: “teh” for “the”",
            "Whole words you stumble on",
          ],
        },
        steady: {
          kicker: "Consistency",
          title: "How steady you are",
          text: "One good day isn't enough. SwiftFlow averages every day you practice and tells you whether your speed holds from one to the next, or whether some days get away from you.",
          points: [
            "A score from 0 to 100, and the speed range your days move in",
            "Each day against your usual range",
            "Only comparable runs: your most played mode",
          ],
        },
        habits: {
          kicker: "Habits",
          title: "When and how much you practice",
          text: "A year of practice at a glance, your day streak, and what time of day you type best compared with your own average in each mode.",
          points: [
            "Activity calendar for the year",
            "Your best time of day",
            "Speed trend from session to session",
          ],
        },
      },
      sessionChips: ["65 WPM", "97% accuracy", "91% consistency", "58 best combo"],
      patterns: [
        {
          title: "You mix up R and T",
          detail:
            "7 out of 10 times you miss the R you hit the T: your finger drifts to the key next to it.",
        },
        {
          title: "Your fingers get ahead of you",
          detail:
            "You swap “ue” and get “eu”. It's not aim but rhythm between your hands.",
        },
        {
          title: "Your left ring finger misses more",
          detail:
            "You miss 11% of its keys (S, W and X) against 4% for a typical finger of yours.",
        },
      ],
    },
    progress: {
      kicker: "To come back tomorrow",
      title: "Every run takes you somewhere",
      ranks: (levels, tiers) => `${levels} levels in ${tiers} ranks`,
      level: (n) => `Level ${n}`,
      rewardsTitle: "Levels unlock things",
      rewardsText:
        "Colors for the whole app, caret styles and keyboard sounds. Tap a color to try it on this page.",
      tryColor: (name) => `Try the ${name} color`,
      trying: "Trying",
      unlocksAt: (n) => `· unlocks at level ${n}`,
      restore: "back to my color",
      caret: (name) => `${name} caret`,
      sound: (name) => `${name} sound`,
      levelShort: (n) => `· lv ${n}`,
      listen: (name) => `Listen to the ${name} sound`,
      achievementsTitle: (n) => `${n} achievements to unlock`,
      achievementsText:
        "Speed, accuracy, streaks, combos, odd hours and a hidden one or two.",
      dailyTitle: "Daily challenges",
      dailyText: "Three a day, made for you: a little past your average.",
      challenges: [
        "Reach 62 wpm in a session",
        "Get an 80 combo without errors",
        "Finish a Code run",
      ],
      weeklyGoalTitle: "Weekly goal",
      weeklyGoalText: "Minutes per week, adjusting on their own to your habits.",
      weeklyTitle: (week) => `Weekly challenge · ${week}`,
      weeklyText:
        "The same text for everyone all week. Play it and send your score to someone:",
      beatMe: "“Can you beat me?”",
      streakTitle: "A streak you won't want to break",
      streakText:
        "Every day you practice counts. If you haven't played today, SwiftFlow tells you how many hours you have left and, if you want, reminds you at night.",
      days: "days",
      summaryTitle: "Your month, told",
      summaryText:
        "Every month and every year, a summary: how much you practiced, your record, how much faster you are than before, the key you tamed and the achievements along the way. Ready to share as an image.",
      summaryDemo: "My September",
    },
  },
};
