# SwiftFlow 🚀

Un test de mecanografía en español que no sólo te mide: te dice en qué fallás, por qué, y
te arma la práctica para arreglarlo.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite)

## ✨ Qué tiene

### Modos

| Modo         | Qué es                                                        |
| ------------ | ------------------------------------------------------------- |
| **Tiempo**   | 15, 30, 60 o 120 segundos de texto continuo                   |
| **Palabras** | 10, 25, 50 o 100 palabras, armadas en oraciones con ¿? y ¡!   |
| **Números**  | Enteros, decimales, porcentajes, horas y miles                |
| **Cita**     | Frases reales con su autor                                    |
| **Clásicos** | Cervantes, Bécquer, Machado, Martí y más, verso por verso     |
| **Dictado**  | Una voz en español te dicta frases y las escribís sin verlas  |
| **Código**   | Fragmentos de JavaScript, TypeScript, Python, Java, Go y Rust |
| **Zen**      | Sin límite: terminás cuando querés                            |
| **Entrenar** | Texto armado alrededor de tus teclas más flojas               |

Con o sin puntuación y mayúsculas, salvo en código, que siempre se escribe tal cual.

Y combinables con cualquier modo:

- **Sin red**: los errores no se ven hasta el final
- **Muerte súbita**: el primer error termina la partida
- **Corregir para avanzar**: una letra equivocada no entra; hay que acertarla para seguir
- **Precisión mínima** (90, 95 o 98 %): si no llegás, la partida no cuenta

### Mientras escribís

- WPM neto en vivo (sólo cuentan las palabras completas y correctas, como Monkeytype) y WPM
  bruto, para ver qué te cuestan los errores
- Precisión sobre cada pulsación: los errores corregidos con backspace también cuentan
- Combo de caracteres correctos seguidos, con avisos al pasar cada hito
- Pausa automática a los 3 segundos sin escribir, y se reanuda sola al seguir
- Teclado en pantalla con la próxima tecla, el dedo que va y la tecla muerta, Shift o AltGr
  que necesita, en tu distribución: Latinoamericano, España, EE. UU. internacional, Dvorak o
  Colemak
- Texto a tu gusto: fuente (monoespaciada, JetBrains Mono, Nunito, Atkinson Hyperlegible u
  OpenDyslexic), tamaño, interlineado, y cursor que se desliza o salta
- Modo foco: solo la palabra que estás escribiendo y la siguiente, grandes y centradas
- Efectos de sonido configurables (tecla, error, celebración)
- Tema claro y oscuro, y alto contraste (sigue al del sistema hasta que lo cambies)
- Accesible: todo se maneja con el teclado, los diálogos atrapan y devuelven el foco, y
  los resultados, logros y consejos se anuncian al lector de pantalla

### Curso desde cero

24 lecciones para aprender a escribir sin mirar, en `/curso`: la fila del medio, la de
arriba y la de abajo, un par de dedos por vez, y después mayúsculas, tildes, números y
signos. Cada lección usa solo las teclas ya aprendidas, se pasa con su velocidad y un 94 %
de precisión, da hasta tres estrellas y abre la siguiente. Se adapta a tu distribución de
teclado.

### Cuando terminás

- Gráfico de WPM y errores a lo largo de la sesión
- Tarjeta para compartir el resultado, con un diseño distinto si fue récord
- 81 logros en 12 categorías, con aviso al desbloquearlos

### En el historial

- **Teclas más falladas**: mapa del teclado y ranking, sobre las últimas 30 sesiones
- **Qué mejorar**: consejos concretos armados con tus propios datos —
  qué tecla practicar, con qué tecla la confundís, si se te adelantan los dedos,
  qué mano o fila te cuesta, y qué teclas te frenan aunque no las falles
- **Teclas y combinaciones más lentas**: velocidad, no precisión — lo que las
  estadísticas de errores no pueden ver
- **Actividad**: los últimos tres meses, un cuadradito por día
- **Tendencia** de WPM, récords personales por modo, y filtro por modo para que los
  promedios comparen lo comparable
- Exportar e importar el historial como archivo JSON

Todo se guarda en el navegador (localStorage). No hay cuenta, servidor ni telemetría.
Funciona instalada como PWA y sin conexión.

## 🚀 Arrancar

```bash
npm install
npm run dev
```

| Comando                 | Qué hace                |
| ----------------------- | ----------------------- |
| `npm run dev`           | Servidor de desarrollo  |
| `npm run build`         | Build de producción     |
| `npm run preview`       | Sirve el build          |
| `npm test`              | Corre los tests una vez |
| `npm run test:watch`    | Tests en modo watch     |
| `npm run test:coverage` | Tests con cobertura     |
| `npm run test:e2e`      | Tests end-to-end        |
| `npm run lint`          | ESLint + Prettier       |
| `npm run lint:fix`      | Corrige lo que se pueda |

## 🛠️ Stack

Vue 3 (Composition API, `<script setup>`) · Pinia · Vue Router · Tailwind CSS 4 ·
Vite · Vitest + @vue/test-utils · Playwright · Heroicons · vite-plugin-pwa

## 📁 Estructura

El código está organizado por feature, no por tipo de archivo: cada carpeta de
`src/features/` se lleva sus componentes, su store, su persistencia y su lógica pura.

```
src/
├── features/
│   ├── typing-test/
│   │   ├── components/          # ParagraphToType, ToolBar, WpmChart, ShareResultModal
│   │   ├── content/             # Los bancos de texto: words, quotes, code, numbers, drill
│   │   ├── utils/               # typingMetrics (wpm/precisión/pulsaciones), shareCard
│   │   ├── store.js             # Config + estado de la sesión en curso
│   │   └── configRepository.js  # Persistencia de la configuración
│   ├── course/              # El curso: lecciones, su texto y el progreso
│   └── history/
│       ├── components/          # KeyErrorHeatmap, TimingBars, ActivityCalendar, ImprovementTips
│       ├── utils/               # historyStats (agregados), improvementTips, historyBackup
│       ├── achievements.js      # Catálogo de logros, cada uno con su check()
│       ├── store.js
│       └── resultsRepository.js # Persistencia de las sesiones
├── shared/                      # Componentes, stores y utilidades comunes
├── views/                       # HomeView, HistoryView
└── style.css                    # Tokens de color, tipografía y animaciones
```

Dos convenciones que conviene respetar al tocar el código:

- **La lógica pura vive en `utils/` y se testea sola.** Los stores y los componentes la
  llaman, no la reimplementan. Por eso casi todos los tests son de funciones puras y no
  de componentes.
- **La persistencia va siempre detrás de un `xRepository.js`**, con la clave privada al
  módulo y degradando a un valor por defecto en vez de tirar excepciones. Así el día que
  haya backend no hay que tocar ni el store ni la vista.

## 🎨 Agregar contenido

**Palabras**: sumalas a `spanishWords` en `src/features/typing-test/content/words.js`.

**Citas**: un objeto `{ text, author }` en `content/quotes.js`.

**Código**: un objeto `{ language, code }` en `content/code.js`. El lenguaje aparece solo
en la barra de modos — la lista se deriva de los fragmentos que haya.

**Párrafos**: un string más en `content/paragraphs.js`.

**Un logro**: un objeto `{ id, category, icon, title, description, check }` en
`achievements.js`. El `check` recibe un contexto ya calculado desde el historial completo,
así que el estado desbloqueado nunca se persiste ni se puede desincronizar. Un umbral que
ya se alcanzó no debería volver a subirse: nadie tendría que perder un logro que se ganó.

**Un modo nuevo** toca cinco lugares, y saltearse cualquiera rompe algo:
`store.js` (`types`), `ToolBar.vue` (`typeMeta`, o el render explota),
`IconButton.vue` (el ícono), `ParagraphToType.vue` (cómo se genera el texto) y
`historyStats.js` (`MODE_LABELS`).

## 🔤 Fuentes

JetBrains Mono y Atkinson Hyperlegible vienen de Fontsource (SIL OFL). OpenDyslexic Mono es
de Abelardo Gonzalez, bajo CC BY 3.0 sobre Bitstream Vera: ver
`src/assets/fonts/opendyslexic/LICENSE.md`.

## 📄 Licencia

MIT. (El README anterior enlazaba a un archivo `LICENSE` que nunca existió en el repo:
si querés que la licencia sea efectiva, falta agregarlo.)
