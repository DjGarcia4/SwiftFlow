<template>
  <section class="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      ></div>
    </div>

    <div class="mx-auto max-w-6xl">
      <header class="mx-auto mb-12 max-w-2xl text-center">
        <p v-reveal class="text-xs font-extrabold uppercase tracking-widest text-primary">
          Para volver mañana
        </p>
        <h2
          v-reveal="{ delay: 100 }"
          class="mt-2 font-display text-3xl font-black text-charcoal sm:text-5xl"
        >
          Cada partida te lleva a algún lado
        </h2>
      </header>

      <!-- The ranks, Novato to the top -->
      <div v-reveal class="mb-4 text-center text-sm font-bold text-pencil-gray">
        {{ MAX_LEVEL }} niveles en {{ LEVEL_TIERS.length }} rangos
      </div>
      <ol
        v-reveal.stagger="{ step: 70 }"
        class="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        <li
          v-for="tier in LEVEL_TIERS"
          :key="tier.title"
          class="flex flex-col items-center gap-2 rounded-card border-2 px-2 py-4 text-center"
          :style="tierStyle(tier)"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
            :style="{ backgroundColor: rgb(tier) }"
          >
            <component :is="ACHIEVEMENT_ICONS[tier.icon]" class="h-6 w-6" />
          </div>
          <div class="text-sm font-extrabold leading-tight" :style="{ color: rgb(tier) }">
            {{ tier.title }}
          </div>
          <div class="text-[11px] font-bold text-pencil-gray">
            {{ tier.from === tier.to ? `Nivel ${tier.from}` : `${tier.from}–${tier.to}` }}
          </div>
        </li>
      </ol>

      <div class="grid gap-4 md:grid-cols-6">
        <!-- Rewards -->
        <article v-reveal v-tilt="3" :class="[CARD, 'md:col-span-3']">
          <h3 class="font-display text-xl font-extrabold text-charcoal">
            Los niveles desbloquean cosas
          </h3>
          <p class="mt-1 text-sm font-bold text-pencil-gray">
            Colores para toda la app, estilos de cursor y sonidos de teclado. Tocá un
            color para probarlo en esta página.
          </p>
          <!-- Trying a color on: the whole page takes it, for this visit only -->
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              v-for="(reward, i) in accents"
              :key="reward.id"
              type="button"
              class="swatch h-9 w-9 rounded-full border-4 shadow-md transition-[scale] duration-200 ease-spring hover:scale-110"
              :class="
                previewing?.id === reward.id ? 'border-charcoal' : 'border-paper-white'
              "
              :style="{
                backgroundColor: ACCENT_SWATCHES[reward.id],
                animationDelay: `${i * 0.35}s`,
              }"
              :aria-label="`Probar el color ${reward.label}`"
              :aria-pressed="previewing?.id === reward.id"
              @click="preview(reward)"
            ></button>
          </div>
          <p class="mt-2 h-5 text-xs font-bold text-pencil-gray">
            <template v-if="previewing">
              Probando <span class="text-primary">{{ previewing.label }}</span>
              {{
                previewing.level > 1
                  ? `· se desbloquea en el nivel ${previewing.level}`
                  : ""
              }}
              ·
              <button
                type="button"
                class="underline underline-offset-2 hover:text-charcoal"
                @click="restore"
              >
                volver a mi color
              </button>
            </template>
          </p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span
              v-for="reward in carets"
              :key="reward.id"
              class="rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal"
            >
              Cursor {{ reward.label.toLowerCase() }}
              <span class="text-pencil-gray">· nv {{ reward.level }}</span>
            </span>
            <!-- Sounds can be heard right here -->
            <button
              v-for="reward in sounds"
              :key="reward.id"
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border-2 border-faded-gray px-2 py-1 text-charcoal transition-[border-color] duration-200 hover:border-primary/50"
              :aria-label="`Escuchar el sonido ${reward.label}`"
              @click="listen(reward.id)"
            >
              <PlayIcon class="h-3 w-3 text-primary" />
              Sonido {{ reward.label.toLowerCase() }}
              <span class="text-pencil-gray">· nv {{ reward.level }}</span>
            </button>
          </div>
        </article>

        <!-- Achievements -->
        <article v-reveal="{ delay: 100 }" v-tilt="3" :class="[CARD, 'md:col-span-3']">
          <h3 class="font-display text-xl font-extrabold text-charcoal">
            {{ ACHIEVEMENTS.length }} logros para desbloquear
          </h3>
          <p class="mt-1 text-sm font-bold text-pencil-gray">
            Velocidad, precisión, rachas, combos, horarios raros y alguno escondido.
          </p>
          <div class="mt-5 grid grid-cols-2 gap-2">
            <div
              v-for="achievement in SAMPLE_ACHIEVEMENTS"
              :key="achievement.id"
              class="flex items-center gap-2 rounded-xl border-2 px-2.5 py-2"
              :style="achievementTintStyle({ ...achievement, unlocked: true })"
            >
              <component
                :is="ACHIEVEMENT_ICONS[achievement.icon]"
                class="h-4 w-4 flex-shrink-0"
              />
              <span class="truncate text-xs font-bold">{{ achievement.title }}</span>
            </div>
          </div>
        </article>

        <!-- Daily challenges -->
        <article v-reveal v-tilt="3" :class="[CARD, 'md:col-span-2']">
          <FlagIcon class="h-6 w-6 text-primary" />
          <h3 class="mt-3 font-display text-lg font-extrabold text-charcoal">
            Retos diarios
          </h3>
          <p class="mt-1 text-sm font-bold text-pencil-gray">
            Tres por día, a tu medida: un poco más allá de tu promedio.
          </p>
          <ul class="mt-4 space-y-2">
            <li
              v-for="challenge in CHALLENGES"
              :key="challenge.title"
              class="flex items-center gap-2 text-xs font-bold"
              :class="challenge.done ? 'text-success-dark' : 'text-charcoal'"
            >
              <CheckCircleIcon v-if="challenge.done" class="h-4 w-4 flex-shrink-0" />
              <span
                v-else
                class="h-4 w-4 flex-shrink-0 rounded-full border-2 border-faded-gray"
              ></span>
              {{ challenge.title }}
            </li>
          </ul>
        </article>

        <!-- Weekly goal -->
        <article v-reveal="{ delay: 100 }" v-tilt="3" :class="[CARD, 'md:col-span-2']">
          <CalendarDaysIcon class="h-6 w-6 text-primary" />
          <h3 class="mt-3 font-display text-lg font-extrabold text-charcoal">
            Meta semanal
          </h3>
          <p class="mt-1 text-sm font-bold text-pencil-gray">
            Minutos por semana, que se ajustan solos a tu costumbre.
          </p>
          <div class="mt-4 grid h-16 grid-cols-7 items-end gap-1.5" aria-hidden="true">
            <div
              v-for="(fill, i) in WEEK"
              :key="i"
              class="week-bar rounded-md"
              :class="fill >= 1 ? 'bg-success' : 'bg-primary/70'"
              :style="{
                height: `${Math.max(8, fill * 100)}%`,
                animationDelay: `${i * 80}ms`,
              }"
            ></div>
          </div>
        </article>

        <!-- Weekly challenge -->
        <article v-reveal="{ delay: 200 }" v-tilt="3" :class="[CARD, 'md:col-span-2']">
          <TrophyIcon class="h-6 w-6 text-primary" />
          <h3 class="mt-3 font-display text-lg font-extrabold text-charcoal">
            Reto semanal · {{ thisWeek }}
          </h3>
          <p class="mt-1 text-sm font-bold text-pencil-gray">
            El mismo texto para todos durante la semana. Jugalo y pasale tu marca a
            alguien:
            <span class="text-charcoal">«¿Me ganás?»</span>
          </p>
        </article>

        <!-- Streak -->
        <article
          v-reveal
          :class="[
            CARD,
            'md:col-span-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left',
          ]"
        >
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-tint text-primary"
          >
            <FireIcon class="flame h-9 w-9" />
          </div>
          <div class="flex-1">
            <h3 class="font-display text-xl font-extrabold text-charcoal">
              Una racha que no querés cortar
            </h3>
            <p class="mt-1 text-sm font-bold text-pencil-gray">
              Cada día que practicás suma. Si todavía no jugaste hoy, SwiftFlow te avisa
              cuántas horas te quedan, y si querés, te recuerda a la noche.
            </p>
          </div>
          <div class="font-display text-5xl font-black text-primary">
            12<span class="ml-1 text-base font-extrabold text-pencil-gray">días</span>
          </div>
        </article>

        <!-- The month, looked back on -->
        <article
          v-reveal
          :class="[
            CARD,
            'md:col-span-6 grid items-center gap-6 lg:grid-cols-[1fr_1.2fr]',
          ]"
        >
          <div>
            <h3 class="font-display text-xl font-extrabold text-charcoal">
              Tu mes, contado
            </h3>
            <p class="mt-1 text-sm font-bold text-pencil-gray">
              Cada mes y cada año, un resumen: cuánto practicaste, tu récord, cuánto más
              rápido vas que antes, la tecla que domaste y los logros del camino. Listo
              para compartir como imagen.
            </p>
          </div>
          <div
            class="rounded-card bg-night-ink px-5 py-4 text-center text-white"
            aria-hidden="true"
          >
            <div class="text-sm font-extrabold text-primary">Mi septiembre</div>
            <div class="mt-2 grid grid-cols-3 gap-2">
              <div v-for="stat in SUMMARY_DEMO" :key="stat.label">
                <div class="font-display text-3xl font-black">{{ stat.value }}</div>
                <div class="text-[11px] font-bold text-white/70">{{ stat.label }}</div>
              </div>
            </div>
            <div class="mt-3 space-y-0.5 text-xs font-bold">
              <div>🏆 Récord: 71 WPM · 30s</div>
              <div>Tecla domada: Ñ 12% → 4%</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  FlagIcon,
  CalendarDaysIcon,
  TrophyIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import { FireIcon, PlayIcon } from "@heroicons/vue/24/solid";
import { ref, onUnmounted } from "vue";
import { useCustomizationStore } from "@/shared/stores/customization";
import { playKeystrokeSound } from "@/shared/utils/sound";
import { LEVEL_TIERS, MAX_LEVEL } from "@/features/history/utils/experience";
import { rewardsOfKind, ACCENT_SWATCHES } from "@/features/history/utils/rewards";
import { ACHIEVEMENTS } from "@/features/history/achievements";
import {
  ACHIEVEMENT_ICONS,
  achievementTintStyle,
} from "@/features/history/achievementPresentation";
import { weeklyKey, weeklyLabel } from "@/features/typing-test/content/weekly";

const SUMMARY_DEMO = [
  { value: 64, label: "partidas" },
  { value: 212, label: "minutos" },
  { value: 21, label: "días" },
];

// min-w-0: a grid item is otherwise as wide as its widest content, and
// the modes strip is a few thousand pixels of it
const CARD =
  "min-w-0 rounded-card border-2 border-faded-gray bg-paper-white p-5 sm:p-6 transition-[border-color] duration-300 hover:border-primary/40";

const rgb = (tier) => `rgb(${tier.rgb.join(" ")})`;
const tierStyle = (tier) => {
  const [r, g, b] = tier.rgb;
  return {
    borderColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.06)`,
  };
};

const accents = rewardsOfKind("accent");
// The ones past the default, which comes free
const carets = rewardsOfKind("caret").filter((r) => r.level > 1);
const sounds = rewardsOfKind("sound").filter((r) => r.level > 1);

// One from each kind of achievement, for a taste of the range
const SAMPLE_ACHIEVEMENTS = [
  "wpm_100",
  "accuracy_100_x5",
  "combo_300",
  "streak_30",
  "night_owl",
  "polyglot",
  "challenge_full_day",
  "zen_marathon_10",
]
  .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
  .filter(Boolean);

const CHALLENGES = [
  { title: "Llegá a 62 wpm en una sesión", done: true },
  { title: "Hacé un combo de 80 sin errores", done: true },
  { title: "Completá una partida de Código", done: false },
];

// A week on its way to the goal: the full ones are days at pace or better
const WEEK = [1.2, 0.6, 1, 0.9, 0.3, 0, 0];

const thisWeek = weeklyLabel(weeklyKey());

// Trying a color: set straight on the root, where the stylesheet reads it,
// and put back to the visitor's own when they're done or they leave
const customization = useCustomizationStore();
const previewing = ref(null);
const setAccent = (id) => {
  if (id === "orange") delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = id;
};
const preview = (reward) => {
  previewing.value = reward;
  setAccent(reward.id);
};
const restore = () => {
  previewing.value = null;
  setAccent(customization.accent);
};
onUnmounted(() => {
  if (previewing.value) setAccent(customization.accent);
});

// A few keystrokes of a sound, the way it sounds while typing
const listen = (id) => {
  [0, 110, 200, 330].forEach((delay) => setTimeout(() => playKeystrokeSound(id), delay));
};
</script>

<style scoped>
/* The accent swatches taking a small bow, one after another */
@keyframes swatch-bob {
  0%,
  70%,
  100% {
    transform: translateY(0);
  }
  80% {
    transform: translateY(-6px);
  }
}

.swatch {
  animation: swatch-bob 2.8s var(--ease-spring) infinite;
}

/* The week's columns growing in */
@keyframes grow-up {
  from {
    transform: scaleY(0);
  }
}

.week-bar {
  transform-origin: bottom;
  animation: grow-up 900ms var(--ease-smooth) backwards;
}

/* The streak's flame never quite still */
@keyframes flicker {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.08) rotate(-4deg);
  }
  60% {
    transform: scale(0.96) rotate(3deg);
  }
}

.flame {
  animation: flicker 1.4s ease-in-out infinite;
}
</style>
