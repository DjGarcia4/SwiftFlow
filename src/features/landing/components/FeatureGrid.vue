<template>
  <section id="que-tiene" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
    <header class="mx-auto mb-12 max-w-2xl text-center">
      <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
        Todo lo que hace
      </p>
      <h2
        v-reveal="{ delay: 100 }"
        class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
      >
        Un test de velocidad que además te entrena
      </h2>
    </header>

    <div v-reveal.stagger="{ step: 90 }" class="grid gap-4 md:grid-cols-6">
      <!-- Modes: a strip that never stops -->
      <article v-tilt="3" :class="[CARD, 'md:col-span-6']">
        <CardTitle
          :icon="Squares2X2Icon"
          title="Nueve maneras de practicar"
          text="De 15 segundos a sin límite, con tu texto o el de todos."
        />
        <div class="marquee mt-5 overflow-hidden" aria-hidden="true">
          <div class="marquee-track flex w-max gap-3">
            <span
              v-for="(mode, index) in [...MODES, ...MODES]"
              :key="index"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-faded-gray bg-paper-white px-3 py-2"
            >
              <component :is="mode.icon" class="h-4 w-4 text-primary" />
              <span class="text-sm font-extrabold text-charcoal">{{ mode.name }}</span>
              <span class="text-xs font-bold text-pencil-gray">{{ mode.detail }}</span>
            </span>
          </div>
        </div>
        <ul class="sr-only">
          <li v-for="mode in MODES" :key="mode.name">
            {{ mode.name }}: {{ mode.detail }}
          </li>
        </ul>
      </article>

      <!-- While typing -->
      <article v-tilt="3" :class="[CARD, 'md:col-span-4']">
        <CardTitle
          :icon="CursorArrowRaysIcon"
          title="Mientras escribís"
          text="El combo como barra que se llena, un coach que te avisa qué letra se te escapa, y un teclado en pantalla con el dedo que va en cada tecla."
        />
        <div class="mt-5 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <FireIcon class="h-5 w-5 text-primary" />
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-faded-gray/40">
                <div class="combo-fill h-full rounded-full bg-primary"></div>
              </div>
              <span class="text-xs font-extrabold text-primary">x48</span>
            </div>
            <div
              class="flex items-center gap-2 rounded-xl border-2 border-primary/40 bg-paper-white px-3 py-2"
            >
              <ViewfinderCircleIcon class="h-5 w-5 flex-shrink-0 text-primary" />
              <span class="min-w-0 flex-1 text-xs font-extrabold text-charcoal"
                >Se te escapa la R · 4 de 12</span
              >
              <span
                class="rounded-md bg-primary px-2 py-0.5 text-[10px] font-extrabold text-white"
                >Entrenar ahora</span
              >
            </div>
          </div>
          <!-- Scaled down, and the room the scaling frees handed back -->
          <div class="hidden origin-center scale-75 sm:block lg:-mx-14 lg:-my-6">
            <KeyboardLayout compact :key-class="() => ''" :key-style="fingerKeyStyle" />
          </div>
        </div>
      </article>

      <!-- Racing -->
      <article v-tilt="3" :class="[CARD, 'md:col-span-2']">
        <CardTitle
          :icon="GhostIcon"
          title="Corré contra alguien"
          text="Tu propio récord como fantasma, o un marcapasos a ritmo fijo."
        />
        <div class="mt-5 space-y-3" aria-hidden="true">
          <div v-for="lane in LANES" :key="lane.label">
            <div
              class="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-pencil-gray"
            >
              <component :is="lane.icon" class="h-3.5 w-3.5" />
              {{ lane.label }}
            </div>
            <div class="relative h-2 rounded-full bg-faded-gray/40">
              <div
                class="race-runner absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full"
                :class="lane.color"
                :style="{ animationDuration: lane.duration }"
              ></div>
            </div>
          </div>
        </div>
      </article>

      <!-- After each session -->
      <article v-tilt="3" :class="[CARD, 'md:col-span-3']">
        <CardTitle
          :icon="MagnifyingGlassIcon"
          title="¿Dónde te frenaste?"
          text="Después de cada partida, tu texto palabra por palabra, coloreado por cuánto tardaste en cada una."
        />
        <p class="mt-5 font-mono text-lg leading-loose">
          <template v-for="([word, tier], index) in demoReplay" :key="index">
            <span class="rounded px-0.5" :class="TIER_CLASSES[tier]">{{ word }}</span
            >{{ " " }}
          </template>
        </p>
        <div class="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal"
            >91% consistencia</span
          >
          <span class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal"
            >64 wpm bruto</span
          >
          <span class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal"
            >2 errores corregidos</span
          >
        </div>
      </article>

      <!-- Smart training -->
      <article v-tilt="3" :class="[CARD, 'md:col-span-3']">
        <CardTitle
          :icon="AcademicCapIcon"
          title="Un entrenamiento que sabe cuándo parar"
          text="Arma la práctica con tus teclas y palabras flojas, te dice si hace falta otra ronda, y te las vuelve a traer en el momento justo."
        />
        <ol class="mt-5 space-y-2">
          <li
            v-for="(step, index) in TRAINING_STEPS"
            :key="step.title"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-tint text-xs font-black text-primary"
              >{{ index + 1 }}</span
            >
            <span class="text-sm font-extrabold text-charcoal">{{ step.title }}</span>
            <span class="text-xs font-bold text-pencil-gray">{{ step.detail }}</span>
          </li>
        </ol>
      </article>

      <!-- Small ones: three to a row, the last row two wide if it'd
           otherwise leave one alone -->
      <article
        v-for="(small, index) in SMALL_CARDS"
        :key="small.title"
        v-tilt="3"
        :class="[CARD, smallCardSpan(index)]"
      >
        <CardTitle :icon="small.icon" :title="small.title" :text="small.text" />
      </article>
    </div>
  </section>
</template>

<script setup>
import { h } from "vue";
import {
  Squares2X2Icon,
  CursorArrowRaysIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ViewfinderCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  SparklesIcon,
  PencilSquareIcon,
  TrophyIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  WifiIcon,
  LanguageIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import TextStyleIcon from "@/shared/components/icons/TextStyleIcon";
import { FireIcon } from "@heroicons/vue/24/solid";
import GhostIcon from "@/shared/components/icons/GhostIcon";
import MetronomeIcon from "@/shared/components/icons/MetronomeIcon";
import KeyboardLayout from "@/features/typing-test/components/KeyboardLayout.vue";
import {
  FINGERS,
  fingerOfKey,
  SHIFT_KEY,
} from "@/features/typing-test/utils/keyboardMap";
import { codeLanguages } from "@/features/typing-test/content/code";
import { KEYBOARD_LAYOUTS } from "@/features/typing-test/utils/keyboardLayouts";
import { useConfigStore } from "@/features/typing-test/store";
import { demoReplay } from "../demoData";

// min-w-0: a grid item is otherwise as wide as its widest content, and
// the modes strip is a few thousand pixels of it
const CARD =
  "min-w-0 rounded-card border-2 border-faded-gray bg-paper-white p-5 sm:p-6 transition-[border-color] duration-300 hover:border-primary/40";

// Icon, title and a line: the top of every card
const CardTitle = (props) =>
  h("div", [
    h(
      "div",
      {
        class:
          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-tint text-primary",
      },
      [h(props.icon, { class: "h-5 w-5" })]
    ),
    h("h3", { class: "font-display text-xl font-extrabold text-charcoal" }, props.title),
    h("p", { class: "mt-1 text-sm font-bold text-pencil-gray" }, props.text),
  ]);
CardTitle.props = ["icon", "title", "text"];

const MODES = [
  { name: "Tiempo", detail: "15 a 120 s", icon: ClockIcon },
  { name: "Palabras", detail: "10 a 100", icon: DocumentTextIcon },
  { name: "Números", detail: "decimales, horas, miles", icon: HashtagIcon },
  { name: "Cita", detail: "frases con autor", icon: ChatBubbleBottomCenterTextIcon },
  { name: "Código", detail: `${codeLanguages.length} lenguajes`, icon: CodeBracketIcon },
  { name: "Zen", detail: "sin límite", icon: SparklesIcon },
  {
    name: "Entrenar",
    detail: "tus teclas y palabras flojas",
    icon: ViewfinderCircleIcon,
  },
  { name: "Mi texto", detail: "pegá lo que escribís", icon: PencilSquareIcon },
  { name: "Semanal", detail: "el mismo texto para todos", icon: TrophyIcon },
];

const LANES = [
  { label: "Vos", icon: CursorArrowRaysIcon, color: "bg-primary", duration: "4.2s" },
  { label: "Tu fantasma", icon: GhostIcon, color: "bg-pencil-gray", duration: "4.6s" },
  {
    label: "Marcapasos 60 wpm",
    icon: MetronomeIcon,
    color: "bg-charcoal/60",
    duration: "5s",
  },
];

const TIER_CLASSES = {
  fast: "text-success",
  normal: "text-charcoal",
  slow: "bg-primary/15 text-primary-dark",
  stuck: "bg-danger/15 font-bold text-danger",
};

const TRAINING_STEPS = [
  { title: "Detecta", detail: "teclas, dedos y palabras flojas" },
  { title: "Entrena", detail: "texto armado alrededor de eso" },
  { title: "Te frena", detail: "“listo por hoy” o “una ronda más”" },
  { title: "Repasa", detail: "a 1, 3, 7, 14 y 30 días" },
];

// "Latinoamericano, Español (España), ... y Colemak"
const layoutNames = KEYBOARD_LAYOUTS.map((layout) => layout.name.split(" (")[0]);
const LAYOUTS_TEXT = `${layoutNames.slice(0, -1).join(", ")} o ${layoutNames.at(-1)}: el teclado en pantalla, los dedos y los consejos siguen al tuyo.`;

const SMALL_CARDS = [
  {
    icon: LanguageIcon,
    title: "Tu teclado",
    text: LAYOUTS_TEXT,
  },
  {
    icon: TextStyleIcon,
    title: "Texto a tu gusto",
    text: "Tamaño, interlineado y fuente, con opciones pensadas para leer mejor como Atkinson Hyperlegible y OpenDyslexic.",
  },
  {
    icon: UserGroupIcon,
    title: "Para todos",
    text: "Alto contraste, todo usable con el teclado, y los resultados leídos en voz alta por tu lector de pantalla.",
  },
  {
    icon: EyeSlashIcon,
    title: "Sin red",
    text: "Escribí sin ver tus errores hasta el final: entrena la confianza en tus dedos.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Sin cuenta",
    text: "Todo queda en tu navegador. Exportá tu historial cuando quieras.",
  },
  {
    icon: WifiIcon,
    title: "Funciona sin internet",
    text: "Instalala como app y practicá donde sea.",
  },
];

// Rows of three; a leftover one or two share the last row(s) two by two
const smallCardSpan = (index) => {
  const count = SMALL_CARDS.length;
  const leftover = count % 3;
  const pairedFrom = leftover === 0 ? count : count - (leftover === 1 ? 4 : 2);
  return index >= Math.max(0, pairedFrom) ? "md:col-span-3" : "md:col-span-2";
};

// The on-screen keyboard's finger colors, at rest
const FINGER_RGB = {
  pinky: [139, 92, 246],
  ring: [59, 130, 246],
  middle: [16, 185, 129],
  index: [245, 158, 11],
  thumb: [100, 116, 139],
};
// Drawn on the visitor's own keyboard, as the app would
const configStore = useConfigStore();
const fingerKeyStyle = (key) => {
  const finger =
    key === SHIFT_KEY ? "left-pinky" : fingerOfKey(key, configStore.keyboardLayout);
  if (!finger) return {};
  const [r, g, b] = FINGER_RGB[FINGERS[finger].kind];
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
    color: `rgb(${r} ${g} ${b})`,
  };
};
</script>

<style scoped>
/* The modes strip: two copies side by side, sliding by one copy's width */
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

.marquee-track {
  animation: marquee 32s linear infinite;
}

.marquee:hover .marquee-track {
  animation-play-state: paused;
}

.marquee {
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

/* The combo filling up, again and again */
@keyframes combo-fill {
  from {
    width: 8%;
  }
  to {
    width: 92%;
  }
}

.combo-fill {
  animation: combo-fill 2.6s var(--ease-smooth) infinite alternate;
}

/* Three runners down their lanes, each at its own pace */
@keyframes race {
  from {
    left: 0;
  }
  to {
    left: calc(100% - 4px);
  }
}

.race-runner {
  animation: race 4.5s linear infinite;
}
</style>
