# Ideas a futuro

Cosas que se charlaron y quedaron para más adelante, con cómo pensamos hacerlas, así no hay
que volver a arrancar de cero.

---

## Desafiar a un amigo con un enlace

Correr el reto semanal contra el fantasma de otra persona, que te lo pasa por un enlace.

### Por qué es posible sin servidor

Es el mismo truco que ya usa el reto semanal: el texto de cada semana sale de una semilla (el
número de semana), así que dos personas que juegan "S39·2026" escriben exactamente las mismas
palabras sin que nada viaje por la red. Lo único que falta pasar es **cómo escribió la otra
persona**, y eso cabe en un enlace.

Un fantasma es una lista de pares `[milisegundos, caracteres escritos]` (ver
`src/features/typing-test/utils/ghost.js`). Para las 40 palabras del reto semanal son unos
250 pares. Guardando sólo la diferencia con el par anterior, redondeando a 10 ms, comprimiendo
con `CompressionStream("deflate-raw")` y codificando en base64url, queda en unos 600–1.000
caracteres: entra sin problemas en una URL.

### Cómo funcionaría

1. Tu amigo termina el reto semanal y, en la pantalla de compartir, toca **"Copiar
   desafío"**. Se genera algo como:

   ```
   https://swiftflow.app/#reto=2026-W39&de=Ana&g=eJxtkMEKwjAQRH8l...
   ```

2. Abrís el enlace. Al cargar, la app lo lee y muestra un aviso: **"Ana te desafía: 64 wpm en
   el reto S39·2026 · Aceptar"**.
3. Al aceptar arranca el reto semanal de **esa** semana (aunque ya haya pasado: el texto se
   regenera de la semilla) y un cursor fantasma con el nombre **Ana** avanza exactamente como
   avanzó ella.
4. En resultados: **"¡Le ganaste a Ana! 67 vs 64 wpm · 1,2 s más rápido"**, con un botón para
   **responderle con tu propio enlace**.

### Decisiones

- **Sólo para el reto semanal.** Es el único modo donde los dos escriben el mismo texto, así
  que es el único donde la comparación es justa. (El fantasma propio corre sobre texto nuevo a
  tu ritmo; el de otra persona tiene que ser sobre su mismo texto.)
- **Los datos van en el `#` de la URL**, no en la query. El fragmento nunca se manda al
  servidor que aloja la app: queda todo en el navegador de quien abre el enlace. El router usa
  `createWebHistory`, así que el `#` no interfiere con las rutas; se lee de
  `window.location.hash` y se limpia después de leerlo.
- **El enlace es un dato no confiable**, porque viene de afuera. Se valida estricto antes de
  usarlo, en el mismo espíritu que `parseBackup` en `historyBackup.js`:
  - la semana tiene que tener formato `AAAA-Wnn` válido;
  - los tiempos tienen que ser enteros, en orden creciente, con un tope de duración;
  - los caracteres escritos, entre 0 y el largo del texto;
  - el payload tiene un tope de tamaño antes de siquiera descomprimirlo;
  - el nombre se corta a ~20 caracteres y se muestra como texto plano (Vue ya escapa, pero no
    se usa en ningún `v-html`).

  Si algo no cuadra se ignora en silencio: un enlace roto nunca rompe la app.

### Piezas

| Pieza                   | Dónde                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Codificar/decodificar   | `src/features/typing-test/utils/challengeLink.js` (+ tests: ida y vuelta, entradas rotas)                                     |
| Leer el enlace al abrir | `App.vue` o `HomeView.vue`: lee el hash, valida, guarda el desafío pendiente                                                  |
| Aviso de desafío        | Componente nuevo con "Aceptar" / "Ahora no"                                                                                   |
| Correr contra él        | `ParagraphToType`: `raceGhost` viene del desafío en vez de `historyStore.ghostFor`; el cursor y la ventaja muestran el nombre |
| Resultado               | `describeGhostOutcome` con el nombre ("Le ganaste a Ana")                                                                     |
| Generar el enlace       | Botón "Copiar desafío" en `ShareResultModal`, sólo para el reto semanal                                                       |

### Limitación

Sin servidor no hay forma de impedir que alguien fabrique un enlace con un tiempo imposible.
Para desafíos entre amigos alcanza.

---

## Tabla de posiciones pública

Ver quién hizo la mejor marca de la semana entre todos los que jugaron el reto semanal.

Esto sí necesita un backend (Supabase o Firebase, por ejemplo) que guarde los resultados, más
cuentas o al menos un apodo, y alguna defensa contra marcas falsas (por ejemplo, validar en el
servidor la línea de tiempo del fantasma contra el texto de la semana). Es un proyecto
bastante más grande que el enlace de desafío; el enlace sirve igual como primer paso, porque
el formato del fantasma sería el mismo que se subiría.

---

## Recordatorio de racha con la app cerrada

Hoy el recordatorio de la noche (`src/features/history/streakReminder.js`) solo llega si
SwiftFlow está abierto, aunque sea en otra pestaña. Avisar con la app cerrada no se puede sin
servidor:

| Opción                                     | Por qué no alcanza                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Web Push                                   | Necesita un servidor que mande el aviso (claves VAPID y guardar las suscripciones).                                                     |
| Notificaciones programadas (`showTrigger`) | Fue un experimento de Chrome y se abandonó: no existe en ningún navegador.                                                              |
| Periodic Background Sync                   | Solo Chrome/Android y con la PWA instalada; el navegador decide cuándo corre (como mucho cada ~12 h), así que no sirve para "a las 21". |

Cuando haya backend (el mismo que pediría la tabla de posiciones), el camino es Web Push: el
servidor guarda la hora elegida y la suscripción de cada persona, y manda el aviso si ese día
no hubo sesión. Del lado de la app: pasar el service worker de `vite-plugin-pwa` de
`generateSW` a `injectManifest` para poder escuchar el evento `push`.
