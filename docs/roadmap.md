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

Dos ajustes independientes: el idioma de la interfaz y el idioma de práctica. Se puede tener
la app en inglés y practicar español, o al revés. El español sigue siendo el principal.

- **13a**: la base de traducción, el selector de idioma y la pantalla de escritura
- **13b**: historial, estadísticas, consejos, logros y retos
- **13c**: curso, resumen, landing y las páginas para compartir
- **13d**: contenido de práctica en inglés (palabras, citas, textos, dictado, curso)

## Fase 14 — Todo con el teclado

Cambiar cualquier cosa sin soltar las manos del teclado.

- **Ctrl/⌘ K** abre una paleta de comandos desde cualquier página: se escribe lo que se busca
  (`30`, `palabras 50`, `oscuro`, `dvorak`, `historial`) en español o en inglés, se elige con
  ↑/↓ y Enter. Los usados hace poco quedan arriba. Si hay una partida en curso, se pausa
- **Tab** a mitad de una partida empieza de nuevo con otro texto (sin nada escrito o en
  pausa, Tab mueve el foco como siempre, para no atrapar a nadie en el texto)
- **?** fuera del test muestra la lista de atajos
- Una partida armada con la paleta y jugada sin tocar el mouse queda marcada (`keyboard`)

Landing: tarjeta chica "Sin soltar el teclado", novedades, botón ⌘K en la barra, logros y un
reto diario.

## Fase 15 — Cada botón con su tecla

La paleta sigue, pero ya no hace falta abrirla para lo que está a la vista: cada botón muestra
su tecla al lado y esa tecla lo presiona.

- En los resultados, la letra sola: **R** otra partida, **F** dónde te frenaste, **M**
  marcapasos, **G** fantasma, **C** compartir, **E** entrenar, **V** salir del entrenamiento,
  **L** los retos del día
- En el test, antes de terminar, las letras son texto: ahí la misma tecla va con **Alt** (⌥ en
  Mac), y el chip lo dice (también **A** apariencia y **K** teclado)
- La barra de arriba: **P** el test, **X** nivel, **Y** racha, **O** curso, **H** historial,
  **Q** qué es SwiftFlow, **Z** sonido e idioma, **T** tema. Letras que en Mac con ⌥ no son
  acentos (E, I, N, U)
- El curso sin mouse: **S** sigue a la próxima lección (en el curso y al pasar una), **R** o
  Espacio la repiten, con un botón "Repetir" en el resultado
- Más comandos en la paleta: retos del día (desde cualquier página), logros, reto semanal,
  seguir el curso y cada lección abierta, y todo lo que hay en pantalla con su tecla
- Los chips solo se ven con mouse o trackpad: en el celular no hay teclado que apretar
- La barra dice dónde estás: el botón de la página actual se ilumina, y la racha pasa junto al
  logo, sin borde (entre los botones parecía siempre la página elegida)
- Esc después de quedarse pensando: los 3 segundos quietos pausan solos, y ese Esc terminaba
  la partida. Ahora solo la termina un segundo Esc sobre una pausa pedida
- La tendencia de WPM del historial se lee: una frase con hacia dónde vas (tus últimas 10
  contra las 10 anteriores), cada partida como un punto tenue, el promedio de 5 como la línea a
  mirar, los wpm al costado, las fechas abajo, tu mejor marca y cada partida al pasar el mouse

Landing: novedades, tarjeta "Sin soltar el teclado" actualizada.

## Fase 16 — Entrenar por dedos

Un modo nuevo, **Dedos**: elegir qué dedos practicar -- uno solo (el meñique izquierdo),
varios, una mano entera o las dos -- en un selector con forma de manos, cada dedo en su color
y con sus letras. Atajos: mano izquierda, mano derecha, las dos, índices, meñiques.

- El texto sale solo de las letras de esos dedos en tu distribución de teclado (Dvorak y
  Colemak cambian las letras, no los dedos): palabras reales que se escriben solo con ellas
  cuando hay ("cereza", "abrazar" con la izquierda; "molino", "niño" con la derecha), y
  grupos de sus letras cuando no alcanzan ("fgt rvb")
- El teclado en pantalla aparece con los colores por dedo y apaga las teclas del resto
- 10, 25, 50 o 100 palabras. El historial dice qué dedos ("Dedos · Índices · 25") y el
  fantasma es por dedos y largo
- En la paleta: cada atajo y cada dedo solo
- La barra de configuración, más simple: con doce modos la tira no entraba. Ahora el modo es
  un solo botón que abre todos agrupados (pruebas, textos, práctica), cada uno con una línea
  de qué es; al lado, solo lo de ese modo; y puntuación, sin red y los modos exigentes van
  juntos en "Opciones", que dice cuántas hay activas
- Y la barra con teclas, como el resto de los botones (con Alt/⌥ en el test): **M** el menú de
  modos (flechas y Enter adentro), **1–9** la cantidad o el tiempo en orden, **J** lo propio del
  modo (los dedos, las teclas de Entrenar, tus textos), **W** las opciones. El marcapasos pasa
  de M a **B**
- Adentro de cada menú abierto, una tecla por opción y sin Alt (con el menú abierto nada va al
  texto), escrita en la opción: en los modos su letra (T Tiempo, P Palabras, N Números, C Cita,
  L Clásicos, D Dictado, O Código, M Mi texto, E Entrenar, F Dedos, Z Zen); en los dedos la tecla
  de la fila guía donde descansa cada uno (A S D F · J K L Ñ) y 1–5 para los atajos; en Opciones
  P, S, M, C y 0/9/5/8 para la precisión; en Entrenar la letra misma; en Mi texto 1–9 y N
- En los retos abiertos (⌥L), cada "Jugar" con su número de arriba abajo: el repaso, los retos
  del día que se juegan y el semanal
- Al terminar una partida, 2 segundos en los que ninguna tecla hace nada (Espacio incluido): las
  letras que todavía iban en camino ya no mandan a otro lado. Los chips aparecen recién ahí
- En pausa, **P** sigue (escribir también) y en Zen el botón de terminar dice **Esc**, que es lo
  que lo termina. "Entrenar ahora" pasa de E a **D**, en los resultados y en el aviso a mitad de
  partida (con ⌥ la E es un acento en Mac), y ese aviso ya no tapa el botón de Retos

Landing: modo nuevo en la tira, novedades (el modo, y la barra más simple con sus teclas),
tarjeta "Sin soltar el teclado" y README. Los textos del logro y el reto sin mouse ya cuentan
las teclas de los botones. Logros: una partida, cada dedo por
separado, meñiques con 95%. Reto diario: un solo dedo (desde el 29/9), y Dedos entra en el
reto de "jugá tal modo".

## Fase 17 — Tus dedos

Seguir cada dedo, no solo cada tecla, y mandarte a practicar el que se queda atrás.

- **Tus dedos** en el historial: las dos manos como en el selector, cada dedo con su % de
  error y sus ms por tecla (las estadísticas por tecla, sumadas por el dedo que las escribe en
  tu teclado), y una flecha si mejoró o empeoró contra las sesiones anteriores. El que falla
  más y el más lento quedan marcados, con un botón que lo pone a practicar solo en Dedos
- Los consejos: el de dedo y el de mano ahora tienen su botón a Dedos (ese dedo, esa mano), y
  hay uno nuevo para el dedo más lento aunque no falle
- Logro: Dedo domado (un dedo que falla la mitad que antes)

Landing: la tarjeta "Tus dedos" en la vitrina de estadísticas, y de paso dos gráficas del
historial que no estaban: "¿Vas mejorando?" (la tendencia de WPM) y "Las letras vuelven solas"
(el repaso). Fila de la comparación ampliada, novedades, README.
