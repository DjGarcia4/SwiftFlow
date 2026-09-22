<template>
  <div class="bg-paper-white rounded-card p-3 sm:px-3 sm:py-2 border-2 border-faded-gray">
    <!-- Mobile Layout (stacked) -->
    <div class="flex flex-col gap-3 sm:hidden">
      <!-- Content type selection (code is always typed as-is) -->
      <template v-if="configStore.type !== 'code'">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <IconButton
            v-for="contentType in configStore.contentTypes"
            :key="contentType"
            :value="contentType"
            :icon="contentType === 'punctuation' ? 'punctuation' : 'number'"
            :variant="
              configStore.selectedContentTypes === contentType ? 'primary' : 'secondary'
            "
            size="sm"
            :text="`${contentType == 'punctuation' ? 'Puntuación' : 'Números'}`"
            @click="configStore.handleContentTypes(contentType)"
          />
        </div>

        <!-- Divisor -->
        <div class="h-px w-full bg-faded-gray"></div>
      </template>

      <!-- Type selection -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <IconButton
          v-for="type in configStore.types"
          :key="type"
          :value="type"
          :icon="typeMeta[type].icon"
          :variant="configStore.type === type ? 'primary' : 'secondary'"
          size="sm"
          :text="typeMeta[type].label"
          @click="configStore.handleType(type)"
        />
      </div>

      <!-- Value selection (no limit to pick in zen mode) -->
      <template
        v-if="
          configStore.type === 'time' ||
          configStore.type === 'words' ||
          configStore.type === 'numbers' ||
          configStore.type === 'code' ||
          configStore.type === 'drill'
        "
      >
        <!-- Divisor -->
        <div class="h-px w-full bg-faded-gray"></div>

        <div
          :key="configStore.type"
          class="flex flex-wrap items-center justify-center gap-2 animate-rise [animation-duration:400ms]"
        >
          <template v-if="configStore.type === 'time'">
            <IconButton
              v-for="time in configStore.times"
              :key="time"
              :value="time"
              :variant="configStore.selectedTime === time ? 'primary' : 'secondary'"
              size="sm"
              :text="`${time}s`"
              @click="configStore.handleTime(time)"
            />
          </template>
          <template
            v-if="
              configStore.type === 'words' ||
              configStore.type === 'numbers' ||
              configStore.type === 'drill'
            "
          >
            <IconButton
              v-for="word in configStore.words"
              :key="word"
              :value="word"
              :variant="configStore.selectedWords === word ? 'primary' : 'secondary'"
              size="sm"
              :text="`${word} `"
              @click="configStore.handleWords(word)"
            />
          </template>
          <template v-if="configStore.type === 'code'">
            <IconButton
              :variant="!configStore.selectedCodeLanguage ? 'primary' : 'secondary'"
              size="sm"
              text="Todos"
              @click="configStore.handleCodeLanguage(null)"
            />
            <IconButton
              v-for="language in configStore.languages"
              :key="language"
              :value="language"
              :variant="
                configStore.selectedCodeLanguage === language ? 'primary' : 'secondary'
              "
              size="sm"
              :text="language"
              @click="configStore.handleCodeLanguage(language)"
            />
          </template>
        </div>
      </template>
    </div>

    <!-- Desktop: one line, always. Every setting is one strip, so the bar
         stays a single row however many modes there are, and the drill's
         keys open in a popover instead of growing a second row. -->
    <div class="hidden sm:flex flex-nowrap items-center justify-center gap-2 lg:gap-3">
      <!-- Content type (code is always typed as-is) -->
      <button
        v-if="configStore.type !== 'code'"
        type="button"
        :aria-pressed="configStore.selectedContentTypes === 'punctuation'"
        title="Puntuación y mayúsculas"
        class="flex flex-shrink-0 items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-xs font-extrabold transition-[background-color,border-color,color,scale] duration-200 ease-spring active:scale-95"
        :class="
          configStore.selectedContentTypes === 'punctuation'
            ? 'border-primary/50 bg-primary-tint text-primary'
            : 'border-faded-gray/60 text-pencil-gray hover:text-charcoal'
        "
        @click="configStore.handleContentTypes('punctuation')"
      >
        <AtSymbolIcon class="w-4 h-4" />
        <span class="hidden lg:inline">Puntuación</span>
      </button>

      <SegmentedControl
        label="Modo"
        compact-labels
        :options="modeOptions"
        :model-value="configStore.type"
        @select="configStore.handleType"
      />

      <!-- The mode's own setting: length, word count or language. Only
           this part scrolls if a long list (code languages) runs out of
           room, so the popover beside it is never clipped. -->
      <div
        v-if="valueOptions"
        :key="configStore.type"
        class="min-w-0 overflow-x-auto animate-rise [animation-duration:400ms]"
      >
        <SegmentedControl
          :label="valueOptions.label"
          :options="valueOptions.options"
          :model-value="valueOptions.selected"
          @select="valueOptions.select"
        />
      </div>

      <!-- Drill targets: a chip showing them, opening the picker -->
      <div
        v-if="configStore.type === 'drill'"
        ref="drillChipRoot"
        data-drill-chip
        class="relative"
      >
        <button
          type="button"
          class="flex flex-shrink-0 items-center gap-1.5 rounded-xl border-2 px-2 py-1 text-xs font-extrabold transition-[background-color,border-color,color] duration-200"
          :class="
            pickerOpen
              ? 'border-primary bg-primary-tint text-primary'
              : 'border-faded-gray/60 text-pencil-gray hover:text-charcoal'
          "
          :aria-expanded="pickerOpen"
          :title="targetKeys.length ? 'Cambiar las teclas a entrenar' : 'Elegir teclas'"
          @click="pickerOpen = !pickerOpen"
        >
          <ViewfinderCircleIcon class="w-4 h-4" />
          <template v-if="targetKeys.length">
            <!-- Green once that letter is done for today -->
            <kbd
              v-for="key in targetKeys"
              :key="key"
              class="rounded-md px-1.5 font-mono text-xs font-extrabold uppercase"
              :class="
                readyKeys.has(key)
                  ? 'bg-success-tint text-success-dark'
                  : 'bg-primary-tint text-primary'
              "
              >{{ key }}</kbd
            >
          </template>
          <span v-else>Elegir teclas</span>
          <ChevronDownIcon
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': pickerOpen }"
          />
        </button>

        <Transition
          enter-active-class="transition-[opacity,translate] duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-opacity duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="pickerOpen"
            class="absolute right-0 top-full z-40 mt-3 w-max rounded-card border-2 border-faded-gray bg-paper-white p-4 shadow-xl"
          >
            <p class="mb-3 text-center text-xs font-bold text-pencil-gray">
              {{
                configStore.drillKeys.length
                  ? "Elegí hasta 5 teclas"
                  : targetKeys.length
                    ? "Según tu historial. Elegí otras si querés:"
                    : "Todavía no sé qué te cuesta: elegí teclas"
              }}
            </p>
            <DrillKeysPicker />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mobile: the drill's target keys get a row of their own in the sheet,
         where there's room for it. -->
    <div
      v-if="configStore.type === 'drill'"
      data-drill-row
      class="sm:hidden mt-3 pt-3 border-t-2 border-faded-gray flex flex-col items-center gap-2"
    >
      <div class="flex flex-wrap items-center justify-center gap-1.5">
        <span class="text-xs font-bold text-pencil-gray">
          {{ targetKeys.length ? "Entrenando:" : "Todavía no sé qué te cuesta:" }}
        </span>

        <kbd
          v-for="key in targetKeys"
          :key="key"
          class="rounded-md border-2 border-primary/30 bg-primary-tint px-2 py-0.5 font-mono text-sm font-extrabold uppercase text-primary"
          >{{ key }}</kbd
        >
        <span v-if="!targetKeys.length" class="text-xs text-pencil-gray">
          elegí teclas o hacé unos tests primero
        </span>

        <IconButton
          :variant="editingKeys ? 'primary' : 'secondary'"
          size="xs"
          :text="editingKeys ? 'Listo' : 'Cambiar'"
          @click="editingKeys = !editingKeys"
        />
      </div>

      <DrillKeysPicker v-if="editingKeys" class="animate-rise" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  AtSymbolIcon,
  ClockIcon,
  HashtagIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  SparklesIcon,
  ViewfinderCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import IconButton from "@/shared/components/IconButton.vue";
import SegmentedControl from "@/shared/components/SegmentedControl.vue";
import DrillKeysPicker from "./DrillKeysPicker.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { useHistoryStore } from "@/features/history/store";
import { resolveDrillKeys } from "@/features/typing-test/utils/drillTargets";

const configStore = useConfigStore();
const historyStore = useHistoryStore();

// Icon + label for each typing mode (the mobile buttons take IconButton's
// icon names, the desktop strip takes the components themselves)
const typeMeta = {
  time: { icon: "clock", component: ClockIcon, label: "Tiempo" },
  words: { icon: "letter", component: "A", label: "Palabras" },
  numbers: { icon: "number", component: HashtagIcon, label: "Números" },
  quote: { icon: "quote", component: ChatBubbleBottomCenterTextIcon, label: "Cita" },
  code: { icon: "code", component: CodeBracketIcon, label: "Código" },
  zen: { icon: "zen", component: SparklesIcon, label: "Zen" },
  drill: { icon: "target", component: ViewfinderCircleIcon, label: "Entrenar" },
};

const modeOptions = computed(() =>
  configStore.types.map((type) => ({
    value: type,
    label: typeMeta[type].label,
    icon: typeMeta[type].component,
  }))
);

// The one setting that belongs to the current mode, or null for the modes
// that have none (quote, zen)
const valueOptions = computed(() => {
  const type = configStore.type;
  if (type === "time") {
    return {
      label: "Duración",
      options: configStore.times.map((time) => ({ value: time, label: `${time}s` })),
      selected: configStore.selectedTime,
      select: configStore.handleTime,
    };
  }
  if (type === "words" || type === "numbers" || type === "drill") {
    return {
      label: "Cantidad",
      options: configStore.words.map((count) => ({ value: count, label: `${count}` })),
      selected: configStore.selectedWords,
      select: configStore.handleWords,
    };
  }
  if (type === "code") {
    return {
      label: "Lenguaje",
      options: [
        { value: null, label: "Todos" },
        ...configStore.languages.map((language) => ({
          value: language,
          label: language,
        })),
      ],
      selected: configStore.selectedCodeLanguage,
      select: configStore.handleCodeLanguage,
    };
  }
  return null;
});

// The picker stays shut until asked for: the default targets are usually
// the right ones. The desktop popover and the mobile sheet's row each keep
// their own, since they're separate copies of the bar.
const editingKeys = ref(false);
const pickerOpen = ref(false);

// What the drill is actually aiming at right now -- hand-picked if there is
// a pick, otherwise whatever the history says is worth practicing.
const targetKeys = computed(() =>
  resolveDrillKeys(configStore.drillKeys, historyStore.results)
);

// Letters already drilled enough today
const readyKeys = computed(() => {
  if (configStore.type !== "drill" || !targetKeys.value.length) return new Set();
  return new Set(
    historyStore
      .drillReadinessFor(targetKeys.value)
      .letters.filter((letter) => letter.ready)
      .map((letter) => letter.key)
  );
});

// The desktop popover closes on a click outside it, on Esc, and whenever
// the mode changes away from the drill.
const drillChipRoot = ref(null);
const handlePointerDown = (event) => {
  if (!pickerOpen.value || !drillChipRoot.value) return;
  if (!drillChipRoot.value.contains(event.target)) pickerOpen.value = false;
};
const handleKeydown = (event) => {
  if (event.key === "Escape") pickerOpen.value = false;
};

watch(
  () => configStore.type,
  () => {
    editingKeys.value = false;
    pickerOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped></style>
