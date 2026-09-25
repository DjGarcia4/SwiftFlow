<template>
  <section class="relative px-4 py-16 sm:px-6 sm:py-24">
    <div class="mx-auto max-w-6xl">
      <header class="mx-auto mb-14 max-w-2xl text-center">
        <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
          Las estadísticas
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
        >
          No te dice solo cuánto. Te dice por qué.
        </h2>
        <p v-reveal="{ delay: 200 }" class="mt-4 text-base font-bold text-pencil-gray">
          Cada tecla que apretás queda anotada: cuál era, cuál apretaste, cuánto tardaste.
          Con eso SwiftFlow encuentra lo que un número de WPM nunca te va a mostrar.
        </p>
      </header>

      <div class="space-y-20 sm:space-y-28">
        <div
          v-for="(row, index) in ROWS"
          :key="row.title"
          class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div
            v-reveal="{ variant: index % 2 ? 'slide-right' : 'slide-left' }"
            class="min-w-0"
            :class="{ 'lg:order-2': index % 2 }"
          >
            <p class="text-xs font-extrabold uppercase tracking-widest text-primary">
              {{ row.kicker }}
            </p>
            <h3 class="mt-2 font-display text-2xl font-black text-charcoal sm:text-3xl">
              {{ row.title }}
            </h3>
            <p class="mt-3 text-base font-bold text-pencil-gray">{{ row.text }}</p>
            <ul class="mt-4 space-y-2">
              <li
                v-for="point in row.points"
                :key="point"
                class="flex items-start gap-2 text-sm font-bold text-charcoal"
              >
                <CheckCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                {{ point }}
              </li>
            </ul>
          </div>

          <div
            v-reveal="{ variant: 'zoom', delay: 120 }"
            v-tilt="2"
            class="min-w-0 rounded-card border-2 border-faded-gray bg-paper-white p-5 shadow-xl shadow-primary/5 sm:p-6"
          >
            <InView :min-height="row.height">
              <!-- Keys missed -->
              <template v-if="row.id === 'keys'">
                <KeyErrorHeatmap :stats="demoKeyStats" />
              </template>

              <!-- How the keys are going -->
              <KeyTrendCard v-else-if="row.id === 'trends'" :trends="demoKeyTrends" />

              <!-- Day to day -->
              <DayConsistencyCard
                v-else-if="row.id === 'steady'"
                :data="demoDayConsistency"
              />

              <!-- Keys and transitions that hold you up -->
              <div v-else-if="row.id === 'slow'" class="space-y-6">
                <TimingBars :stats="demoKeyTiming" title="Tus teclas más lentas" />
                <TimingBars
                  :stats="demoBigramTiming"
                  title="Tus combinaciones más lentas"
                  unit-label="combo"
                />
              </div>

              <!-- A session, second by second -->
              <div v-else-if="row.id === 'session'">
                <WpmChart :history="demoWpmHistory" />
                <div class="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span
                    v-for="chip in SESSION_CHIPS"
                    :key="chip"
                    class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal animate-pop-in"
                    >{{ chip }}</span
                  >
                </div>
              </div>

              <!-- Patterns -->
              <div v-else-if="row.id === 'patterns'" class="space-y-3">
                <div
                  v-for="(pattern, i) in PATTERNS"
                  :key="pattern.title"
                  class="flex items-start gap-3 rounded-xl bg-primary-tint/40 px-3 py-3 animate-rise"
                  :style="staggerStyle(i, { step: 90, base: 100 })"
                >
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white"
                  >
                    <component :is="pattern.icon" class="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div class="text-sm font-extrabold text-charcoal">
                      {{ pattern.title }}
                    </div>
                    <div class="text-xs font-bold text-pencil-gray">
                      {{ pattern.detail }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <span
                    v-for="(word, i) in demoProblemWords"
                    :key="word.word"
                    class="inline-flex items-baseline gap-2 rounded-xl border-2 border-danger/25 bg-danger-tint/50 px-3 py-1.5 animate-pop-in"
                    :style="staggerStyle(i, { step: 80, base: 400 })"
                  >
                    <span class="font-mono text-sm font-extrabold text-danger">{{
                      word.word
                    }}</span>
                    <span class="text-[11px] font-bold text-pencil-gray">{{
                      word.reason
                    }}</span>
                  </span>
                </div>
              </div>

              <!-- Habits -->
              <div v-else-if="row.id === 'habits'" class="space-y-6">
                <ActivityCalendar :activity="demoActivity" />
                <TimeOfDayCard :data="demoTimeOfDay" />
              </div>
            </InView>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  CheckCircleIcon,
  ArrowsPointingInIcon,
  ArrowPathRoundedSquareIcon,
  HandRaisedIcon,
} from "@heroicons/vue/24/outline";
import { staggerStyle } from "@/shared/utils/motion";
import KeyErrorHeatmap from "@/features/history/components/KeyErrorHeatmap.vue";
import TimingBars from "@/features/history/components/TimingBars.vue";
import KeyTrendCard from "@/features/history/components/KeyTrendCard.vue";
import DayConsistencyCard from "@/features/history/components/DayConsistencyCard.vue";
import ActivityCalendar from "@/features/history/components/ActivityCalendar.vue";
import TimeOfDayCard from "@/features/history/components/TimeOfDayCard.vue";
import WpmChart from "@/features/typing-test/components/WpmChart.vue";
import InView from "./InView.vue";
import {
  demoKeyStats,
  demoKeyTiming,
  demoBigramTiming,
  demoWpmHistory,
  demoActivity,
  demoTimeOfDay,
  demoProblemWords,
  demoKeyTrends,
  demoDayConsistency,
} from "../demoData";

const ROWS = [
  {
    id: "keys",
    kicker: "Teclas",
    title: "Dónde se te escapan los dedos",
    text: "Un mapa del teclado con cada tecla teñida según cuánto la errás, y la lista ordenada por lo que de verdad te cuesta: no la tecla que más usás, sino la que más fallás en proporción.",
    points: [
      "Tasa de error de cada tecla, sobre tus últimas 30 sesiones",
      "Errores corregidos con borrar también cuentan",
      "Qué dedo y qué mano fallan más",
    ],
    height: "18rem",
  },
  {
    id: "trends",
    kicker: "Evolución",
    title: "Cómo van tus teclas",
    text: "Tus últimas 30 partidas contra las 30 anteriores, tecla por tecla: cuáles mejoraron y cuáles se te están escapando más que antes. Solo cambios claros, no una mala tarde.",
    points: [
      "Qué teclas bajaron sus errores, y cuánto",
      "Cuáles empeoraron, antes de que se vuelvan un hábito",
      "El «antes» de cada tecla en el mapa del teclado",
    ],
    height: "10rem",
  },
  {
    id: "slow",
    kicker: "Velocidad",
    title: "Lo que te frena aunque no lo erres",
    text: "Hay teclas que nunca fallás pero te hacen dudar. SwiftFlow mide el tiempo entre cada tecla y te muestra las que te llevan más que tu ritmo habitual, y las combinaciones que se te traban.",
    points: [
      "Milisegundos por tecla, contra tu propia mediana",
      "Combinaciones lentas: «ue», «ct», «rr»",
      "Sin confundirlo con errores: son problemas distintos",
    ],
    height: "20rem",
  },
  {
    id: "session",
    kicker: "Cada partida",
    title: "La partida, segundo a segundo",
    text: "El gráfico de tu velocidad durante toda la partida con cada error marcado, tu WPM bruto, la precisión contando cada pulsación, y qué tan parejo fue tu ritmo.",
    points: [
      "WPM neto (palabras correctas) y bruto (todas)",
      "Consistencia: qué tan parejo fue tu ritmo",
      "Combo máximo y errores corregidos",
    ],
    height: "16rem",
  },
  {
    id: "patterns",
    kicker: "Patrones",
    title: "Los errores tienen forma",
    text: "No es lo mismo errar una letra que apretar siempre la de al lado, o invertir dos letras por adelantarte. SwiftFlow distingue cada patrón y te dice cómo arreglarlo.",
    points: [
      "Qué tecla apretás cuando errás otra",
      "Letras invertidas: «qeu» por «que»",
      "Palabras enteras que se te traban",
    ],
    height: "18rem",
  },
  {
    id: "steady",
    kicker: "Constancia",
    title: "Qué tan parejo sos",
    text: "No alcanza con un buen día. SwiftFlow promedia cada día que practicás y te dice si tu velocidad se sostiene de uno al otro, o si hay días que se te van.",
    points: [
      "Un puntaje de 0 a 100, y entre qué velocidades se mueven tus días",
      "Cada día contra tu franja habitual",
      "Solo con partidas comparables: tu modo más jugado",
    ],
    height: "14rem",
  },
  {
    id: "habits",
    kicker: "Hábitos",
    title: "Cuándo y cuánto practicás",
    text: "Un año de práctica de un vistazo, tu racha de días, y a qué hora del día escribís mejor comparado con tu propio promedio en cada modo.",
    points: [
      "Calendario de actividad del año",
      "Tu mejor momento del día",
      "Tendencia de velocidad sesión a sesión",
    ],
    height: "18rem",
  },
];

const SESSION_CHIPS = ["65 WPM", "97% precisión", "91% consistencia", "58 combo máx."];

const PATTERNS = [
  {
    icon: ArrowsPointingInIcon,
    title: "Confundís la R con la T",
    detail:
      "7 de cada 10 veces que errás la R apretás la T: el dedo se te corre a la de al lado.",
  },
  {
    icon: ArrowPathRoundedSquareIcon,
    title: "Se te adelantan los dedos",
    detail: "Invertís «ue» y te sale «eu». No es puntería sino ritmo entre las manos.",
  },
  {
    icon: HandRaisedIcon,
    title: "Tu anular izquierdo falla más",
    detail:
      "Errás el 11% de las teclas que le tocan (S, W y X) contra el 4% de un dedo típico tuyo.",
  },
];
</script>
