# Hoja de ruta

Lo que viene, en el orden en que se va a hacer. Una fase por vez: se implementa, se prueba,
se aprueba, se commitea y se pushea, y recién ahí arranca la siguiente.

El desafío por enlace queda en pausa (ver `docs/ideas.md`).

## Cada fase que agrega algo visible también actualiza

- [ ] `src/features/landing/changelog.js`: una entrada arriba de todo
- [ ] `src/features/landing/components/FeatureGrid.vue`: el modo en la tira (y el conteo
      "Nueve maneras…"), una tarjeta chica o el texto de la tarjeta que corresponda
- [ ] `src/features/landing/components/ComparisonSection.vue`: una fila si es algo que el
      análisis ahora puede decirte
- [ ] `README.md`: la sección "Qué tiene"
- [ ] `build/routePages.js`: si hay una ruta nueva
- [ ] Logros (`achievements.js`) y retos diarios (`dailyChallenges.js`) para lo nuevo. Un reto
      nuevo lleva fecha de estreno (`since`, el día siguiente) y va al final de su lista: los
      días pasados se recalculan del historial y no pueden cambiar

---

## Fase 1 — Red de seguridad: tests end-to-end

Playwright contra el build de producción. Antes de tocar `ParagraphToType.vue` (2.000+
líneas) en casi todas las fases que siguen, conviene poder probar el flujo entero de una.

- Escribir un test de palabras hasta el final y ver los resultados
- El resultado aparece en el historial y sobrevive a recargar la página
- Cambiar de modo y de configuración
- La landing carga y "probalo acá" funciona
- Corre en CI después de `npm run build`

Landing: nada (es interno).

## Fase 2 — Distribuciones de teclado

Elegir entre Español (España), Latinoamericano y Inglés (EE. UU.); después Dvorak y Colemak.

- `keyboardMap.js` pasa de un solo mapa a uno por distribución (filas, dedos, shift, teclas
  muertas)
- Lo usan el teclado en pantalla, el mapa de errores, los dedos, los consejos de "Qué
  mejorar" y el entrenamiento
- Se guarda en la configuración; el historial viejo se sigue leyendo igual (las teclas son
  caracteres, no posiciones)
- Primer arranque: se adivina por `navigator.language`, y se puede cambiar

Landing: tarjeta chica "Tu teclado", entrada en novedades.

## Fase 3 — Texto y cursor a tu gusto

- Fuente (la actual, otras monoespaciadas, una sin serifa y OpenDyslexic)
- Tamaño del texto e interlineado
- Forma del cursor (bloque, barra, subrayado) y si se desliza o salta. Los estilos que hoy
  se desbloquean por nivel se mantienen

Landing: texto de la tarjeta de personalización, novedades.

## Fase 4 — Accesibilidad

- `aria-live` para resultados, logros, subidas de nivel y el coach
- Tema de alto contraste
- Todo usable sin mouse: foco visible, orden de tabulación, diálogos que atrapan el foco y lo
  devuelven al cerrarse
- Revisión con lector de pantalla del flujo principal

Landing: tarjeta chica "Accesible", novedades.

## Fase 5 — Modos exigentes

- **Muerte súbita**: el primer error termina la partida
- **Corregir para avanzar**: no te deja seguir hasta arreglar la letra
- **Precisión mínima**: por debajo del umbral elegido (90/95/98 %) la sesión no cuenta
- Se combinan con cualquier modo, como "Sin red". Una partida fallada no se guarda (como
  cortarla con Esc); una que llega es una partida normal, marcada, así que no hacen falta
  récords aparte

Landing: tarjetas chicas o una tarjeta "Modos exigentes", novedades, logros nuevos si
corresponde.

## Fase 6 — Modo foco

Mostrar solo la palabra actual y la siguiente, grandes y centradas.

Landing: tarjeta chica, novedades.

## Fase 7 — Más contenido en español

- Banco de palabras con tildes, ñ, ü, ¿ y ¡
- Textos largos de varios párrafos (dominio público), con el salto de párrafo como parte del
  texto

Landing: tira de modos si aparece uno nuevo, novedades.

## Fase 8 — Dictado

Escuchás y escribís, con `speechSynthesis` en una voz en español. Velocidad de voz ajustable,
repetir la frase, y el texto se revela al final.

Landing: modo nuevo en la tira, novedades.

## Fase 9 — Cursos para empezar de cero

Lecciones por fila: inicio, arriba, abajo, números, símbolos. Cada una con una meta de WPM y
precisión que desbloquea la siguiente, usando los dedos por color del teclado en pantalla.
Depende de la fase 2 (las filas cambian según la distribución).

Landing: una tarjeta grande propia, novedades, logros.

## Fase 10 — Tendencia por tecla

"La ñ bajó de 12 % a 4 % de error este mes": la evolución de cada tecla, no solo la foto de
hoy.

Landing: fila en la comparación, novedades.

## Fase 11 — Consistencia entre sesiones

Qué tan parejo sos de un día al otro (desviación del WPM), además de dentro de cada sesión.

Landing: fila en la comparación, novedades.

## Fase 12 — Tu resumen

Un resumen mensual y anual: récords, lo que más mejoró, días de práctica, la tecla que
dominaste. Compartible con la tarjeta que ya existe.

Landing: sección o tarjeta propia, novedades.

## Fase 13 — SwiftFlow en inglés

Toda la interfaz traducida, con idioma elegible, y contenido en inglés (palabras, citas,
textos). El español sigue siendo el idioma principal. Va última porque traduce todo lo
anterior de una sola vez.

Landing: la landing también traducida, y su propia ruta o selector.
