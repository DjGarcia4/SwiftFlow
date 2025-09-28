<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
    :type="type"
  >
    <component v-if="icon" :is="iconComponent" class="w-4 h-4" />
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from "vue";

// Import common Heroicons
import { ClockIcon } from "@heroicons/vue/24/outline";

// Props
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "clock",
    validator: (value) => value && ["clock"].includes(value),
  },
  value: {
    type: [String, Number],
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => value && ["sm", "md", "lg"].includes(value),
  },
  type: {
    type: String,
    default: "button",
    validator: (value) =>
      value && ["button", "submit", "reset"].includes(value),
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// Computed
const isActive = computed(() => props.modelValue === props.value);

// Icon mapping
const iconMap = {
  clock: ClockIcon,
};

// Computed icon component
const iconComponent = computed(() => {
  return iconMap[props.icon] || ClockIcon;
});

// Computed classes
const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-semibold",
    "rounded-2xl",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "backdrop-blur-sm",
    "cursor-pointer",
    "gap-2",
    "border",
    "p-2",
  ];

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Active/Inactive state classes
  const stateClasses = isActive.value
    ? [
        "bg-gradient-to-r",
        "from-emerald-600",
        "to-emerald-600",
        "hover:from-emerald-700",
        "hover:to-emerald-700",
        "active:from-emerald-800",
        "active:to-emerald-800",
        "text-white",
        "border-emerald-500",
        "focus:ring-emerald-500",
        "shadow-lg",
        "hover:shadow-xl",
        "transform",
        "hover:scale-105",
      ]
    : [
        "bg-gradient-to-r",
        "from-gray-700/50",
        "to-gray-600/50",
        "hover:from-gray-600/70",
        "hover:to-gray-500/70",
        "active:from-gray-800/70",
        "active:to-gray-700/70",
        "text-white/80",
        "border-gray-500/50",
        "focus:ring-gray-400",
        "shadow-md",
        "hover:shadow-lg",
        "hover:text-white",
      ];

  return [...baseClasses, ...sizeClasses[props.size], ...stateClasses].join(
    " "
  );
});

// Methods
const handleClick = (event) => {
  if (!props.disabled) {
    emit("update:modelValue", props.value);
    emit("change", props.value);
  }
};
</script>

<style scoped>
/* Custom animations for the button */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}
</style>
