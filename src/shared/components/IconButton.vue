<template>
  <div v-if="tooltip" class="relative group">
    <ButtonCustom
      :variant="variant"
      :size="size"
      :disabled="disabled"
      :loading="loading"
      :full-width="fullWidth"
      @click="$emit('click', $event)"
    >
      <template v-if="icon" #icon>
        <div
          v-if="icon === 'letter'"
          class="w-4 h-4 flex items-center justify-center font-bold text-sm"
        >
          A
        </div>
        <component :is="iconComponent" v-else class="w-6 h-6" />
      </template>
      {{ text }}
    </ButtonCustom>

    <!-- Tooltip -->
    <div
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-bold text-white bg-night-ink rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50"
    >
      {{ tooltip }}
      <!-- Tooltip arrow -->
      <div
        class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-night-ink"
      ></div>
    </div>
  </div>

  <ButtonCustom
    v-else
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :full-width="fullWidth"
    @click="$emit('click', $event)"
  >
    <template v-if="icon" #icon>
      <div
        v-if="icon === 'letter'"
        class="w-4 h-4 flex items-center justify-center font-bold text-sm"
      >
        A
      </div>
      <component :is="iconComponent" v-else class="w-4 h-4" />
    </template>
    {{ text }}
  </ButtonCustom>
</template>

<script setup>
import { computed } from "vue";
import ButtonCustom from "./ButtonCustom.vue";

// Import common Heroicons
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  Cog6ToothIcon,
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AtSymbolIcon,
  HashtagIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";

// Props
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  // Optional: some buttons (e.g. the plain time/word count pills) are
  // text-only and render no icon at all.
  icon: {
    type: String,
    default: "",
    validator: (value) =>
      value === "" ||
      [
        "play",
        "pause",
        "stop",
        "restart",
        "check",
        "close",
        "plus",
        "minus",
        "settings",
        "user",
        "home",
        "document",
        "chart",
        "trophy",
        "clock",
        "back",
        "next",
        "letter",
        "punctuation",
        "number",
        "zen",
        "quote",
        "code",
        "share",
      ].includes(value),
  },
  variant: {
    type: String,
    default: "primary",
  },
  size: {
    type: String,
    default: "xs",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["click"]);

// Icon mapping
const iconMap = {
  play: PlayIcon,
  pause: PauseIcon,
  stop: StopIcon,
  restart: ArrowPathIcon,
  check: CheckIcon,
  close: XMarkIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  settings: Cog6ToothIcon,
  user: UserIcon,
  home: HomeIcon,
  document: DocumentTextIcon,
  chart: ChartBarIcon,
  trophy: TrophyIcon,
  clock: ClockIcon,
  back: ArrowLeftIcon,
  next: ArrowRightIcon,
  punctuation: AtSymbolIcon,
  number: HashtagIcon,
  zen: SparklesIcon,
  quote: ChatBubbleBottomCenterTextIcon,
  code: CodeBracketIcon,
  share: ShareIcon,
};

// Computed icon component
const iconComponent = computed(() => {
  return iconMap[props.icon] || PlayIcon;
});
</script>
